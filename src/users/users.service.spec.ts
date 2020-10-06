import { ObjectID } from 'mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';

import { ServiceHelper } from '../common/helpers/service.helper';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';
import { UserInput } from './inputs/user.input';
import { Role } from './models/role.enum';
import { UserDto } from './dto/user.dto';
import { User } from './models/user.model';
import { getModelToken } from '@nestjs/mongoose';

describe('UsersService', () => {
  let service: UsersService;

  function mockUserModel(dto: any) {
    this.data = dto;
    this.save = () => {
      return this.data;
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
        UsersService,
        UserRepository,
        ServiceHelper,
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return one new User', async () => {
    const mockCreateUserDto: UserInput = {
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@johndoe.com',
      telephone: '+351 21 2233-4455',
      birthDate: new Date('1980-05-10'),
    };

    const newUser: User = {
      id: new ObjectID().toHexString(),
      active: true,
      roles: [Role.USER],
      password: await bcrypt.hash('password', 10),
      registrations: [],
      ...mockCreateUserDto,
    } as User;

    jest.spyOn(service, 'upsert').mockImplementation(() => Promise.resolve(newUser));

    expect(await service.upsert(undefined, mockCreateUserDto)).toBe(newUser);
  });
});
