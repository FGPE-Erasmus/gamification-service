import { EntityRepository, Repository } from 'typeorm';

import { PlayerEntity } from './player.entity';

@EntityRepository(PlayerEntity)
export class PlayerRepository extends Repository<PlayerEntity> {}
