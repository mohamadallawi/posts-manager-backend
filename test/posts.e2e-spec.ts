import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Post } from '../src/posts/entities/post.entity';
import { User } from '../src/users/entities/user.entity';

describe('Posts (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userId: string;

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
    await dataSource.getRepository(Post).clear();
    await dataSource.getRepository(User).clear();

    const user = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Author', email: 'author@example.com' });
    userId = user.body.id;
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /posts returns empty array initially', () => {
    return request(app.getHttpServer()).get('/posts').expect(200).expect([]);
  });

  it('POST /posts creates a post for a user', async () => {
    const response = await request(app.getHttpServer())
      .post('/posts')
      .send({ title: 'E2E Post', content: 'E2E content', userId })
      .expect(201);

    expect(response.body.title).toBe('E2E Post');
    expect(response.body.user.id).toBe(userId);
  });

  it('GET /posts?userId filters by user', async () => {
    await request(app.getHttpServer())
      .post('/posts')
      .send({ title: 'Filtered', content: 'Post', userId });

    const response = await request(app.getHttpServer())
      .get(`/posts?userId=${userId}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].userId).toBe(userId);
  });

  it('GET /users/:id/posts returns user posts', async () => {
    await request(app.getHttpServer())
      .post('/posts')
      .send({ title: 'User Post', content: 'Content', userId });

    const response = await request(app.getHttpServer())
      .get(`/users/${userId}/posts`)
      .expect(200);

    expect(response.body).toHaveLength(1);
  });

  it('DELETE /posts/:id removes a post', async () => {
    const created = await request(app.getHttpServer())
      .post('/posts')
      .send({ title: 'Delete', content: 'Me', userId });

    await request(app.getHttpServer())
      .delete(`/posts/${created.body.id}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/posts/${created.body.id}`)
      .expect(404);
  });
});
