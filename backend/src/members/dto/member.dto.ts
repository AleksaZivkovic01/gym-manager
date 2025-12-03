import { IsBoolean, IsOptional, IsString, IsIn, IsDateString } from 'class-validator';

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
}