/* eslint-disable @typescript-eslint/no-inferrable-types */
import { IAcDataRow } from "@autocode-ts/autocode";
import { AcDatagridRowElement } from "../elements/ac-datagrid-row.element";
import { IAcDatagridCell } from "./ac-datagrid-cell.interface";

export interface IAcDatagridRow extends IAcDataRow {
  isActive?: boolean;
  element?: AcDatagridRowElement;
  datagridCells?: IAcDatagridCell[];
  level?: number;
  hasChildren?: boolean;
  isExpanded?: boolean;
  parentId?: string;
  isGroupHeader?: boolean;
  groupField?: string;
  groupValue?: any;
  groupCount?: number;
  groupAggregates?: Record<string, number>;
  pinned?: 'top' | 'bottom';
  isMasterDetail?: boolean;
  isDetailExpanded?: boolean;
  isRowEditing?: boolean;
  isDirty?: boolean;
  originalDataBackup?: any;
}
