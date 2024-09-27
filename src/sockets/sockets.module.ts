import { forwardRef, Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { ChatsModule } from 'src/chats/chats.module';
import { Chat, ChatSchema } from 'src/chats/entities/chat.entity';
import { Room, RoomSchema } from 'src/chats/entities/room.entity';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { SocketsGateway } from './sockets.gateway';

@Module({
  imports: [
    forwardRef(() => ChatsModule),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Chat.name, schema: ChatSchema },
      { name: Room.name, schema: RoomSchema },
    ]),
  ],

  providers: [SocketsGateway],
  exports: [SocketsGateway],
})
export class SocketsModule {}
