import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from './package.entity';
import { CreatePackageDto, UpdatePackageDto } from './dto/package.dto';

@Injectable()
export class PackageService {
  constructor(
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
  ) {}

  findAll(): Promise<Package[]> {
    return this.packageRepository.find({
      order: { price: 'ASC' },
    });
  }

  findOne(id: number): Promise<Package | null> {
    return this.packageRepository.findOne({
      where: { id },
    });
  }

  create(dto: CreatePackageDto): Promise<Package> {
    const newPackage = this.packageRepository.create(dto);
    return this.packageRepository.save(newPackage);
  }

  async update(id: number, dto: UpdatePackageDto): Promise<Package> {
    await this.packageRepository.update(id, dto);
    const updated = await this.findOne(id);
    if (!updated) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    const result = await this.packageRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }
  }
}

