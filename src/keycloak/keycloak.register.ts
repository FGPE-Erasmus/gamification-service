import { DiscoveryService, Reflector } from '@nestjs/core';
import { HttpService } from '@nestjs/common';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { KeycloakAdminClient } from 'keycloak-admin/lib/client';
import { AxiosResponse } from 'axios';
import * as qs from 'qs';

import { appConfig } from '../app.config';
import { Data } from './interfaces/data.interface';
import { KeycloakOptions } from './interfaces/keycloak-options.interface';
import { Resource } from './interfaces/resource.interface';
import { Resources } from './interfaces/resources.interface';
import { Role } from './interfaces/role.interface';
import { Scope } from './interfaces/scope.interface';
import { difference, intersection } from '../common/utils/array.utils';
import { SCOPES } from './decorators/scopes.decorator';
import { RESOURCE } from './decorators/resource.decorator';
import { ROLES } from './decorators/roles.decorator';

const kcAdminClient = new KeycloakAdminClient();

export default class KeycloakRegister {
  private realmUrl: string;
  private _controllers: any[] | undefined;

  constructor(
    private readonly options: KeycloakOptions,
    private readonly httpService: HttpService,
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
  ) {
    this.realmUrl = `${this.options.authServerUrl}/admin/realms/${this.options.realm}`;
  }

  get controllers(): InstanceWrapper[] {
    if (this._controllers) return this._controllers;
    this._controllers = this.discoveryService.getControllers();
    return this._controllers;
  }

  get roles(): string[] {
    return [
      ...this.controllers.reduce((roles: Set<string>, controller: InstanceWrapper) => {
        const methods = getMethods(controller.instance);
        const values = this.reflector.getAllAndMerge(ROLES, [controller.metatype, ...methods]);
        return new Set([...roles, ...values]);
      }, new Set()),
    ];
  }

  get resources(): Resources {
    return Object.entries(
      this.controllers.reduce((resources: Resources<Set<string>>, controller: InstanceWrapper) => {
        const methods = getMethods(controller.instance);
        const resourceName = this.reflector.get(RESOURCE, controller.metatype);
        if (!resourceName) return resources;
        resources[resourceName] = new Set([
          ...(resourceName in resources ? resources[resourceName] : []),
          ...methods.reduce((scopes: Set<string>, method: (...args: any[]) => any) => {
            const methodValues = this.reflector.get(SCOPES, method);
            return new Set([...scopes, ...(methodValues || [])]);
          }, new Set()),
        ]);
        return resources;
      }, {}),
    ).reduce((resources: Resources, [resourceName, scopes]: [string, Set<string>]) => {
      resources[resourceName] = [...scopes];
      return resources;
    }, {});
  }

  async setup(): Promise<void> {
    console.log('registering keycloak ...');
    const data: Data = {
      roles: this.roles,
      resources: this.resources,
    };
    await kcAdminClient.auth({
      username: this.options.adminUser,
      password: this.options.adminPass,
      grantType: 'password',
      clientId: 'admin-cli',
    });
    kcAdminClient.setConfig({
      realmName: this.options.realm,
    });
    await this.enableAuthorization();
    const getRolesRes: Role[] = await this.getRoles();
    const roleNames = getRolesRes.map(role => role.name);
    const rolesToCreate = difference(data.roles, roleNames);
    rolesToCreate.forEach(role => {
      this.createRoles(role);
    });
    const getResourcesRes = await this.getResources();
    const resourceNames = getResourcesRes.map(resource => resource.name);
    const resourceToCreate = difference(Object.keys(data.resources), resourceNames);
    resourceToCreate.forEach(async (resource: string) => {
      const scopes: Array<string> = data.resources[resource];
      const scopesToAttach = await this.scopeOperations(scopes);
      await this.createResource(resource, scopesToAttach);
    });
    console.log('registered keycloak:', JSON.stringify(data, null, 2));
  }

  async scopeOperations(scopes: Array<string>): Promise<Array<Scope>> {
    const createdScopes: Array<Scope> = [];
    const getScopesRes = await this.getScopes();
    const existingScopes = getScopesRes.data.map(scope => scope.name);
    const scopesToCreate = difference(scopes, existingScopes);
    const scopesToLink = intersection(scopes, existingScopes);
    if (scopesToLink.length) {
      const scopeInfo = getScopesRes.data.filter(scope => {
        return existingScopes.includes(scope.name);
      });
      createdScopes.concat(scopeInfo);
    }
    scopesToCreate.forEach(async resource => {
      const res: Scope | Record<string, unknown> = (await this.createScope(resource)).data;
      if ('id' in res) {
        createdScopes.push(res);
      }
    });
    return createdScopes;
  }

