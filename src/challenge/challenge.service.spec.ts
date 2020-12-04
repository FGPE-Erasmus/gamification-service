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
  let challengeAbnormal: Challenge;
  let challengeFenomenal: Challenge;
  let challengeSophisticated: Challenge;

  const testChallengeAbnormal = {
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

  const testChallengeFenomenal = {
    game: '6853e599-d0bc-4a96-a83c-14086ba22660',
    name: 'Fenomenal challenge',
    description: 'Just a fenomenal challenge.',
    difficulty: Difficulty.BEGINNER,
    mode: Mode.HACK_IT,
    modeParameters: [],
    refs: ['A', 'B', 'C'],
    locked: false,
    hidden: true,
  };

  const testChallengeSophisticated = {
    game: '6853e599-d0bc-4a96-a83c-14086ba22661',
    name: 'Sophisticated challenge',
    description: 'Just a sophisticated challenge.',
    difficulty: Difficulty.HARD,
    mode: Mode.SHAPESHIFTER,
    modeParameters: [],
    refs: ['123', '456', '789'],
    locked: false,
    hidden: true,
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
    challengeAbnormal = await service.create(testChallengeAbnormal);
    challengeFenomenal = await service.create(testChallengeFenomenal);
    challengeSophisticated = await service.create(testChallengeSophisticated);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add new challenge', async () => {
    expect(challengeAbnormal).toEqual(expect.objectContaining(challengeAbnormal));
  });

  it('should get entity inserted', async () => {
    const foundChallenge: Challenge = await service.findById(challengeAbnormal.id);
    expect(foundChallenge).toEqual(expect.objectContaining(challengeAbnormal));
  });

  it('should find an entity by game id', async () => {
    const foundChallenges: Challenge[] = await service.findByGameId(challengeAbnormal.game);
    expect(foundChallenges).toEqual(expect.objectContaining([challengeAbnormal, challengeFenomenal]));
  });

  it('should find an entity by game id', async () => {
    const foundChallenges: Challenge[] = await service.findByGameId(challengeAbnormal.game);
    expect(foundChallenges).toEqual(expect.objectContaining([challengeAbnormal, challengeFenomenal]));
  });

  it('should return locked challenges', async () => {
    const lockedChallenges: Challenge[] = await service.findLocked(true, challengeAbnormal.game);
    expect(lockedChallenges).toEqual(expect.objectContaining([challengeAbnormal]));
  });

  it('should return visible challenges', async () => {
    const hiddenChallenges: Challenge[] = await service.findHidden(true);
    expect(hiddenChallenges).toEqual(expect.objectContaining([challengeFenomenal, challengeSophisticated]));
  });

  it('should return challenge found by name', async () => {
    const foundChallenge: Challenge[] = await service.findByName(challengeAbnormal.name, challengeAbnormal.game);
    expect(foundChallenge).toEqual(expect.objectContaining([challengeAbnormal]));
  });

  it('should retrieve all challenges', async () => {
    const foundChallenge: Challenge[] = await service.findAll();
    expect(foundChallenge).toEqual(
      expect.objectContaining([challengeAbnormal, challengeFenomenal, challengeSophisticated]),
    );
  });
});
