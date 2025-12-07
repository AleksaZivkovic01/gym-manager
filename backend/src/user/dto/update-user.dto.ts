import { IsEmail, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional()
  @Transform(({ value }) => value && value.trim() ? value.trim() : undefined)
  @ValidateIf((o) => o.email !== undefined && o.email !== null && o.email !== '')
  @IsEmail({}, { message: 'Email mora biti validan' })
  email?: string;

  @IsOptional()
  @Transform(({ value }) => value && value.trim() ? value.trim() : undefined)
  @ValidateIf((o) => o.oldPassword !== undefined && o.oldPassword !== null && o.oldPassword !== '')
  @IsString()
  oldPassword?: string;

  @IsOptional()
  @Transform(({ value }) => value && value.trim() ? value.trim() : undefined)
  @ValidateIf((o) => o.newPassword !== undefined && o.newPassword !== null && o.newPassword !== '')
  @IsString()
  @MinLength(6, { message: 'Nova lozinka mora imati najmanje 6 karaktera' })
  newPassword?: string;
}
