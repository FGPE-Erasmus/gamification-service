import { Module } from '@nestjs/common';
import { RestHealthcheckController } from './rest.healthcheck.controller';
import { GraphqlHealthResolver } from './graphl.healthcheck.resolver';

@Module({
    controllers: [RestHealthcheckController],
    providers: [GraphqlHealthResolver],
})
export class HealthModule { }
