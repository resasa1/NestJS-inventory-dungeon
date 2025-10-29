import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PaginationDto } from '../pagination.dto';

@Injectable()
export class UsersService {
  // Inject Repository
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // 2. CREATE
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    try {
      const savedUser = await this.usersRepository.save(newUser);

      const { password, ...result } = savedUser;

      return result;
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  // 3. READ ALL (Dengan pagination)
  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.usersRepository.findAndCount({
      take: limit,
      skip: skip,
      order: {
        id: 'DESC',
      },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 4. SHOW (Read One by ID)
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // 5. UPDATE
  async update(id: number, updateUserDto: UpdateUserDto) { 
    const user = await this.findOne(id);

    // Jika ada password baru di DTO, hash password itu
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    this.usersRepository.merge(user, updateUserDto);

    try {
      const updatedUser = await this.usersRepository.save(user);

      const { password, ...result } = updatedUser;
      return result;
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  // 6. DELETE (Soft Delete)
  async remove(id: number): Promise<{ message: string }> {

    const result = await this.usersRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `User with ID ${id} has been soft-deleted` };
  }
}