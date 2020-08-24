import { HintRepository } from './repository/hint.repository';
import { HintEntity as Hint } from './entities/hint.entity';

export class HintService {
  constructor(readonly hintRepository: HintRepository) {}

  async getHint(playerId: string, exerciseId: string): Promise<Hint[]> {
    const wrap: Hint[] = [];
    const hint = await this.hintRepository.findOne({
      where: {
        playerId: playerId,
        exerciseId: exerciseId,
      },
    });
    if (hint) wrap.push(hint);
    return wrap;
  }
}
