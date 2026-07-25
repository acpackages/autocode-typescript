/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDataDictionary, AcDDTable, AcDDTableColumn, AcDDView, AcDDViewColumn, AcEnumDDColumnType } from '@autocode-ts/ac-data-dictionary';
import { AcEnumDatagridColumnDataType,IAcRepeaterField } from '@autocode-ts/ac-browser';

export class AcDDRepeaterFieldManager {
  static fieldResolver?: Function;

  static getTableColumnFields({ tableName, excludeColumns, includeColumns, fields ,dataDictionaryName = 'default' }: { tableName: string, excludeColumns?: string[], includeColumns?: string[], fields?: IAcRepeaterField[],dataDictionaryName?:string }):IAcRepeaterField[] {
    if (fields == undefined) {
      fields = [];
    }
    const result: IAcRepeaterField[] = [];
    const ddTable: AcDDTable | null = AcDataDictionary.getTable({ tableName,dataDictionaryName });
    if (ddTable) {
      for (const column of ddTable.tableColumns) {
        let continueOperation: boolean = true;
        if (excludeColumns && excludeColumns.length > 0 && excludeColumns.includes(column.columnName)) {
          continueOperation = false;
        }
        if (continueOperation && includeColumns && includeColumns.length > 0 && !includeColumns.includes(column.columnName)) {
          continueOperation = false;
        }
        if (continueOperation && result.findIndex((col) => { return col.key == column.columnName }) >= 0) {
          continueOperation = false;
        }
        const existingIndex:number = fields.findIndex((col) => { return col.key == column.columnName });
        if (continueOperation && existingIndex >= 0) {
          continueOperation = false;
        }
        if (continueOperation) {
          const field: IAcRepeaterField | undefined = this.getTableColumnField({ tableName: ddTable.tableName, columnName: column.columnName,dataDictionaryName });
          if (field) {
            result.push(field);
          }
        }
      }
    }
    return [...result,...fields];
  }

  static getTableColumnField({ tableName, columnName ,dataDictionaryName = 'default' }: { tableName: string, columnName: string,dataDictionaryName?:string }): IAcRepeaterField | undefined {
    const result: IAcRepeaterField = { key: columnName,label:columnName };
    const ddTableColumn: AcDDTableColumn | null = AcDataDictionary.getTableColumn({ tableName, columnName,dataDictionaryName });
    if (ddTableColumn) {
      let resolvedDefinition: IAcRepeaterField | undefined;
      if (resolvedDefinition == undefined) {
        result.label = ddTableColumn.getColumnTitle();
        result.type = AcEnumDatagridColumnDataType.String;
        switch(ddTableColumn.columnType){
          case AcEnumDDColumnType.Date:
            result.type = AcEnumDatagridColumnDataType.Date;
            break;
          case AcEnumDDColumnType.Datetime:
          case AcEnumDDColumnType.Timestamp:
          case AcEnumDDColumnType.Time:
            result.type = AcEnumDatagridColumnDataType.Datetime;
            break
          case AcEnumDDColumnType.Double:
          case AcEnumDDColumnType.Integer:
          case AcEnumDDColumnType.AutoIncrement:
          case AcEnumDDColumnType.AutoIndex:
            result.type = AcEnumDatagridColumnDataType.Number;
            break;
          case AcEnumDDColumnType.YesNo:
            result.type = AcEnumDatagridColumnDataType.Boolean;
            break;
          case AcEnumDDColumnType.Json:
            result.type = AcEnumDatagridColumnDataType.Object;
            break;
        }
      }
    }
    return result;
  }

  static getViewColumnFields({ viewName, excludeColumns, includeColumns, fields,dataDictionaryName = 'default' }: { viewName: string, excludeColumns?: string[], includeColumns?: string[], fields?: IAcRepeaterField[],dataDictionaryName?:string }):IAcRepeaterField[] {
    if (fields == undefined) {
      fields = [];
    }
    const result: IAcRepeaterField[] = [];
    const ddView: AcDDView | null = AcDataDictionary.getView({ viewName,dataDictionaryName });
    if (ddView) {
      for (const column of ddView.viewColumns) {
        let continueOperation: boolean = true;
        if (excludeColumns && excludeColumns.length > 0 && excludeColumns.includes(column.columnName)) {
          continueOperation = false;
        }
        if (continueOperation && includeColumns && includeColumns.length > 0 && !includeColumns.includes(column.columnName)) {
          continueOperation = false;
        }
        if (continueOperation && result.findIndex((col) => { return col.key == column.columnName }) >= 0) {
          continueOperation = false;
        }
        const existingIndex:number = fields.findIndex((col) => { return col.key == column.columnName });
        if (continueOperation && existingIndex >= 0) {
          continueOperation = false;
        }
        if (continueOperation) {
          const field: IAcRepeaterField | undefined = this.getViewColumnField({ viewName: ddView.viewName, columnName: column.columnName,dataDictionaryName });
          if (field) {
            result.push(field);
          }
        }
      }
    }
    return [...result,...fields];
  }

  static getViewColumnField({ viewName, columnName,dataDictionaryName = 'default'  }: { viewName: string, columnName: string,dataDictionaryName?:string }): IAcRepeaterField | undefined {
    const result: IAcRepeaterField = { label:columnName,key: columnName };
    const ddViewColumn: AcDDViewColumn | null = AcDataDictionary.getViewColumn({ viewName, columnName,dataDictionaryName });
    if (ddViewColumn) {
      let resolvedDefinition: IAcRepeaterField | undefined;
      if (resolvedDefinition == undefined) {
        result.label = ddViewColumn.getColumnTitle();
        result.type = AcEnumDatagridColumnDataType.String;
        switch(ddViewColumn.columnType){
          case AcEnumDDColumnType.Date:
            result.type = AcEnumDatagridColumnDataType.Date;
            break;
          case AcEnumDDColumnType.Datetime:
          case AcEnumDDColumnType.Timestamp:
          case AcEnumDDColumnType.Time:
            result.type = AcEnumDatagridColumnDataType.Datetime;
            break
          case AcEnumDDColumnType.Double:
          case AcEnumDDColumnType.Integer:
          case AcEnumDDColumnType.AutoIncrement:
          case AcEnumDDColumnType.AutoIndex:
            result.type = AcEnumDatagridColumnDataType.Number;
            break;
          case AcEnumDDColumnType.YesNo:
            result.type = AcEnumDatagridColumnDataType.Boolean;
            break;
          case AcEnumDDColumnType.Json:
            result.type = AcEnumDatagridColumnDataType.Object;
            break;
        }
      }
    }
    return result;
  }
}
