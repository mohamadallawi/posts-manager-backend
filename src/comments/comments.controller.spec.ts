import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: jest.Mocked<CommentsService>;

  const mockComment: Comment = {
    id: 'comment-1',
    content: 'Great!',
    postId: 'post-1',
    userId: 'user-1',
    user: {
      id: 'user-1',
      name: 'John',
      email: 'john@example.com',
      posts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    post: {} as Comment['post'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: {
            findByPost: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get(CommentsService);
  });

  it('should return comments for a post', async () => {
    service.findByPost.mockResolvedValue([mockComment]);

    const comments = await controller.findByPost('post-1');

    expect(comments).toHaveLength(1);
  });

  it('should create a comment', async () => {
    service.create.mockResolvedValue(mockComment);

    const comment = await controller.create('post-1', {
      content: 'Great!',
      userId: 'user-1',
    });

    expect(comment.content).toBe('Great!');
  });

  it('should remove a comment', async () => {
    service.remove.mockResolvedValue(undefined);

    const result = await controller.remove('comment-1');

    expect(result).toEqual({ message: 'Comment deleted successfully' });
  });
});
