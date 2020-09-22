import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { GqlAdminGuard } from '../common/guards/gql-admin.guard';
import ImportGameDto from './dto/import-game.dto';
import { GameService } from './game.service';
import { GameEntity as Game } from './entities/game.entity';

@Resolver()
export class GameResolver {
  constructor(private gameService: GameService) {}

  @Mutation(() => Game)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async importGEdILArchive(@Args() input: ImportGameDto): Promise<Game> {
    const { createReadStream } = await input.file;
    const game: Game = await this.gameService.importGEdILArchive(
      {
        name: input.name,
        description: input.description,
        startDate: input.startDate,
        endDate: input.endDate,
        users: input.users,
      },
      createReadStream(),
    );
    return game;
  }

  @Query(() => Game)
  @UseGuards(GqlJwtAuthGuard)
  async game(@Args('id') id: string): Promise<Game> {
    const game: Game = await this.gameService.findOne(id);
    if (!game) {
      throw new NotFoundException(id);
    }
    return game;
  }
}
