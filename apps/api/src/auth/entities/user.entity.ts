import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  @Index()
  jiraUsername: string;

  @Column({ nullable: true })
  jiraDisplayName: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ type: 'simple-array', default: 'user' })
  roles: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  jiraToken: string;

  @Column({ nullable: true })
  jiraRefreshToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
