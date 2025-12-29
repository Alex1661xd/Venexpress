import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Beneficiary } from './entities/beneficiary.entity';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class BeneficiariesService {
  constructor(
    @InjectRepository(Beneficiary)
    private beneficiariesRepository: Repository<Beneficiary>,
  ) {}

  async create(createBeneficiaryDto: CreateBeneficiaryDto, user: any): Promise<Beneficiary> {
    const beneficiary = this.beneficiariesRepository.create(createBeneficiaryDto);

    // Asociar al cliente o usuario según el rol
    if (user.role === UserRole.CLIENTE) {
      beneficiary.userApp = { id: user.id } as any;
    } else if (createBeneficiaryDto.clientColombiaId) {
      beneficiary.clientColombia = { id: createBeneficiaryDto.clientColombiaId } as any;
    }

    return this.beneficiariesRepository.save(beneficiary);
  }

  async findAll(user: any, search?: string): Promise<Beneficiary[]> {
    const where: any = {};

    // Filtrar según el rol
    if (user.role === UserRole.CLIENTE) {
      where.userApp = { id: user.id };
    } else if (user.role === UserRole.VENDEDOR) {
      // Mostrar Destinatarios de clientes del vendedor
      where.clientColombia = { vendedor: { id: user.id } };
    }

    if (search) {
      where.fullName = Like(`%${search}%`);
    }

    return this.beneficiariesRepository.find({
      where,
      relations: ['clientColombia', 'userApp'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Beneficiary> {
    const beneficiary = await this.beneficiariesRepository.findOne({
      where: { id },
      relations: ['clientColombia', 'userApp'],
    });

    if (!beneficiary) {
      throw new NotFoundException(`Destinatario con ID ${id} no encontrado`);
    }

    return beneficiary;
  }

  async update(id: number, updateBeneficiaryDto: UpdateBeneficiaryDto): Promise<Beneficiary> {
    const beneficiary = await this.findOne(id);
    Object.assign(beneficiary, updateBeneficiaryDto);
    return this.beneficiariesRepository.save(beneficiary);
  }
}

