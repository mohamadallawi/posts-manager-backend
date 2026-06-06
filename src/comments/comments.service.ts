import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) {}

  findByPost(postId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { postId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user', 'post'],
    });
    if (!comment) {
      throw new NotFoundException(`Comment with id "${id}" not found`);
    }
    return comment;
  }

  async create(
    postId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const post = await this.postsService.findOne(postId);
    const user = await this.usersService.findOne(createCommentDto.userId);
    const comment = this.commentsRepository.create({
      content: createCommentDto.content.trim(),
      post,
      postId: post.id,
      user,
      userId: user.id,
    });
    const saved = await this.commentsRepository.save(comment);
    return this.findOne(saved.id);
  }

  async update(id: string, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.findOne(id);
    if (updateCommentDto.content !== undefined) {
      comment.content = updateCommentDto.content.trim();
    }
    await this.commentsRepository.save(comment);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const comment = await this.findOne(id);
    await this.commentsRepository.remove(comment);
  }
}
