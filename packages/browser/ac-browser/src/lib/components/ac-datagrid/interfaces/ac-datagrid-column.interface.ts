/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcEnumSortOrder, IAcFilterGroup } from "@autocode-ts/autocode";
import { IAcDatagridColumnDefinition } from "../interfaces/ac-datagrid-column-definition.interface";
import { AcEnumDatagridColumnDataType } from "../enums/ac-enum-datagrid-column-data-type.enum";
import { AcDatagridHeaderCellElement } from "../elements/ac-datagrid-header-cell.element";

export interface IAcDatagridColumn {
  isActive:boolean;
  columnId: string;
  columnDefinition: IAcDatagridColumnDefinition;
  dataType: AcEnumDatagridColumnDataType;
  extensionData: Record<string, any>;
  filterGroup?: IAcFilterGroup;
  headerCellElement?: AcDatagridHeaderCellElement;
  index: number;
  sortOrder?: AcEnumSortOrder;
  allowEdit:boolean;
  allowFilter:boolean;
  allowFocus:boolean;
  allowResize:boolean;
  allowSort:boolean;
  columnKey:string;
  isFirst:boolean;
  isLast:boolean;
  originalIndex:number;
  title:string;
  visible:boolean;
  width:number;
  pinnedOn?:'LEFT'|'RIGHT';
}
