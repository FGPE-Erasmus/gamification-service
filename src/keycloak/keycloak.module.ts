import * as Keycloak from 'keycloak-connect';
import { DynamicModule, HttpModule, HttpService, Module, Provider } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { KEYCLOAK_INSTANCE, KEYCLOAK_OPTIONS, KEYCLOAK_REGISTER } from './keycloak.constants';
import { KeycloakResolver } from './keycloak.resolver';
import { KeycloakService } from './keycloak.service';
import { KeycloakOptions } from './interfaces/keycloak-options.interface';
import { KeycloakAsyncOptions } from './interfaces/keycloak-async-options.interface';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { CacheModule } from '../cache/cache.module';
import { KeycloakController } from './keycloak.controller';

@Module({
  controllers: [KeycloakController],
  providers: [KeycloakResolver, KeycloakService, UserService, UserResolver],
  exports: [KeycloakService, UserService],
})
export class KeycloakModule {
  public static imports = [HttpModule, CacheModule];

  public static register(options: KeycloakOptions): DynamicModule {
    return {
      module: KeycloakModule,
      imports: KeycloakModule.imports,
      providers: [
        KeycloakService,
        this.keycloakProvider,
        {
          provide: KEYCLOAK_OPTIONS,
          useValue: options,
        },
        this.createKeycloakRegisterProvider(),
      ],
      exports: [KEYCLOAK_OPTIONS, KeycloakService, this.keycloakProvider],
    };
  }

  public static registerAsync(asyncOptions: KeycloakAsyncOptions): DynamicModule {
    return {
      module: KeycloakModule,
      imports: [...(asyncOptions.imports || []), ...KeycloakModule.imports],
      providers: [
        KeycloakService,
        this.createOptionsProvider(asyncOptions),
        this.keycloakProvider,
        this.createKeycloakRegisterProvider(),
      ],
      exports: [KEYCLOAK_OPTIONS, KeycloakService, this.keycloakProvider],
    };
  }

  private static createKeycloakRegisterProvider() {
    return {
      provide: KEYCLOAK_REGISTER,
      useFactory(options: KeycloakOptions) {
        KeycloakModule.setupKeycloak(options);
      },
      inject: [KEYCLOAK_OPTIONS, HttpService, Reflector],
    };
  }

  private static createOptionsProvider(asyncOptions: KeycloakAsyncOptions) {
    if (!asyncOptions.useFactory) {
      throw new Error("registerAsync must have 'useFactory'");
    }
    return {
      inject: asyncOptions.inject || [],
      provide: KEYCLOAK_OPTIONS,
      useFactory: asyncOptions.useFactory,
    };
  }

  private static keycloakProvider: Provider = {
    provide: KEYCLOAK_INSTANCE,
    useFactory: (options: KeycloakOptions) => {
      const keycloak: any = new Keycloak({}, options as any);
      keycloak.accessDenied = (req: any, _res: any, next: any) => {
        req.resourceDenied = true;
        next();
      };
      return keycloak;
    },
    inject: [KEYCLOAK_OPTIONS],
  };

  private static async setupKeycloak(options: KeycloakOptions): Promise<void> {
    console.log(`registering keycloak ... ${JSON.stringify(options, null, 2)}`);
    console.log('registered keycloak');
  }
}
