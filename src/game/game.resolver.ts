import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { GqlAdminGuard } from '../common/guards/gql-admin.guard';
import { ImportGameArgs } from './args/import-game.args';
import { GameService } from './game.service';
import { GameDto } from './dto/game.dto';

@Resolver(() => GameDto)
export class GameResolver {
  constructor(private gameService: GameService) {}

  @Mutation(() => GameDto)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async importGEdILArchive(@Args() input: ImportGameArgs): Promise<GameDto> {
    const { createReadStream } = await input.file;
    return await this.gameService.importGEdILArchive(
      {
        name: input.name,
        description: input.description,
        startDate: input.startDate,
        endDate: input.endDate,
      },
      createReadStream(),
    );
  }

  @Query(() => GameDto)
  @UseGuards(GqlJwtAuthGuard)
  async game(@Args('id') id: string): Promise<GameDto> {
    const game: GameDto = await this.gameService.findOne(id);
    if (!game) {
      throw new NotFoundException(id);
    }
    return game;
  }
}
