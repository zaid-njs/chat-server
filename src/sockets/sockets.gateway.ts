import { forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { italic, red, yellow } from 'cli-color';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { ChatsService } from 'src/chats/chats.service';
import { Chat, IChat } from 'src/chats/entities/chat.entity';
import { IRoom, Room } from 'src/chats/entities/room.entity';
import { IUser, User } from 'src/users/entities/user.entity';

@WebSocketGateway()
/*
{
  // namespace: 'chat',
  cors: {
    origin: '*',
    credentials: true,
  },
  */
export class SocketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  constructor(
    @InjectModel(User.name) private readonly User: Model<IUser>,
    @InjectModel(Room.name) private readonly Room: Model<IRoom>,
    @InjectModel(Chat.name) private readonly Chat: Model<IChat>,
    @Inject(forwardRef(() => ChatsService))
    private readonly chatsService: ChatsService,
  ) {}

  afterInit(server: Server) {
    console.log(`${yellow('SOCKET INITIALIZED')}`);
  }

  // when user joins the app
  @SubscribeMessage('join')
  async handleConnection(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { id: string },
  ) {
    try {
      if (!payload?.id)
        throw new Error(italic(red('Socket Error: Payload is empty')));

      const { socketIds } = await this.User.findOne({ _id: payload?.id })
        .select('socketIds')
        .lean();

      await Promise.all([
        this.User.findByIdAndUpdate(payload.id, {
          socketIds: [
            ...socketIds.filter((id) => this.server.sockets.sockets.has(id)),
            client.id,
          ],
          isOnline: true,
        }),
        this.Chat.updateMany(
          { to: payload.id },
          { $addToSet: { deliveredTo: payload.id } },
        ),
      ]);

      // fire chat-delivered event for all rooms
      const rooms = await this.Room.find({ 'users.user': payload.id })
        .select('_id')
        .lean();
      const roomIds = rooms.map((room) => room._id.toHexString());

      if (roomIds.length > 0)
        client.broadcast.to(roomIds).emit('chat-delivered');

      console.log(italic(`User Connected: ${payload.id}`));
    } catch (error) {
      console.log(error.message);
    }
  }

  // when user disconnects with the app
  @SubscribeMessage('disconnecting')
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    try {
      const user = await this.User.findOneAndUpdate(
        { socketIds: client.id },
        { $pull: { socketIds: client.id } },
        { new: true },
      );
      if (user?.socketIds?.length === 0) {
        user.isOnline = false;
        await user.save();
      }
      if (!!user) console.log(italic(`User Disconnected: ${user?.id}`));
    } catch (error) {
      console.log(error.message);
    }
  }

  @SubscribeMessage('join-room')
  async handleRoomJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    try {
      if (!payload.roomId)
        throw new Error(italic(red('Socket Error: Payload is empty')));

      client.join(payload.roomId);

      const user = await this.User.findOne({ socketIds: client.id }).lean();

      await this.Chat.updateMany(
        { to: user._id.toHexString() },
        { $addToSet: { readBy: user._id.toHexString() } },
      );

      await this.Room.findByIdAndUpdate(
        payload.roomId,
        {
          'users.$[elem].unreadCount': 0,
        },
        {
          arrayFilters: [{ 'elem.user': user._id.toHexString() }],
        },
      ).lean();

      client.broadcast.to(payload.roomId).emit('chat-read');
    } catch (error) {
      console.log(error.message);
    }
  }

  @SubscribeMessage('leave-room')
  async handleRoomLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    try {
      if (!payload.roomId)
        throw new Error(italic(red('Socket Error: Payload is empty')));

      client.leave(payload.roomId);
    } catch (error) {
      console.log(error.message);
    }
  }

  @SubscribeMessage('chat-message')
  async handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; message: string },
  ) {
    try {
      const from = await this.User.findOne({ socketIds: client.id })
        .select('_id firstName lastName')
        .lean();

      let room = await this.Room.findById(payload.roomId).lean();

      if (!room || !from)
        throw new Error(italic(red('Socket Error: Room or Sender not found')));

      const messageData = await this.chatsService.sendMessage({
        roomId: payload.roomId,
        message: payload.message,
        from: from._id.toHexString(),
        client,
      });
      room = messageData.room;

      // fire the new room socket event
      const socketIds = room.users.reduce((acc, roomUser) => {
        if (roomUser.user._id.toHexString() !== from._id.toHexString()) {
          acc.push(...roomUser.user.socketIds);
        }
        return acc;
      }, []);

      if (socketIds.length > 0)
        client.broadcast.to(socketIds).emit('new-room', { room });

      return { chat: messageData.chat };
    } catch (error) {
      console.log(error.message);
    }
  }
}
