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

    this.element.addEventListener('input', (e: Event) => {
      this.currentValue = (e.target as any)?.value;
    });
  }

  refresh(args: IAcDatagridCellElementArgs): void {
    this.args = args;
    this.currentValue = args.value;
    if ('value' in (this.element as any) && args.value !== undefined) {
      (this.element as any).value = args.value ?? '';
    }
  }

  destroy(): void {
    acClearElement({ element: this.element });
    if (this.element.parentNode) {
      this.element.remove();
    }
  }
}
