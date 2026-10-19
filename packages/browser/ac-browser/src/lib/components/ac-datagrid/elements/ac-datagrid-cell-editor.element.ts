/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { acNullifyInstanceProperties } from "@autocode-ts/autocode";
import { acAddClassToElement, acClearElement } from "../../../utils/ac-element-functions";
import { AcDatagridApi, IAcDatagridColumn, IAcDatagridRow, AC_DATAGRID_HOOK, IAcDatagridCellEditor, IAcDatagridCellElementArgs, IAcDatagridColumnDefinition, AcEnumDatagridColumnDataType } from "../_ac-datagrid.export";
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
    const key = this.datagridCell.datagridColumn.columnKey || this.datagridCell.datagridColumn.columnDefinition.field;
    if (key) {
      const val = this.getValue();
      (this.datagridCell.datagridRow as any).data[key] = val;
    }
  }

  destroy(): void {
    if (this.element) {
      this.element.removeEventListener('input', this.onInputChange);
      this.element.removeEventListener('change', this.onInputChange);
      acClearElement({ element: this.element });
      this.element.remove();
    }
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
    if (this.datagridColumn && (this.datagridColumn.columnDefinition?.dataType === 'BOOLEAN' || (this.datagridColumn as any)?.dataType === AcEnumDatagridColumnDataType.Boolean)) {
      return this.element.value === 'true' || this.element.value === true;
    }
    const isNumber = this.columnDefinition?.dataType === 'NUMBER' || (this.datagridColumn as any)?.dataType === AcEnumDatagridColumnDataType.Number;
    if (isNumber) {
      const val = this.element ? this.element.value : '';
      if (val !== '' && val !== null && val !== undefined && !isNaN(Number(val))) {
        return Number(val);
      }
      return val === '' ? undefined : val;
    }
    return this.element ? this.element.value : '';
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
      const isNumber = this.columnDefinition?.dataType === 'NUMBER' || (this.datagridColumn as any)?.dataType === AcEnumDatagridColumnDataType.Number;
      if (isNumber) {
        this.element.setAttribute('type', 'number');
        if (!this.element.hasAttribute('step')) {
          this.element.setAttribute('step', 'any');
        }
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
    this.element.value = value;
    if (this.datagridApi) {
      this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.CellEditorRefresh, args: this });
    }
  }

  private onInputChange = (e: Event) => {
    if (!this.datagridCell) return;
    const colKey = this.datagridCell.datagridColumn.columnKey;
    const val = this.getValue();
    this.datagridCell.datagridRow.data[colKey] = val;
    if (this.datagridCell.element) {
      (this.datagridCell.element as any).previousValue = val;
    }
    this.datagridApi?.eventHandler?.handleCellValueChange({ datagridCell: this.datagridCell, event: e });
  };

  initElement(initialValue?: any) {
    this.element.classList.add(AC_DATAGRID_CLASS_NAME.acDatagridCellEditorInput);
    this.element.setAttribute(AcDatagridAttributeName.acDatagridCellId, this.datagridCell.cellId);
    this.element.setAttribute(AcDatagridAttributeName.acDatagridColumnId, this.datagridCell.datagridColumn.columnId);
    this.element.setAttribute(AcDatagridAttributeName.acDatagridRowId, this.datagridCell.datagridRow.rowId);
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridCellEditorInput, element: this.element });
    this.element.style.height = "100%";
    this.element.style.width = "100%";
    this.element.value = initialValue ?? this.datagridCell.datagridRow.data[this.datagridCell.datagridColumn.columnKey] ?? '';

    this.element.addEventListener('input', this.onInputChange);
    this.element.addEventListener('change', this.onInputChange);
  }

}
