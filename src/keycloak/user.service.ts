import { HttpException, HttpService, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import * as qs from 'qs';

import { appConfig } from '../app.config';
import { Role } from '../common/enums/role.enum';
import { KEYCLOAK_OPTIONS } from './keycloak.constants';
import { KeycloakOptions } from './interfaces/keycloak-options.interface';
import { UserDto } from './dto/user.dto';
import { User } from './interfaces/user.interface';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class UserService {
  protected readonly realmUrl: string;

  constructor(
    @Inject(KEYCLOAK_OPTIONS) private readonly options: KeycloakOptions,
    private readonly httpService: HttpService,
    protected readonly cacheService: CacheService,
  ) {
    this.realmUrl = `${this.options.authServerUrl}/admin/realms/${this.options.realm}`;
  }

  async getUsers(): Promise<UserDto[]> {
    const response: AxiosResponse<User[]> = await this.httpService
      .get<User[]>(`${this.realmUrl}/users`, {
        headers: {
          Authorization: `Bearer ${(await this.getAccessToken()).data.access_token}`,
        },
      })
      .toPromise();
    if (response.status > 299) {
      throw new HttpException(response.data, response.status);
    }
    return response.data.map(user => ({
      firstName: user.given_name,
      lastName: user.family_name,
      ...user,
    }));
  }

  async getUser(userId: string, forceFresh = false): Promise<UserDto> {
    const cacheKey = `user:${userId}`;
    if (!forceFresh) {
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
    }
    const response: AxiosResponse<User> = await this.httpService
      .get<User>(`${this.realmUrl}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${(await this.getAccessToken()).data.access_token}`,
        },
      })
      .toPromise();
    if (response.status === 404) {
      throw new NotFoundException();
    } else if (response.status > 299) {
      throw new HttpException(response.data, response.status);
    }
    const result = {
      firstName: response.data.given_name,
      lastName: response.data.family_name,
      ...response.data,
    };

    await this.cacheService.set(cacheKey, result);

    return result;
  }

  async getUsersByRole(role: Role): Promise<UserDto[]> {
    const response: AxiosResponse<User[]> = await this.httpService
      .get<User[]>(`${this.realmUrl}/roles/${role.toLowerCase()}/users`, {
        headers: {
          Authorization: `Bearer ${(await this.getAccessToken()).data.access_token}`,
        },
      })
      .toPromise();
    if (response.status > 299) {
      throw new HttpException(response.data, response.status);
    }
    return response.data.map(user => ({
      firstName: user.given_name,
      lastName: user.family_name,
      ...user,
    }));
  }

  private async getAccessToken(): Promise<AxiosResponse> {
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
}
