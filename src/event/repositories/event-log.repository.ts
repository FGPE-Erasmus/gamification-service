import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { EventLog, EventLogDocument } from '../models/event-log.model';

@Injectable()
export class EventLogRepository extends BaseRepository<EventLog, EventLogDocument> {
  constructor(@InjectModel('EventLog') protected readonly eventLogModel: Model<EventLogDocument>) {
    super(new Logger(EventLogRepository.name), eventLogModel);
  }
}
