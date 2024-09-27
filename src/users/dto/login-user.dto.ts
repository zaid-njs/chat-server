import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty({ message: 'please provide email.' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'please provide password.' })
  @MinLength(8, { message: 'Min 8 characters are required.' })
  @MaxLength(30, { message: 'Max 30 characters are required.' })
  password: string;

  @IsOptional()
  @IsArray()
  @IsNotEmpty({ message: 'fcmToken is cannot be empty.' })
  fcmToken: string[];
}
