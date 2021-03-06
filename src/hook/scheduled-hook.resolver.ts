import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Role } from '../common/enums/role.enum';
import { ChallengeDto } from '../challenge/dto/challenge.dto';
import { ChallengeToDtoMapper } from '../challenge/mappers/challenge-to-dto.mapper';
import { ChallengeService } from '../challenge/challenge.service';
import { GameService } from '../game/game.service';
import { GameDto } from '../game/dto/game.dto';
import { GameToDtoMapper } from '../game/mappers/game-to-dto.mapper';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { ScheduledHookService } from './scheduled-hook.service';
import { ScheduledHookDto } from './dto/scheduled-hook.dto';
import { ScheduledHookToDtoMapper } from './mappers/scheduled-hook-to-dto.mapper';
import { ScheduledHook } from './models/scheduled-hook.model';

@Resolver(() => ScheduledHookDto)
export class ScheduledHookResolver {
  constructor(
    protected readonly scheduledHookService: ScheduledHookService,
    protected readonly scheduledHookToDtoMapper: ScheduledHookToDtoMapper,
    protected readonly gameService: GameService,
    protected readonly gameToDtoMapper: GameToDtoMapper,
    protected readonly challengeService: ChallengeService,
    protected readonly challengeToDtoMapper: ChallengeToDtoMapper,
  ) {}

  @Roles(Role.TEACHER)
  @Query(() => [ScheduledHookDto])
  async scheduledHooks(@Args('gameId') gameId: string): Promise<ScheduledHookDto[]> {
    const hooks: ScheduledHook[] = await this.scheduledHookService.findByGameId(gameId);
    return Promise.all(hooks.map(async hook => this.scheduledHookToDtoMapper.transform(hook)));
  }

  @ResolveField()
  async game(@Parent() root: ScheduledHookDto): Promise<GameDto> {
    const { game: gameId } = root;
    const game = await this.gameService.findById(gameId);
    return this.gameToDtoMapper.transform(game);
  }

  @ResolveField()
  async parentChallenge(@Parent() root: ScheduledHookDto): Promise<ChallengeDto | undefined> {
    const { parentChallenge: parentChallengeId } = root;
    if (!parentChallengeId) {
      return;
    }
    const parentChallenge = await this.challengeService.findById(parentChallengeId);
    return this.challengeToDtoMapper.transform(parentChallenge);
  }
}
