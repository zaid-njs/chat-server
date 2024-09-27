import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'please provide name.' })
  @IsString()
  firstName: string;

  @IsNotEmpty({ message: 'please provide name.' })
  @IsString()
  lastName: string;

  @IsNotEmpty({ message: 'please provide email.' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'please provide password.' })
  @MinLength(8, { message: 'Min 8 characters are required.' })
  @MaxLength(30, { message: 'Max 30 characters are required.' })
  password: string;

  @IsNotEmpty({ message: 'please provide confirm password.' })
  @MinLength(8, { message: 'Min 8 characters are required.' })
  @MaxLength(30, { message: 'Max 30 characters are required.' })
  passwordConfirm: string;

  @IsArray()
  @IsOptional()
  fcmToken: string[];
}
