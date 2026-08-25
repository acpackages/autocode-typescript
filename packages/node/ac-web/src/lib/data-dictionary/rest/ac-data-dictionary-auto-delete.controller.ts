/* eslint-disable @typescript-eslint/no-explicit-any */
import { AcDDTable, AcEnumDDRowOperation } from '@autocode-ts/ac-data-dictionary';
import { AcSqlDbTable } from '@autocode-ts/ac-sql';
import { AcLogger, AcEnumHttpResponseCode } from '@autocode-ts/autocode';
import { AcEnumApiDataType } from '../../api-docs/enums/ac-enum-api-data-type.enum';
import { AcApiDocRoute } from '../../api-docs/models/ac-api-doc-route.model';
import { AcApiDocParameter } from '../../api-docs/models/ac-api-doc-parameter.model';
import { AcApiDocContent } from '../../api-docs/models/ac-api-doc-content.model';
import { AcApiDocRequestBody } from '../../api-docs/models/ac-api-doc-request-body.model';
import { AcWebResponse } from '../../models/ac-web-response.model';
import { AcWebApiResponse } from '../../models/ac-web-api-response.model';
import { AcApiDocUtils } from '../../api-docs/utils/ac-api-docs-utils';
import { AcWebDataDictionaryUtils } from '../utils/ac-web-data-dictionary-utils.utility';
import { AcDataDictionaryAutoApiConfig } from './ac-data-dictionary-auto-api-config.model';
import { AcDataDictionaryAutoApi } from './ac-data-dictionary-auto-api.controller';
import { IAcWebRequestHandlerArgs } from '../../interfaces/ac-web-request-handler-args.interface';

export class AcDataDictionaryAutoDelete {
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
    const apiUrl = `${acDataDictionaryAutoApi.urlPrefix}/${tableName}/${AcDataDictionaryAutoApiConfig.pathForDelete}`;
    const pkName = acDDTable.getPrimaryKeyColumnName();

    acDataDictionaryAutoApi.acWeb.delete({
      url: `${apiUrl}/{${pkName}}`,
      handler: this.getHandler(),
      acApiDocRoute: this.getAcApiDocRoute(),
    });

    acDataDictionaryAutoApi.acWeb.post({
      url: apiUrl,
      handler: this.getPostHandler(),
      acApiDocRoute: this.getAcApPostDocRoute(),
    });
  }

  getAcApiDocRoute(): AcApiDocRoute {
    const route = new AcApiDocRoute();
    route.addTag({ tag: this.acDDTable.tableName });
    route.summary = `Delete ${this.acDDTable.tableName}`;
    route.description = `Auto generated data dictionary api to delete row in table ${this.acDDTable.tableName}`;

    const param = new AcApiDocParameter();
    param.name = this.acDDTable.getPrimaryKeyColumnName();
    param.description = `${this.acDDTable.getPrimaryKeyColumnName()} value of row to delete`;
    param.required = true;
    param.inValue = 'path';
    route.addParameter({ parameter: param });

    const responses = AcApiDocUtils.getApiDocRouteResponsesForOperation({
      operation: AcEnumDDRowOperation.Delete,
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
      const key = this.acDDTable.getPrimaryKeyColumnName();
      try {
        if (acWebRequest.post && acWebRequest.post[key] != undefined) {
          const sqlDbTableResult = await this.acDataDictionaryAutoApi.getAcSqlDbTable({ request: acWebRequest, acDDTable: this.acDDTable });
          if (sqlDbTableResult.isSuccess()) {
            const acSqlDbTable: AcSqlDbTable = sqlDbTableResult.value;
            const result = await acSqlDbTable.deleteRows({
              primaryKeyValue: acWebRequest.pathParameters[key],
            });
            response.setFromSqlDaoResult({ result });
          } else {
            response.setFromResult({ result: sqlDbTableResult });
          }
        } else {
          response.message = 'parameters missing';
          return AcWebResponse.json({ data: response });
        }
      } catch (ex: any) {
        response.setException({ exception: ex });
      }
      return response.toWebResponse();
    };
  }

  getAcApPostDocRoute(): AcApiDocRoute {
    const route = new AcApiDocRoute();
    route.addTag({ tag: this.acDDTable.tableName });
    route.summary = `Delete row in ${this.acDDTable.tableName}`;
    route.description = `Auto generated data dictionary api to delete row in table ${this.acDDTable.tableName}`;

    const properties: Record<string, any> = {
      [this.acDDTable.getPrimaryKeyColumnName()]: { type: AcEnumApiDataType.String },
    };

    const content = new AcApiDocContent();
    content.encoding = 'application/json';
    content.schema = {
      type: AcEnumApiDataType.Object,
      properties: properties,
    };

    const requestBody = new AcApiDocRequestBody();
    requestBody.addContent({ content });
    route.requestBody = requestBody;

    const responses = AcApiDocUtils.getApiDocRouteResponsesForOperation({
      operation: AcEnumDDRowOperation.Delete,
      acDDTable: this.acDDTable,
      acApiDoc: this.acDataDictionaryAutoApi.acWeb.acApiDoc,
    });
    for (const res of responses) {
      route.addResponse({ response: res });
    }

    return route;
  }

  getPostHandler(): (args: IAcWebRequestHandlerArgs) => Promise<AcWebResponse> {
    return async (args: IAcWebRequestHandlerArgs) => {
      const logger: AcLogger = args.logger;
      const acWebRequest = args.request;
      const response = new AcWebApiResponse();
      try {
        logger.log(`Deleting row from table ${this.acDDTable.tableName}`);
        const key = this.acDDTable.getPrimaryKeyColumnName();
        logger.log(`Deleting for primary key field ${key}`);
        if (acWebRequest.post && acWebRequest.post[key] != undefined) {
          logger.log(`Found primary key field ${key}`);
          const sqlDbTableResult = await this.acDataDictionaryAutoApi.getAcSqlDbTable({ request: acWebRequest, acDDTable: this.acDDTable });
          if (sqlDbTableResult.isSuccess()) {
            const acSqlDbTable: AcSqlDbTable = sqlDbTableResult.value;
            const result = await acSqlDbTable.deleteRows({
              primaryKeyValue: acWebRequest.post[key],
            });
            response.setFromSqlDaoResult({ result });
          } else {
            response.setFromResult({ result: sqlDbTableResult });
          }
        } else {
          logger.log(['Primary key field is missing in post', acWebRequest.post]);
          response.message = 'parameters missing';
        }
      } catch (ex: any) {
        response.setException({ exception: ex });
      }
      return response.toWebResponse();
    };
  }
}
