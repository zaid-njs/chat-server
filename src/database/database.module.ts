import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { green } from 'cli-color';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri: string = String(configService.get('DATABASE')).replace(
          '<PASSWORD>',
          configService.get('DATABASE_PASSWORD'),
        );
        console.log(green('Database Connected Successfully...'));
        return { uri };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [],
  providers: [],
})
export class DatabaseModule {}
