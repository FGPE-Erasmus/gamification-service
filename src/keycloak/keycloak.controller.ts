import { Controller, Post, Req } from '@nestjs/common';
import { Public } from './decorators/public.decorator';
import { Request } from 'express';
import { KeycloakService } from './keycloak.service';

@Controller('keycloak')
export class KeycloakController {
  constructor(private readonly keycloakService: KeycloakService) {}

  @Post('lti-login')
  @Public()
  async ltiLogin(@Req() req: Request): Promise<void> {
    return await this.keycloakService.ltiLogin(req.res.locals.token, req.body);
  }
}
