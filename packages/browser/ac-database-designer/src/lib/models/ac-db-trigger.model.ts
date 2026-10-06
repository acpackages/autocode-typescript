import { AcEnumDbTriggerTiming } from '../enums/ac-enum-db-trigger-timing';
import { AcEnumDbTriggerEvent } from '../enums/ac-enum-db-trigger-event';

export interface AcDbTrigger {
  triggerId: string;
  schemaId: string;
  triggerName: string;
  tableId: string;
  timing: AcEnumDbTriggerTiming;
  event: AcEnumDbTriggerEvent;
  triggerCode: string;
  description: string;
}
