import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from './entities/user.entity';

interface JiraLoginDto {
  username: string;
  password: string;
  jiraUrl: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<{ user: User; token: string }> {
    return await this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    return await this.authService.register(registerDto);
  }

  /**
   * Jira Authentication Endpoint
   * Validates credentials against Jira API and returns JWT token
   */
  @Post('jira/login')
  @HttpCode(HttpStatus.OK)
  async jiraLogin(@Body() credentials: JiraLoginDto) {
    return await this.authService.loginWithJira(credentials);
  }

  /**
   * Get current user profile
   */
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req: any) {
    const user = await this.authService.validateUserById(req.user.userId);
    if (!user) {
      return { error: 'User not found' };
    }
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      jiraUsername: user.jiraUsername,
      jiraDisplayName: user.jiraDisplayName,
      avatarUrl: user.avatarUrl,
      roles: user.roles,
    };
  }
}
