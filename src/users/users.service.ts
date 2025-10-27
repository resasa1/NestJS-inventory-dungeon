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
  constructor(
    // 1. Suntikkan (Inject) Repository User
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // 2. CREATE
  async create(createUserDto: CreateUserDto) { // Perhatikan: Tipe return diinferensi
    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword, // Simpan password yang sudah di-hash
    });

    try {
      const savedUser = await this.usersRepository.save(newUser);

      // (PERBAIKAN 1) Pisahkan password dari sisa properti
      const { password, ...result } = savedUser;

      return result; // Kembalikan 'result' (objek tanpa password)

    } catch (error) {
      // Menangani error jika email duplikat (error code 23505 untuk unique constraint)
      if (error.code === '23505') {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  // 3. READ ALL (Dengan pagination)
  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit; // Logika untuk skip halaman

    const [data, total] = await this.usersRepository.findAndCount({
      take: limit, // Ambil sebanyak 'limit'
      skip: skip,  // Lewati sebanyak 'skip'
      order: {
        id: 'DESC', // Urutkan berdasarkan ID terbaru
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
  async update(id: number, updateUserDto: UpdateUserDto) { // Perhatikan: Tipe return diinferensi
    // Cek dulu apakah user-nya ada
    const user = await this.findOne(id);

    // Jika ada password baru di DTO, hash password itu
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Gabungkan data lama dengan data baru
    this.usersRepository.merge(user, updateUserDto);

    try {
      const updatedUser = await this.usersRepository.save(user);

      // (PERBAIKAN 2) Lakukan hal yang sama seperti di create()
      const { password, ...result } = updatedUser;
      return result;
    } catch (error) {
      // Menangani error jika email duplikat saat update
      if (error.code === '23505') {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  // 6. DELETE (Soft Delete)
  async remove(id: number): Promise<{ message: string }> {
    // Kita panggil .softDelete() BUKAN .delete()
    const result = await this.usersRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `User with ID ${id} has been soft-deleted` };
  }
}