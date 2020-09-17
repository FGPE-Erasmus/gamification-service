import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Readable } from 'stream';
import { Parse } from 'unzipper';

import { extractToJson } from '../common/utils/extraction.utils';
import { ChallengeService } from '../challenge/challenge.service';
import GameDto from './dto/game.dto';
import { GameEntity as Game } from './entities/game.entity';
import { GameRepository } from './repositories/game.repository';
import { LeaderboardService } from 'src/leaderboard/leaderboard.service';

@Injectable()
export class GameService {
  constructor(
    private challengeService: ChallengeService,
    private gameRepository: GameRepository,
    private leaderboardService: LeaderboardService,
  ) {}

  /**
   * Import a game from a GEdIL layer archive.
   *
   * @param game {Game} the game properties
   * @param gedilStream {Readable} a read stream to the GEdIL specification package.
   */
  async importGEdILArchive(gameDto: GameDto, gedilStream: Readable): Promise<Game | undefined> {
    let game: Game;
    const entries = { challenges: {}, leaderboards: {}, rewards: {}, rules: {} };

    const zip = gedilStream.pipe(Parse({ forceStream: true }));
    for await (const entry of zip) {
      const fileName = entry.path;
      const buffer = await entry.buffer();

      // if (regexChallenge.test(fileName) && regexRewards.test(fileName)) {
      //   switch (encodedContent.kind) {
      //     case RewardType.BADGE:
      //     case RewardType.COUPON:
      //     case RewardType.HINT:
      //     case RewardType.VIRTUAL_ITEM:
      //   }
      // }

      if (fileName === 'metadata.json') {
        game = await this.create(gameDto, extractToJson(buffer));
      } else {
        const result = /^(challenges|leaderboards|rewards|rules)\/([^/]+)\//.exec(fileName);
        console.log(result);
        if (result) {
          const subpath = fileName.substring(result[0].length);
          console.log(subpath);
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
    /* for (const gedilId of Object.keys(entries.rewards)) {
      // TODO
    } */

    // rules
    /* for (const gedilId of Object.keys(entries.rules)) {
      // TODO
    } */

    return game;
  }

  /**
   * Create a game.
   *
   * @param game {Game} the game properties
   * @param gedilLayer {any} data about the GEdIL layer.
   */
  async create(gameDto: GameDto, gedilLayer: { id: string; name: string; description: string }): Promise<Game> {
    return this.gameRepository.save({
      ...gameDto,
      gedilLayerId: gedilLayer.id,
      gedilLayerDescription: `[${gedilLayer.name}] ${gedilLayer.description}`,
    });
  }

  /**
   * Returns a game by their ID
   *
   * @param {string} id of game
   * @returns {(Promise<Game | undefined>)}
   * @memberof UsersService
   */
  async findGameById(id: string): Promise<Game> {
    return await this.gameRepository.findOne({
      where: {
        _id: ObjectId(id),
      },
    });
  }
}
