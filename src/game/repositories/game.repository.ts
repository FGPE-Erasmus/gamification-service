import { EntityRepository, Repository } from 'typeorm';

import { GameEntity } from '../entities/game.entity';

@EntityRepository(GameEntity)
export class GameRepository extends Repository<GameEntity> {}
