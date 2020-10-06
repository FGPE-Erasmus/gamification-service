import { Test, TestingModule } from '@nestjs/testing';

import { UserRepository } from './user.repository';
import { getModelToken } from '@nestjs/mongoose';

describe('UserRepository', () => {
  let repo: UserRepository;

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
        UserRepository,
      ],
    }).compile();

    repo = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(repo).toBeDefined();
  });
});
