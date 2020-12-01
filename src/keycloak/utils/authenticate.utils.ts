import { KeycloakRequest } from '../types/keycloak-request.type';
import { KeycloakOptions } from '../interfaces/keycloak-options.interface';
import { HttpService } from '@nestjs/common';
import * as qs from 'qs';
import { LoginArgs } from '../args/login.args';
import { AuthDto } from '../dto/auth.dto';
import { LoginResponseDto } from '../dto/login-response.dto';

export default async function authenticate(
  req: KeycloakRequest<Request>,
  options: KeycloakOptions,
  httpService: HttpService,
  { password, refreshToken, scope, username }: LoginArgs,
): Promise<AuthDto> {
  if (Array.isArray(scope)) scope = scope.join(' ');
  if (!scope?.length) scope = 'openid profile';
  try {
    let data: string;
    if (refreshToken && refreshToken.length) {
      data = qs.stringify({
        client_id: options.clientId,
        client_secret: options.secret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });
    } else {
      data = qs.stringify({
        client_id: options.clientId,
        client_secret: options.secret,
        grant_type: 'password',
        password,
        scope,
        username,
      });
    }
    const res = await httpService
      .post<LoginResponseDto>(`/realms/${options.realm}/protocol/openid-connect/token`, data, {
        baseURL: options.authServerUrl,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .toPromise();
    if (req.session) {
      if (res.data.access_token?.length) {
        req.session.token = res.data.access_token;
      }
      if (res.data.refresh_token?.length) {
        req.session.refreshToken = res.data.refresh_token;
      }
    }
    return {
      accessToken: res.data.access_token,
      expiresIn: res.data.expires_in,
      message: 'authentication successful',
      refreshExpiresIn: res.data.refresh_expires_in,
      refreshToken: res.data.refresh_token,
      scope: res.data.scope,
      tokenType: res.data.token_type,
    };
  } catch (err) {
    if (err.response?.data && err.response?.status) {
      const { data } = err.response;
      err.statusCode = err.response.status;
      err.payload = {
        error: data.error,
        message: data.error_description,
        statusCode: err.statusCode,
      };
    }
    throw err;
  }
}
