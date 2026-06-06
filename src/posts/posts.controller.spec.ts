import { Test, TestingModule } from '@nestjs/testing';
import { Post } from './entities/post.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

describe('PostsController', () => {
  let controller: PostsController;
  let service: jest.Mocked<PostsService>;

  const mockPost: Post = {
    id: 'uuid-1',
    title: 'Test',
    content: 'Content',
    userId: 'user-1',
    user: {
      id: 'user-1',
      name: 'John',
      email: 'john@example.com',
      posts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [{ provide: PostsService, useValue: mockService }],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get(PostsService);
  });

  it('should return all posts', async () => {
    service.findAll.mockResolvedValue([mockPost]);

    const posts = await controller.findAll();

    expect(posts).toHaveLength(1);
  });

  it('should filter posts by userId', async () => {
    service.findAll.mockResolvedValue([mockPost]);

    await controller.findAll('user-1');

    expect(service.findAll).toHaveBeenCalledWith('user-1');
  });

  it('should create a post', async () => {
    service.create.mockResolvedValue(mockPost);

    const post = await controller.create({
      title: 'New',
      content: 'Body',
      userId: 'user-1',
    });

    expect(post.title).toBe('Test');
  });

  it('should remove a post', async () => {
    service.remove.mockResolvedValue(undefined);

    const result = await controller.remove('uuid-1');

    expect(result).toEqual({ message: 'Post deleted successfully' });
  });
});
