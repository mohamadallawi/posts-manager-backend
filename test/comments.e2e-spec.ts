import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Comment } from '../src/comments/entities/comment.entity';
import { Post } from '../src/posts/entities/post.entity';
import { User } from '../src/users/entities/user.entity';

describe('Comments (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userId: string;
  let postId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    dataSource = app.get(DataSource);
    await dataSource.getRepository(Comment).clear();
    await dataSource.getRepository(Post).clear();
    await dataSource.getRepository(User).clear();

    const user = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Commenter', email: 'commenter@example.com' });
    userId = user.body.id;

    const post = await request(app.getHttpServer())
      .post('/posts')
      .send({ title: 'Post', content: 'Content', userId });
    postId = post.body.id;
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  it('GET /posts/:postId/comments returns empty array', () => {
    return request(app.getHttpServer())
      .get(`/posts/${postId}/comments`)
      .expect(200)
      .expect([]);
  });

  it('POST /posts/:postId/comments creates a comment', async () => {
    const response = await request(app.getHttpServer())
      .post(`/posts/${postId}/comments`)
      .send({ content: 'Nice post!', userId })
      .expect(201);

    expect(response.body.content).toBe('Nice post!');
    expect(response.body.user.name).toBe('Commenter');
  });

  it('PATCH /comments/:id updates a comment', async () => {
    const created = await request(app.getHttpServer())
      .post(`/posts/${postId}/comments`)
      .send({ content: 'Before', userId });

    const response = await request(app.getHttpServer())
      .patch(`/comments/${created.body.id}`)
      .send({ content: 'After' })
      .expect(200);

    expect(response.body.content).toBe('After');
  });

  it('DELETE /comments/:id removes a comment', async () => {
    const created = await request(app.getHttpServer())
      .post(`/posts/${postId}/comments`)
      .send({ content: 'Delete me', userId });

    await request(app.getHttpServer())
      .delete(`/comments/${created.body.id}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/posts/${postId}/comments`)
      .expect(200)
      .expect([]);
  });
});
