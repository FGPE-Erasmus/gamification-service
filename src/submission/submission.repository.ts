import { EntityRepository, Repository } from 'typeorm';

import { SubmissionEntity as Submission } from './entity/submission.entity';

@EntityRepository(Submission)
export class SubmissionRepository extends Repository<Submission> {}
