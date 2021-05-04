import { ModuleMetadata } from '@nestjs/common';
import { KeycloakOptions } from './keycloak-options.interface';

export interface KeycloakAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<KeycloakOptions> | KeycloakOptions;
}
