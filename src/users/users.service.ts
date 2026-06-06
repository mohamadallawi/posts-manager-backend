import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: { email: createUserDto.email.trim().toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email is already in use');
    }

    const user = this.usersRepository.create({
      name: createUserDto.name.trim(),
      email: createUserDto.email.trim().toLowerCase(),
    });
    return this.usersRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email !== undefined) {
      const email = updateUserDto.email.trim().toLowerCase();
      const existing = await this.usersRepository.findOne({ where: { email } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Email is already in use');
      }
      user.email = email;
    }

    if (updateUserDto.name !== undefined) {
      user.name = updateUserDto.name.trim();
    }

    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
