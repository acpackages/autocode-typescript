/* eslint-disable @typescript-eslint/no-inferrable-types */
import { acAddClassToElement, acClearElement } from "../../../utils/ac-element-functions";
import { IAcDatagridCellRenderer, IAcDatagridCellElementArgs, IAcDatagridColumn, AC_DATAGRID_HOOK, IAcDatagridCell } from "../_ac-datagrid.export";
import { AcDatagridAttributeName } from "../consts/ac-datagrid-attribute-name.const";
import { AC_DATAGRID_CLASS_NAME } from "../consts/ac-datagrid-css-class-name.const";
import { AcDatagridApi } from "../core/ac-datagrid-api";
import { acResolveCellValue } from "../helpers/ac-datagrid-value-helper";

export class AcDatagridCellRendererElement implements IAcDatagridCellRenderer {
  private datagridApi!: AcDatagridApi;
  private datagridCell!: IAcDatagridCell;
  private datagridColumn!: IAcDatagridColumn;
  public element: HTMLElement = document.createElement('div');

  destroy?(): void {
    acClearElement({ element: this.element });
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

  initElement() {
    this.element.setAttribute(AcDatagridAttributeName.acDatagridCellId, this.datagridCell.cellId);
    this.element.setAttribute(AcDatagridAttributeName.acDatagridColumnId, this.datagridCell.datagridColumn.columnId);
    this.element.setAttribute(AcDatagridAttributeName.acDatagridRowId, this.datagridCell.datagridRow.rowId);
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridCellRenderer, element: this.element });
    this.element.style.height = "100%";
    this.element.style.width = "max-content";
    this.render();
  }

  refresh(args: IAcDatagridCellElementArgs): void {
    this.render();
    if (this.datagridApi) {
      this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.CellRendererRefresh, args: this });
    }
  }

  render() {
    const { formattedValue } = acResolveCellValue({
      row: this.datagridCell.datagridRow,
      column: this.datagridColumn,
      datagridApi: this.datagridApi
    });
    acClearElement({ element: this.element });
    if (formattedValue !== '') {
      this.element.innerHTML = formattedValue;
    }
  }
}
