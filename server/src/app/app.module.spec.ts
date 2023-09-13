import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { closeMongoConnection, rootMongooseTestModule } from '../utils/test';

describe.skip('AppModule', () => {
  it('loads properly', async () => {
    const module = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), AppModule],
    }).compile();

    expect(module).toBeDefined();
  });

  afterAll(async () => {
    await closeMongoConnection();
  });
});
