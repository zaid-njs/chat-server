import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { IUser } from 'src/users/entities/user.entity';
import { pagination } from 'src/utils/utils.types';
import { ChatsService } from './chats.service';
import { REFERENCE } from './enums/chat.enum';

@Controller({ path: 'chats', version: '1' })
export class ChatsController {
  constructor(private readonly chatService: ChatsService) {}

  @Get('/')
  @Auth()
  async getRooms(
    @GetUser() user: IUser,
    @Query() query: pagination & { search: string },
  ) {
    const data = await this.chatService.getRooms(user, query);

    return { data };
  }

  // get chat messages against Room for user
  @Get('/messages/:room')
  @Auth()
  async chatMessages(
    @GetUser() user: IUser,
    @Param('room') room: string,
    @Query() query: pagination,
  ) {
    const data = await this.chatService.chatMessages(user, room, query);
    return { data };
  }

  //create a new chat
  @Post('/start')
  @Auth()
  async startChat(
    @GetUser() user: IUser,
    @Body('users') users: string[],
    @Body('message') message?: string,
    @Body('reference') reference?: REFERENCE,
  ) {
    const data = await this.chatService.startChat(
      {
        users,
        message,
        reference,
      },
      user,
    );

    return { data };
  }

  // join Room for broker
  @Patch('/join')
  @Auth()
  async joinRoom(@GetUser() user: IUser, @Body('roomId') roomId: string) {
    const data = await this.chatService.joinRoom(user, roomId);

    return { status: 'success', data };
  }

  // leave Room
  @Patch('/leave')
  @Auth()
  async leaveRoom(@GetUser() user: IUser, @Body('roomId') roomId: string) {
    const data = await this.chatService.leaveRoom(user, roomId);
    return { status: 'success', data };
  }

  @Patch('/end')
  @Auth()
  async endRoom(@Body('roomId') roomId: string) {
    const data = await this.chatService.endRoom(roomId);
    return { status: 'success', data };
  }
}
