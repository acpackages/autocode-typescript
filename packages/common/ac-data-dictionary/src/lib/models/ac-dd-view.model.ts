/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcBindJsonProperty, AcEnumSqlDatabaseType, AcJsonUtils } from "@autocode-ts/autocode";
import { AcDDViewColumn } from "./ac-dd-view-column.model";
import { AcDataDictionary } from "./ac-data-dictionary.model";

export class AcDDView {
  static readonly KeyViewName = "viewName";
  static readonly KeyViewColumns = "viewColumns";
  static readonly KeyViewQuery = "viewQuery";

  @AcBindJsonProperty({ key: AcDDView.KeyViewName })
  viewName: string = "";

  @AcBindJsonProperty({ key: AcDDView.KeyViewQuery })
  viewQuery: string = "";

  @AcBindJsonProperty({ key: AcDDView.KeyViewColumns })
  viewColumns: AcDDViewColumn[] = [];

  static instanceFromJson({ jsonData }: { jsonData: any }): AcDDView {
    const instance = new AcDDView();
    instance.fromJson({ jsonData: jsonData });
    return instance;
  }

  static getInstance({ viewName, dataDictionaryName = "default" }: { viewName: string, dataDictionaryName?: string }): AcDDView {
    const result = new AcDDView();
    const acDataDictionary = AcDataDictionary.getInstance({ dataDictionaryName });

    if (acDataDictionary.views[viewName] != undefined) {
      result.fromJson({ jsonData: acDataDictionary.views[viewName] });
    }

    return result;
  }

  static getDropViewStatement({ viewName, databaseType = AcEnumSqlDatabaseType.Unknown }: { viewName: string; databaseType?: string }): string {
    return `DROP View IF EXISTS ${viewName};`;
  }

  fromJson({ jsonData }: { jsonData: any }): this {
    const json = { ...jsonData };

    if (
      AcDDView.KeyViewColumns in json &&
      typeof json[AcDDView.KeyViewColumns] === 'object' &&
      !Array.isArray(json[AcDDView.KeyViewColumns])
    ) {
      this.viewColumns = [];
      for (const [columnName, columnData] of Object.entries(json[AcDDView.KeyViewColumns])) {
        const column = AcDDViewColumn.instanceFromJson({ jsonData: columnData as any });
        this.viewColumns.push(column);
      }
      delete json[AcDDView.KeyViewColumns];
    }

    AcJsonUtils.setInstancePropertiesFromJsonData({ instance: this, jsonData: json });
    return this;
  }

  getColumn({ columnName }: { columnName: string }): AcDDViewColumn | undefined {
    return this.viewColumns.find((column) => column.columnName == columnName);
  }

  getColumnNames(): string[] {
    return this.viewColumns.map((column) => column.columnName);
  }

  getSearchQueryColumnNames(): string[] {
    return this.getSearchQueryColumns().map((column) => column.columnName);
  }

  getSearchQueryColumns(): AcDDViewColumn[] {
    return this.viewColumns.filter((column) => column.isUseForRowLikeFilter());
  }

  getCreateViewStatement({ databaseType = AcEnumSqlDatabaseType.Unknown }: { databaseType?: string } = {}): string {
    return `CREATE View ${this.viewName} AS ${this.viewQuery};`;
  }

  toJson(): Record<string, any> {
    return AcJsonUtils.getJsonDataFromInstance({ instance: this });
  }

  toString(): string {
    return AcJsonUtils.prettyEncode({ object: this.toJson() });
  }
}

