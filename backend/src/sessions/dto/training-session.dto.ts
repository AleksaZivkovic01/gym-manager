import { IsString, IsInt, IsOptional, IsDateString, Matches } from 'class-validator';

export class CreateTrainingSessionDto {
  @IsDateString({}, { message: 'Date must be in format YYYY-MM-DD' })
  date: string;

  @Matches(/^\d{2}:\d{2}$/, { message: 'Time must be in format HH:MM' })
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
  @IsDateString({}, { message: 'Date must be in format YYYY-MM-DD' })
  date?: string;

  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Time must be in format HH:MM' })
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