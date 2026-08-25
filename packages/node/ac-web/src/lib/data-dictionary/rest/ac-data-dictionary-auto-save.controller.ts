/* eslint-disable @typescript-eslint/no-explicit-any */
import { AcDDTable, AcEnumDDRowOperation } from '@autocode-ts/ac-data-dictionary';
import { AcSqlDbTable } from '@autocode-ts/ac-sql';
import { AcEnumApiDataType } from '../../api-docs/enums/ac-enum-api-data-type.enum';
import { AcApiDocRoute } from '../../api-docs/models/ac-api-doc-route.model';
import { AcApiDocContent } from '../../api-docs/models/ac-api-doc-content.model';
import { AcApiDocRequestBody } from '../../api-docs/models/ac-api-doc-request-body.model';
import { IAcWebRequestHandlerArgs } from '../../interfaces/ac-web-request-handler-args.interface';
import { AcWebResponse } from '../../models/ac-web-response.model';
import { AcWebApiResponse } from '../../models/ac-web-api-response.model';
import { AcApiDocUtils } from '../../api-docs/utils/ac-api-docs-utils';
import { AcWebDataDictionaryUtils } from '../utils/ac-web-data-dictionary-utils.utility';
import { AcDataDictionaryAutoApiConfig } from './ac-data-dictionary-auto-api-config.model';
import { AcDataDictionaryAutoApi } from './ac-data-dictionary-auto-api.controller';

export class AcDataDictionaryAutoSave {
  readonly acDDTable: AcDDTable;
  readonly acDataDictionaryAutoApi: AcDataDictionaryAutoApi;

  constructor({
    acDDTable,
    acDataDictionaryAutoApi,
  }: {
    acDDTable: AcDDTable;
    acDataDictionaryAutoApi: AcDataDictionaryAutoApi;
  }) {
    this.acDDTable = acDDTable;
    this.acDataDictionaryAutoApi = acDataDictionaryAutoApi;

    const tableName = AcWebDataDictionaryUtils.getTableNameForApiPath({ acDDTable });
    const apiUrl = `${acDataDictionaryAutoApi.urlPrefix}/${tableName}/${AcDataDictionaryAutoApiConfig.pathForSave}`;

    acDataDictionaryAutoApi.acWeb.post({
      url: apiUrl,
      handler: this.getHandler(),
      acApiDocRoute: this.getAcApiDocRoute(),
    });
  }

  getAcApiDocRoute(): AcApiDocRoute {
    const route = new AcApiDocRoute();
    route.addTag({ tag: this.acDDTable.tableName });
    route.summary = `Save ${this.acDDTable.tableName}`;
    route.description = `Auto generated data dictionary api to save row in table ${this.acDDTable.tableName}. Either single row or multiple rows can be saved at a time. This operation is an upsert.`;

    const schema = AcApiDocUtils.getApiModelRefFromAcDDTable({
      acDDTable: this.acDDTable,
      acApiDoc: this.acDataDictionaryAutoApi.acWeb.acApiDoc,
    });

    const content = new AcApiDocContent();
    content.encoding = 'application/json';
    content.schema = {
      type: AcEnumApiDataType.Object,
      properties: {
        row: schema,
        rows: { type: AcEnumApiDataType.Array, items: schema },
      },
    };

    const requestBody = new AcApiDocRequestBody();
    requestBody.addContent({ content });
    route.requestBody = requestBody;

    const responses = AcApiDocUtils.getApiDocRouteResponsesForOperation({
      operation: AcEnumDDRowOperation.Save,
      acDDTable: this.acDDTable,
      acApiDoc: this.acDataDictionaryAutoApi.acWeb.acApiDoc,
    });
    for (const res of responses) {
      route.addResponse({ response: res });
    }

    return route;
  }

  getHandler(): (args: IAcWebRequestHandlerArgs) => Promise<AcWebResponse> {
    return async (args: IAcWebRequestHandlerArgs) => {
      const acWebRequest = args.request;
      const response = new AcWebApiResponse();
      try {
        const sqlDbTableResult = await this.acDataDictionaryAutoApi.getAcSqlDbTable({ request: acWebRequest, acDDTable: this.acDDTable });
        if (sqlDbTableResult.isSuccess()) {
          const acSqlDbTable: AcSqlDbTable = sqlDbTableResult.value;
          if (acWebRequest.post && acWebRequest.post['row'] != undefined) {
            const result = await acSqlDbTable.saveRow({ row: acWebRequest.post['row'] });
            response.setFromSqlDaoResult({ result });
          } else if (acWebRequest.post && acWebRequest.post['rows'] != undefined) {
            const result = await acSqlDbTable.saveRows({ rows: acWebRequest.post['rows'] });
            response.setFromSqlDaoResult({ result });
          } else {
            response.message = 'parameters missing';
          }
        } else {
          response.setFromResult({ result: sqlDbTableResult });
        }
      } catch (ex: any) {
        response.setException({ exception: ex });
      }
      return response.toWebResponse();
    };
  }
}
