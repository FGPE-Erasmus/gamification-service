import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { GameRepository } from '../../game/repositories/game.repository';
import { PlayerRepository } from '../../player/repositories/player.repository';
import { Validation, ValidationDocument } from '../models/validation.model';

@Injectable()
export class ValidationRepository extends BaseRepository<Validation, ValidationDocument> {
  constructor(
    @InjectModel('Validation') protected readonly model: Model<ValidationDocument>,
    protected readonly gameRepository: GameRepository,
    @Inject(forwardRef(() => PlayerRepository)) protected readonly playerRepository: PlayerRepository,
  ) {
    super(new Logger(ValidationRepository.name), model);
  }

  async save(doc: Partial<Validation>, overwrite = true): Promise<any> {
    // if game changed, remove from previous game's collection
    if (doc.id && doc.game) {
      await this.gameRepository.removeValidation(doc.game, { id: doc.id });
    }
    // if player changed, remove from previous player's collection
    if (doc.id && doc.player) {
      await this.playerRepository.removeValidation(doc.player, { id: doc.id });
    }

    // save the entity as requested
    const result = await super.save(doc, overwrite);

    // add to game's collection
    await this.gameRepository.upsertValidation(result.game, { id: result.id });

    // add to player's collection
    await this.playerRepository.upsertValidation(result.player, { id: result.id });

    return result;
  }

  async deleteIf(conditions: FilterQuery<Validation>, options: Record<string, unknown> = {}): Promise<Validation[]> {
    const validations: Validation[] = await super.deleteIf(conditions, options);
    for (const validation of validations) {
      await this.removeRelationsOnDelete(validation);
    }
    return validations;
  }

  async delete(doc: Partial<Validation>): Promise<Validation> {
    const validation: Validation = await super.delete(doc);
    await this.removeRelationsOnDelete(validation);
    return validation;
  }

  async deleteOne(
    conditions: FilterQuery<ValidationDocument>,
    options: Record<string, unknown> = {},
  ): Promise<Validation> {
    const validation: Validation = await super.deleteOne(conditions, options);
    await this.removeRelationsOnDelete(validation);
    return validation;
  }

  async deleteById(id: string): Promise<Validation> {
    const validation: Validation = await super.deleteById(id);
    await this.removeRelationsOnDelete(validation);
    return validation;
  }

  private async removeRelationsOnDelete(validation: Validation): Promise<void> {
    // remove from game's collection
    if (validation.game) {
      await this.gameRepository.removeValidation(validation.game, { id: validation.id });
    }
    // remove from player's collection
    if (validation.player) {
      await this.playerRepository.removeValidation(validation.player, { id: validation.id });
    }
  }
}
