import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { appConfig } from '../app.config';
import { EventLog } from './models/event-log.model';
import { EventLogRepository } from './repositories/event-log.repository';

@Injectable()
export class EventService {
  constructor(
    @InjectQueue(appConfig.queue.event.name) protected readonly eventQueue: Queue,
    protected readonly repository: EventLogRepository,
  ) {}

  async fireEvent(event: string, params: { [key: string]: any }): Promise<void> {
    await this.eventQueue.add(`${event.toUpperCase()}_JOB`, params);
  }

  async createEventLog(input: EventLog): Promise<EventLog> {
    return await this.repository.save(input);
  }

  async hasEventLogsMatching(params: {
    game: string;
    player?: string;
    actionHook?: string;
    scheduledHook?: string;
    challenge?: string;
    activityId?: string;
    reward?: string;
  }): Promise<boolean> {
    const conditions: any[] = [];
    conditions.push({ game: { $eq: params.game } });
    if (params.player) conditions.push({ player: { $eq: params.player } });
    if (params.actionHook) conditions.push({ actionHook: { $eq: params.actionHook } });
    if (params.scheduledHook) conditions.push({ scheduledHook: { $eq: params.scheduledHook } });
    if (params.challenge) conditions.push({ challenge: { $eq: params.challenge } });
    if (params.activityId) conditions.push({ activityId: { $eq: params.activityId } });
    if (params.reward) conditions.push({ reward: { $eq: params.reward } });
    if (conditions.length > 1) {
      return !!(await this.repository.findOne({
        $and: [...conditions],
      }));
    } else {
      return !!(await this.repository.findOne({
        ...conditions[0],
      }));
    }
  }
}
