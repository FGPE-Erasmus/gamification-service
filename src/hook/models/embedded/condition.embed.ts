import { Prop } from '@nestjs/mongoose';

export class ConditionEmbed {

  @Prop()
  order: number;

  @Prop()
  leftEntity: string;

  @Prop()
  leftProperty: string;

  @Prop()
  comparingFunction: string;

  @Prop()
  rightEntity: string;

  @Prop()
  rightProperty: string;
}
