import { Args, Resolver, Mutation, Query } from '@nestjs/graphql';
import { Response } from 'express';

import { appConfig } from '../app.config';
import { GqlResponse } from '../common/decorators/gql-response.decorator';
import { LoginArgs } from './args/login.args';
import { Public } from './decorators/public.decorator';
import { AuthDto } from './dto/auth.dto';
import { KeycloakService } from './keycloak.service';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { ProfileDto } from './dto/profile.dto';
import { GqlUserInfo } from '../common/decorators/gql-user-info.decorator';
import { UserDto } from './dto/user.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { UserService } from './user.service';

@Resolver('Keycloak')
export class KeycloakResolver {
  constructor(protected readonly keycloakService: KeycloakService, protected readonly userService: UserService) {}

  @Public()
  @Mutation(() => AuthDto)
  async login(@GqlResponse() res: Response, @Args() input: LoginArgs): Promise<AuthDto> {
    const result: AuthDto = await this.keycloakService.authenticate(input);
    res.cookie(appConfig.auth.keycloak.cookieKey, result.accessToken, { httpOnly: true });
    if (input.redirectUri) {
      res.redirect(input.redirectUri);
    }
    return result;
  }

  @UseGuards(AuthGuard)
  @Query(() => ProfileDto)
  async me(@GqlUserInfo() userInfo: Record<string, any>): Promise<ProfileDto> {
    return {
      id: userInfo.sub,
      username: userInfo.preferredUsername,
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      ...userInfo,
    };
  }

  @Query(() => UserDto)
  async user(@Args('id') userId: string): Promise<UserDto> {
    return this.userService.getUser(userId);
  }

  @Public()
  @Mutation(() => LogoutResponseDto)
  async logout(
    @GqlResponse() res: Response,
    @Args('redirectUri', { nullable: true }) redirectUri?: string,
  ): Promise<LogoutResponseDto> {
    await this.keycloakService.logout();
    res.clearCookie(appConfig.auth.keycloak.cookieKey, { httpOnly: true });
    if (redirectUri) {
      res.redirect(redirectUri);
    }
    return new LogoutResponseDto();
  }

  /*@Mutation(() => UserDto)
  async signup(@Args() input: SignupArgs, @GqlResponse() res: Response): Promise<UserDto> {
    const result: LoginResultDto = await this.authService.signup(input);
    res.cookie('token', result.token, { httpOnly: true });
    return result.user;
  }*/
}
