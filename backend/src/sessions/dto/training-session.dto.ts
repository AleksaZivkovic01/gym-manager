import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateTrainingSessionDto {
  @IsString()
  date: string;

  @IsString()
  time: string;

  @IsString()
  type: string;

  @IsInt()
  memberId: number;

  @IsInt()
  trainerId: number;
}

export class UpdateTrainingSessionDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsInt()
  memberId?: number;

  @IsOptional()
  @IsInt()
  trainerId?: number;
}
