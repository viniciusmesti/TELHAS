import { IsEmail, IsNotEmpty, IsString } from "class-validator";


export class LoginDto {
    @IsEmail({}, { message: 'Email inválido.' })
    @IsNotEmpty({ message: 'O email náo pode estar vazio.' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'A senha náo pode estar vazia.' })
    password: string;
  }
  