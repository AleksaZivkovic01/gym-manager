import { IsString, IsInt, IsOptional, IsDateString, Matches, Min } from 'class-validator';

export class CreateTrainingSessionDto {
  @IsDateString({}, { message: 'Date must be in format YYYY-MM-DD' })
  date: string;

  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, { message: 'Time must be in format HH:MM or HH:MM:SS' })
  time: string;

  @IsString()
  type: string;

  @IsInt()
  @Min(1)
  trainerId: number;

  @IsInt()
  @Min(1)
  maxParticipants: number;
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
  trainerId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;
}

export class RegisterToSessionDto {
  @IsInt()
  memberId: number;
}

export class CreateTrainingSessionByTrainerDto {
  @IsDateString({}, { message: 'Date must be in format YYYY-MM-DD' })
  date: string;

  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, { message: 'Time must be in format HH:MM or HH:MM:SS' })
  time: string;

  @IsString()
  type: string;

  @IsInt()
  @Min(1)
  maxParticipants: number;
}