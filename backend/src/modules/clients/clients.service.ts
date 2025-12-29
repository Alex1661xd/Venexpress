import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) { }

  async create(createClientDto: CreateClientDto, vendedorId: number): Promise<Client> {
    const client = this.clientsRepository.create({
      ...createClientDto,
      vendedor: { id: vendedorId } as any,
    });
    return this.clientsRepository.save(client);
  }

  async findAll(search?: string, userId?: number, userRole?: string): Promise<Client[]> {
    // Construir condiciones de búsqueda
    const whereConditions: any = {};

    // Si es vendedor, solo ver sus propios clientes
    if (userRole === 'vendedor') {
      whereConditions.vendedor = { id: userId };
    }

    // Agregar búsqueda si existe
    if (search) {
      return this.clientsRepository.find({
        where: [
          { ...whereConditions, name: Like(`%${search}%`) },
          { ...whereConditions, phone: Like(`%${search}%`) },
        ],
        relations: ['vendedor'],
        order: { createdAt: 'DESC' },
      });
    }

    return this.clientsRepository.find({
      where: whereConditions,
      relations: ['vendedor'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Client> {
    const client = await this.clientsRepository.findOne({
      where: { id },
      relations: ['vendedor'],
    });

    if (!client) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return client;
  }

  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);
    Object.assign(client, updateClientDto);
    return this.clientsRepository.save(client);
  }
}

