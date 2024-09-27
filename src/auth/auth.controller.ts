import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { IUser, User } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { GetUser } from './decorators/user.decorator';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  //post routes
  @Post('/signup') // signup for a user
  async signup(@Body() createUserDto: CreateUserDto) {
    const data = await this.authService.signup(createUserDto);

    return { status: 'success', data };
  }

  @Post('/login') //login for a user
  async login(@Body() loginUserDto: LoginUserDto) {
    const data = await this.authService.login(loginUserDto);

    return { status: 'success', data };
  }

  @Post('/logout') // For logout user & admin
  @Auth()
  async logout(@Body('fcmToken') fcmToken: string, @GetUser() user: IUser) {
    await this.authService.logout(fcmToken, user.id);

    return {
      status: 'success',
      message: 'logout success',
    };
  }
}
