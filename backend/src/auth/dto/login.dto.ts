import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'ana@example.com', description: 'Email adresa korisnika' })
  @IsEmail({}, { message: 'Email mora biti validan' })
  @IsNotEmpty({ message: 'Email je obavezan' })
  email: string;

  @ApiProperty({ example: 'test123', description: 'Password korisnika' })
  @IsString()
  @IsNotEmpty({ message: 'Password je obavezan' })
  password: string;
}