import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OpenCodeSession {
  id: string;
  projectID: string;
  title: string;
  directory: string;
}

export interface OpenCodeToolState {
  status: 'pending' | 'running' | 'completed' | 'error';
  input: any;
  output?: string;
  error?: string;
  title?: string;
}

export interface OpenCodePart {
  id: string;
  type: 'text' | 'tool' | 'reasoning' | 'subtask' | 'step-start' | 'step-finish' | 'permission' | 'question';
  text?: string;
  tool?: string;
  state?: OpenCodeToolState;
  delta?: string;
  prompt?: string;
  agent?: string;
  description?: string;
  permissionRequest?: any;
  questionRequest?: any;
}

export interface OpenCodeMessage {
  info: {
    id: string;
    role: 'user' | 'assistant';
    agent?: string;
  };
  parts: OpenCodePart[];
}

@Injectable({
  providedIn: 'root'
})
export class OpenCodeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5678';

  createSession(title?: string): Observable<OpenCodeSession> {
    return this.http.post<OpenCodeSession>(`${this.baseUrl}/session`, { title });
  }

  executeCommand(sessionId: string, command: string, args: string): Observable<OpenCodeMessage> {
    return this.http.post<OpenCodeMessage>(`${this.baseUrl}/session/${sessionId}/command`, {
      command,
      arguments: args
    });
  }

  runShellCommand(sessionId: string, command: string, agent: string = 'analyze'): Observable<OpenCodeMessage> {
    return this.http.post<OpenCodeMessage>(`${this.baseUrl}/session/${sessionId}/shell`, {
      command,
      agent
    });
  }

  respondToPermission(requestID: string, response: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/permission/${requestID}/reply`, {
      reply: response
    });
  }

  respondToQuestion(requestID: string, answers: string[][]): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/question/${requestID}/reply`, {
      answers
    });
  }

  getPendingPermissions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/permission`);
  }

  getPendingQuestions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/question`);
  }

  abortSession(sessionId: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/session/${sessionId}/abort`, {});
  }

  getEventStreamUrl(): string {
    return `${this.baseUrl}/event`;
  }
}
