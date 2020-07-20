import { Query, Resolver, Mutation, Args } from '@nestjs/graphql';
import GameDto from './game.dto';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from 'src/common/guards/gql-jwt-auth.guard';
import { GqlAdminGuard } from 'src/common/guards/gql-admin.guard';

@Resolver(() => String)
export class GameResolver {
    constructor() { }

    @Mutation(returns => String)
    @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
    async createGame(@Args() input: GameDto): Promise<string> {
        return 'Creating a game...';
    }

}