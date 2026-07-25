/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDataDictionary, AcDDTable, AcDDTableColumn, AcDDView, AcDDViewColumn, AcEnumDDColumnType } from '@autocode-ts/ac-data-dictionary';
import { AcEnumDatagridColumnDataType, IAcDatagridColumnDefinition } from '@autocode-ts/ac-browser';
import { objectCopyTo } from '@autocode-ts/ac-extensions';
import { IAcDDColumnDefinition } from '../interfaces/ac-dd-column-definition.interface'

export class AcDDDatagridColumnManager {
  static columnResolver?: Function;
  private static typeColumnDefinition: Record<string, Partial<IAcDDColumnDefinition>> = {
    [AcEnumDDColumnType.Blob]: { visible: false, allowSort: false },
    [AcEnumDDColumnType.Date]: { format: 'DISPLAY' },
    [AcEnumDDColumnType.Datetime]: { format: 'DISPLAY' },
    [AcEnumDDColumnType.Double]: { format: 'DISPLAY' },
    [AcEnumDDColumnType.Integer]: { format: 'INT' },
    [AcEnumDDColumnType.Json]: { visible: false, allowSort: false },
    [AcEnumDDColumnType.Password]: { visible: false, allowSort: false },
  };

  static getTableColumns({ tableName, excludeColumns, includeColumns, hiddenColumns, visibleColumns, columnDefinitions,defaultValues = {},dataDictionaryName = 'default',flexColumns,defaultColumnOrder }: { tableName: string,flexColumns?: string[], excludeColumns?: string[], includeColumns?: string[], hiddenColumns?: string[], visibleColumns?: string[],defaultValues?:Partial<IAcDDColumnDefinition>, columnDefinitions?: IAcDatagridColumnDefinition[],dataDictionaryName?:string,defaultColumnOrder?:string[] }):IAcDatagridColumnDefinition[] {
    if (columnDefinitions == undefined) {
      columnDefinitions = [];
    }
    const result: IAcDatagridColumnDefinition[] = [];
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
        if (continueOperation && result.findIndex((col) => { return col.field == column.columnName }) >= 0) {
          continueOperation = false;
        }
        const existingIndex:number = columnDefinitions.findIndex((col) => { return col.field == column.columnName });
        if (continueOperation &&  existingIndex>= 0) {
          continueOperation = false;
          const colDef:any = columnDefinitions[existingIndex];
          for(const key of Object.keys(defaultValues)){
            if(colDef[key] == undefined){
              colDef[key] = (defaultValues as any)[key];
            }
          }
        }
        if (continueOperation) {
          const columnDefinition: IAcDatagridColumnDefinition | undefined = this.getTableColumn({ tableName: ddTable.tableName, columnName: column.columnName,defaultValues:defaultValues,dataDictionaryName });
          if (columnDefinition) {
            if (visibleColumns && visibleColumns.length > 0) {
              if (visibleColumns.includes(column.columnName)) {
                columnDefinition.visible = true;
              }
              else {
                columnDefinition.visible = false;
              }
            }
            if (hiddenColumns && hiddenColumns.length > 0) {
              if (hiddenColumns.includes(column.columnName)) {
                columnDefinition.visible = false;
              }
              else {
                columnDefinition.visible = true;
              }
            }
            if(flexColumns && flexColumns.includes(column.columnName)){
              columnDefinition.flexSize = 1;
            }
            result.push(columnDefinition);
          }
        }
      }
      if(defaultColumnOrder){
        let index:number = 0;
        for(const columnName of defaultColumnOrder){
          const col = result.find((col) => { return col.field == columnName });
          if(col){
            col.index = index;
          }
          index++;
        }
      }
      if(defaultColumnOrder == undefined && visibleColumns){
        let index:number = 0;
        for(const columnName of visibleColumns){
          const col = result.find((col) => { return col.field == columnName });
          if(col){
            col.index = index;
          }
          index++;
        }
      }
    }
    return [...result,...columnDefinitions];
  }

  static getTableColumn({ tableName, columnName,defaultValues = {}, skipResolver,dataDictionaryName = 'default' }: { tableName: string, columnName: string,defaultValues?:Partial<IAcDDColumnDefinition>, skipResolver?: boolean,dataDictionaryName?:string, }): IAcDatagridColumnDefinition | undefined {
    let result: IAcDatagridColumnDefinition | any = {...defaultValues, field: columnName };
    const ddTableColumn: AcDDTableColumn | null = AcDataDictionary.getTableColumn({ tableName, columnName,dataDictionaryName });
    if (ddTableColumn) {
      let resolvedDefinition: IAcDatagridColumnDefinition | undefined;
      if (this.columnResolver && skipResolver != true) {
        resolvedDefinition = this.columnResolver({tableName,columnName,defaultValues,ddTableColumn});
        if(resolvedDefinition){
          objectCopyTo(resolvedDefinition, result);
        }
      }
      if (resolvedDefinition == undefined) {
        result.title = ddTableColumn.getColumnTitle();
        result.dataType = AcEnumDatagridColumnDataType.String;
        switch(ddTableColumn.columnType){
          case AcEnumDDColumnType.Date:
            result.dataType = AcEnumDatagridColumnDataType.Date;
            break;
          case AcEnumDDColumnType.Datetime:
          case AcEnumDDColumnType.Timestamp:
          case AcEnumDDColumnType.Time:
            result.dataType = AcEnumDatagridColumnDataType.Datetime;
            break
          case AcEnumDDColumnType.Double:
          case AcEnumDDColumnType.Integer:
          case AcEnumDDColumnType.AutoIncrement:
          case AcEnumDDColumnType.AutoIndex:
            result.dataType = AcEnumDatagridColumnDataType.Number;
            break;
          case AcEnumDDColumnType.YesNo:
            result.dataType = AcEnumDatagridColumnDataType.Boolean;
            break;
          case AcEnumDDColumnType.Json:
            result.dataType = AcEnumDatagridColumnDataType.Object;
            break;
        }
        if (this.typeColumnDefinition[ddTableColumn.columnType]) {
          const typeDefinition: any = AcDDDatagridColumnManager.typeColumnDefinition[ddTableColumn.columnType];
          const keys: string[] = Object.keys(typeDefinition);
          let excludeColumn: boolean = false;
          for (const key of keys) {
            if (key == "excludeColumn") {
              excludeColumn = typeDefinition.exclude == true;
            }
            else if (result[key] == undefined) {
              result[key] = typeDefinition[key];
            }
          }
          if (excludeColumn) {
            result = undefined;
          }
        }
      }
    }
    return result;
  }

  static getViewColumns({ viewName, excludeColumns, includeColumns, hiddenColumns, visibleColumns, columnDefinitions,defaultValues = {},dataDictionaryName = 'default',flexColumns,defaultColumnOrder }: { viewName: string,flexColumns?: string[], excludeColumns?: string[], includeColumns?: string[], hiddenColumns?: string[], visibleColumns?: string[],defaultValues?:Partial<IAcDDColumnDefinition>, columnDefinitions?: IAcDatagridColumnDefinition[],dataDictionaryName?:string,defaultColumnOrder?:string[] }):IAcDatagridColumnDefinition[] {
    if (columnDefinitions == undefined) {
      columnDefinitions = [];
    }
    const result: IAcDatagridColumnDefinition[] = [];
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
        if (continueOperation && result.findIndex((col) => { return col.field == column.columnName }) >= 0) {
          continueOperation = false;
        }
        const existingIndex:number = columnDefinitions.findIndex((col) => { return col.field == column.columnName });
        if (continueOperation && existingIndex >= 0) {
          continueOperation = false;
          const colDef:any = columnDefinitions[existingIndex];
          for(const key of Object.keys(defaultValues)){
            if(colDef[key] == undefined){
              colDef[key] = (defaultValues as any)[key];
            }
          }
        }
        if (continueOperation) {
          const columnDefinition: IAcDatagridColumnDefinition | undefined = this.getViewColumn({ viewName: ddView.viewName, columnName: column.columnName,defaultValues:defaultValues,dataDictionaryName });
          if (columnDefinition) {
            if (visibleColumns && visibleColumns.length > 0) {
              if (visibleColumns.includes(column.columnName)) {
                columnDefinition.visible = true;
              }
              else {
                columnDefinition.visible = false;
              }
            }
            if (hiddenColumns && hiddenColumns.length > 0) {
              if (hiddenColumns.includes(column.columnName)) {
                columnDefinition.visible = false;
              }
              else {
                columnDefinition.visible = true;
              }
            }
            if(flexColumns && flexColumns.includes(column.columnName)){
              columnDefinition.flexSize = 1;
            }
            result.push(columnDefinition);
          }
        }
      }
      if(defaultColumnOrder){
        let index:number = 0;
        for(const columnName of defaultColumnOrder){
          const col = result.find((col) => { return col.field == columnName });
          if(col){
            col.index = index;
          }
          index++;
        }
      }
      if(defaultColumnOrder == undefined && visibleColumns){
        let index:number = 0;
        for(const columnName of visibleColumns){
          const col = result.find((col) => { return col.field == columnName });
          if(col){
            col.index = index;
          }
          index++;
        }
      }
    }
    return [...result,...columnDefinitions];
  }

  static getViewColumn({ viewName, columnName,defaultValues = {}, skipResolver,dataDictionaryName = 'default' }: { viewName: string, columnName: string,defaultValues?:Partial<IAcDDColumnDefinition>, skipResolver?: boolean,dataDictionaryName?:string }): IAcDatagridColumnDefinition | undefined {
    let result: IAcDatagridColumnDefinition | any = { ...defaultValues,field: columnName };
    const ddViewColumn: AcDDViewColumn | null = AcDataDictionary.getViewColumn({ viewName, columnName,dataDictionaryName });
    if (ddViewColumn) {
      let resolvedDefinition: IAcDatagridColumnDefinition | undefined;
      if (this.columnResolver && skipResolver != true) {
        resolvedDefinition = this.columnResolver({viewName,columnName,defaultValues,ddViewColumn});
        if(resolvedDefinition){
          objectCopyTo(resolvedDefinition, result);
        }
      }
      if (resolvedDefinition == undefined) {
        result.title = ddViewColumn.getColumnTitle();
        result.dataType = AcEnumDatagridColumnDataType.String;
        switch(ddViewColumn.columnType){
          case AcEnumDDColumnType.Date:
            result.dataType = AcEnumDatagridColumnDataType.Date;
            break;
          case AcEnumDDColumnType.Datetime:
          case AcEnumDDColumnType.Timestamp:
          case AcEnumDDColumnType.Time:
            result.dataType = AcEnumDatagridColumnDataType.Datetime;
            break
          case AcEnumDDColumnType.Double:
          case AcEnumDDColumnType.Integer:
          case AcEnumDDColumnType.AutoIncrement:
          case AcEnumDDColumnType.AutoIndex:
            result.dataType = AcEnumDatagridColumnDataType.Number;
            break;
          case AcEnumDDColumnType.YesNo:
            result.dataType = AcEnumDatagridColumnDataType.Boolean;
            break;
          case AcEnumDDColumnType.Json:
            result.dataType = AcEnumDatagridColumnDataType.Object;
            break;
        }
        if (this.typeColumnDefinition[ddViewColumn.columnType]) {
          const typeDefinition: any = AcDDDatagridColumnManager.typeColumnDefinition[ddViewColumn.columnType];
          const keys: string[] = Object.keys(typeDefinition);
          let excludeColumn: boolean = false;
          for (const key of keys) {
            if (key == "excludeColumn") {
              excludeColumn = typeDefinition.exclude == true;
            }
            else if (result[key] == undefined) {
              result[key] = typeDefinition[key];
            }
          }
          if (excludeColumn) {
            result = undefined;
          }
        }
      }
    }
    return result;
  }

  static registerColumnTypeDefinition({ columnType, columnDefinition }: { columnType: AcEnumDDColumnType, columnDefinition: Partial<IAcDatagridColumnDefinition> }) {
    AcDDDatagridColumnManager.typeColumnDefinition[columnType] = columnDefinition;
  }
}
