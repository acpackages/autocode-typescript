/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcBindJsonProperty, AcEnumSqlDatabaseType, AcJsonUtils } from "@autocode-ts/autocode";
import { AcDataDictionary } from "./ac-data-dictionary.model";

export class AcDDTrigger {
  static readonly KeyRowOperation = "rowOperation";
  static readonly KeyTableName = "tableName";
  static readonly KeyTriggerCode = "triggerCode";
  static readonly KeyTriggerExecution = "triggerExecution";
  static readonly KeyTriggerName = "triggerName";

  @AcBindJsonProperty({ key: AcDDTrigger.KeyRowOperation })
  rowOperation: string = "";

  @AcBindJsonProperty({ key: AcDDTrigger.KeyTriggerExecution })
  triggerExecution: string = "";

  @AcBindJsonProperty({ key: AcDDTrigger.KeyTableName })
  tableName: string = "";

  @AcBindJsonProperty({ key: AcDDTrigger.KeyTriggerName })
  triggerName: string = "";

  @AcBindJsonProperty({ key: AcDDTrigger.KeyTriggerCode })
  triggerCode: string = "";

  static instanceFromJson({ jsonData }: { jsonData: any }): AcDDTrigger {
    const instance = new AcDDTrigger();
    instance.fromJson({ jsonData: jsonData });
    return instance;
  }

  static getInstance({triggerName,dataDictionaryName = "default"}:{triggerName: string,  dataDictionaryName?: string }): AcDDTrigger {
    const result = new AcDDTrigger();
    const acDataDictionary = AcDataDictionary.getInstance({ dataDictionaryName });

    if (acDataDictionary.triggers[triggerName] != undefined) {
      result.fromJson({ jsonData: acDataDictionary.triggers[triggerName] });
    }

    return result;
  }

  static getDropTriggerStatement({triggerName,databaseType=AcEnumSqlDatabaseType.Unknown}: { triggerName: string; databaseType?: string }): string {
    // default for databaseType param if not provided
    return `DROP Trigger IF EXISTS ${triggerName};`;
  }

  getCreateTriggerStatement({databaseType=AcEnumSqlDatabaseType.Unknown}: { databaseType?: string } = {}): string {
    let result = '';
    if ([AcEnumSqlDatabaseType.MySql, AcEnumSqlDatabaseType.Sqlite].includes(databaseType as any)) {
      result = `CREATE Trigger ${this.triggerName} ${this.triggerExecution} ${this.rowOperation} ON ${this.tableName} FOR EACH ROW BEGIN ${this.triggerCode} END;`;
    }
    return result;
  }

  fromJson({ jsonData }: { jsonData: any }): AcDDTrigger {
    AcJsonUtils.setInstancePropertiesFromJsonData({ instance: this, jsonData: jsonData });
    return this;
  }

  toJson(): Record<string, any> {
    return AcJsonUtils.getJsonDataFromInstance({ instance: this });
  }

  toString(): string {
    return AcJsonUtils.prettyEncode({ object: this.toJson() });
  }
}

