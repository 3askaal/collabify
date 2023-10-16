import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { CONFIG, NEST_CONFIG } from '../config';
import { PlaylistModule } from '../playlist/playlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [NEST_CONFIG],
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(CONFIG.MONGODB_URI),
    PlaylistModule,
  ],
})
export class AppModule {}
