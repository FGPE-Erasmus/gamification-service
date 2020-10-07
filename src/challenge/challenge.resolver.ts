import { UseGuards } from '@nestjs/common';
import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { GameDto } from '../game/dto/game.dto';
import { GameToDtoMapper } from '../game/mappers/game-to-dto.mapper';
import { GameService } from '../game/game.service';
import { ChallengeService } from './challenge.service';
import { ChallengeDto } from './dto/challenge.dto';
import { ChallengeToDtoMapper } from './mappers/challenge-to-dto.mapper';
import { Challenge } from './models/challenge.model';

@Resolver(() => ChallengeDto)
export class ChallengeResolver {
  constructor(
    protected readonly challengeService: ChallengeService,
    protected readonly challengeToDtoMapper: ChallengeToDtoMapper,
    protected readonly gameService: GameService,
    protected readonly gameToDtoMapper: GameToDtoMapper,
  ) {}

  @Query(() => [ChallengeDto])
  @UseGuards(GqlJwtAuthGuard)
  async challenges(): Promise<ChallengeDto[]> {
    const challenges: Challenge[] = await this.challengeService.findAll();
    return Promise.all(challenges.map(async challenge => this.challengeToDtoMapper.transform(challenge)));
  }

  @ResolveField()
  async game(@Parent() root: ChallengeDto): Promise<GameDto> {
    const { game } = root;
    return this.gameToDtoMapper.transform(await this.gameService.findById(game));
  }

  @ResolveField()
  async parentChallenge(@Parent() root: ChallengeDto): Promise<ChallengeDto | undefined> {
    const { parentChallenge } = root;
    if (!parentChallenge) {
      return;
    }
    return this.challengeToDtoMapper.transform(await this.challengeService.findOne({ parentChallenge }));
  }
}
