import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface JiraUser {
  self: string;
  key: string;
  name: string;
  emailAddress: string;
  displayName: string;
  active: boolean;
  avatarUrls?: {
    '48x48': string;
    '24x24': string;
    '16x16': string;
    '32x32': string;
  };
}

export interface JiraCredentials {
  username: string;
  password: string;
  jiraUrl: string;
}

@Injectable()
export class JiraClientService {
  private readonly logger = new Logger(JiraClientService.name);

  async validateCredentials(credentials: JiraCredentials): Promise<JiraUser> {
    const { username, password, jiraUrl } = credentials;

    const client = axios.create({
      baseURL: `${jiraUrl}/rest/api/2`,
      auth: { username, password },
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });

    try {
      this.logger.log(`Validating credentials for: ${username}`);
      const response = await client.get<JiraUser>('/myself');
      this.logger.log(`Authenticated: ${response.data.displayName} (${response.data.emailAddress})`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Auth failed: ${error.message}`);
      if (error.response?.status === 401) {
        throw new Error('Invalid Jira credentials');
      }
      throw new Error(`Jira authentication failed: ${error.message}`);
    }
  }
}
