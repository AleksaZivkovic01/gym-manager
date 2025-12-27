import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PackageService } from './package.service';
import { CreatePackageDto, UpdatePackageDto } from './dto/package.dto';
import { Package } from './package.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  
  @Get()
  getAll(): Promise<Package[]> {
    return this.packageService.findAll();
  }

  
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number): Promise<Package | null> {
    return this.packageService.findOne(id);
  }

  
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreatePackageDto): Promise<Package> {
    return this.packageService.create(dto);
  }

  
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('admin')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePackageDto,
  ): Promise<Package> {
    return this.packageService.update(id, dto);
  }

  
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('admin')
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.packageService.delete(id);
  }
}

