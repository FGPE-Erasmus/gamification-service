import { forwardRef } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { TestingModule, Test } from '@nestjs/testing';
import { ObjectId } from 'mongodb';
import { Connection } from 'mongoose';

import { EventModule } from '../event/event.module';
import { GameModule } from '../game/game.module';
import { PlayerModule } from '../player/player.module';
import { UsersModule } from '../users/users.module';
import { GroupResolver } from './group.resolver';
import { GroupService } from './group.service';
import { GroupToDtoMapper } from './mappers/group-to-dto.mapper';
import { Group, GroupSchema } from './models/group.model';
import { GroupRepository } from './repositories/group.repository';
import DbTestModule, { cleanupMongo } from '../../test/utils/db-test.module';

const gameId = '41224d776a326fb40f000000';

const testGroupDark = {
  game: new ObjectId(gameId),
  name: 'Dark Forces',
  displayName: 'Dark Forces',
  imageUrl: 'https://i2-prod.mirror.co.uk/incoming/article7891821.ece/ALTERNATES/s810/Star-Wars-Dark-Forces.jpg',
  players: [],
};

const testGroupLight = {
  game: new ObjectId(gameId),
  name: 'Light Forces',
  displayName: 'Light Forces',
  imageUrl:
    'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/baby-yoda-old-yoda-1574103229.jpg?crop=0.486xw:0.973xh;0.514xw,0&resize=980:*',
  players: ['41224d776a326fb40f000001', '41224d776a326fb40f000002', '41224d776a326fb40f000003'],
};

describe('Group', () => {
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
        forwardRef(() => UsersModule),
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

  it('should find groups by game', async () => {
    const foundGroup = service.findByGame(gameId);
    expect(foundGroup).toEqual(expect.objectContaining([groupDark, groupLight]));
  });

  // it('should find the group by game and player id', () => {
  //     const foundGroup = service.findByGameAndPlayer(gameId, '41224d776a326fb40f000001');
  //     expect(foundGroup).toEqual(expect.objectContaining([groupLight]));
  // });

  it('should return all groups', async () => {
    const foundGroups = service.findAll();
    expect(foundGroups).toEqual(expect.objectContaining([groupDark, groupLight]));
  });
});
