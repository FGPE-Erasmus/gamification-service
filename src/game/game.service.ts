import { Injectable, LoggerService } from '@nestjs/common';
import { Readable } from 'stream';
import { Parse } from 'unzipper';

import { extractToJson } from '../common/utils/extraction.utils';
import { BaseService } from '../common/services/base.service';
import { ChallengeService } from '../challenge/challenge.service';
import { ChallengeToDtoMapper } from '../challenge/mappers/challenge-to-dto.mapper';
import { ChallengeToPersistenceMapper } from '../challenge/mappers/challenge-to-persistence.mapper';
import { HookService } from '../hook/hook.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { RewardService } from '../reward/reward.service';
import GameInput from './inputs/game.input';
import { Game } from './models/game.model';
import { GameRepository } from './repositories/game.repository';
import { GameDto } from './dto/game.dto';

@Injectable()
export class GameService extends BaseService<Game, GameInput, GameDto> {

  constructor(
    protected readonly logger: LoggerService,
    protected readonly repository: GameRepository,
    protected readonly toDtoMapper: ChallengeToDtoMapper,
    protected readonly toPersistenceMapper: ChallengeToPersistenceMapper,
    protected readonly challengeService: ChallengeService,
    protected readonly rewardService: RewardService,
    protected readonly leaderboardService: LeaderboardService,
    protected readonly hookService: HookService,
  ) {
    super(logger, repository, toDtoMapper, toPersistenceMapper);
  }

  /**
   * Import a game from a GEdIL layer archive.
   *
   * @param {GameInput} input the game attributes
   * @param {Readable} gedilStream a read stream to the GEdIL specification package.
   */
  async importGEdILArchive(input: GameInput, gedilStream: Readable): Promise<GameDto | undefined> {
    let game: GameDto;
    const entries = { challenges: {}, leaderboards: {}, rewards: {}, rules: {} };

    const zip = gedilStream.pipe(Parse({ forceStream: true }));
    for await (const entry of zip) {
      const fileName = entry.path;
      const buffer = await entry.buffer();

      if (fileName === 'metadata.json') {
        const gedilLayer = extractToJson(buffer);
        game = await this.create({
          ...input,
          gedilLayerId: gedilLayer.id,
          gedilLayerDescription: `[${gedilLayer.name}] ${gedilLayer.description}`,
        });
      } else {
        const result = /^(challenges|leaderboards|rewards|rules)\/([^/]+)\//.exec(fileName);
        if (result) {
          const subpath = fileName.substring(result[0].length);
          if (!entries[result[1]][result[2]]) {
            entries[result[1]][result[2]] = {};
          }
          entries[result[1]][result[2]][subpath] = buffer;
        } else {
          console.error('Unrecognized entry "%s".', fileName);
          entry.autodrain();
        }
      }
    }

    const subObjects = { challenges: {}, leaderboards: {}, rewards: {}, rules: {} };

    // challenges
    for (const gedilId of Object.keys(entries.challenges)) {
      subObjects.challenges[gedilId] = await this.challengeService.importGEdIL(
        game,
        gedilId,
        entries.challenges[gedilId],
      );
    }

    // leaderboards
    for (const gedilId of Object.keys(entries.leaderboards)) {
      subObjects.leaderboards[gedilId] = await this.leaderboardService.importGEdIL(game, entries.leaderboards[gedilId]);
    }

    // rewards
    for (const gedilId of Object.keys(entries.rewards)) {
      subObjects.rewards[gedilId] = await this.rewardService.importGEdIL(game, entries.rewards[gedilId]);
    }

    // rules
    for (const gedilId of Object.keys(entries.rules)) {
      subObjects.rules[gedilId] = await this.hookService.importGEdIL(game, entries.rules[gedilId]);
    }

    return game;
  }
}
