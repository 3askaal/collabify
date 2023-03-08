import { Module } from '@nestjs/common';
import { AppController } from './playlist/playlist.resolver';
import { AppService } from './playlist.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
