import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { ServiceHelper } from '../common/helpers/service.helper';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { UserRepository } from './repositories/user.repository';
import { UserToDtoMapper } from './mappers/user-to-dto.mapper';

describe('UsersResolver', () => {
  let resolver: UsersResolver;

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
        UserToDtoMapper,
        UsersService,
        UserRepository,
        ServiceHelper,
        UsersResolver,
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
