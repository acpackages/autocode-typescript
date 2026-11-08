import { AcDatagridApi, IAcDatagridRow } from "../../../_ac-datagrid.export";

export interface IAcDatagridSelectionMultipleRowsChangeEvent{
  datagridApi:AcDatagridApi,
  datagridRows:IAcDatagridRow[],
  isSelected:boolean;
}
