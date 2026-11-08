/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcSortable } from "../../../../ac-draggable/_ac-draggable.export";
import { AcDraggableApi } from "../../../../ac-draggable/core/ac-draggable-api";
import { AcDatagridExtension } from "../../../core/ac-datagrid-extension";
import { AC_DATAGRID_EXTENSION_NAME } from "../../../consts/ac-datagrid-extension-name.const";
import { AC_DATAGRID_HOOK } from "../../../consts/ac-datagrid-hook.const";
import { IAcDatagridExtension } from "../../../interfaces/ac-datagrid-extension.interface";
import { IAcDatagridHeaderHookArgs } from "../../../interfaces/hook-args/ac-datagrid-header-hook-args.interface";
import { IAcDatagridRowHookArgs } from "../../../interfaces/hook-args/ac-datagrid-row-hook-args.interface";
import { AcDatagridInternalColumn } from "../../../models/ac-datagrid-internal-column.model";
import { AcDatagridTreeTableChildrenToggleCell } from "../elements/ac-datagrid-tree-table-children-toggle-cell.element";
import { AcDatagridTreeTableChildrenToggleHeaderCell } from "../elements/ac-datagrid-tree-table-children-toggle-header-cell.element";
import { AcEnumDatagridTreeTableHook } from "../enums/ac-enum-datagrid-tree-table-hook.enum";
import { IAcDatagridTreeTableHookArgs } from "../interfaces/ac-datagrid-tree-table-hook-args.interface";

export class AcDatagridTreeTableExtension extends AcDatagridExtension {
  get isTreeTable(): boolean {
    return this.treeDataChildKey != '' && this.treeDataParentKey != '';
  }

  private _treeDataChildKey: string = '';
  get treeDataChildKey(): string {
    return this._treeDataChildKey;
  }
  set treeDataChildKey(value: string) {
    this._treeDataChildKey = value;
    if (this.datagridApi) {
      const hookArgs: IAcDatagridTreeTableHookArgs = {
        datagridApi: this.datagridApi,
        datagridTreeTableExtension: this,
        value: value
      };
      this.datagridApi.hooks.execute({ hook: AcEnumDatagridTreeTableHook.TreeDataChildKeyChange, args: hookArgs });
    }
  }

  private _treeDataDisplayKey: string = '';
  get treeDataDisplayKey(): string {
    return this._treeDataDisplayKey;
  }
  set treeDataDisplayKey(value: string) {
    this._treeDataDisplayKey = value;
    if (this.datagridApi) {
      const hookArgs: IAcDatagridTreeTableHookArgs = {
        datagridApi: this.datagridApi,
        datagridTreeTableExtension: this,
        value: value
      };
      this.datagridApi.hooks.execute({ hook: AcEnumDatagridTreeTableHook.TreeDataDisplayKeyChange, args: hookArgs });
    }
  }

  private _treeDataParentKey: string = '';
  get treeDataParentKey(): string {
    return this._treeDataParentKey;
  }
  set treeDataParentKey(value: string) {
    this._treeDataParentKey = value;
    if (this.datagridApi) {
      const hookArgs: IAcDatagridTreeTableHookArgs = {
        datagridApi: this.datagridApi,
        datagridTreeTableExtension: this,
        value: value
      };
      this.datagridApi.hooks.execute({ hook: AcEnumDatagridTreeTableHook.TreeDataParentKeyChange, args: hookArgs });
    }
  }

  private _treeLevelExpanded: number = 0;
  get treeLevelExpanded(): number {
    return this._treeLevelExpanded;
  }
  set treeLevelExpanded(value: number) {
    this._treeLevelExpanded = value;
    if (this.datagridApi) {
      const hookArgs: IAcDatagridTreeTableHookArgs = {
        datagridApi: this.datagridApi,
        datagridTreeTableExtension: this,
        value: value
      };
      this.datagridApi.hooks.execute({ hook: AcEnumDatagridTreeTableHook.TreeLevelExpandedChange, args: hookArgs });
    }
  }

  datagridInternalColumn: AcDatagridInternalColumn = new AcDatagridInternalColumn({
    width: 35,
  });

  override init(): void {
    // const draggableSort = new AcDraggableSort({ element: this.datagridApi.datagrid.datagridBody.element });
    // const draggableSort = new AcSortable();
    // this.draggableApi = draggableSort.draggableApi;
  }

  override handleHook({ hook, args }: { hook: string; args: any; }): void {
    if (this.datagridApi) {
      if (hook == AC_DATAGRID_HOOK.BeforeRowCellsCreate) {
        this.handleBeforeRowCellsCreated(args);
      }
      else if (hook == AC_DATAGRID_HOOK.BeforeHeaderColumnCellsCreate) {
        this.handleBeforeHeaderColumnCellsCreated(args);
      }
    }
  }

  getNestedDataTree({ childrenKey = 'children' }: { childrenKey?: string } = {}) {
    const rootData: any[] = [];
    const parentDataMap: any = {};
    if (this.datagridApi) {
      for (const datagridRow of this.datagridApi.datagridRows) {
        const data = datagridRow.data;
        const parentId: any = data[this.treeDataChildKey];
        if (parentId) {
          if (parentDataMap[parentId] == undefined) {
            parentDataMap[parentId] = [];
          }
          parentDataMap[parentId].push(data)
        }
        else {
          rootData.push(data);
        }
      }
      const setChildData: Function = (data: any): void => {
        if (parentDataMap[data[this.treeDataParentKey]]) {
          data[childrenKey] = parentDataMap[data[this.treeDataParentKey]];
          for (const childData of data[childrenKey]) {
            setChildData(childData);
          }
        }
      };
      for (const childData of rootData) {
        setChildData(childData);
      }
    }
    return rootData;
  }

  handleBeforeHeaderColumnCellsCreated(args: IAcDatagridHeaderHookArgs) {
    const datagridApi = args.datagridApi;
    const datagridHeader = args.datagridHeader;
    const datagriRowNumberCell = new AcDatagridTreeTableChildrenToggleHeaderCell({ datagridApi: datagridApi, datagridInternalColumn: this.datagridInternalColumn });
    datagridHeader.append(datagriRowNumberCell.element);
  }

  handleBeforeRowCellsCreated(args: IAcDatagridRowHookArgs) {
    const datagridApi = args.datagridApi;
    const datagridRow = args.datagridRow;

    if (datagridRow.element) {
      const datagridCell = new AcDatagridTreeTableChildrenToggleCell({ datagridApi: datagridApi, datagridRow: datagridRow, datagridInternalColumn: this.datagridInternalColumn, extension: this });
      datagridRow.element.append(datagridCell.element);
    }
  }

}

export const AC_DATAGRID_TREE_TABLE_EXTENSION: IAcDatagridExtension = {
  extensionName: 'TREE_TABLE',
  extensionClass: AcDatagridTreeTableExtension
}
