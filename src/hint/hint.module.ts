import { TypeOrmModule } from '@nestjs/typeorm';
import { HintService } from './hint.service';
import { HintRepository } from './repository/hint.repository';
import { HintResolver } from './hint.resolver';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([HintRepository])],
  providers: [HintService, HintResolver],
  exports: [HintService],
})
export class HintModule {}
