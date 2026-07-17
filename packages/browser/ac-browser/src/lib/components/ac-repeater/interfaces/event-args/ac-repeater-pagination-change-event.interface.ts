import { AcPaginationElement } from "../../../ac-pagination/_ac-pagination.export";
import { AcRepeaterApi } from "../../core/ac-repeater-api";

export interface IAcRepeaterPaginationChangeEvent{
  repeaterApi:AcRepeaterApi,
  pagination:AcPaginationElement,
  event?:any
}
