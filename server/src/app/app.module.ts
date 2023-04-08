import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { CONFIG } from 'src/config';
import { PlaylistModule } from 'src/playlist/playlist.module';

@Module({
  imports: [MongooseModule.forRoot(CONFIG.MONGODB_URI), PlaylistModule],
  controllers: [AppController],
})
export class AppModule {}