  async enableAuthorization(): Promise<void> {
    await kcAdminClient.clients.update(
      { id: this.options.clientUniqueId || '' },
      {
        clientId: this.options.clientId,
        authorizationServicesEnabled: true,
        serviceAccountsEnabled: true,
      },
    );
  }

  async getRoles(): Promise<Role[]> {
    return kcAdminClient.clients.listRoles({
      id: this.options.clientUniqueId || '',
    });
  }

  async createRoles(role: string): Promise<{ roleName: string }> {
    return kcAdminClient.clients.createRole({
      id: this.options.clientUniqueId,
      name: role,
    });
  }

  async getAccessToken(): Promise<AxiosResponse> {
    return this.httpService
      .post(
        `${this.options.authServerUrl}/realms/${this.options.realm}/protocol/openid-connect/token`,
        qs.stringify({
          client_id: 'admin-cli',
          grant_type: 'password',
          username: appConfig.auth.keycloak.adminUsername,
          password: appConfig.auth.keycloak.adminPassword,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      )
      .toPromise();
  }

  async getResources(): Promise<Resource[]> {
    const resourcesRes = await this.httpService
      .get<[Resource]>(`${this.realmUrl}/clients/${this.options.clientUniqueId}/authz/resource-server/resource`, {
        headers: {
          Authorization: `Bearer ${(await this.getAccessToken()).data.access_token}`,
        },
      })
      .toPromise();
    return resourcesRes.data;
  }

  async createResource(resourceName: string, scopes: Array<Scope> | [] = []): Promise<AxiosResponse> {
    return this.httpService
      .post(
        `${this.realmUrl}/clients/${this.options.clientUniqueId}/authz/resource-server/resource`,
        {
          attributes: {},
          displayName: resourceName,
          name: resourceName,
          ownerManagedAccess: '',
          scopes,
          uris: [],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await this.getAccessToken()).data.access_token}`,
          },
        },
      )
      .toPromise();
  }

  async updateResource(
    resourceName: string,
    resourceId: string,
    scopes: Array<Scope> | [] = [],
  ): Promise<AxiosResponse> {
    return this.httpService
      .put(
        `${this.realmUrl}/clients/${this.options.clientUniqueId}/authz/resource-server/resource/${resourceId}`,
        qs.stringify({
          attributes: {},
          displayName: resourceName,
          name: resourceName,
          owner: {
            id: this.options.clientUniqueId,
            name: this.options.realm,
          },
          ownerManagedAccess: false,
          scopes,
          uris: [],
          _id: resourceId,
        }),
        {
          headers: {
            Authorization: `Bearer ${kcAdminClient.getAccessToken()}`,
          },
        },
      )
      .toPromise();
  }

  async getScopes(): Promise<AxiosResponse<Array<Scope>>> {
    return await this.httpService
      .get<Array<Scope>>(`${this.realmUrl}/clients/${this.options.clientUniqueId}/authz/resource-server/scope`, {
        headers: {
          Authorization: `Bearer ${(await this.getAccessToken()).data.access_token}`,
        },
      })
      .toPromise();
  }

  async createScope(scope: string): Promise<AxiosResponse<Scope>> {
    return this.httpService
      .post<Scope>(
        `${this.realmUrl}/clients/${this.options.clientUniqueId}/authz/resource-server/scope`,
        { name: scope },
        {
          headers: {
            Authorization: `Bearer ${(await this.getAccessToken()).data.access_token}`,
          },
        },
      )
      .toPromise();
  }
}

function getMethods(obj: any): ((...args: any[]) => any)[] {
  const propertyNames = new Set<string>();
  let current = obj;
  do {
    Object.getOwnPropertyNames(current).map(propertyName => propertyNames.add(propertyName));
  } while ((current = Object.getPrototypeOf(current)));
  return [...propertyNames]
    .filter((propertyName: string) => typeof obj[propertyName] === 'function')
    .map((propertyName: string) => obj[propertyName]) as ((...args: any[]) => any)[];
}
