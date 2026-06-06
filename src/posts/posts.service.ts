import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly usersService: UsersService,
  ) {}

  findAll(userId?: string): Promise<Post[]> {
    return this.postsRepository.find({
      where: userId ? { userId } : {},
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  findByUser(userId: string): Promise<Post[]> {
    return this.findAll(userId);
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }
    return post;
  }

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const user = await this.usersService.findOne(createPostDto.userId);
    const post = this.postsRepository.create({
      title: createPostDto.title.trim(),
      content: createPostDto.content.trim(),
      user,
      userId: user.id,
    });
    const saved = await this.postsRepository.save(post);
    return this.findOne(saved.id);
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    if (updatePostDto.title !== undefined) {
      post.title = updatePostDto.title.trim();
    }
    if (updatePostDto.content !== undefined) {
      post.content = updatePostDto.content.trim();
    }
    await this.postsRepository.save(post);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const post = await this.findOne(id);
    await this.postsRepository.remove(post);
  }
}
