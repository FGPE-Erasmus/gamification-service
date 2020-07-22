import { Injectable } from '@nestjs/common';
import { ServiceHelper } from 'src/common/helpers/service.helper';
import { CreateChallengeDto } from 'src/challenge/dto/create-challenge.dto';
import ChallengeStatus from './dto/challenge-status.dto';
import CreateStatusDto from './dto/create-challenge-status.dto';
import { State } from './dto/state.enum';

@Injectable()
export class ChallengeStatusService {
  /**
   * Creates a challenge status as soon as there is an interaction
   *  between the student and the challenge.
   * @param game the game properties
   * @param gedilStream a read stream to the GEdIL specification package.
   */

  //looks basic for now, thing to improve
  async createStatus(data: CreateStatusDto): Promise<ChallengeStatus> {
    const status: ChallengeStatus = {
      startedAt: data.startedAt,
      endedAt: undefined,
      state: data.state ? data.state : [State.OPENED], //default one?
      openedAt: data.openedAt ? data.openedAt : undefined, //can a student choose to instantly open?
    };

    return status;
  }
}
