/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { acNullifyInstanceProperties } from "@autocode-ts/autocode";
import { acAddClassToElement, acClearElement } from "../../../utils/ac-element-functions";
import { AcDatagridApi, IAcDatagridColumn, IAcDatagridRow, AC_DATAGRID_HOOK, IAcDatagridCellEditor, IAcDatagridCellElementArgs, IAcDatagridColumnDefinition } from "../_ac-datagrid.export";
import { AcDatagridAttributeName } from "../consts/ac-datagrid-attribute-name.const";
import { AcDatagridCssClassName } from "../consts/ac-datagrid-css-class-name.const";
import { IAcDatagridCell } from "../interfaces/ac-datagrid-cell.interface";

export class AcDatagridCellEditor implements IAcDatagridCellEditor {
  private datagridApi!: AcDatagridApi;
  private datagridCell!: IAcDatagridCell;
  private datagridColumn!: IAcDatagridColumn;
  private datagridRow!: IAcDatagridRow;
  private columnDefinition!: IAcDatagridColumnDefinition;
  public element!: HTMLInputElement | any;

  blur() {
    this.element.blur();
    (this.datagridCell.datagridRow as any).data[this.datagridCell.datagridColumn.columnDefinition.field] = this.element.value;
  }

  destroy(): void {
    acClearElement({element:this.element});
    this.element.remove();
    Object.freeze(this);
    acNullifyInstanceProperties({instance:this});
  }

  focus() {
    this.element.focus();
  }

  getElement(): HTMLElement {
    return this.element;
  }

  getValue() {
    if (this.datagridColumn && this.datagridColumn.columnDefinition.dataType == 'BOOLEAN') {
      return this.element.value == 'true' || this.element.value == true;
    }
    return this.element.value;
  }

  init(args: IAcDatagridCellElementArgs): void {
    this.datagridApi = args.datagridApi;
    this.datagridCell = args.datagridCell;
    this.datagridColumn = this.datagridCell.datagridColumn;
    this.datagridRow = this.datagridCell.datagridRow;
    this.columnDefinition = this.datagridColumn.columnDefinition;
    if (this.columnDefinition.cellInputElement) {
      this.element = this.datagridCell.element!.ownerDocument.createElement(this.columnDefinition.cellInputElement);
    }
    else {
      if (this.datagridColumn.columnDefinition.dataType == 'BOOLEAN') {
        this.element = this.datagridCell.element!.ownerDocument.createElement('select');
        this.element.append('<option value="true">true</option>');
        this.element.append('<option value="false">false</option>')
      }
      else {
        this.element = this.datagridCell.element!.ownerDocument.createElement('input');
        if (this.datagridColumn.columnDefinition.dataType == 'NUMBER') {
          this.element.setAttribute('type', 'number');
        }
        else if (this.datagridColumn.columnDefinition.dataType == 'DATE') {
          this.element.setAttribute('type', 'date');
          this.element.type = 'date';
        }
        else if (this.datagridColumn.columnDefinition.dataType == 'DATETIME') {
          this.element.setAttribute('type', 'datetime-local');
        }
      }
    }
    if (this.columnDefinition.cellInputElementAttrs) {
      for(const key of Object.keys(this.columnDefinition.cellInputElementAttrs)){
        this.element[key] = this.columnDefinition.cellInputElementAttrs[key];
      }
    }
    this.initElement();
  }

  refresh(args: IAcDatagridCellElementArgs): void {
    this.element.value = args.datagridCell.datagridRow.data[args.datagridCell.datagridColumn.columnKey];
    if(this.datagridApi){
      this.datagridApi.hooks.execute({hook:AC_DATAGRID_HOOK.CellEditorRefresh,args:this});
    }
  }

  initElement() {
    this.element.classList.add(AcDatagridCssClassName.acDatagridCellEditorInput);
    this.element.setAttribute(AcDatagridAttributeName.acDatagridCellId, this.datagridCell.cellId);
    this.element.setAttribute(AcDatagridAttributeName.acDatagridColumnId, this.datagridCell.datagridColumn.columnId);
    this.element.setAttribute(AcDatagridAttributeName.acDatagridRowId, this.datagridCell.datagridRow.rowId);
    acAddClassToElement({ class_: AcDatagridCssClassName.acDatagridCellEditorInput, element: this.element });
    this.element.style.height = "100%";
    this.element.style.width = "100%";
    this.element.value = this.datagridCell.datagridRow.data[this.datagridCell.datagridColumn.columnKey];
  }

}
