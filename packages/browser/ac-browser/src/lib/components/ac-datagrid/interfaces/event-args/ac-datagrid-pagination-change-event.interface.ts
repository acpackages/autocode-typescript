import { AcDatagridApi } from "../../core/ac-datagrid-api";
import { AcPaginationElement } from "../../../ac-pagination/_ac-pagination.export";

export interface IAcDatagridPaginationChangeEvent{
  datagridApi:AcDatagridApi,
  pagination:AcPaginationElement,
  event?:any
}
