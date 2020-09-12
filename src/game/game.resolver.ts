import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { GqlAdminGuard } from '../common/guards/gql-admin.guard';
import ImportGameDto from './import-game.dto';
import { GameService } from './game.service';
import { HookService } from 'src/hook/hook.service';

@Resolver()
export class GameResolver {
  constructor(private gameService: GameService, private hookService: HookService) {}

  @Mutation(() => String)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async createGame(@Args() input: ImportGameDto): Promise<string> {
    const { createReadStream } = await input.file;
    await this.gameService.create(
      {
        name: input.name,
        startDate: input.startDate,
        endDate: input.endDate,
        userIds: input.userIds,
      },
      createReadStream(),
    );
    //implement hooks uploading
    return 'Creating a game...';
  }
}
