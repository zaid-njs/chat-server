import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { SocketsModule } from 'src/sockets/sockets.module';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { Chat, ChatSchema } from './entities/chat.entity';
import { Room, RoomSchema } from './entities/room.entity';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => SocketsModule),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Chat.name, schema: ChatSchema },
      { name: Room.name, schema: RoomSchema },
    ]),
  ],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
