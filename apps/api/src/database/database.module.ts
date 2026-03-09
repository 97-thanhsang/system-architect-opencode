import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../auth/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Pipeline } from '../tasks/entities/pipeline.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'better-sqlite3',
        database: configService.get<string>('DATABASE_NAME') || 'opencode.db',
        entities: [User, Task, Pipeline],
        synchronize: true, // Chỉ dùng cho development
        logging: true, // Enable logging để debug
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
