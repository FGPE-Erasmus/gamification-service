import { Module } from '@nestjs/common';
import { HealthcheckController } from './healthcheck.controller';
import { HealthcheckResolver } from './healthcheck.resolver';

@Module({
    controllers: [HealthcheckController],
    providers: [HealthcheckResolver],
})
export class HealthModule { }
