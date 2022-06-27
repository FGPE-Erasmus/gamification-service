import { Body, Controller, Get, Logger, LoggerService, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { Public } from '../keycloak/decorators/public.decorator';
import { LtiService } from './lti.service';
import { LtiAuthDto } from './dto/auth.dto';
import { LtiGradeDto } from './dto/grade.dto';

const LTI_CONTEXT_COOKIE_KEY = 'FGPE_LTI_CONTEXT';

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

  @Post('auth')
  @Public()
  async ltiAuth(@Req() req: Request, @Res() res: Response, @Body() dto: LtiAuthDto): Promise<void> {
    const result = await this.ltiService.auth(req.res.locals.token, dto);
    res
      /*.cookie(LTI_CONTEXT_COOKIE_KEY, jwt.sign({
        ltik: dto.ltik,
        game: dto.game,
        challenge: dto.challenge,
        activity: dto.activity,
      }, appConfig.key),
        { httpOnly: true }
      )*/
      .send({
        accessToken: result.access_token,
        expiresIn: result.expires_in,
        refreshExpiresIn: result.refresh_expires_in,
        refreshToken: result.refresh_token,
        tokenType: result.token_type,
        idToken: result.id_token,
        sessionState: result.session_state,
        role: result.role,
      })
      .status(200);
  }

  @Post('grade')
  @Public()
  async send(@Req() req: Request, @Body() dto: LtiGradeDto): Promise<any> {
    this.logger.log(JSON.stringify(dto));
    return await this.ltiService.sendLastGrade(req.res.locals.token, dto.game, dto.challenge, dto.activity);
  }
}
