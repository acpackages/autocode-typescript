import { AcElementBase } from "../../../core/ac-element-base";
import { acClearElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AcPagination } from "./ac-pagination.element";

import { AcEnumPaginationEvent } from "../enums/ac-enum-pagination-event.enum";

export class AcPaginationDisplayedRows extends AcElementBase{
  private _pagination?: AcPagination;
  get pagination():AcPagination|undefined{
    return this._pagination;
  }
  set pagination(value:AcPagination){
    this._pagination = value;
    value.on({event:AcEnumPaginationEvent.PageChange,callback:()=>{
      this.render();
    }});
    value.on({event:AcEnumPaginationEvent.PageSizeChange,callback:()=>{
      this.render();
    }});
  }

  override init(){
    this.render();
  }

  render() {
    if (this.pagination) {
      acClearElement({element:this});
      this.innerHTML = `<b>${this.pagination.startRow}</b> to <b>${this.pagination.endRow}</b> of <b>${this.pagination.totalRows}</b>`;
    }
  }

}

acRegisterCustomElement({'tag':'ac-pagination-displayed-rows',type:AcPaginationDisplayedRows});
