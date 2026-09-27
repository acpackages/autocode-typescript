import { dateFormat, parseDateTimeString } from "@autocode-ts/ac-extensions";
import { AcDatagridApi } from "../core/ac-datagrid-api";
import { IAcDatagridCell } from "../interfaces/ac-datagrid-cell.interface";
import { IAcDatagridColumn } from "../interfaces/ac-datagrid-column.interface";
import { IAcDatagridRow } from "../interfaces/ac-datagrid-row.interface";
import { AcEnumDatagridColumnDataType } from "../enums/ac-enum-datagrid-column-data-type.enum";

export function acGetNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  if (!path.includes('.')) return obj[path];
  const parts = path.split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr == null) return undefined;
    curr = curr[part];
  }
  return curr;
}

export function acResolveCellValue({
  row,
  column,
  datagridApi
}: {
  row: IAcDatagridRow;
  column: IAcDatagridColumn;
  datagridApi?: AcDatagridApi;
}): { rawValue: any; formattedValue: string } {
  const colDef = column.columnDefinition;
  let rawValue: any;

  // 1. Resolve rawValue via valueGetter or fallback to data[columnKey]
  if (typeof colDef.valueGetter === 'function') {
    rawValue = colDef.valueGetter({
      data: row.data,
      row,
      column,
      datagridApi: datagridApi!
    });
  } else if (typeof colDef.valueGetter === 'string' && colDef.valueGetter.length > 0) {
    rawValue = acGetNestedValue(row.data, colDef.valueGetter);
  } else {
    rawValue = row.data != null ? row.data[column.columnKey] : undefined;
  }

  // 2. Format value via valueFormatter or default type formatters
  let formattedValue: string;
  if (typeof colDef.valueFormatter === 'function') {
    formattedValue = String(colDef.valueFormatter({
      value: rawValue,
      data: row.data,
      row,
      column,
      datagridApi: datagridApi!
    }));
  } else if (rawValue === null || rawValue === undefined) {
    formattedValue = '';
  } else if (column.dataType === AcEnumDatagridColumnDataType.Date || colDef.dataType === 'DATE') {
    const parseValue = parseDateTimeString(rawValue);
    formattedValue = parseValue ? dateFormat(parseValue, 'dd-MM-yyyy') : String(rawValue);
  } else if (column.dataType === AcEnumDatagridColumnDataType.Datetime || colDef.dataType === 'DATETIME') {
    const parseValue = parseDateTimeString(rawValue);
    formattedValue = parseValue ? dateFormat(parseValue, 'dd-MM-yyyy HH:mm a') : String(rawValue);
  } else {
    formattedValue = String(rawValue);
  }

  return { rawValue, formattedValue };
}
