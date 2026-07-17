import { AcPaginationElement } from "../../elements/ac-pagination.element";

export interface IAcPaginationPageChangeEvent{
  previousActivePage:number,
  activePage:number,
  totalPages:number,
  startRow:number,
  endRow:number
  pagination:AcPaginationElement
}
