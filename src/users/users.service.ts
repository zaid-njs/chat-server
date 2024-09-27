import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser, User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly User: Model<IUser>) {}

  async getAll(user: IUser): Promise<IUser[]> {
    return await this.User.find({ _id: { $ne: user._id.toHexString() } });
  }
}
