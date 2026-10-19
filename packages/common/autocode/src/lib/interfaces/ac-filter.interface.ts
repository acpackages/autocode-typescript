import { AcEnumConditionOperator } from "../enums/ac-enum-condition-operator.enum";

export interface IAcFilter {
  key: string;
  operator: AcEnumConditionOperator;
  value?:any;
}
