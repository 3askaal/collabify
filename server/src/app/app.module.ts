import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { CONFIG, NEST_CONFIG } from 'src/config';
import { PlaylistModule } from 'src/playlist/playlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [NEST_CONFIG],
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(CONFIG.MONGODB_URI),
    PlaylistModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
