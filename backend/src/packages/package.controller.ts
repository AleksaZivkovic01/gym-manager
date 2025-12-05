import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PackageService } from './package.service';
import { CreatePackageDto, UpdatePackageDto } from './dto/package.dto';
import { Package } from './package.entity';

@Controller('packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  // Public endpoint - anyone can view packages
  @Get()
  getAll(): Promise<Package[]> {
    return this.packageService.findAll();
  }

  // Public endpoint - anyone can view a package
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number): Promise<Package | null> {
    return this.packageService.findOne(id);
  }

  // Admin only - Create package
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() dto: CreatePackageDto): Promise<Package> {
    // TODO: Add admin role check
    return this.packageService.create(dto);
  }

  // Admin only - Update package
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePackageDto,
  ): Promise<Package> {
    // TODO: Add admin role check
    return this.packageService.update(id, dto);
  }

  // Admin only - Delete package
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // TODO: Add admin role check
    return this.packageService.delete(id);
  }
}

