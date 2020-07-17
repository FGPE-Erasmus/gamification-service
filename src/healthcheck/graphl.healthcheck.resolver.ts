import { Query, Resolver, Mutation } from '@nestjs/graphql';

@Resolver(() => String)
export class GraphqlHealthResolver {
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