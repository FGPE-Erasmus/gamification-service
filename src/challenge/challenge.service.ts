import { Injectable } from '@nestjs/common';
import { ServiceHelper } from '../common/helpers/service.helper';
import { UpsertChallengeDto } from './dto/upsert-challenge.dto';
import { ChallengeRepository } from './repositories/challenge.repository';
import { ChallengeEntity as Challenge } from './entities/challenge.entity';

@Injectable()
export class ChallengeService {
  constructor(
    private readonly serviceHelper: ServiceHelper,
    private readonly challengeRepository: ChallengeRepository,
  ) {}

  /**
   * Create a challenge with a set of providesd fields.
   *
   * @param id of the challenge to create
   * @param data for creation
   */

  async createChallenge(data: UpsertChallengeDto): Promise<Challenge> {
    const fields: { [k: string]: any } = { ...data };
    delete fields.children;
    fields.parentChallenge = '';
    const newChallenge: Challenge = await this.serviceHelper.getUpsertData(fields.id, fields, this.challengeRepository);
    if (data.children.length !== 0) {
      const childrenList: Challenge[] = data.children;
      childrenList.forEach(async child => {
        child.parentChallenge = newChallenge;
        this.challengeRepository.save(child);
      });
    }
    return this.challengeRepository.save(newChallenge);
  }
}
