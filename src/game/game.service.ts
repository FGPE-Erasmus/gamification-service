import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { Parse, Entry } from 'unzipper';

import GameDto from './game.dto';
import { ExtractionHelper } from 'src/common/helpers/extraction.helper';
import { ChallengeEntity as Challenge } from 'src/challenge/entities/challenge.entity';
import { ChallengeService } from 'src/challenge/challenge.service';
import { UpsertChallengeDto } from 'src/challenge/dto/upsert-challenge.dto';
import { RewardType } from 'src/common/enum/reward-type.enum';

@Injectable()
export class GameService {
  constructor(private extractionHelper: ExtractionHelper, private challengeService: ChallengeService) {}
  /**
   * Create a game from a GEdIL specification.
   *
   * @param game the game properties
   * @param gedilStream a read stream to the GEdIL specification package.
   */
  async create(game: GameDto, gedilStream: Readable): Promise<boolean | undefined> {
    console.log(game);

    const regexChallenge = /\b(\w*challenges\w*)\b/g;
    const regexRewards = /\b(\w*rewards\w*)\b/g;
    const regexLeaderboards = /\b(\w*leaderboards\w*)\b/g;
    const regexRules = /\b(\w*rules\w*)\b/g;

    gedilStream.pipe(Parse()).on('entry', async (entry: Entry) => {
      const fileName = entry.path;
      const type = entry.type;
      const size = entry.vars.compressedSize;
      const content = await entry.buffer();
      const encodedContent = this.extractionHelper.extractToJson(content);

      // if (regexChallenge.test(fileName) && regexRewards.test(fileName)) {
      //   switch (encodedContent.kind) {
      //     case RewardType.BADGE:
      //     case RewardType.COUPON:
      //     case RewardType.HINT:
      //     case RewardType.VIRTUAL_ITEM:
      //   }
      // }

      if (regexChallenge.test(fileName) && !regexRewards.test(fileName)) {
        const challenge: UpsertChallengeDto = encodedContent as UpsertChallengeDto;
        await this.challengeService.createChallenge(challenge);
      }
      entry.autodrain();
    });
    return true;
  }
}
