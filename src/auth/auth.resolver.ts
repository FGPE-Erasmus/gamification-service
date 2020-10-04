import { Args, Resolver, Mutation } from '@nestjs/graphql';
import { Response } from 'express';

import { User as User } from '../users/models/user.model';
import { GqlResponse } from '../common/decorators/gql-response.decorator';
import { UserDto } from '../users/dto/user.dto';
import { AuthService } from './auth.service';
import LoginArgs from './args/login.args';
import SignupArgs from './args/signup.args';
import LoginResultDto from './dto/login-result.dto';

@Resolver('Auth')
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => User)
  async login(@Args() input: LoginArgs, @GqlResponse() res: Response): Promise<UserDto> {
    const result: LoginResultDto = await this.authService.login(input);
    res.cookie('token', result.token, { httpOnly: true });
    return result.user;
  }

  @Mutation(() => User)
  async signup(@Args() input: SignupArgs, @GqlResponse() res: Response): Promise<UserDto> {
    const result: LoginResultDto = await this.authService.signup(input);
    res.cookie('token', result.token, { httpOnly: true });
    return result.user;
  }
}
