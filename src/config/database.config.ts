import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Comment } from '../comments/entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';

export const getDatabaseConfig = (
  config: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: config.get<string>('DB_HOST', 'localhost'),
  port: config.get<number>('DB_PORT', 3306),
  username: config.get<string>('DB_USERNAME', 'root'),
  password: config.get<string>('DB_PASSWORD', ''),
  database: config.get<string>('DB_DATABASE', 'posts_db'),
  entities: [User, Post, Comment],
  synchronize: config.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
  charset: 'utf8mb4',
});
