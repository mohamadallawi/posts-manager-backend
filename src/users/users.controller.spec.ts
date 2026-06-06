import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from '../posts/posts.service';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;
  let postsService: jest.Mocked<PostsService>;

  const mockUser: User = {
    id: 'uuid-1',
    name: 'John',
    email: 'john@example.com',
    posts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: PostsService,
          useValue: { findByUser: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
    postsService = module.get(PostsService);
  });

  it('should return all users', async () => {
    usersService.findAll.mockResolvedValue([mockUser]);

    const users = await controller.findAll();

    expect(users).toHaveLength(1);
  });

  it('should create a user', async () => {
    usersService.create.mockResolvedValue(mockUser);

    const user = await controller.create({
      name: 'John',
      email: 'john@example.com',
    });

    expect(user.email).toBe('john@example.com');
  });

  it('should return user posts', async () => {
    postsService.findByUser.mockResolvedValue([]);

    const posts = await controller.findUserPosts('uuid-1');

    expect(posts).toEqual([]);
    expect(postsService.findByUser).toHaveBeenCalledWith('uuid-1');
  });

  it('should remove a user', async () => {
    usersService.remove.mockResolvedValue(undefined);

    const result = await controller.remove('uuid-1');

    expect(result).toEqual({ message: 'User deleted successfully' });
  });
});
