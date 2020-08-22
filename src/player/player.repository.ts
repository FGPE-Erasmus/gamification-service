import { EntityRepository, Repository } from 'typeorm';

import { PlayerEntity } from './entities/player.entity';

@EntityRepository(PlayerEntity)
export class PlayerRepository extends Repository<PlayerEntity> {}
