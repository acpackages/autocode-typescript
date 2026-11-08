import { AcRepeaterApi } from '../../core/ac-repeater-api';
import { IAcRepeaterRow } from '../ac-repeater-row.interface';
import { IAcRepeaterFieldDef } from '../ac-repeater-field-def.interface';

export interface IAcRepeaterRowEditorArgs {
  row: IAcRepeaterRow;
  rowElement: any;
  fields: IAcRepeaterFieldDef[];
  readonly dataSnapshot: Record<string, any>;
  repeaterApi: AcRepeaterApi;
  notifyFieldChange(field: IAcRepeaterFieldDef, newValue: any): void;
  commit(changedFields?: string[]): void;
  cancel(): void;
}
