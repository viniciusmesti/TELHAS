import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString({ message: 'O nome não pode estar vazio' })
  name: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password: string;

  @IsEnum(['admin', 'user'], { message: 'Role deve ser admin ou user' })
  role: string;
}
