import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { GqlAdminGuard } from '../common/guards/gql-admin.guard';
import { ImportGameArgs } from './args/import-game.args';
import { GameService } from './game.service';
import { GameDto } from './dto/game.dto';
import { GameToDtoMapper } from './mappers/game-to-dto.mapper';
import { Game } from './models/game.model';

@Resolver(() => GameDto)
export class GameResolver {
  constructor(protected readonly gameService: GameService, protected readonly gameToDtoMapper: GameToDtoMapper) {}

  @Mutation(() => GameDto)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async importGEdILArchive(@Args() importGameArgs: ImportGameArgs): Promise<GameDto> {
    const { file, gameInput } = importGameArgs;
    const { createReadStream } = await file;
    const game = await this.gameService.importGEdILArchive(
      {
        name: gameInput.name,
        description: gameInput.description,
        startDate: gameInput.startDate,
        endDate: gameInput.endDate,
      },
      createReadStream(),
    );
    return this.gameToDtoMapper.transform(game);
  }

  @Query(() => [GameDto])
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async games(): Promise<GameDto[]> {
    const games: Game[] = await this.gameService.findAll();
    return Promise.all(games.map(async game => this.gameToDtoMapper.transform(game)));
  }

  @Query(() => GameDto)
  @UseGuards(GqlJwtAuthGuard)
  async game(@Args('id') id: string): Promise<GameDto> {
    const game: Game = await this.gameService.findById(id);
    if (!game) {
      throw new NotFoundException();
    }
    return this.gameToDtoMapper.transform(game);
  }
}
