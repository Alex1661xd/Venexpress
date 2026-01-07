import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { CreateRateDto } from './dto/create-rate.dto';
import { RateType } from '../../common/enums/rate-type.enum';

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
      where: { rateType: RateType.ACTUAL },
      order: { createdAt: 'DESC' },
      relations: ['createdBy'],
    });

    if (!rate) {
      throw new NotFoundException('No hay tasa de cambio disponible');
    }

    return rate;
  }

  async getCurrentRateByType(rateType: RateType): Promise<ExchangeRate | null> {
    const rate = await this.ratesRepository.findOne({
      where: { rateType },
      order: { createdAt: 'DESC' },
      relations: ['createdBy'],
    });

    return rate;
  }

  async getAllCurrentRates(): Promise<Record<RateType, ExchangeRate | null>> {
    const rateTypes = Object.values(RateType);
    const rates: Record<string, ExchangeRate | null> = {};

    for (const rateType of rateTypes) {
      rates[rateType] = await this.getCurrentRateByType(rateType);
    }

    return rates as Record<RateType, ExchangeRate | null>;
  }

  async getHistory(limit: number = 30): Promise<ExchangeRate[]> {
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

