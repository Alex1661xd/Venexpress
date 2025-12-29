import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { CreateRateDto } from './dto/create-rate.dto';

@Injectable()
export class RatesService {
  constructor(
    @InjectRepository(ExchangeRate)
    private ratesRepository: Repository<ExchangeRate>,
  ) {}

  async create(createRateDto: CreateRateDto, userId: number): Promise<ExchangeRate> {
    const rate = this.ratesRepository.create({
      ...createRateDto,
      createdBy: { id: userId } as any,
    });
    return this.ratesRepository.save(rate);
  }

  async getCurrentRate(): Promise<ExchangeRate> {
    const rate = await this.ratesRepository.findOne({
      where: {},
      order: { createdAt: 'DESC' },
      relations: ['createdBy'],
    });

    if (!rate) {
      throw new NotFoundException('No hay tasa de cambio disponible');
    }

    return rate;
  }

  async getHistory(limit: number = 10): Promise<ExchangeRate[]> {
    return this.ratesRepository.find({
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['createdBy'],
    });
  }

  async findOne(id: number): Promise<ExchangeRate> {
    const rate = await this.ratesRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!rate) {
      throw new NotFoundException(`Tasa con ID ${id} no encontrada`);
    }

    return rate;
  }
}

