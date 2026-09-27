/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { acNullifyInstanceProperties } from "@autocode-ts/autocode";
import { acAddClassToElement, acClearElement } from "../../../utils/ac-element-functions";
import { AcDatagridApi, IAcDatagridColumn, IAcDatagridRow, AC_DATAGRID_HOOK, IAcDatagridCellEditor, IAcDatagridCellElementArgs, IAcDatagridColumnDefinition } from "../_ac-datagrid.export";
import { AcDatagridAttributeName } from "../consts/ac-datagrid-attribute-name.const";
import { AC_DATAGRID_CLASS_NAME } from "../consts/ac-datagrid-css-class-name.const";
import { IAcDatagridCell } from "../interfaces/ac-datagrid-cell.interface";

export class AcDatagridCellEditorElement implements IAcDatagridCellEditor {
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
    acClearElement({ element: this.element });
    this.element.remove();
    Object.freeze(this);
    acNullifyInstanceProperties({ instance: this });
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

    // Use rawValue from args (honours valueGetter) then fall back to row data
    const initialValue = args.rawValue !== undefined
      ? args.rawValue
      : this.datagridRow.data[this.datagridColumn.columnKey];

    const ownerDoc = this.datagridCell.element?.ownerDocument ?? document;

    if (this.columnDefinition.dataType == 'BOOLEAN') {
      this.element = ownerDoc.createElement('select');
      const optTrue = ownerDoc.createElement('option');
      optTrue.value = 'true';
      optTrue.text = 'true';
      const optFalse = ownerDoc.createElement('option');
      optFalse.value = 'false';
      optFalse.text = 'false';
      this.element.append(optTrue, optFalse);
    } else {
      this.element = ownerDoc.createElement('input');
      if (this.columnDefinition.dataType == 'NUMBER') {
        this.element.setAttribute('type', 'number');
      } else if (this.columnDefinition.dataType == 'DATE') {
        this.element.setAttribute('type', 'date');
      } else if (this.columnDefinition.dataType == 'DATETIME') {
        this.element.setAttribute('type', 'datetime-local');
      }
    }

    // Apply cellEditorElementAttrs (setAttribute style) and cellInputElementAttrs (property style)
    if (this.columnDefinition.cellEditorElementAttrs) {
      for (const key of Object.keys(this.columnDefinition.cellEditorElementAttrs)) {
        this.element.setAttribute(key, String(this.columnDefinition.cellEditorElementAttrs[key]));
      }
    }
    if (this.columnDefinition.cellInputElementAttrs) {
      for (const key of Object.keys(this.columnDefinition.cellInputElementAttrs)) {
        this.element[key] = this.columnDefinition.cellInputElementAttrs[key];
      }
    }

    this.initElement(initialValue);
  }

  refresh(args: IAcDatagridCellElementArgs): void {
    const value = args.rawValue !== undefined
      ? args.rawValue
      : args.datagridCell.datagridRow.data[args.datagridCell.datagridColumn.columnKey];
    this.element.value = value ?? '';
    if (this.datagridApi) {
      this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.CellEditorRefresh, args: this });
    }
  }

  initElement(initialValue?: any) {
    this.element.classList.add(AC_DATAGRID_CLASS_NAME.acDatagridCellEditorInput);
    this.element.setAttribute(AcDatagridAttributeName.acDatagridCellId, this.datagridCell.cellId);
    this.element.setAttribute(AcDatagridAttributeName.acDatagridColumnId, this.datagridCell.datagridColumn.columnId);
    this.element.setAttribute(AcDatagridAttributeName.acDatagridRowId, this.datagridCell.datagridRow.rowId);
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridCellEditorInput, element: this.element });
    this.element.style.height = "100%";
    this.element.style.width = "100%";
    this.element.value = initialValue ?? this.datagridCell.datagridRow.data[this.datagridCell.datagridColumn.columnKey] ?? '';
  }

}
