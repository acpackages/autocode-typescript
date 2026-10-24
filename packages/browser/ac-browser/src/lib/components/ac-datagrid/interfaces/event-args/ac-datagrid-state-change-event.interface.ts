import { AcDatagridApi } from "../../core/ac-datagrid-api";
import { IAcDatagridState } from "../ac-datagrid-state.interface";

export interface IAcDatagridStateChangeEvent {
  datagridApi: AcDatagridApi;
  datagridState: IAcDatagridState;
  currentState?: IAcDatagridState;
  source?: string;
  event?: any;
}
