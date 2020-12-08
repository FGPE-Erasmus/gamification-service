import { forwardRef } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { TestingModule, Test } from '@nestjs/testing';
import { Connection } from 'mongoose';

import { ChallengeModule } from '../challenge/challenge.module';
import { SubscriptionsModule } from '../common/subscriptions/subscriptions.module';
import { EventModule } from '../event/event.module';
import { GameModule } from '../game/game.module';
import { HookModule } from '../hook/hook.module';
import { PlayerModule } from '../player/player.module';
import { BadgeResolver } from './badge.resolver';
import { CouponResolver } from './coupon.resolver';
import { HintResolver } from './hint.resolver';
import { RewardToDtoMapper } from './mappers/reward-to-dto.mapper';
import { MessageResolver } from './message.resolver';
import { RewardType } from './models/reward-type.enum';
import { Reward, RewardSchema } from './models/reward.model';
import { PointResolver } from './point.resolver';
import { RewardRepository } from './repositories/reward.repository';
import { RevealResolver } from './reveal.resolver';
import { RewardResolver } from './reward.resolver';
import { RewardService } from './reward.service';
import { UnlockResolver } from './unlock.resolver';
import { VirtualItemResolver } from './virtual-item.resolver';
import DbTestModule, { cleanupMongo } from '../../test/utils/db-test.module';

const gameId = '440850928599';

const testReward1 = {
  game: gameId,
  kind: RewardType.BADGE,
  name: 'Brightest star in the universe',
  description: 'Shines and blinds',
  recurrent: false,
  amount: 2,
  message: 'Shines and blinds again',
  players: [],
};

const testReward2 = {
  game: gameId,
  kind: RewardType.UNLOCK,
  name: 'Ultimate one',
  description: 'Be the master',
  recurrent: true,
  challenges: [],
  players: [],
};

describe('RewardService', () => {
  describe('Reward', () => {
    let connection: Connection;
    let service: RewardService;
    let rewardBadge: Reward;
    let rewardUnlock: Reward;

    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          MongooseModule.forFeature([
            {
              name: 'Reward',
              schema: RewardSchema,
            },
          ]),
          forwardRef(() => EventModule),
          forwardRef(() => GameModule),
          forwardRef(() => ChallengeModule),
          forwardRef(() => PlayerModule),
          forwardRef(() => HookModule),
          forwardRef(() => SubscriptionsModule),
          DbTestModule({}),
        ],
        providers: [
          RewardToDtoMapper,
          RewardRepository,
          RewardService,
          RewardResolver,
          BadgeResolver,
          CouponResolver,
          HintResolver,
          MessageResolver,
          PointResolver,
          RevealResolver,
          VirtualItemResolver,
          UnlockResolver,
        ],
      }).compile();
      connection = module.get<Connection>(await getConnectionToken());
      service = module.get<RewardService>(RewardService);
    });

    beforeEach(async () => {
      await cleanupMongo('Reward');
      await cleanupMongo('Event');
      rewardBadge = await service.create(testReward1);
      rewardUnlock = await service.create(testReward2);
    });

    afterAll(async () => {
      await connection.close();
    });

    describe('create', () => {
      it('should create badge reward', async () => {
        expect(rewardBadge).toEqual(expect.objectContaining(testReward1));
      });

      it('should create unlock reward', async () => {
        expect(rewardUnlock).toEqual(expect.objectContaining(testReward2));
      });
    });

    describe('findByGameId', () => {
      it('should find two reward through game id', async () => {
        const foundRewards = await service.findByGameId(gameId);
        expect(foundRewards).toEqual(expect.objectContaining([rewardUnlock, rewardBadge].values()));
      });

      it('should find a badge reward through game id and kind', async () => {
        const foundReward = await service.findByGameId(gameId, RewardType.BADGE);
        expect(foundReward).toEqual(expect.objectContaining([rewardBadge]));
      });
    });
  });
});
