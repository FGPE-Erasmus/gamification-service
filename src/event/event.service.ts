import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { appConfig } from '../app.config';

@Injectable()
export class EventService {
  constructor(@InjectQueue(appConfig.queue.event.name) protected readonly eventQueue: Queue) {}

  async fireEvent(event: string, params: { [key: string]: any }): Promise<void> {
    await this.eventQueue.add(`${event.toUpperCase()}_JOB`, params);
  }
}
