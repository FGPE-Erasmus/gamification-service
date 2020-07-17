import { Query, Resolver, Mutation } from '@nestjs/graphql';

@Resolver(() => String)
export class HealthcheckResolver {
    constructor() { }

    @Query(returns => String)
    async queryCheck() {
        return 'Healthy';
    }

    @Mutation(returns => String)
    async mutationCheck() {
        return 'Healthy';
    }

}