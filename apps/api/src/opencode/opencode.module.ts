import { Module } from '@nestjs/common';
import { OpencodeService } from './opencode.service';

@Module({
  providers: [OpencodeService],
  exports: [OpencodeService],
})
export class OpencodeModule {}
