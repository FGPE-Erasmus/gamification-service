import { HintRepository } from './repository/hint.repository';
import { HintEntity as Hint } from './entities/hint.entity';

export class HintService {
  constructor(readonly hintRepository: HintRepository) {}

  async getPlayersHintsForExercise(playerId: string, exerciseId: string): Promise<Hint[]> {
    const wrap: Hint[] = [];
    const hint = await this.hintRepository.find({
      where: {
        playerId: playerId,
        exerciseId: exerciseId,
      },
    });
    if (hint) wrap.concat(hint);
    return wrap;
  }

  async getHintsForExercise(exerciseId: string): Promise<Hint[]> {
    const wrap: Hint[] = [];
    const hints = await this.hintRepository.find({
      where: {
        exerciseId: exerciseId,
      },
    });
    if (hints) wrap.concat(hints);
    return wrap;
  }
}
