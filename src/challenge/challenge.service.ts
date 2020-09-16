import { Injectable } from '@nestjs/common';

import { ServiceHelper } from '../common/helpers/service.helper';
import { extractToJson } from '../common/utils/extraction.utils';
import { GameEntity as Game } from '../game/entities/game.entity';
import { UpsertChallengeDto } from './dto/upsert-challenge.dto';
import { ChallengeRepository } from './repositories/challenge.repository';
import { ChallengeEntity as Challenge } from './entities/challenge.entity';

@Injectable()
export class ChallengeService {
  constructor(
    private readonly serviceHelper: ServiceHelper,
    private readonly challengeRepository: ChallengeRepository,
  ) {}

  async importGEdIL(
    game: Game,
    gedilId: string,
    entries: { [path: string]: Buffer },
    parentChallenge?: Challenge,
  ): Promise<Challenge | undefined> {
    let challenge: Challenge;

    const subEntries = { challenges: {}, leaderboards: {}, rewards: {}, rules: {} };
    for (const path of Object.keys(entries)) {
      if (path === 'metadata.json') {
        const encodedContent = extractToJson(entries[path]);
        challenge = await this.create({
          ...encodedContent,
          gameId: game.id,
          parentChallenge,
        });
      } else {
        const result = /^(challenges|leaderboards|rewards|rules)\/([^/]+)\//.exec(path);
        if (result) {
          const subpath = path.substring(result[0].length);
          if (!subEntries[result[1]][result[2]]) {
            subEntries[result[1]][result[2]] = {};
          }
          subEntries[result[1]][result[2]][subpath] = entries[path];
        } else {
          console.error('Unrecognized entry "challenges/%s/%s".', gedilId, path);
        }
      }
    }

    return challenge;
  }

  /**
   * Create a challenge with a set of provides fields.
   *
   * @param id of the challenge to create
   * @param data for creation
   */
  async create(data: UpsertChallengeDto): Promise<Challenge> {
    const fields: { [k: string]: any } = { ...data };
    const newChallenge: Challenge = await this.serviceHelper.getUpsertData(null, fields, this.challengeRepository);
    /* delete fields.children;
    fields.parentChallenge = '';
    if (data.children.length !== 0) {
      const childrenList: Challenge[] = data.children;
      childrenList.forEach(async child => {
        child.parentChallenge = newChallenge;
        this.challengeRepository.save(child);
      });
    } */
    return this.challengeRepository.save(newChallenge);
  }

  /**
   * Find all challenges.
   *
   * @returns {Promise<Challenge[]>} the challenges.
   */
  async findAll(): Promise<Challenge[]> {
    return await this.challengeRepository.find();
  }
}
