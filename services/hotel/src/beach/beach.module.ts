import { Module } from '@nestjs/common';
import { BeachService } from './beach.service';

@Module({
  providers: [BeachService],
  exports: [BeachService],
})
export class BeachModule {}
