import { AcJsonUtils, AcLogger, AcResult } from "@autocode-ts/autocode";
import { AcWebResponse } from "./ac-web-response.model";

export class AcWebApiResponse extends AcResult {
  static readonly KeyData = 'data';

  data: any;

  toWebResponse(): AcWebResponse {
    return AcWebResponse.json({ data: this.toJson() });
  }

  override setFromResult({ result, message, logger }: { result: AcResult; message?: string; logger?: AcLogger }): this {
    super.setFromResult({ result, message, logger });
    if (this.value != null) {
      this.data = this.value;
      this.value = null;
    }
    return this;
  }

  setFromSqlDaoResult({ result, message, logger }: { result: any; message?: string; logger?: AcLogger }): this {
    this.setFromResult({ result, message, logger });
    const sqlData: Record<string, any> = {};
    sqlData['rows'] = result.rows;
    if (result.affectedRowsCount != null && result.affectedRowsCount > 0) {
      sqlData['affectedRowsCount'] = result.affectedRowsCount;
    }
    if (result.lastInsertedId != null) {
      sqlData['lastInsertedId'] = result.lastInsertedId;
    }
    if (result.totalRows > 0) {
      sqlData['totalRows'] = result.totalRows;
    }
    this.data = sqlData;
    return this;
  }

  override toJson(): Record<string, any> {
    const result = AcJsonUtils.getJsonDataFromInstance({ instance: this });
    const logKey = (AcResult as any).KEY_LOG || (AcResult as any).KeyLog || 'log';
    const otherDetailsKey = (AcResult as any).KEY_OTHER_DETAILS || (AcResult as any).KeyOtherDetails || 'otherDetails';
    if (result[logKey] && Array.isArray(result[logKey]) && result[logKey].length === 0) {
      delete result[logKey];
    }
    if (result[otherDetailsKey] && typeof result[otherDetailsKey] === 'object' && Object.keys(result[otherDetailsKey]).length === 0) {
      delete result[otherDetailsKey];
    }
    return result;
  }
}

