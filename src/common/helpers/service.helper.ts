import { Injectable } from '@nestjs/common';

import { IWhereName } from '../interfaces/where-name.interface';
import { IWhereIds } from '../interfaces/where-ids.interface';
import { findOrder } from '../types/find-order.type';
import { FindNameDto } from '../dto/find-name.dto';
import { toMongoId } from '../utils/mongo.utils';
import { IRepository } from '../interfaces/repository.interface';

@Injectable()
export class ServiceHelper {
  async getUpsertData(id: string | undefined, fields: { [k: string]: any }, repository: IRepository<any>): Promise<any> {
    if (id) {
      return {
        ...(await repository.getById(id)),
        ...fields,
      };
    }

    return repository.save(fields);
  }

  getWhereByName(name: string | undefined): IWhereName {
    const $where: IWhereName = {
      active: true,
    };

    if (name) {
      $where.name = new RegExp('.*' + name.toLocaleLowerCase() + '.*', 'i');
    }

    return $where;
  }

  getWhereByIds(ids: string[]): IWhereIds {
    return {
      _id: { $in: ids.map((mongoId: string): string => toMongoId(mongoId)) },
      active: true,
    };
  }

  /*async findAllByNameOrIds(dto: FindNameDto, repository: IRepository<any>): Promise<any> {
    const { skip, take, ids, name, order, fieldSort }: FindNameDto = dto;
    const $order: findOrder = { [fieldSort]: order };
    const $where: IWhereName | IWhereIds = ids ? this.getWhereByIds(ids) : this.getWhereByName(name);

    const [result, count]: [any[], any[]] = await Promise.all([
      repository.find({
        skip,
        take,
        where: $where,
        order: $order,
      }),
      repository.find({
        where: $where,
      }),
    ]);

    return {
      items: result,
      total: count.length,
    };
  }*/
}
