import { Test } from '@nestjs/testing';
import { PlaylistModule } from './playlist.module';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { rootMongooseTestModule } from '../testing';

describe('PlaylistModule', () => {
  it('loads properly', async () => {
    const module = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), PlaylistModule],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(PlaylistController)).toBeInstanceOf(PlaylistController);
    expect(module.get(PlaylistService)).toBeInstanceOf(PlaylistService);
  });
});
