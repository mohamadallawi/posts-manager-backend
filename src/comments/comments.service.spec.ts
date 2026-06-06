import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';

describe('CommentsService', () => {
  let service: CommentsService;
  let repository: jest.Mocked<Repository<Comment>>;
  let postsService: jest.Mocked<PostsService>;
  let usersService: jest.Mocked<UsersService>;

  const mockUser = {
    id: 'user-1',
    name: 'John',
    email: 'john@example.com',
    posts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPost = {
    id: 'post-1',
    title: 'Test',
    content: 'Content',
    userId: 'user-1',
    user: mockUser,
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockComment: Comment = {
    id: 'comment-1',
    content: 'Nice post!',
    postId: 'post-1',
    userId: 'user-1',
    post: mockPost,
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: PostsService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: UsersService,
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    repository = module.get(getRepositoryToken(Comment));
    postsService = module.get(PostsService);
    usersService = module.get(UsersService);
  });

  it('should return comments for a post', async () => {
    repository.find.mockResolvedValue([mockComment]);

    const comments = await service.findByPost('post-1');

    expect(comments).toHaveLength(1);
    expect(repository.find).toHaveBeenCalledWith({
      where: { postId: 'post-1' },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  });

  it('should create a comment', async () => {
    postsService.findOne.mockResolvedValue(mockPost);
    usersService.findOne.mockResolvedValue(mockUser);
    repository.create.mockReturnValue(mockComment);
    repository.save.mockResolvedValue(mockComment);
    repository.findOne.mockResolvedValue(mockComment);

    const result = await service.create('post-1', {
      content: '  Nice post!  ',
      userId: 'user-1',
    });

    expect(result.content).toBe('Nice post!');
  });

  it('should throw NotFoundException for unknown comment', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('should update a comment', async () => {
    repository.findOne
      .mockResolvedValueOnce({ ...mockComment })
      .mockResolvedValueOnce({ ...mockComment, content: 'Updated' });
    repository.save.mockResolvedValue({ ...mockComment, content: 'Updated' });

    const result = await service.update('comment-1', { content: '  Updated  ' });

    expect(result.content).toBe('Updated');
  });

  it('should remove a comment', async () => {
    repository.findOne.mockResolvedValue(mockComment);
    repository.remove.mockResolvedValue(mockComment);

    await service.remove('comment-1');

    expect(repository.remove).toHaveBeenCalledWith(mockComment);
  });
});
