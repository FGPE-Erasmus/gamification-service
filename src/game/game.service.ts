import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { Parse, Entry } from 'unzipper';

import GameDto from './game.dto';

@Injectable()
export class GameService {
  /**
   * Create a game from a GEdIL specification.
   *
   * @param game the game properties
   * @param gedilStream a read stream to the GEdIL specification package.
   */
  async create(game: GameDto, gedilStream: Readable): Promise<boolean | undefined> {
    console.log(game);
    gedilStream.pipe(Parse()).on('entry', (entry: Entry) => {
      const fileName = entry.path;
      const type = entry.type;
      const size = entry.vars.compressedSize;

      console.log(fileName + ' ' + type + ' ' + size);

      entry.autodrain();
    });
    return true;
  }
}
