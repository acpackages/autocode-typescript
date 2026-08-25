/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcBindJsonProperty, AcEnumSqlDatabaseType, AcJsonUtils } from "@autocode-ts/autocode";
import { AcDataDictionary } from "./ac-data-dictionary.model";

export class AcDDStoredProcedure {
  static readonly KeyStoredProcedureName = "storedProcedureName";
  static readonly KeyStoredProcedureCode = "storedProcedureCode";

  @AcBindJsonProperty({ key: AcDDStoredProcedure.KeyStoredProcedureName })
  storedProcedureName: string = "";

  @AcBindJsonProperty({ key: AcDDStoredProcedure.KeyStoredProcedureCode })
  storedProcedureCode: string = "";

  static instanceFromJson({jsonData}: { jsonData: { [key: string]: any } }): AcDDStoredProcedure {
    const instance = new AcDDStoredProcedure();
    instance.fromJson({ jsonData: jsonData });
    return instance;
  }

  static getInstance({storedProcedureName,dataDictionaryName="default"}: { storedProcedureName: string; dataDictionaryName?: string }): AcDDStoredProcedure {
    const result = new AcDDStoredProcedure();
    const acDataDictionary = AcDataDictionary.getInstance({ dataDictionaryName });

    if (acDataDictionary.storedProcedures[storedProcedureName] != undefined) {
      result.fromJson({ jsonData: acDataDictionary.storedProcedures[storedProcedureName] });
    }
    return result;
  }

  static getDropStoredProcedureStatement({storedProcedureName,databaseType = AcEnumSqlDatabaseType.Unknown}: { storedProcedureName: string; databaseType?: string }): string {
    return `DROP PROCEDURE IF EXISTS ${storedProcedureName};`;
  }

  fromJson({jsonData}: { jsonData: { [key: string]: any } }): this {
    AcJsonUtils.setInstancePropertiesFromJsonData({ instance: this, jsonData: jsonData });
    return this;
  }

  getCreateStoredProcedureStatement({databaseType=AcEnumSqlDatabaseType.Unknown}: { databaseType?: string } = {}): string {
    return this.storedProcedureCode;
  }

  toJson(): { [key: string]: any } {
    return AcJsonUtils.getJsonDataFromInstance({ instance: this });
  }

  toString(): string {
    return AcJsonUtils.prettyEncode({ object: this.toJson() });
  }
}

