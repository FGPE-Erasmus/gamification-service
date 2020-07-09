import { Args, Resolver, Mutation } from '@nestjs/graphql';
import { Response } from 'express';

import { UserEntity as User } from '../users/entities/user.entity';
import { GqlResponse } from '../common/decorators/gql-response.decorator';
import { AuthService } from './auth.service';
import LoginDto from './dto/login.dto';
import LoginResultDto from './dto/login-result.dto';
import SignupDto from './dto/signup.dto';

@Resolver('Auth')
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => User)
  async login(@Args() input: LoginDto, @GqlResponse() res: Response): Promise<User> {
    const result: LoginResultDto = await this.authService.login(input);
    res.cookie('token', result.token, { httpOnly: true });
    return result.user;
  }

  @Mutation(() => User)
  async signup(@Args() input: SignupDto, @GqlResponse() res: Response): Promise<User> {
    const result: LoginResultDto = await this.authService.signup(input);
    res.cookie('token', result.token, { httpOnly: true });
    return result.user;
  }
}
