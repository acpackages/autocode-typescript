/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcBindJsonProperty, AcJsonUtils, AcFilterGroup } from "@autocode-ts/autocode";
import { AcDDCondition } from "./ac-dd-condition.model";

export class AcDDConditionGroup {
  static readonly KeyDatabaseType = "databaseType";
  static readonly KeyConditions = "conditions";
  static readonly KeyOperator = "operator";

  @AcBindJsonProperty({ key: AcDDConditionGroup.KeyDatabaseType })
  databaseType: string = "";

  conditions: any[] = [];
  operator: string = "";

  static instanceFromJson({ jsonData }: { jsonData: any }): AcDDConditionGroup {
    const instance = new AcDDConditionGroup();
    instance.fromJson({ jsonData });
    return instance;
  }

  addCondition({
    key,
    operator,
    value,
  }: {
    key: string;
    operator: string;
    value: any;
  }): this {
    this.conditions.push(
      AcDDCondition.instanceFromJson({
        jsonData: {
          [AcDDCondition.KeyKey]: key,
          [AcDDCondition.KeyOperator]: operator,
          [AcDDCondition.KeyValue]: value,
        },
      })
    );
    return this;
  }

  static instanceFromFilterGroup({ filterGroup }: { filterGroup: AcFilterGroup }): AcDDConditionGroup {
    return new AcDDConditionGroup().fromFilterGroup({ filterGroup });
  }

  addConditionGroup({
    conditions,
    operator = "AND",
  }: {
    conditions: any[];
    operator?: string;
  }): this {
    this.conditions.push(
      AcDDConditionGroup.instanceFromJson({
        jsonData: {
          [AcDDConditionGroup.KeyConditions]: conditions,
          [AcDDConditionGroup.KeyOperator]: operator,
        },
      })
    );
    return this;
  }

  fromFilterGroup({ filterGroup }: { filterGroup: AcFilterGroup }): this {
    this.operator = filterGroup.operator;
    this.conditions = [];

    for (const filter of filterGroup.filters) {
      this.conditions.push(AcDDCondition.instanceFromFilter({ filter }));
    }

    for (const childGroup of filterGroup.filterGroups) {
      this.conditions.push(AcDDConditionGroup.instanceFromFilterGroup({ filterGroup: childGroup }));
    }

    return this;
  }

  fromJson({ jsonData }: { jsonData: any }): this {
    const json = { ...jsonData };

    if (json[AcDDConditionGroup.KeyConditions] != undefined) {
      for (const condition of json[AcDDConditionGroup.KeyConditions]) {
        if (condition && typeof condition === "object" && !Array.isArray(condition)) {
          if (condition[AcDDConditionGroup.KeyConditions] != undefined) {
            this.conditions.push(AcDDConditionGroup.instanceFromJson({ jsonData: condition }));
          } else if (condition[AcDDCondition.KeyKey] != undefined) {
            this.conditions.push(AcDDCondition.instanceFromJson({ jsonData: condition }));
          }
        } else {
          this.conditions.push(condition);
        }
      }
      delete json[AcDDConditionGroup.KeyConditions];
    }

    AcJsonUtils.setInstancePropertiesFromJsonData({ instance: this, jsonData: json });
    return this;
  }

  toJson(): Record<string, any> {
    return AcJsonUtils.getJsonDataFromInstance({ instance: this });
  }

  toString(): string {
    return AcJsonUtils.prettyEncode({object:this.toJson()});
  }
}
