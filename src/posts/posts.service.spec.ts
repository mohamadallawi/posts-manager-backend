import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Post } from './entities/post.entity';
import { PostsService } from './posts.service';

describe('PostsService', () => {
  let service: PostsService;
  let repository: jest.Mocked<Repository<Post>>;
  let usersService: jest.Mocked<UsersService>;

  const mockUser = {
    id: 'user-1',
    name: 'John',
    email: 'john@example.com',
    posts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPost: Post = {
    id: 'uuid-1',
    title: 'Test',
    content: 'Content',
    userId: 'user-1',
    user: mockUser,
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(Post), useValue: mockRepository },
        {
          provide: UsersService,
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    repository = module.get(getRepositoryToken(Post));
    usersService = module.get(UsersService);
  });

  describe('create', () => {
    it('should create a post linked to a user', async () => {
      usersService.findOne.mockResolvedValue(mockUser);
      repository.create.mockReturnValue(mockPost);
      repository.save.mockResolvedValue(mockPost);
      repository.findOne.mockResolvedValue(mockPost);

      const result = await service.create({
        title: '  Hello  ',
        content: '  World  ',
        userId: 'user-1',
      });

      expect(repository.create).toHaveBeenCalledWith({
        title: 'Hello',
        content: 'World',
        user: mockUser,
        userId: 'user-1',
      });
      expect(result).toEqual(mockPost);
    });
  });

  describe('findAll', () => {
    it('should return posts with user relation', async () => {
      repository.find.mockResolvedValue([mockPost]);

      const posts = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        where: {},
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
      expect(posts).toEqual([mockPost]);
    });

    it('should filter posts by userId', async () => {
      repository.find.mockResolvedValue([mockPost]);

      await service.findAll('user-1');

      expect(repository.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      repository.findOne.mockResolvedValue(mockPost);

      const found = await service.findOne('uuid-1');

      expect(found).toEqual(mockPost);
    });

    it('should throw NotFoundException for unknown id', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update title and content', async () => {
      repository.findOne
        .mockResolvedValueOnce({ ...mockPost })
        .mockResolvedValueOnce({ ...mockPost, title: 'New' });
      repository.save.mockResolvedValue({ ...mockPost, title: 'New' });

      const result = await service.update('uuid-1', {
        title: '  New  ',
        content: '  New content  ',
      });

      expect(result.title).toBe('New');
    });
  });

  describe('remove', () => {
    it('should delete a post', async () => {
      repository.findOne.mockResolvedValue(mockPost);
      repository.remove.mockResolvedValue(mockPost);

      await service.remove('uuid-1');

      expect(repository.remove).toHaveBeenCalledWith(mockPost);
    });
  });
});
