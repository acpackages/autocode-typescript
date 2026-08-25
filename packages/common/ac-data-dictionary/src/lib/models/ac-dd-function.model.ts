/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcBindJsonProperty, AcEnumSqlDatabaseType, AcJsonUtils } from "@autocode-ts/autocode";
import { AcDataDictionary } from "./ac-data-dictionary.model";

export class AcDDFunction {
  static readonly KeyFunctionName = "functionName";
  static readonly KeyFunctionCode = "functionCode";

  @AcBindJsonProperty({ key: AcDDFunction.KeyFunctionName })
  functionName: string = "";

  @AcBindJsonProperty({ key: AcDDFunction.KeyFunctionCode })
  functionCode: string = "";

  static instanceFromJson({ jsonData }: { jsonData: any }): AcDDFunction {
    const instance = new AcDDFunction();
    instance.fromJson({ jsonData });
    return instance;
  }

  static getInstance({
    functionName,
    dataDictionaryName = "default",
  }: {
    functionName: string;
    dataDictionaryName?: string;
  }): AcDDFunction {
    const result = new AcDDFunction();
    const acDataDictionary = AcDataDictionary.getInstance({ dataDictionaryName });
    if (acDataDictionary.functions[functionName] != undefined) {
      result.fromJson({ jsonData: acDataDictionary.functions[functionName] });
    }
    return result;
  }

  static getDropFunctionStatement({
    functionName,
    databaseType = AcEnumSqlDatabaseType.Unknown,
  }: {
    functionName: string;
    databaseType?: string;
  }): string {
    return `DROP Function IF EXISTS ${functionName};`;
  }

  fromJson({ jsonData }: { jsonData: any }): this {
    AcJsonUtils.setInstancePropertiesFromJsonData({ instance: this, jsonData });
    return this;
  }

  toJson(): Record<string, any> {
    return AcJsonUtils.getJsonDataFromInstance({ instance: this });
  }

  getCreateFunctionStatement({
    databaseType = AcEnumSqlDatabaseType.Unknown,
  }: {
    databaseType?: string;
  } = {}): string {
    return this.functionCode;
  }

  toString(): string {
    return AcJsonUtils.prettyEncode({ object: this.toJson() });
  }
}

