import { forwardRef } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { TestingModule, Test } from '@nestjs/testing';
import { Connection } from 'mongoose';

import { ChallengeStatusModule } from '../challenge-status/challenge-status.module';
import { SubscriptionsModule } from '../common/subscriptions/subscriptions.module';
import { EventModule } from '../event/event.module';
import { GameModule } from '../game/game.module';
import { GroupModule } from '../group/group.module';
import { PlayerRewardModule } from '../player-reward/player-reward.module';
import { SubmissionModule } from '../submission/submission.module';

import DbTestModule, { cleanupMongo } from '../../test/utils/db-test.module';
import { PlayerToDtoMapper } from './mappers/player-to-dto.mapper';
import { Player, PlayerSchema } from './models/player.model';
import { PlayerResolver } from './player.resolver';
import { PlayerService } from './player.service';
import { PlayerRepository } from './repositories/player.repository';
import { Group } from '../group/models/group.model';
import { GroupService } from '../group/group.service';
import { EventService } from '../event/event.service';
import { KeycloakModule } from '../keycloak/keycloak.module';

const gameId = '440850928599';
const groupId = '440850928588';
const testUserId1 = '440850928510';
const testUserId2 = '440850928512';
const testUserId3 = '440850928513';
const testUserId4 = '440850928514';

const testGroupDark = {
  game: gameId,
  name: 'Dark Forces',
  displayName: 'Dark Forces',
  imageUrl: 'https://i2-prod.mirror.co.uk/incoming/article7891821.ece/ALTERNATES/s810/Star-Wars-Dark-Forces.jpg',
  players: [],
};

const testGroupLight = {
  game: gameId,
  name: 'Light Forces',
  displayName: 'Light Forces',
  imageUrl:
    'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/baby-yoda-old-yoda-1574103229.jpg?crop=0.486xw:0.973xh;0.514xw,0&resize=980:*',
  players: [],
};

const testPlayer1 = {
  user: '440850928566',
  game: gameId,
  group: groupId,
  points: 123,
  submissions: ['440850928555', '440850928544'],
  learningPath: ['440850928533'],
  rewards: ['440850928522'],
};

const testPlayer2 = {
  user: '440850928111',
  game: gameId,
  group: groupId,
  points: 456,
  submissions: [],
  learningPath: ['440850928511'],
  rewards: [],
};

const testPlayer3 = {
  user: '440850928222',
  game: gameId,
  points: 0,
  submissions: ['440850928999'],
  learningPath: ['440850928888'],
  rewards: ['440850928777'],
};

const testPlayer4 = {
  user: '440850928333',
  game: gameId,
  points: 0,
  submissions: ['440850928123'],
  learningPath: ['440850928123'],
  rewards: ['440850928123'],
};

describe('PlayerService', () => {
  let connection: Connection;
  let service: PlayerService;
  let groupService: GroupService;
  let playerYoda: Player;
  let playerLeia: Player;
  let playerVader: Player;
  let playerAnakin: Player;
  let darkGroup: Group;
  let lightGroup: Group;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DbTestModule({}),
        MongooseModule.forFeature([
          {
            name: 'Player',
            schema: PlayerSchema,
          },
        ]),
        KeycloakModule,
        forwardRef(() => EventModule),
        forwardRef(() => GameModule),
        forwardRef(() => GroupModule),
        forwardRef(() => ChallengeStatusModule),
        forwardRef(() => PlayerRewardModule),
        forwardRef(() => SubmissionModule),
        forwardRef(() => SubscriptionsModule),
      ],
      providers: [PlayerToDtoMapper, PlayerRepository, PlayerService, PlayerResolver],
    }).compile();
    connection = module.get<Connection>(await getConnectionToken());
    service = module.get<PlayerService>(PlayerService);
    groupService = module.get<GroupService>(GroupService);
  });

  beforeEach(async () => {
    await cleanupMongo('Group');
    await cleanupMongo('Player');
    playerYoda = await service.create(testPlayer1);
    playerLeia = await service.create(testPlayer2);
    playerVader = await service.create(testPlayer3);
    playerAnakin = await service.create(testPlayer4);
    darkGroup = await groupService.create(testGroupDark);
    lightGroup = await groupService.create(testGroupLight);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create player', async () => {
      expect(playerYoda).toBeDefined();
    });
  });

  describe('findByGame', () => {
    it('should find players within the game', async () => {
      const foundPlayers = await service.findByGame(gameId);
      expect(foundPlayers.length).toEqual(4);
    });
  });

  describe('findByGameAndUser', () => {
    it('should find player through game and user id', async () => {
      const foundPlayer: Player = await service.findByGameAndUser(gameId, testPlayer1.user);
      expect(foundPlayer.user).toEqual(playerYoda.user);
    });

    it('should find player through game and user id', async () => {
      const foundPlayer: Player = await service.findByGameAndUser(gameId, testPlayer2.user);
      expect(foundPlayer.user).toEqual(playerLeia.user);
    });
  });

  describe('enroll', () => {
    it('should enroll 4 players', async () => {
      cleanupMongo('Player');
      const mockFireEvent = jest.spyOn(EventService.prototype, 'fireEvent');
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      mockFireEvent.mockImplementation(async () => {});

      await service.enroll(gameId, testUserId1);
      await service.enroll(gameId, testUserId2);
      await service.enroll(gameId, testUserId3);
      await service.enroll(gameId, testUserId4);

      const players = await service.findAll();
      expect(players.length).toEqual(4);
    });
  });

  describe('setGroup', () => {
    it('should enroll 2 players to a group', async () => {
      const mockFindOne = jest.spyOn(GroupService.prototype, 'findOne');
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      mockFindOne.mockImplementation(async () => {
        return darkGroup;
      });

      await service.setGroup(gameId, playerAnakin.id, darkGroup.id);
      await service.setGroup(gameId, playerVader.id, darkGroup.id);

      expect(darkGroup.players).toEqual([playerAnakin.id, playerVader.id]);
    });
  });
});
