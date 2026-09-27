import { AcDatagridApi } from "../../core/ac-datagrid-api";
import { IAcDatagridCell } from "../ac-datagrid-cell.interface";
import { IAcDatagridRow } from "../ac-datagrid-row.interface";
import { IAcDatagridColumn } from "../ac-datagrid-column.interface";

export interface IAcDatagridCellElementArgs {
  datagridApi: AcDatagridApi;
  datagridCell: IAcDatagridCell;
  value?: any;
  rawValue?: any;
  row?: IAcDatagridRow;
  column?: IAcDatagridColumn;
  params?: any;
}

