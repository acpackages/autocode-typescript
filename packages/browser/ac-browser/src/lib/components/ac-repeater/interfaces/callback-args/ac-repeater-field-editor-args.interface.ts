import { AcRepeaterApi } from '../../core/ac-repeater-api';
import { IAcRepeaterRow } from '../ac-repeater-row.interface';
import { IAcRepeaterFieldDef } from '../ac-repeater-field-def.interface';

export interface IAcRepeaterFieldEditorArgs {
  repeaterApi: AcRepeaterApi;
  repeaterRow: IAcRepeaterRow;
  field: IAcRepeaterFieldDef;
  value: any;
  rawValue: any;
  params?: any;
}
