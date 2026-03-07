import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JiraClientService, JiraCredentials } from '../jira/jira-client.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly jiraClient: JiraClientService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && user.password === password) {
      const { password, ...result } = user;
      return result as User;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Generate JWT token
    const payload = { 
      sub: user.id, 
      email: user.email, 
      roles: user.roles,
    };
    const token = this.jwtService.sign(payload);
    
    return { user, token };
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const user = this.userRepository.create({
      ...registerDto,
      roles: registerDto.roles || ['user'],
    });

    return await this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  /**
   * Login with Jira credentials
   * Validates against Jira API and creates/updates local user
   */
  async loginWithJira(credentials: JiraCredentials) {
    try {
      // 1. Validate credentials with Jira
      this.logger.log(`Attempting Jira login for: ${credentials.username}`);
      const jiraUser = await this.jiraClient.validateCredentials(credentials);
      
      // 2. Find or create user in local DB
      let user = await this.userRepository.findOne({
        where: { jiraUsername: jiraUser.name },
      });
      
      if (!user) {
        this.logger.log(`Creating new user: ${jiraUser.name}`);
        user = this.userRepository.create({
          email: jiraUser.emailAddress,
          name: jiraUser.displayName,
          jiraUsername: jiraUser.name,
          jiraDisplayName: jiraUser.displayName,
          avatarUrl: jiraUser.avatarUrls?.['48x48'],
          roles: ['user'],
          isActive: true,
        });
        await this.userRepository.save(user);
      } else {
        // Update user info from Jira
        this.logger.log(`Updating existing user: ${user.id}`);
        user.email = jiraUser.emailAddress;
        user.name = jiraUser.displayName;
        user.jiraDisplayName = jiraUser.displayName;
        user.avatarUrl = jiraUser.avatarUrls?.['48x48'] || undefined;
        await this.userRepository.save(user);
      }
      
      // 3. Generate JWT
      const payload = { 
        sub: user.id, 
        email: user.email, 
        roles: user.roles,
        jiraUsername: user.jiraUsername,
      };
      
      const access_token = this.jwtService.sign(payload);
      
      this.logger.log(`Jira login successful: ${user.email}`);
      
      return {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          jiraUsername: user.jiraUsername,
          jiraDisplayName: user.jiraDisplayName,
          avatarUrl: user.avatarUrl,
          roles: user.roles,
        },
      };
    } catch (error) {
      this.logger.error(`Jira login failed: ${error.message}`);
      throw new UnauthorizedException(error.message || 'Jira authentication failed');
    }
  }

  async updateJiraTokens(
    userId: string,
    jiraToken: string,
    jiraRefreshToken: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    user.jiraToken = jiraToken;
    user.jiraRefreshToken = jiraRefreshToken;
    
    return await this.userRepository.save(user);
  }

  async validateUserById(userId: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id: userId } });
  }
}
