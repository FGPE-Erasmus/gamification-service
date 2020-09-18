import { TriggerEvent } from '../enums/trigger-event.enum';
import { TriggerKind } from '../enums/trigger-kind.dto';

export class Trigger {
  kind: TriggerKind;
  event: TriggerEvent;
  recurrent: boolean;
  parameters: string[];
}
