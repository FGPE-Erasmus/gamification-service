import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { ChallengeEntity as Challenge } from '../challenge/entities/challenge.entity';
import { GameEntity as Game } from '../game/entities/game.entity';
import { ChallengeService } from '../challenge/challenge.service';
import { GameService } from '../game/game.service';
import { RewardEntity as Reward } from './entities/reward.entity';
import { RewardService } from './reward.service';

@Resolver(() => Reward, { isAbstract: true })
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

  @ResolveField('game', () => Game)
  async game(@Parent() root: Reward): Promise<Game> {
    const { game } = root;
    return await this.gameService.findOne(game);
  }

  @ResolveField('parentChallenge', () => Challenge)
  async parentChallenge(@Parent() root: Reward): Promise<Challenge | undefined> {
    const { parentChallenge } = root;
    if (!parentChallenge) {
      return;
    }
    return await this.challengeService.findOne(parentChallenge);
  }
}
