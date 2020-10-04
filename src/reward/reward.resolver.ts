import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { Challenge } from '../challenge/models/challenge.model';
import { Game } from '../game/models/game.model';
import { ChallengeService } from '../challenge/challenge.service';
import { GameDto } from '../game/dto/game.dto';
import { GameService } from '../game/game.service';
import { Reward } from './models/reward.model';
import { RewardService } from './reward.service';
import { ChallengeDto } from '../challenge/dto/challenge.dto';
import { RewardDto } from './dto/reward.dto';

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
  async game(@Parent() root: RewardDto): Promise<GameDto> {
    const { game } = root;
    return await this.gameService.findOne(game);
  }

  @ResolveField('parentChallenge', () => Challenge)
  async parentChallenge(@Parent() root: RewardDto): Promise<ChallengeDto> {
    const { parentChallenge } = root;
    if (!parentChallenge) {
      return;
    }
    return await this.challengeService.findOne(parentChallenge);
  }
}
