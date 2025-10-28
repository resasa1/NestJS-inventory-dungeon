// src/users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = (): MockRepository<User> => ({
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  softDelete: jest.fn(),
  merge: jest.fn(),
});

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: MockRepository<User>;
  let mockedBcrypt: jest.Mocked<typeof bcrypt>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<MockRepository<User>>(getRepositoryToken(User));
    mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  // FindOne test
  describe('findOne', () => {
    it('should find a user by id and return it', async () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@test.com' } as User;


      repository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should hash password and save a new user', async () => {
      const createUserDto = {
        name: 'New User',
        email: 'new@test.com',
        password: 'Password123',
      };
      const hashedPassword = 'hashedPassword123';
      const mockUser = { id: 2, ...createUserDto, password: hashedPassword };
      const expectedResult = { id: 2, name: 'New User', email: 'new@test.com' };
      // tiruan hash
      mockedBcrypt.hash.mockResolvedValue(hashedPassword);
      // tiruan create
      repository.create.mockReturnValue(mockUser);
      // tiruan save
      repository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('Password123', 10);
      expect(repository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
      expect(repository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException if email already exists', async () => {
      const createUserDto = {
        name: 'New User',
        email: 'new@test.com',
        password: 'Password123',
      };

      mockedBcrypt.hash.mockResolvedValue('hashedPassword123');
      repository.save.mockRejectedValue({ code: '23505' });

      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
    });
  });

  // remove soft delete test
  describe('remove', () => {
    it('should soft delete a user', async () => {
      repository.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(repository.softDelete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'User with ID 1 has been soft-deleted' });
    });

    it('should throw NotFoundException if user to delete not found', async () => {
      repository.softDelete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
