import { AcEnumDatagridColumnAggregateFunction, AcEnumDatagridColumnDataType, IAcDatagridColumnDefinition } from "@autocode-ts/ac-browser";
import type { ColDef } from 'ag-grid-community';

export function acGetAgDataTypeFromAcDataType(dataType: any) {
  let result: any = 'text';
  if (dataType == AcEnumDatagridColumnDataType.Boolean) {
    result = 'boolean';
  }
  else if (dataType == AcEnumDatagridColumnDataType.Date || dataType == AcEnumDatagridColumnDataType.Datetime) {
    result = 'dateString';
  }
  else if (dataType == AcEnumDatagridColumnDataType.Custom || dataType == AcEnumDatagridColumnDataType.Object) {
    result = 'object';
  }
  else if (dataType == AcEnumDatagridColumnDataType.Number) {
    result = 'number';
  }
  return result;
}

export function acGetColDefFromAcDataGridColumn({ datagridColDef }: { datagridColDef: IAcDatagridColumnDefinition }): ColDef {
  let editable: boolean = datagridColDef.allowEdit;
  if (datagridColDef.allowEdit != undefined) {
    editable = datagridColDef.allowEdit;
  }
  const colDef: ColDef|any = {
    field: datagridColDef.field,
    headerName: datagridColDef.title,
    autoHeight:datagridColDef.autoHeight,
    width: datagridColDef.width,
    minWidth: datagridColDef.minWidth,
    maxWidth: datagridColDef.maxWidth,
    type: acGetAgDataTypeFromAcDataType(datagridColDef.dataType),
    editable: editable,
    filter: datagridColDef.allowFilter == false ? false : true,
    sortable: datagridColDef.allowSort == false ? false : true,
    cellClass: (datagridColDef.cellClass ?? ''),
    headerClass: datagridColDef.headerCellClass,
    suppressHeaderMenuButton: true,
    hide: datagridColDef.visible == false,
    flex: datagridColDef.flexSize,
    columnDefinition:datagridColDef,
    suppressNavigable : datagridColDef.suppressFocus == true
  };
  if(datagridColDef.pinnedOn){
    colDef.pinned = datagridColDef.pinnedOn.toLowerCase();
  }
  if(datagridColDef.isGroup){
    colDef.rowGroup = true;
    colDef.enableRowGroup = true;
  }
  if(datagridColDef.groupAggregateFunction){
    if(datagridColDef.groupAggregateFunction == AcEnumDatagridColumnAggregateFunction.Average){
      colDef.aggFunc = "avg";
    }
    else if(datagridColDef.groupAggregateFunction == AcEnumDatagridColumnAggregateFunction.Count){
      colDef.aggFunc = "count";
    }
    else if(datagridColDef.groupAggregateFunction == AcEnumDatagridColumnAggregateFunction.First){
      colDef.aggFunc = "first";
    }
    else if(datagridColDef.groupAggregateFunction == AcEnumDatagridColumnAggregateFunction.Last){
      colDef.aggFunc = "last";
    }
    else if(datagridColDef.groupAggregateFunction == AcEnumDatagridColumnAggregateFunction.Min){
      colDef.aggFunc = "min";
    }
    else if(datagridColDef.groupAggregateFunction == AcEnumDatagridColumnAggregateFunction.Max){
      colDef.aggFunc = "max";
    }
    else if(datagridColDef.groupAggregateFunction == AcEnumDatagridColumnAggregateFunction.Sum){
      colDef.aggFunc = "sum";
    }
  }
  if(colDef.filter){
    colDef.filter = 'agTextColumnFilter';
    colDef.filterParams = {
      buttons:['apply','clear','reset'],
      trimInput: true,
      maxNumConditions:1
    }
  }
  return colDef;
}
