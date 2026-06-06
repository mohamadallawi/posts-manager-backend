import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 'uuid-1',
    name: 'John',
    email: 'john@example.com',
    posts: [],
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
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  it('should create a user with trimmed name and lowercase email', async () => {
    repository.findOne.mockResolvedValue(null);
    repository.create.mockReturnValue(mockUser);
    repository.save.mockResolvedValue(mockUser);

    const result = await service.create({
      name: '  John  ',
      email: '  John@Example.COM  ',
    });

    expect(repository.create).toHaveBeenCalledWith({
      name: 'John',
      email: 'john@example.com',
    });
    expect(result).toEqual(mockUser);
  });

  it('should throw ConflictException for duplicate email', async () => {
    repository.findOne.mockResolvedValue(mockUser);

    await expect(
      service.create({ name: 'Jane', email: 'john@example.com' }),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw NotFoundException for unknown id', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('should update a user', async () => {
    repository.findOne
      .mockResolvedValueOnce({ ...mockUser })
      .mockResolvedValueOnce(null);
    repository.save.mockResolvedValue({ ...mockUser, name: 'Jane' });

    const result = await service.update('uuid-1', { name: '  Jane  ' });

    expect(result.name).toBe('Jane');
  });

  it('should remove a user', async () => {
    repository.findOne.mockResolvedValue(mockUser);
    repository.remove.mockResolvedValue(mockUser);

    await service.remove('uuid-1');

    expect(repository.remove).toHaveBeenCalledWith(mockUser);
  });
});
