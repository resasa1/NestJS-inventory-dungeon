import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InventoryLog, LogType } from './entities/invent-log.entity';
import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';
import { CreateLogDto } from './dto/create-invent-log.dto';
import { PaginationDto } from '../pagination.dto';

@Injectable()
export class InventoryLogsService {
  constructor(
    @InjectRepository(InventoryLog)
    private logsRepository: Repository<InventoryLog>,
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    // Kita inject DataSource untuk menggunakan Transaksi
    private dataSource: DataSource,
  ) {}

  /**
   * Endpoint utama: Membuat log baru DAN mengupdate stok item.
   * Dijalankan dalam satu transaksi database.
   */
  async createLog(createLogDto: CreateLogDto) {
    const { itemId, userId, type, quantity, reason } = createLogDto;

    // Kita gunakan 'this.dataSource.transaction'
    // Ini memastikan semua operasi di dalamnya berhasil,
    // atau semuanya akan di-rollback jika ada satu error.
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      // 1. Validasi: Cek apakah User dan Item ada
      const user = await transactionalEntityManager.findOneBy(User, { id: userId });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const item = await transactionalEntityManager.findOneBy(Item, { id: itemId });
      if (!item) {
        throw new NotFoundException(`Item with ID ${itemId} not found`);
      }

      // 2. Logika Bisnis: Hitung stok baru
      let newQuantity = item.quantity;
      let quantityChanged = 0;

      if (type === LogType.IN) {
        newQuantity += quantity;
        quantityChanged = +quantity; // +10
      } else if (type === LogType.OUT) {
        if (item.quantity < quantity) {
          throw new BadRequestException(`Not enough stock for item ${item.name}`);
        }
        newQuantity -= quantity;
        quantityChanged = -quantity; // -10
      } else if (type === LogType.ADJUSTMENT) {
        // Untuk adjustment, 'quantity' adalah stok final
        quantityChanged = quantity - item.quantity;
        newQuantity = quantity;
      }

      // 3. Simpan Log
      const newLog = transactionalEntityManager.create(InventoryLog, {
        item: item,
        user: user,
        type: type,
        quantity_changed: quantityChanged,
        reason: reason,
      });
      await transactionalEntityManager.save(newLog);

      // 4. Update Kuantitas Item
      await transactionalEntityManager.update(Item, item.id, {
        quantity: newQuantity,
      });

      return newLog;
    });
  }

  /**
   * Endpoint Read: Mendapatkan riwayat log dengan pagination
   */
  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.logsRepository.findAndCount({
      take: limit,
      skip: skip,
      order: {
        createdAt: 'DESC', // Tampilkan log terbaru dulu
      },
      // 'relations' otomatis join tabel item dan user
      relations: ['item', 'user'], 
    });

    return {
      data: data.map(log => ({ // Kita format responsnya
        ...log,
        // Hapus password user dari data log
        user: log.user ? { id: log.user.id, name: log.user.name, email: log.user.email } : null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Endpoint Read: Mendapatkan satu log spesifik
   */
  async findOne(id: number) {
    const log = await this.logsRepository.findOne({
      where: { id },
      relations: ['item', 'user'],
    });

    if (!log) {
      throw new NotFoundException(`Log with ID ${id} not found`);
    }

    // Hapus password user dari respons
    const { password, ...userWithoutPassword } = log.user || {};
    
    return {
      ...log,
      user: log.user ? userWithoutPassword : null,
    };
  }

  // CATATAN: Kita sengaja TIDAK membuat method update() atau remove()
  // untuk log. Riwayat (log) seharusnya 'immutable' (tidak bisa diubah).
}
