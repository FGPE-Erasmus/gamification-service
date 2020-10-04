import { Injectable } from '@nestjs/common';
import { IMapper } from '../../common/interfaces/mapper.interface';
import { PlayerReward } from '../models/player-reward.model';
import { PlayerRewardDto } from '../dto/player-reward.dto';

@Injectable()
export class PlayerRewardToDtoMapper implements IMapper<PlayerReward, PlayerRewardDto> {

  async transform(obj: PlayerReward): Promise<PlayerRewardDto> {
    return undefined;
  }

}
