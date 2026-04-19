/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcDatagrid, AcDatagridApi, AcElementBase, AcEnumDataSourceType,acRegisterCustomElement, IAcDatagridColumnDefinition } from "@autocode-ts/ac-browser";
import { AcDDTableColumn } from "@autocode-ts/ac-data-dictionary";
import { AcEnumSqlEntity, IAcOnDemandRequestArgs } from "@autocode-ts/autocode";
import { AcDDDatagridColumnManager } from "../core/ac-dd-datagrid-column-manager";

export class AcDDDatagridElement extends AcElementBase {
  get data(): any[] {
    return this.datagridApi.data;
  }
  set data(value: any[]) {
    this.datagridApi.data = value;
  }

  get dataDictionary(): string {
    let result:string = 'default';
    if(this.hasAttribute('data-dictionary')){
      result = this.getAttribute('data-dictionary')!;
    }
    return result;
  }
  set dataDictionary(value: string) {
    this.setAttribute('data-dictionary',value);
  }

  private _columnDefinitions:IAcDatagridColumnDefinition[] = [];
  get columnDefinitions(): any {
    return this._columnDefinitions;
  }
  set columnDefinitions(value: any) {
    this._columnDefinitions = value;
    this.setDatagridColumns();
  }

  get sourceType(): string {
    let result:string = AcEnumSqlEntity.Table.toLowerCase();
    if(this.hasAttribute('source-type')){
      result = this.getAttribute('source-type')!;
    }
    return result;
  }
  set sourceType(value: string) {
    this.setAttribute('source-type',value);
    this.setDatagridColumns();
  }

  get sourceValue(): string|null {
    return this.getAttribute('source-value')!;
  }
  set sourceValue(value: string) {
    this.setAttribute('source-value',value);
    this.setDatagridColumns();
  }

  private _excludeColumns:string[] = [];
  get excludeColumns(): any {
    return this._excludeColumns;
  }
  set excludeColumns(value: string[]) {
    this._excludeColumns = value;
    this.setDatagridColumns();
  }

  private _includeColumns:string[] = [];
  get includeColumns(): any {
    return this._includeColumns;
  }
  set includeColumns(value: string[]) {
    this._includeColumns = value;
    this.setDatagridColumns();
  }

  get onDemandFunction():any{
    return this.datagridApi.dataManager.onDemandFunction;
  };
  set onDemandFunction(value:(args: IAcOnDemandRequestArgs) => void){
    this.datagridApi.dataManager.onDemandFunction = value;
    this.datagridApi.dataManager.getData();
  }
  datagrid:AcDatagrid = new AcDatagrid();
  datagridApi!:AcDatagridApi;

  columns?: AcDDTableColumn;

  override init(): void {
    this.style.display = 'contents';
    this.datagridApi = this.datagrid.datagridApi;
    super.init();
    this.append(this.datagrid);
    this.setDatagridColumns();
  }

  private setDatagridColumns() {
    if(this.sourceValue){
      if(this.sourceType.toUpperCase() == AcEnumSqlEntity.Table){
        const columns = AcDDDatagridColumnManager.getTableColumns({
          tableName:this.sourceValue,
          columnDefinitions:this.columnDefinitions,
          excludeColumns:this.excludeColumns,
          includeColumns:this.includeColumns
        });
        this.datagridApi.columnDefinitions = columns;
      }
    }

    // if (this.dataSourceEntity && this._dataSourceValue) {
      // const column = AcDataDictionary.getTableColumn({ tableName: this.tableName, columnName: this.columnName });
      // if (column) {
      //   this.ddTableColumn = column;
      // }
      // const inputDefinition = AcDDInputManager.getColumnInputDefinition({ tableName: this.tableName, columnName: this.columnName });
      // this.inputElement = new inputDefinition.inputElement();
      // if (inputDefinition.defaultProperties) {
      //   for (const key in inputDefinition.defaultProperties) {
      //     this.inputElement[key] = inputDefinition.defaultProperties[key];
      //     console.log(key);
      //   }
      // }
    // }
  }
}

acRegisterCustomElement({tag:'ac-dd-datagrid',type:AcDDDatagridElement});
