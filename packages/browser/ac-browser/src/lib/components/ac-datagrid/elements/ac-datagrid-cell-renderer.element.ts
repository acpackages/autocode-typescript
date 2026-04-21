/* eslint-disable @typescript-eslint/no-inferrable-types */
import { dateFormat, parseDateTimeString } from "@autocode-ts/ac-extensions";
import { acAddClassToElement, acClearElement } from "../../../utils/ac-element-functions";
import { IAcDatagridCellRenderer, IAcDatagridCellElementArgs, IAcDatagridColumn, AC_DATAGRID_HOOK, IAcDatagridCell, AcEnumDatagridColumnDataType } from "../_ac-datagrid.export";
import { AcDatagridAttributeName } from "../consts/ac-datagrid-attribute-name.const";
import { AcDatagridCssClassName } from "../consts/ac-datagrid-css-class-name.const";
import { AcDatagridApi } from "../core/ac-datagrid-api";

export class AcDatagridCellRendererElement implements IAcDatagridCellRenderer{
  private datagridApi!: AcDatagridApi;
  private datagridCell!:IAcDatagridCell;
  private datagridColumn!:IAcDatagridColumn;
  public element: HTMLElement = document.createElement('div');

  destroy?(): void {
    acClearElement({element:this.element});
    this.element.remove();
    Object.freeze(this);
  }

  getElement(): HTMLElement {
    return this.element;
  }

  init(args: IAcDatagridCellElementArgs): void {
    this.datagridApi = args.datagridApi;
    this.datagridCell = args.datagridCell;
    this.datagridColumn = this.datagridCell.datagridColumn;
    this.initElement();
  }

  initElement(){
    this.element.setAttribute(AcDatagridAttributeName.acDatagridCellId,this.datagridCell.cellId);
    this.element.setAttribute(AcDatagridAttributeName.acDatagridColumnId,this.datagridCell.datagridColumn.columnId);
    this.element.setAttribute(AcDatagridAttributeName.acDatagridRowId,this.datagridCell.datagridRow.rowId);
    acAddClassToElement({ class_: AcDatagridCssClassName.acDatagridCellRenderer, element: this.element });
    this.element.style.height = "100%";
    this.element.style.width = "max-content";
    this.render();
  }

  refresh(args: IAcDatagridCellElementArgs): void {
    this.render();
    if(this.datagridApi){
      this.datagridApi.hooks.execute({hook:AC_DATAGRID_HOOK.CellRendererRefresh,args:this});
    }
  }

  render() {
    const value = this.datagridCell.datagridRow.data[this.datagridCell.datagridColumn.columnKey];
    acClearElement({element:this.element});
    if(value){
      if(this.datagridColumn && this.datagridColumn.columnDefinition.dataType == AcEnumDatagridColumnDataType.Date){
        const parseValue = parseDateTimeString(value);
        if(parseValue){
          this.element.innerHTML = dateFormat(parseValue,'dd-MM-yyyy');
        }
      }
      else if(this.datagridColumn && this.datagridColumn.columnDefinition.dataType == AcEnumDatagridColumnDataType.Datetime){
        const parseValue = parseDateTimeString(value);
        if(parseValue){
          this.element.innerHTML = dateFormat(parseValue,'dd-MM-yyyy HH:mm a');
        }
      }
      else{
        this.element.innerHTML = value;
      }
    }
  }

}
