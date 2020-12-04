import { forwardRef } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ObjectId } from 'mongodb';
import { Connection } from 'mongoose';

import DbTestModule, { cleanupMongo } from '../../test/utils/db-test.module';
import { ChallengeModule } from '../challenge/challenge.module';
import { SubscriptionsModule } from '../common/subscriptions/subscriptions.module';
import { EventModule } from '../event/event.module';
import { PlayerModule } from '../player/player.module';
import { UsersModule } from '../users/users.module';
import { ChallengeStatusResolver } from './challenge-status.resolver';
import { ChallengeStatusService } from './challenge-status.service';
import { ChallengeStatusToDtoMapper } from './mappers/challenge-status-to-dto.mapper';
import { ChallengeStatus, ChallengeStatusSchema } from './models/challenge-status.model';
import { StateEnum as State } from './models/state.enum';
import { ChallengeStatusRepository } from './repositories/challenge-status.repository';
import { EventService } from '../event/event.service';

describe('ChallengeStatusService', () => {
  let connection: Connection;
  let service: ChallengeStatusService;
  let challengeStatusAbnormal: ChallengeStatus;
  const gameId = 'd4302172-58c7-431f-b1a6-0069ffb61b4c';

  const testChallengeStatusAbnormal = {
    player: new ObjectId('41224d776a326fb40f000002'),
    challenge: new ObjectId('41224d776a326fb40f000001'),
    startedAt: new Date('2020-11-03T22:10:52.723Z'),
    openedAt: new Date('2020-12-03T22:10:52.723Z'),
    endedAt: new Date('2020-12-03T22:10:52.723Z'),
    state: State.AVAILABLE,
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forFeature([
          {
            name: 'ChallengeStatus',
            schema: ChallengeStatusSchema,
          },
        ]),
        forwardRef(() => UsersModule),
        forwardRef(() => EventModule),
        forwardRef(() => PlayerModule),
        forwardRef(() => ChallengeModule),
        forwardRef(() => SubscriptionsModule),
        DbTestModule({}),
      ],
      providers: [
        ChallengeStatusToDtoMapper,
        ChallengeStatusRepository,
        ChallengeStatusService,
        ChallengeStatusResolver,
      ],
    }).compile();
    connection = module.get<Connection>(await getConnectionToken());
    service = module.get<ChallengeStatusService>(ChallengeStatusService);
  });

  beforeEach(async () => {
    await cleanupMongo('Player');
    await cleanupMongo('Challenge');
    await cleanupMongo('ChallengeStatus');
    challengeStatusAbnormal = await service.create(testChallengeStatusAbnormal);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a status', async () => {
    expect(challengeStatusAbnormal).toEqual(expect.objectContaining(testChallengeStatusAbnormal));
  });

  it('should find a status through id of the player and a challenge', async () => {
    const foundChallengeStatus = await service.findByChallengeIdAndPlayerId(
      challengeStatusAbnormal.challenge,
      challengeStatusAbnormal.player,
    );
    expect(foundChallengeStatus).toEqual(expect.objectContaining(challengeStatusAbnormal));
  });

  it('should update the status to open', async () => {
    const mockFireEvent = jest.spyOn(EventService.prototype, 'fireEvent');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mockFireEvent.mockImplementation(async () => {});

    const changedChallengeStatus = await service.markAsOpen(
      gameId,
      challengeStatusAbnormal.challenge,
      challengeStatusAbnormal.player,
      new Date(),
    );
    expect(changedChallengeStatus.state).toEqual(State.OPENED);
  });

  it('should update the status to failed', async () => {
    const mockFireEvent = jest.spyOn(EventService.prototype, 'fireEvent');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mockFireEvent.mockImplementation(async () => {});

    const changedChallengeStatus = await service.markAsFailed(
      gameId,
      challengeStatusAbnormal.challenge,
      challengeStatusAbnormal.player,
      new Date(),
    );
    expect(changedChallengeStatus.state).toEqual(State.FAILED);
  });

  it('should update the status to completed', async () => {
    const mockFireEvent = jest.spyOn(EventService.prototype, 'fireEvent');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mockFireEvent.mockImplementation(async () => {});

    const changedChallengeStatus = await service.markAsCompleted(
      gameId,
      challengeStatusAbnormal.challenge,
      challengeStatusAbnormal.player,
      new Date(),
    );
    expect(changedChallengeStatus.state).toEqual(State.COMPLETED);
  });

  it('should update the status to rejected', async () => {
    const mockFireEvent = jest.spyOn(EventService.prototype, 'fireEvent');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mockFireEvent.mockImplementation(async () => {});

    const changedChallengeStatus = await service.markAsRejected(
      gameId,
      challengeStatusAbnormal.challenge,
      challengeStatusAbnormal.player,
      new Date(),
    );
    expect(changedChallengeStatus.state).toEqual(State.REJECTED);
  });

  it('should update the status to available', async () => {
    const mockFireEvent = jest.spyOn(EventService.prototype, 'fireEvent');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mockFireEvent.mockImplementation(async () => {});

    const changedChallengeStatus = await service.markAsOpen(
      gameId,
      challengeStatusAbnormal.challenge,
      challengeStatusAbnormal.player,
      new Date(),
    );
    expect(changedChallengeStatus.state).toEqual(State.AVAILABLE);
  });

  it('should update the status to hidden', async () => {
    const mockFireEvent = jest.spyOn(EventService.prototype, 'fireEvent');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mockFireEvent.mockImplementation(async () => {});

    const changedChallengeStatus = await service.markAsHidden(
      gameId,
      challengeStatusAbnormal.challenge,
      challengeStatusAbnormal.player,
    );
    expect(changedChallengeStatus.state).toEqual(State.HIDDEN);
  });

  it('should update the status to locked', async () => {
    const mockFireEvent = jest.spyOn(EventService.prototype, 'fireEvent');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mockFireEvent.mockImplementation(async () => {});

    const changedChallengeStatus = await service.markAsLocked(
      gameId,
      challengeStatusAbnormal.challenge,
      challengeStatusAbnormal.player,
    );
    expect(changedChallengeStatus.state).toEqual(State.LOCKED);
  });
});
