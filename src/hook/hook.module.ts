import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionHookRepository } from './repository/action-hook.repository';
import { Module } from '@nestjs/common';
import { ScheduledHookRepository } from './repository/scheduled-hook.repository';
import { HookService } from './hook.service';

@Module({
  imports: [TypeOrmModule.forFeature([ActionHookRepository, ScheduledHookRepository])],
  providers: [HookService],
})
export class HookModule {}
