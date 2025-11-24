import { IsString, IsOptional } from 'class-validator';

export class CreateTrainerDto {
  @IsString()
  name: string;

  @IsString()
  specialty: string;
}

export class UpdateTrainerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  specialty?: string;
}
