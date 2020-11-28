import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection, Document } from 'mongoose';

import DbTestModule, { cleanupMongo, closeMongoConnection } from '../../test/utils/db-test.module';
import { wait } from '../../test/utils/time.utils';
import { pick } from '../common/utils/object.utils';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';
import { User, UserDocument, UserSchema } from './models/user.model';

const testUser = {
  name: 'John Doe',
  username: 'johndoe',
  password: 'gr4phQ1ismy1if3',
  email: 'johndoe@johndoe.com',
  telephone: '+351 21 2233-4455',
  birthDate: new Date('1980-05-10'),
};

describe('UsersService', () => {
  let connection: Connection;
  let service: UsersService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DbTestModule({}), MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
      providers: [UsersService, UserRepository],
    }).compile();

    connection = module.get<Connection>(await getConnectionToken());
    service = module.get<UsersService>(UsersService);
  });

  beforeEach(async () => {
    await cleanupMongo('User');
  });

  afterAll(async () => {
    // await closeMongoConnection();
    await connection.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new entity', async () => {
    const user = await service.create(testUser);

    expect(user).toEqual(expect.objectContaining(testUser));
  });

  it('should save the entity and add the createdAt and savedAt fields', async () => {
    const user = await service.create(testUser);

    expect(user.createdAt).toBeTruthy();
    expect(user.updatedAt).toBeTruthy();
  });

  it('should update entity', async () => {
    const user: User = await service.create(testUser);

    const actualUpdate = user.updatedAt;
    expect(user.updatedAt.getTime()).toBe(actualUpdate.getTime());

    await wait(20);

    user.email = 'test2@test2.com';

    const updatedUser: User = await service.update(
      user.id,
      pick(['username', 'email', 'name', 'birthDate', 'telephone', 'photo', 'password'], user) as User,
    );

    expect(updatedUser.email).toEqual(user.email);
    expect(user.updatedAt.getTime()).toBeLessThan(updatedUser.updatedAt.getTime());
  });

  it('should get entity inserted', async () => {
    const user: User = await service.create(testUser);

    const foundUser: User = await service.findById(user.id);

    expect(foundUser).toEqual(expect.objectContaining(user));
  });
});
