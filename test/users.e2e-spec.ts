import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Post } from '../src/posts/entities/post.entity';
import { User } from '../src/users/entities/user.entity';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

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
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /users returns empty array initially', () => {
    return request(app.getHttpServer()).get('/users').expect(200).expect([]);
  });

  it('POST /users creates a user', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'John Doe', email: 'john@example.com' })
      .expect(201);

    expect(response.body.name).toBe('John Doe');
    expect(response.body.email).toBe('john@example.com');
  });

  it('PATCH /users/:id updates a user', async () => {
    const created = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Before', email: 'before@example.com' });

    const response = await request(app.getHttpServer())
      .patch(`/users/${created.body.id}`)
      .send({ name: 'After' })
      .expect(200);

    expect(response.body.name).toBe('After');
  });

  it('DELETE /users/:id removes a user', async () => {
    const created = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Delete', email: 'delete@example.com' });

    await request(app.getHttpServer())
      .delete(`/users/${created.body.id}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/users/${created.body.id}`)
      .expect(404);
  });
});
