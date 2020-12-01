import { Request } from 'express';
import { Grant } from 'keycloak-connect';
import { UserInfo } from '../interfaces/user-info.interface';

export type KeycloakRequest<T = Request> = {
  grant?: Grant;
  userInfo?: UserInfo;
  session?: {
    refreshToken?: string;
    token?: string;
    userInfo?: UserInfo;
    [key: string]: any;
  };
} & T;
