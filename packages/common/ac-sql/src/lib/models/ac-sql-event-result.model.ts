import { AcEnumDDRowOperation } from "@autocode-ts/ac-data-dictionary";
import { AcResult } from "@autocode-ts/autocode";

/**
 * Represents the result of a SQL event handler execution.
 */
export class AcSqlEventResult extends AcResult {
  condition?: string;
  operation: AcEnumDDRowOperation = AcEnumDDRowOperation.Unknown;
  row?: Record<string, any>;
  rows?: Array<Record<string, any>>;
  rowsWithConditions?: Array<Record<string, any>>;
  parameters?: Record<string, any>;
  result?: AcResult;
  table: string = "";

  constructor({
    operation,
    row,
    table,
    condition,
    parameters,
    result,
    rows,
    rowsWithConditions,
  }: {
    operation?: AcEnumDDRowOperation;
    row?: Record<string, any>;
    table?: string;
    condition?: string;
    parameters?: Record<string, any>;
    result?: AcResult;
    rows?: Array<Record<string, any>>;
    rowsWithConditions?: Array<Record<string, any>>;
  } = {}) {
    super();
    if (operation !== undefined) this.operation = operation;
    if (row !== undefined) this.row = row;
    if (table !== undefined) this.table = table;
    if (condition !== undefined) this.condition = condition;
    if (parameters !== undefined) this.parameters = parameters;
    if (result !== undefined) this.result = result;
    if (rows !== undefined) this.rows = rows;
    if (rowsWithConditions !== undefined) this.rowsWithConditions = rowsWithConditions;
  }

  static override instanceFromJson({ jsonData }: { jsonData: Record<string, any> }): AcSqlEventResult {
    const instance = new AcSqlEventResult();
    return instance.fromJson({ jsonData });
  }

  override fromJson({ jsonData }: { jsonData: Record<string, any> }): AcSqlEventResult {
    if (jsonData["operation"] != undefined) {
      this.operation = jsonData["operation"];
    }
    Object.assign(this, jsonData);
    return this;
  }

  override setSuccess({
    value,
    message,
    logger
  }: {
    value?: any;
    message?: string;
    logger?: any;
  }= {}): AcSqlEventResult {
    super.setSuccess({ value, message, logger });
    return this;
  }

  override setFailure({
    value,
    message,
    logger
  }: {
    value?: any;
    message?: string;
    logger?: any;
  }): AcSqlEventResult {
    super.setFailure({ value, message, logger });
    return this;
  }

  override toJson(): Record<string, any> {
    const result: Record<string, any> = { ...this };
    result["operation"] = this.operation;
    return result;
  }
}
