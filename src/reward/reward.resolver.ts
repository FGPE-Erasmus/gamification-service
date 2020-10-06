import { Resolver } from '@nestjs/graphql';

import { ChallengeService } from '../challenge/challenge.service';
import { GameService } from '../game/game.service';
import { RewardService } from './reward.service';
import { RewardDto } from './dto/reward.dto';

@Resolver(() => RewardDto, { isAbstract: true })
export class RewardResolver {
  constructor(
    protected readonly rewardService: RewardService,
    protected readonly gameService: GameService,
    protected readonly challengeService: ChallengeService,
  ) {}

  /* @Query(() => [RewardDto])
  @UseGuards(GqlJwtAuthGuard)
  async rewards(): Promise<RewardDto[]> {
    return this.rewardService.findAll();
  }

  @Query(() => [BadgeDto])
  @UseGuards(GqlJwtAuthGuard)
  async badges(): Promise<BadgeDto[]> {
    return this.rewardService.findAll(RewardType.BADGE);
  } */

  /*@ResolveField('game', () => GameDto)
  async game(@Parent() root: RewardDto): Promise<GameDto> {
    const { game } = root;
    return await this.gameService.findOne(game);
  }

  @ResolveField('parentChallenge', () => ChallengeDto)
  async parentChallenge(@Parent() root: RewardDto): Promise<ChallengeDto> {
    const { parentChallenge } = root;
    if (!parentChallenge) {
      return;
    }
    return await this.challengeService.findOne(parentChallenge);
  }*/
}
