/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { acClearElement } from "../../../utils/ac-element-functions";
import { IAcDatagridCellEditor } from "../interfaces/ac-datagrid-cell-editor-element.interface";
import { IAcDatagridCellElementArgs } from "../interfaces/callback-args/ac-datagrid-cell-renderer-element-args.interface";
import { AcDatagridAttributeName } from "../consts/ac-datagrid-attribute-name.const";
import { AC_DATAGRID_CLASS_NAME } from "../consts/ac-datagrid-css-class-name.const";

export class AcDatagridFunctionalCellEditor implements IAcDatagridCellEditor {
  public element: HTMLElement = document.createElement('input');
  private args!: IAcDatagridCellElementArgs;
  private currentValue: any;

  getElement(): HTMLElement {
    return this.element;
  }

  getValue(): any {
    if (this.element && typeof (this.element as any).getValue === 'function') {
      return (this.element as any).getValue();
    }
    if (this.element && 'value' in (this.element as any)) {
      return (this.element as any).value;
    }
    return this.currentValue;
  }

  focus(): void {
    if (this.element && typeof this.element.focus === 'function') {
      this.element.focus();
    }
  }

  blur(): void {
    if (this.element && typeof this.element.blur === 'function') {
      this.element.blur();
    }
  }

  init(args: IAcDatagridCellElementArgs): void {
    this.args = args;
    this.currentValue = args.value;

    const fn = args.column?.columnDefinition.cellEditorFunction;
    if (typeof fn === 'function') {
      const el = fn(args);
      if (el instanceof HTMLElement) {
        this.element = el;
      }
    }

    this.element.classList.add(AC_DATAGRID_CLASS_NAME.acDatagridCellEditorInput);
    if (args.datagridCell) {
      this.element.setAttribute(AcDatagridAttributeName.acDatagridCellId, args.datagridCell.cellId);
      if (args.column) {
        this.element.setAttribute(AcDatagridAttributeName.acDatagridColumnId, args.column.columnId);
      }
      if (args.row) {
        this.element.setAttribute(AcDatagridAttributeName.acDatagridRowId, args.row.rowId);
      }
    }
    const rowId = args.row?.rowId || args.datagridCell?.datagridRow?.rowId;
    if (rowId) {
      this.element.setAttribute(AcDatagridAttributeName.acCellEditorRowId, rowId);
    }
    const columnKey = args.column?.columnKey || args.column?.columnDefinition?.field || args.datagridCell?.datagridColumn?.columnKey || args.datagridCell?.datagridColumn?.columnDefinition?.field;
    if (columnKey) {
      this.element.setAttribute(AcDatagridAttributeName.acCellEditorColumnKey, columnKey);
    }
    this.element.style.height = "100%";
    this.element.style.width = "100%";

    // Apply attributes if specified
    const attrs = args.column?.columnDefinition.cellEditorElementAttrs;
    if (attrs) {
      for (const [key, value] of Object.entries(attrs)) {
        this.element.setAttribute(key, String(value));
      }
    }

    // Set initial value on standard inputs if not already populated
    if ('value' in (this.element as any) && (this.element as any).value === '' && args.value !== undefined) {
      (this.element as any).value = args.value ?? '';
    }

    const handleInput = (e: Event) => {
      const val = this.getValue() !== undefined ? this.getValue() : (e.target as any)?.value;
      if (this.args?.datagridCell) {
        const colKey = this.args.datagridCell.datagridColumn.columnKey;
        const oldVal = this.args.datagridCell.datagridRow.data[colKey];
        const isBothEmpty = (oldVal === undefined || oldVal === null || oldVal === '') && (val === undefined || val === null || val === '');
        if (isBothEmpty || oldVal === val) {
          return;
        }
        this.currentValue = val;
        this.args.datagridCell.datagridRow.data[colKey] = val;
        if (this.args.datagridCell.element) {
          (this.args.datagridCell.element as any).previousValue = val;
        }
        this.args.datagridApi?.eventHandler?.handleCellValueChange({ datagridCell: this.args.datagridCell, event: e });
      }
    };
    this.element.addEventListener('input', handleInput);
    this.element.addEventListener('change', handleInput);
  }

  refresh(args: IAcDatagridCellElementArgs): void {
    this.args = args;
    const rowId = args.row?.rowId || args.datagridCell?.datagridRow?.rowId;
    if (rowId) {
      this.element.setAttribute(AcDatagridAttributeName.acCellEditorRowId, rowId);
    }
    const columnKey = args.column?.columnKey || args.column?.columnDefinition?.field || args.datagridCell?.datagridColumn?.columnKey || args.datagridCell?.datagridColumn?.columnDefinition?.field;
    if (columnKey) {
      this.element.setAttribute(AcDatagridAttributeName.acCellEditorColumnKey, columnKey);
    }
    const resolvedValue = args.rawValue !== undefined ? args.rawValue : args.value;
    this.currentValue = resolvedValue;
    if (this.element) {
      if (typeof (this.element as any).refresh === 'function') {
        (this.element as any).refresh(args);
      } else if ('value' in (this.element as any)) {
        (this.element as any).value = resolvedValue ?? '';
      } else if (typeof (this.element as any).setValue === 'function') {
        try {
          (this.element as any).setValue({ value: resolvedValue, emitEvent: false });
        } catch {
          (this.element as any).setValue(resolvedValue);
        }
      }
    }
  }

  destroy(): void {
    acClearElement({ element: this.element });
    if (this.element.parentNode) {
      this.element.remove();
    }
  }
}
