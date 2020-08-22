import { EntityRepository, Repository } from 'typeorm';

import { SubmissionEntity as Submission } from './entities/submission.entity';

@EntityRepository(Submission)
export class SubmissionRepository extends Repository<Submission> {}
