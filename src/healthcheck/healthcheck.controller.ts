import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

import { appConfig } from '../app.config';
import { Public } from '../keycloak/decorators/public.decorator';

@Controller('healthcheck')
export class HealthcheckController {
  @Get()
  @Public()
  async checkStatus(@Res() res: Response): Promise<void> {
    try {
      res
        .status(200)
        .json({
          outcome: 'Successful connection',
          port: appConfig.port,
          host: appConfig.host,
          timestamp: new Date(),
        })
        .send();
    } catch (e) {
      res
        .status(503)
        .json({
          errors: e,
        })
        .send();
    }
  }
}
