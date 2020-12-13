import { forwardRef } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { TestingModule, Test } from '@nestjs/testing';
import { Connection } from 'mongoose';

import { EventModule } from '../event/event.module';
import { GameModule } from '../game/game.module';
import { PlayerModule } from '../player/player.module';

import { GroupResolver } from './group.resolver';
import { GroupService } from './group.service';
import { GroupToDtoMapper } from './mappers/group-to-dto.mapper';
import { Group, GroupSchema } from './models/group.model';
import { GroupRepository } from './repositories/group.repository';
import DbTestModule, { cleanupMongo } from '../../test/utils/db-test.module';

const gameId = '440850928599';
const playerYoda = '440850928500';

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
  players: [playerYoda, '41224d776a326fb40f000002', '41224d776a326fb40f000003'],
};

describe('GroupService', () => {
  let connection: Connection;
  let service: GroupService;
  let groupDark: Group;
  let groupLight: Group;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forFeature([
          {
            name: 'Group',
            schema: GroupSchema,
          },
        ]),
        forwardRef(() => EventModule),
        forwardRef(() => GameModule),
        forwardRef(() => PlayerModule),
        DbTestModule({}),
      ],
      providers: [GroupToDtoMapper, GroupRepository, GroupService, GroupResolver],
    }).compile();
    connection = module.get<Connection>(await getConnectionToken());
    service = module.get<GroupService>(GroupService);
  });

  beforeEach(async () => {
    await cleanupMongo('Group');
    groupDark = await service.create(testGroupDark);
    groupLight = await service.create(testGroupLight);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByGame', () => {
    it('should find groups by game', async () => {
      const foundGroup = await service.findByGame(gameId);
      expect(foundGroup).toEqual(expect.objectContaining([groupDark, groupLight].values()));
    });
  });

  describe('findByGameAndPlayer', () => {
    it('should find the group by game and player id', async () => {
      const foundGroup = await service.findByGameAndPlayer(gameId, playerYoda);
      expect(foundGroup).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all groups', async () => {
      const foundGroups = await service.findAll();
      expect(foundGroups).toEqual(expect.objectContaining([groupDark, groupLight].values()));
    });
  });

  describe('autoAssignGroup', () => {
    it('should auto assign 4 players to two groups', async () => {
      const returnedGroups: Group[] = await service.autoAssignPlayers(gameId);
      expect(returnedGroups).toEqual([groupDark, groupLight]);
    });
  });
});
