import { Injectable } from '@nestjs/common';
import { ServiceHelper } from 'src/common/helpers/service.helper';
import { PlayerRepository } from './player.repository';
import { PlayerEntity as Player } from './entities/player.entity';
import { PlayerDto } from './player.dto';

@Injectable()
export class PlayerService {
  constructor(private readonly serviceHelper: ServiceHelper, private readonly playerRepository: PlayerRepository) {}

  async createPlayer(id: string | undefined, data: PlayerDto): Promise<Player> {
    const fields: { [k: string]: any } = { ...data };
    const newPlayer: Player = await this.serviceHelper.getUpsertData(id, fields, this.playerRepository);
    return this.playerRepository.save(newPlayer);
  }
}
