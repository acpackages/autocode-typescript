import { IAcDatagridColumnDefinition } from "../interfaces/ac-datagrid-column-definition.interface";

export const AC_DATAGRID_DEFAULT_COLUMN_DEFINITION:Partial<IAcDatagridColumnDefinition> = {
  allowEdit:false,
  editable:false,
  allowFilter:true,
  allowResize:true,
  allowSort:true,
  allowFocus:false,
  width:200,
  visible:true
}
