import {
  HttpException,
  HttpService,
  Inject,
  Injectable,
  Logger,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
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
  protected readonly logger: LoggerService;
  protected readonly realmUrl: string;

  constructor(
    @Inject(KEYCLOAK_OPTIONS) private readonly options: KeycloakOptions,
    private readonly httpService: HttpService,
    protected readonly cacheService: CacheService,
  ) {
    this.logger = new Logger(UserService.name);
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

  async getUserByUsername(username: string, forceFresh = false, accessToken = null): Promise<UserDto | null> {
    const cacheKey = `user_by_username:${username}`;
    if (!forceFresh) {
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
    }
    const response: AxiosResponse<User[]> = await this.httpService
      .get<User[]>(`${this.realmUrl}/users?username=${username}`, {
        headers: {
          Authorization: `Bearer ${accessToken || (await this.getAccessToken()).data.access_token}`,
        },
      })
      .toPromise();
    if (response.status > 299) {
      throw new HttpException(response.data, response.status);
    }
    if (response.data.length === 0) return null;
    const result = {
      firstName: response.data[0].given_name,
      lastName: response.data[0].family_name,
      ...response.data[0],
    };

    await this.cacheService.set(cacheKey, result);

    return result;
  }

  async createUser(user: UserDto, role: 'teacher' | 'student' = 'student'): Promise<UserDto> {
    this.logger.log('---------------------------------------------------------------')
    const token = (await this.getAccessToken()).data;
    this.logger.log(JSON.stringify(token))

    const createUserResponse: AxiosResponse<void> = await this.httpService
      .post<void>(`${this.realmUrl}/users`, { ...user, enabled: true }, {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      })
      .toPromise();
    if (createUserResponse.status > 299) {
      throw new HttpException('', createUserResponse.status);
    }

    const savedUser = await this.getUserByUsername(user.username, true, token.access_token);
    this.logger.log(JSON.stringify(savedUser))

    const roleResponse: AxiosResponse = await this.httpService
      .get<{ id: string; name: string; containerId: string }>(
        `${this.realmUrl}/roles/${role}`,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        }
      )
      .toPromise()
    if (roleResponse.status > 299) {
      throw new HttpException(roleResponse.data, roleResponse.status);
    }
    this.logger.log(JSON.stringify(roleResponse.data))

    const addRoleResponse = await this.httpService
      .post<any>(
        `${this.realmUrl}/users/${savedUser.id}/role-mappings/realm`,
        [roleResponse.data],
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        }
      )
      .toPromise();
    if (addRoleResponse.status > 299) {
      throw new HttpException(addRoleResponse.data, addRoleResponse.status);
    }
    this.logger.log(JSON.stringify(addRoleResponse.data))

    return savedUser;
  }

  async exchangeAdminTokenForUserToken(targetUserId: string): Promise<any> {
    const token = (await this.getAccessToken()).data;
    this.logger.log(token.refresh_token)
    const response: AxiosResponse = await this.httpService
      .post<any>(
        `${this.options.authServerUrl}/realms/${this.options.realm}/protocol/openid-connect/token`,
        qs.stringify({
          client_id: 'fgpe-learning-platform',
          grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
          subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
          subject_token: token.access_token,
          requested_token_type: 'urn:ietf:params:oauth:token-type:refresh_token',
          requested_subject: targetUserId,
          scope: 'openid profile email',
          audience: 'fgpe-learning-platform',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
      .toPromise();
    if (response.status > 299) {
      throw new HttpException(response.data, response.status);
    }
    return response.data;
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
