import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { appConfig } from 'src/app.config';

@Controller('healthcheck')
export class RestHealthcheckController {
    @Get()
    async checkStatus(@Res() res: Response) {
        try {
            res.status(200).json({
                outcome: "Successful connection",
                port: appConfig.port,
                host: appConfig.host,
                timestamp: new Date(),
            }).send();
        } catch (e) {
            res.status(503).json({
                errors: e,
            }).send();
        }
    }
}