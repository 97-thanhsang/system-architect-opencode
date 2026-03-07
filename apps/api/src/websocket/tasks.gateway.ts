import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200',
    credentials: true,
  },
  namespace: 'tasks',
})
export class TasksGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(TasksGateway.name);

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe-task')
  handleSubscribeTask(
    @MessageBody() taskId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(`task-${taskId}`);
    this.logger.debug(`Client ${client.id} subscribed to task ${taskId}`);
    client.emit('subscribed', { taskId });
  }

  @SubscribeMessage('unsubscribe-task')
  handleUnsubscribeTask(
    @MessageBody() taskId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    client.leave(`task-${taskId}`);
    this.logger.debug(`Client ${client.id} unsubscribed from task ${taskId}`);
    client.emit('unsubscribed', { taskId });
  }

  @SubscribeMessage('subscribe-queue')
  handleSubscribeQueue(
    @ConnectedSocket() client: Socket,
  ): void {
    client.join('queue-status');
    this.logger.debug(`Client ${client.id} subscribed to queue status`);
    client.emit('subscribed-queue', {});
  }

  // Method to emit task progress to specific task room
  emitTaskProgress(taskId: string, progress: number, logs?: string[]): void {
    this.server.to(`task-${taskId}`).emit('task-progress', {
      taskId,
      progress,
      logs,
      timestamp: new Date().toISOString(),
    });
  }

  // Method to emit task status changes
  emitTaskStatus(taskId: string, status: string, output?: string): void {
    this.server.to(`task-${taskId}`).emit('task-status', {
      taskId,
      status,
      output,
      timestamp: new Date().toISOString(),
    });
  }

  // Method to emit queue status to all subscribed clients
  emitQueueStatus(status: any): void {
    this.server.to('queue-status').emit('queue-status', status);
  }

  // Method to emit log stream
  emitTaskLog(taskId: string, log: string): void {
    this.server.to(`task-${taskId}`).emit('task-log', {
      taskId,
      log,
      timestamp: new Date().toISOString(),
    });
  }
}
