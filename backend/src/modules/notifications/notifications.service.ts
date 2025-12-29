import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(
    userId: number,
    title: string,
    message: string,
    transactionId?: number,
    type?: string,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      user: { id: userId } as any,
      title,
      message,
      transaction: transactionId ? { id: transactionId } as any : null,
      type,
    });

    return this.notificationsRepository.save(notification);
  }

  async findAllByUser(userId: number, paginationDto: PaginationDto): Promise<Notification[]> {
    const { limit, offset } = paginationDto;

    return this.notificationsRepository.find({
      where: { user: { id: userId } },
      relations: ['transaction'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getUnreadCount(userId: number): Promise<{ count: number }> {
    const count = await this.notificationsRepository.count({
      where: {
        user: { id: userId },
        isRead: false,
      },
    });

    return { count };
  }

  async markAsRead(id: number, userId: number): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!notification) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }

    notification.isRead = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: number): Promise<{ affected: number }> {
    const result = await this.notificationsRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );

    return { affected: result.affected || 0 };
  }
}

