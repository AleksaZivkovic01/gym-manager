import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePackageDto {
  @ApiProperty({ example: 'Basic Plan' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '8 termina mesečno, pristup osnovnoj opremi', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 25.00 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 8, description: '0 = unlimited' })
  @IsNumber()
  @Min(0)
  sessionsPerMonth: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdatePackageDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sessionsPerMonth?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

