import { IsBoolean, IsOptional, IsString, IsIn, IsDateString, IsInt } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  name: string;

  @IsIn(['beginner', 'medium', 'expert'])
  level: 'beginner' | 'medium' | 'expert';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsInt()
  packageId?: number;

}

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['beginner', 'medium', 'expert'])
  level?: 'beginner' | 'medium' | 'expert';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsInt()
  packageId?: number;

}
