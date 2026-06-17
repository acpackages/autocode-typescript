import { AcDatagridApi } from "../../core/ac-datagrid-api";
import { IAcDatagridRow } from "../ac-datagrid-row.interface";

export interface IAcDatagridRowUpdateHookArgs{
  datagridApi:AcDatagridApi,
  datagridRow:IAcDatagridRow,
  highlightCells:boolean,
  triggerChange?:boolean
}
