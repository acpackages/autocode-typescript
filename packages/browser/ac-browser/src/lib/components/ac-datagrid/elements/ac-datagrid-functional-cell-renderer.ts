/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { acClearElement } from "../../../utils/ac-element-functions";
import { IAcDatagridCellRenderer } from "../interfaces/ac-datagrid-cell-renderer-element.interface";
import { IAcDatagridCellElementArgs } from "../interfaces/callback-args/ac-datagrid-cell-renderer-element-args.interface";
import { AcDatagridAttributeName } from "../consts/ac-datagrid-attribute-name.const";
import { AC_DATAGRID_CLASS_NAME } from "../consts/ac-datagrid-css-class-name.const";

export class AcDatagridFunctionalCellRenderer implements IAcDatagridCellRenderer {
  public element: HTMLElement = document.createElement('div');
  private args!: IAcDatagridCellElementArgs;

  getElement(): HTMLElement {
    return this.element;
  }

  init(args: IAcDatagridCellElementArgs): void {
    this.args = args;
    this.element.classList.add(AC_DATAGRID_CLASS_NAME.acDatagridCellRenderer);
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
    this.element.style.width = "max-content";

    // Apply attributes if specified
    const attrs = args.column?.columnDefinition.cellRendererElementAttrs;
    if (attrs) {
      for (const [key, value] of Object.entries(attrs)) {
        this.element.setAttribute(key, String(value));
      }
    }

    this.render();
  }

  refresh(args: IAcDatagridCellElementArgs): void {
    this.args = args;
    this.render();
  }

  render(): void {
    const fn = this.args.column?.columnDefinition.cellRendererFunction;
    if (typeof fn === 'function') {
      const result = fn(this.args);
      acClearElement({ element: this.element });
      if (result instanceof HTMLElement) {
        this.element.append(result);
      } else if (result !== undefined && result !== null) {
        this.element.innerHTML = String(result);
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
