import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested, IsInt, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UserRole } from '../../user/user.entity';

class MemberRegisterDataDto {
  @ApiProperty({ example: 'Petar Petrović' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: ['beginner', 'medium', 'expert'] })
  @IsIn(['beginner', 'medium', 'expert'])
  level: 'beginner' | 'medium' | 'expert';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ required: false, example: '2000-01-01' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}

class TrainerRegisterDataDto {
  @ApiProperty({ example: 'Marko Marković' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Fitness' })
  @IsString()
  @IsNotEmpty()
  specialty: string;

  @ApiProperty({ required: false, example: 5 })
  @IsOptional()
  @IsInt()
  experienceYears?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ required: false, example: '1995-05-10' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'ana@example.com', description: 'Jedinstvena email adresa' })
  @IsEmail({}, { message: 'Email mora biti validan' })
  @IsNotEmpty({ message: 'Email je obavezan' })
  email: string;

  @ApiProperty({ example: 'tajna123', description: 'Lozinka korisnika' })
  @IsString()
  @MinLength(6, { message: 'Lozinka mora imati najmanje 6 karaktera' })
  password: string;

  @ApiProperty({ enum: ['member', 'trainer'], required: true, description: 'Uloga korisnika' })
  @IsIn(['member', 'trainer'])
  role: UserRole;

  @ApiProperty({ required: false, type: MemberRegisterDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MemberRegisterDataDto)
  member?: MemberRegisterDataDto;

  @ApiProperty({ required: false, type: TrainerRegisterDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TrainerRegisterDataDto)
  trainer?: TrainerRegisterDataDto;
}
