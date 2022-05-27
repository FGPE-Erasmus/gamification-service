import { Body, Controller, Get, Logger, LoggerService, Post, Req } from '@nestjs/common';
import { Request, Response } from 'express';

import { Public } from '../keycloak/decorators/public.decorator';
import { LtiService } from './lti.service';
import { PlatformDto } from './dto/platform.dto';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('lti')
export class LtiController {
  protected readonly logger: LoggerService;

  constructor(private readonly ltiService: LtiService) {
    this.logger = new Logger(LtiController.name);
  }

  @Get('error')
  @Public()
  async error(req: Request, res: Response): Promise<void> {
    res.send('There was a problem getting you authenticated through LTI. Please contact support.');
  }

  @Get('config')
  @Public()
  async config(@Req() req: Request): Promise<any> {
    return {};
  }

  @Post('platform')
  @Roles(Role.TEACHER)
  async create(@Body() createPlatformDto: PlatformDto): Promise<void> {
    return this.ltiService.registerPlatform(createPlatformDto);
  }

  @Post('login')
  @Public()
  async ltiLogin(@Req() req: Request): Promise<void> {
    this.logger.log('-----------------------------------');
    return await this.ltiService.login(req.res.locals.token, req.body);
  }
}
