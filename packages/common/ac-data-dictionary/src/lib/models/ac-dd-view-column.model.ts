/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcBindJsonProperty, AcJsonUtils } from "@autocode-ts/autocode";
import { AcDDTableColumnProperty } from "./ac-dd-table-column-property.model";
import { AcEnumDDColumnProperty } from "../enums/ac-enum-dd-column-property.enum";
import { AcDataDictionary } from "./ac-data-dictionary.model";
import { AcDDTableColumn } from "./ac-dd-table-column.model";
import { AcEnumDDColumnType } from "../enums/ac-enum-dd-column-type.enum";

export class AcDDViewColumn {
  static readonly KeyColumnName = "columnName";
  static readonly KeyColumnProperties = "columnProperties";
  static readonly KeyColumnType = "columnType";
  static readonly KeyColumnValue = "columnValue";
  static readonly KeyColumnSource = "columnSource";
  static readonly KeyColumnSourceName = "columnSourceName";
  static readonly KeyColumnSourceOriginalColumn = "columnSourceOriginalColumn";

  @AcBindJsonProperty({ key: AcDDViewColumn.KeyColumnName })
  columnName: string = "";

  @AcBindJsonProperty({ key: AcDDViewColumn.KeyColumnProperties })
  columnProperties: Record<string, AcDDTableColumnProperty> = {};

  @AcBindJsonProperty({ key: AcDDViewColumn.KeyColumnType })
  columnType: string|AcEnumDDColumnType = "text";

  @AcBindJsonProperty({ key: AcDDViewColumn.KeyColumnValue })
  columnValue: any;

  @AcBindJsonProperty({ key: AcDDViewColumn.KeyColumnSource })
  columnSource: string = "";

  @AcBindJsonProperty({ key: AcDDViewColumn.KeyColumnSourceName })
  columnSourceName: string = "";

  @AcBindJsonProperty({ key: AcDDViewColumn.KeyColumnSourceOriginalColumn })
  columnSourceOriginalColumn: string = "";

  static getInstance({ viewName, columnName, dataDictionaryName = "default" }: { viewName: string; columnName: string; dataDictionaryName?: string }): AcDDViewColumn {
    return AcDataDictionary.getViewColumn({ viewName, columnName, dataDictionaryName })!;
  }

  static instanceFromJson({ jsonData }: { jsonData: Record<string, any> }): AcDDViewColumn {
    const instance = new AcDDViewColumn();
    instance.fromJson({ jsonData: jsonData });
    return instance;
  }

  fromJson({ jsonData }: { jsonData: Record<string, any> }): AcDDViewColumn {
    const json = { ...jsonData };

    if (json[AcDDViewColumn.KeyColumnProperties] != undefined) {
      const props = json[AcDDViewColumn.KeyColumnProperties] as Record<string, any>;
      this.columnProperties = {};
      for (const key in props) {
        this.columnProperties[key] = AcDDTableColumnProperty.instanceFromJson({ jsonData: props[key] });
      }
      delete json[AcDDViewColumn.KeyColumnProperties];
    }

    AcJsonUtils.setInstancePropertiesFromJsonData({ instance: this, jsonData: json });
    return this;
  }

  getColumnTitle(): string {
    if (this.columnProperties[AcEnumDDColumnProperty.ColumnTitle]) {
      return this.columnProperties[AcEnumDDColumnProperty.ColumnTitle].propertyValue ?? this.columnName;
    } else if (this.columnSource === 'table') {
      if (this.columnSourceName && this.columnSourceOriginalColumn) {
        const ddTableColumn = AcDDTableColumn.getInstance({
          tableName: this.columnSourceName,
          columnName: this.columnSourceOriginalColumn,
        });
        if (ddTableColumn) {
          return ddTableColumn.getColumnTitle();
        }
      }
    } else if (this.columnSource === 'view') {
      if (this.columnSourceName && this.columnSourceOriginalColumn) {
        const ddViewColumn = AcDDViewColumn.getInstance({
          viewName: this.columnSourceName,
          columnName: this.columnSourceOriginalColumn,
        });
        if (ddViewColumn) {
          return ddViewColumn.getColumnTitle();
        }
      }
    }
    return this.columnName;
  }

  isUseForRowLikeFilter(): boolean {
    if (this.columnProperties[AcEnumDDColumnProperty.UseForRowLikeFilter]) {
      return this.columnProperties[AcEnumDDColumnProperty.UseForRowLikeFilter].propertyValue === true;
    }
    return false;
  }

  isSelectDistinct(): boolean {
    if (this.columnProperties[AcEnumDDColumnProperty.IsSelectDistinct]) {
      return this.columnProperties[AcEnumDDColumnProperty.IsSelectDistinct].propertyValue === true;
    }
    return false;
  }

  toJson(): Record<string, any> {
    return AcJsonUtils.getJsonDataFromInstance({ instance: this });
  }

  toString(): string {
    return AcJsonUtils.prettyEncode({ object: this.toJson() });
  }
}

