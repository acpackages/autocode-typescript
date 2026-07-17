import { AcElementBase } from "../../../core/ac-element-base";
import { acClearElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AcPaginationElement } from "./ac-pagination.element";

import { AcEnumPaginationEvent } from "../enums/ac-enum-pagination-event.enum";

export class AcPaginationDisplayedRowsElement extends AcElementBase{
  private _pagination?: AcPaginationElement;
  get pagination():AcPaginationElement|undefined{
    return this._pagination;
  }
  set pagination(value:AcPaginationElement){
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

acRegisterCustomElement({'tag':'ac-pagination-displayed-rows',type:AcPaginationDisplayedRowsElement});
