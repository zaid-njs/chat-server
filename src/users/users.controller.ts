import { Controller, Get } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { IUser } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  @Auth()
  async getMe(@GetUser() user: IUser) {
    return user;
  }

  @Get('/')
  @Auth()
  async getAll(@GetUser() user: IUser) {
    const data = await this.usersService.getAll(user);
    return { data };
  }
}
