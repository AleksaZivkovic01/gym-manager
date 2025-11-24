import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  name: string;

  @IsString()
  membershipType: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  membershipType?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
