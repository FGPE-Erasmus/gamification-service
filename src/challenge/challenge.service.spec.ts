import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { forwardRef } from '@nestjs/common';
import { Connection } from 'mongoose';

import { ChallengeService } from './challenge.service';
import DbTestModule, { cleanupMongo } from '../../test/utils/db-test.module';
import { Challenge, ChallengeSchema } from './models/challenge.model';
import { ChallengeResolver } from './challenge.resolver';
import { ChallengeToDtoMapper } from './mappers/challenge-to-dto.mapper';
import { SubscriptionsModule } from '../common/subscriptions/subscriptions.module';
import { GameModule } from '../game/game.module';
import { HookModule } from '../hook/hook.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { RewardModule } from '../reward/reward.module';
import { UsersModule } from '../users/users.module';
import { ChallengeRepository } from './repositories/challenge.repository';
import { Difficulty } from './models/difficulty.enum';
import { Mode } from './models/mode.enum';

describe('ChallengeService', () => {
  let connection: Connection;
  let service: ChallengeService;

  const testChallenge = {
    game: '6853e599-d0bc-4a96-a83c-14086ba22660',
    name: 'Abnormal challenge',
    description: 'Just an abnormal challenge.',
    difficulty: Difficulty.MASTER,
    mode: Mode.SPEEDUP,
    modeParameters: [],
    refs: ['FirstRef', 'SecondRef', 'ThirdRef'],
    locked: true,
    hidden: false,
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forFeature([{ name: 'Challenge', schema: ChallengeSchema }]),
        forwardRef(() => UsersModule),
        forwardRef(() => GameModule),
        forwardRef(() => HookModule),
        forwardRef(() => LeaderboardModule),
        forwardRef(() => RewardModule),
        forwardRef(() => SubscriptionsModule),
        DbTestModule({}),
      ],
      providers: [ChallengeToDtoMapper, ChallengeRepository, ChallengeService, ChallengeResolver],
    }).compile();

    connection = module.get<Connection>(await getConnectionToken());
    service = module.get<ChallengeService>(ChallengeService);
  });

  beforeEach(async () => {
    await cleanupMongo('Challenge');
    await cleanupMongo('Leaderboard');
    await cleanupMongo('Reward');
    await cleanupMongo('ActionHook');
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add new challenge', async () => {
    const challenge = await service.create(testChallenge);

    expect(challenge).toEqual(expect.objectContaining(testChallenge));
  });

  it('should get entity inserted', async () => {
    const challenge: Challenge = await service.create(testChallenge);

    const foundChallenge: Challenge = await service.findById(challenge.id);

    expect(foundChallenge).toEqual(expect.objectContaining(challenge));
  });

  it('should find an entity by game id', async () => {
    const challenge: Challenge = await service.create(testChallenge);

    const foundChallenge: Challenge[] = await service.findByGameId(challenge.game);

    expect(foundChallenge).toEqual(expect.objectContaining([challenge]));
  });

  it('should find an entity by game id', async () => {
    const challenge: Challenge = await service.create(testChallenge);

    const foundChallenge: Challenge[] = await service.findByGameId(challenge.game);

    expect(foundChallenge).toEqual(expect.objectContaining([challenge]));
  });

  it('should return locked challenge', async () => {
    const challenge: Challenge = await service.create(testChallenge);

    const lockedChallenges: Challenge[] = await service.findLocked(true, challenge.game);

    expect(lockedChallenges).toEqual(expect.objectContaining([challenge]));
  });

  it('should return visible challenge', async () => {
    const challenge: Challenge = await service.create(testChallenge);

    const hiddenChallenges: Challenge[] = await service.findHidden(false, challenge.game);

    expect(hiddenChallenges).toEqual(expect.objectContaining([challenge]));
  });

  it('should return challenge found by name', async () => {
    const challenge: Challenge = await service.create(testChallenge);

    const foundChallenge: Challenge[] = await service.findByName(challenge.name, challenge.game);

    expect(foundChallenge).toEqual(expect.objectContaining([challenge]));
  });
});
