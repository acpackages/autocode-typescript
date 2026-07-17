import { AcPaginationElement } from "../../elements/ac-pagination.element";

export interface IAcPaginationPageSizeChangeEvent{
  previousPageSize:number,
  pageSize:number,
  pagination:AcPaginationElement
}
