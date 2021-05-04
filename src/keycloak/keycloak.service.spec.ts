import { Test, TestingModule } from '@nestjs/testing';

import { KeycloakService } from './keycloak.service';
import { KEYCLOAK_INSTANCE, KEYCLOAK_OPTIONS } from './keycloak.constants';
import { Keycloak } from '../../test/__mocks__/keycloak-mock';
import { HttpModule } from '@nestjs/common';

describe('KeycloakService', () => {
  let service: KeycloakService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        KeycloakService,
        {
          provide: KEYCLOAK_INSTANCE,
          useValue: new Keycloak(),
        },
        {
          provide: KEYCLOAK_OPTIONS,
          useValue: {},
        },
      ],
    }).compile();

    service = await module.resolve<KeycloakService>(KeycloakService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
