import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: 'opencode.db',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Chỉ dùng cho development
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
