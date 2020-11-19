import { Resolver, ResolveField, Parent } from '@nestjs/graphql';

import { GameService } from '../game/game.service';
import { GameToDtoMapper } from '../game/mappers/game-to-dto.mapper';
import { RewardService } from '../reward/reward.service';
import { PlayerService } from '../player/player.service';
import { PlayerToDtoMapper } from '../player/mappers/player-to-dto.mapper';
import { RewardToDtoMapper } from '../reward/mappers/reward-to-dto.mapper';
import { PlayerDto } from '../player/dto/player.dto';
import { Player } from '../player/models/player.model';
import { RewardDto } from '../reward/dto/reward.dto';
import { Reward } from '../reward/models/reward.model';
import { PlayerRewardDto } from './dto/player-reward.dto';
import { PlayerRewardToDtoMapper } from './mappers/player-reward-to-dto.mapper';
import { PlayerRewardService } from './player-reward.service';

@Resolver(() => PlayerRewardDto)
export class PlayerRewardResolver {
  constructor(
    protected readonly playerRewardService: PlayerRewardService,
    protected readonly playerRewardToDtoMapper: PlayerRewardToDtoMapper,
    protected readonly gameService: GameService,
    protected readonly gameToDtoMapper: GameToDtoMapper,
    protected readonly playerService: PlayerService,
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
    protected readonly rewardService: RewardService,
    protected readonly rewardToDtoMapper: RewardToDtoMapper,
  ) {}

  @ResolveField()
  async player(@Parent() root: PlayerRewardDto): Promise<PlayerDto> {
    const { player: playerId } = root;
    const player: Player = await this.playerService.findById(playerId);
    return this.playerToDtoMapper.transform(player);
  }

  @ResolveField()
  async reward(@Parent() root: PlayerRewardDto): Promise<RewardDto> {
    const { reward: rewardId } = root;
    const reward: Reward = await this.rewardService.findById(rewardId);
    return this.rewardToDtoMapper.transform(reward);
  }
}
