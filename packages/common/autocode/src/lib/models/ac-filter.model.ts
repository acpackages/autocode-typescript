import { AcEnumConditionOperator } from "../enums/ac-enum-condition-operator.enum";
import { IAcFilter } from "../interfaces/ac-filter.interface";
import { AcJsonUtils } from "../utils/ac-json-utils";

export class AcFilter {
  static readonly KeyKey = "key";
  static readonly KeyOperator = "operator";
  static readonly KeyValue = "value";

  key?: string;
  operator: AcEnumConditionOperator = AcEnumConditionOperator.Unknown;
  value:any;

  static instanceFromJson({ jsonData }: { jsonData: any }): AcFilter {
    const instance = new AcFilter();
    instance.fromJson({ jsonData });
    return instance;
  }

  static instanceWithValues({
    key,
    operator,
    value,
  }: {
    key: string;
    operator: AcEnumConditionOperator;
    value?: any;
  }):AcFilter {
    const result= new AcFilter();
    result.key = key;
    result.operator = operator;
    result.value = value;
    return result;
  }

  clone():AcFilter{
    return new AcFilter().fromJson({jsonData:this.toJson()});
  }

  fromJson({ jsonData }: { jsonData: any }): this {
    AcJsonUtils.setInstancePropertiesFromJsonData({
      instance: this,
      jsonData,
    });
    return this;
  }

  toJson(): IAcFilter {
    return AcJsonUtils.getJsonDataFromInstance({ instance: this }) as any;
  }

  toString(): string {
    return AcJsonUtils.prettyEncode({object:this.toJson()});
  }
}
