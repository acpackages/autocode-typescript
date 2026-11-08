import { AcRepeaterApi } from '../../core/ac-repeater-api';
import { IAcRepeaterRow } from '../ac-repeater-row.interface';
import { IAcRepeaterFieldDef } from '../ac-repeater-field-def.interface';

export interface IAcRepeaterFieldValueChangeArgs {
  repeaterApi: AcRepeaterApi;
  repeaterRow: IAcRepeaterRow;
  field: IAcRepeaterFieldDef;
  oldValue: any;
  newValue: any;
  event?: Event;
}
