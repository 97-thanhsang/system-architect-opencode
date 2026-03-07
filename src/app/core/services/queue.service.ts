import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface QueueStatus {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  total: number;
}

export interface AnalyzeJobData {
  taskId: string;
  jiraKey?: string;
  input: string;
  type: string;
  projectPath?: string;
  outputPath?: string;
}

@Injectable({
  providedIn: 'root'
})
export class QueueService {
  private api = inject(ApiService);

  getQueueStatus(): Observable<QueueStatus> {
    return this.api.get<QueueStatus>('/queue/status');
  }

  getJobStatus(jobId: string): Observable<any> {
    return this.api.get<any>(`/queue/job/${jobId}`);
  }

  addAnalyzeJob(data: AnalyzeJobData): Observable<{ jobId: string; status: string }> {
    return this.api.post<{ jobId: string; status: string }>('/queue/analyze', data);
  }

  pauseQueue(): Observable<{ status: string }> {
    return this.api.post<{ status: string }>('/queue/pause', {});
  }

  resumeQueue(): Observable<{ status: string }> {
    return this.api.post<{ status: string }>('/queue/resume', {});
  }
}
