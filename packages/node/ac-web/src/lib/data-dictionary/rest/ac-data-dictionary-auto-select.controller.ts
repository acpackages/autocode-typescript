/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AcDataDictionary, AcDDTable, AcDDSelectStatement, AcEnumDDRowOperation } from '@autocode-ts/ac-data-dictionary';
import { AcSqlDbTable } from '@autocode-ts/ac-sql';
import { AcLogger, AcEnumLogicalOperator, AcEnumConditionOperator, AcEnumHttpResponseCode, AcEnumLogType, AcEnumHttpMethod } from '@autocode-ts/autocode';
import { AcEnumApiDataType } from '../../api-docs/enums/ac-enum-api-data-type.enum';
import { AcApiDocRoute } from '../../api-docs/models/ac-api-doc-route.model';
import { AcApiDocParameter } from '../../api-docs/models/ac-api-doc-parameter.model';
import { AcApiDocContent } from '../../api-docs/models/ac-api-doc-content.model';
import { AcApiDocRequestBody } from '../../api-docs/models/ac-api-doc-request-body.model';
import { IAcWebRequestHandlerArgs } from '../../interfaces/ac-web-request-handler-args.interface';
import { AcWebResponse } from '../../models/ac-web-response.model';
import { AcWebApiResponse } from '../../models/ac-web-api-response.model';
import { AcApiDocUtils } from '../../api-docs/utils/ac-api-docs-utils';
import { AcWebDataDictionaryUtils } from '../utils/ac-web-data-dictionary-utils.utility';
import { AcDataDictionaryAutoApiConfig } from './ac-data-dictionary-auto-api-config.model';
import { AcDataDictionaryAutoApi } from './ac-data-dictionary-auto-api.controller';

export class AcDataDictionaryAutoSelect {
  readonly acDDTable: AcDDTable;
  readonly acDataDictionaryAutoApi: AcDataDictionaryAutoApi;
  includeSelectRow: boolean = true;

  constructor({
    acDDTable,
    acDataDictionaryAutoApi,
    includeSelectRow = true,
  }: {
    acDDTable: AcDDTable;
    acDataDictionaryAutoApi: AcDataDictionaryAutoApi;
    includeSelectRow?: boolean;
  }) {
    this.acDDTable = acDDTable;
    this.acDataDictionaryAutoApi = acDataDictionaryAutoApi;
    this.includeSelectRow = includeSelectRow;

    const tableName = AcWebDataDictionaryUtils.getTableNameForApiPath({ acDDTable });
    const apiUrl1 = `${acDataDictionaryAutoApi.urlPrefix}/${tableName}/${AcDataDictionaryAutoApiConfig.pathForSelect}`;
    acDataDictionaryAutoApi.acWeb.get({
      url: apiUrl1,
      handler: this.getHandler(),
      acApiDocRoute: this.getAcApiDocRoute(),
    });

    if (this.includeSelectRow) {
      const pkName = acDDTable.getPrimaryKeyColumnName();
      const apiUrl2 = `${acDataDictionaryAutoApi.urlPrefix}/${tableName}/${AcDataDictionaryAutoApiConfig.pathForSelect}/{${pkName}}`;
      acDataDictionaryAutoApi.acWeb.get({
        url: apiUrl2,
        handler: this.getByIdHandler(),
        acApiDocRoute: this.getByIdAcApiDocRoute(),
      });
    }

    const apiUrl3 = `${acDataDictionaryAutoApi.urlPrefix}/${tableName}/${AcDataDictionaryAutoApiConfig.pathForSelect}`;
    acDataDictionaryAutoApi.acWeb.post({
      url: apiUrl3,
      handler: this.postHandler(),
      acApiDocRoute: this.postAcApiDocRoute(),
    });
  }

  getAcApiDocRoute(): AcApiDocRoute {
    const route = new AcApiDocRoute();
    route.addTag({ tag: this.acDDTable.tableName });
    route.summary = `Get ${this.acDDTable.tableName}`;
    route.description = `Auto generated data dictionary api to get rows in table ${this.acDDTable.tableName}`;

    const queryColumns = this.acDDTable.getSearchQueryColumnNames();
    if (queryColumns.length > 0) {
      const param = new AcApiDocParameter();
      param.name = AcDataDictionaryAutoApiConfig.selectParameterQueryKey;
      param.description = `Filter values using like condition for columns (${queryColumns.join(',')})`;
      param.required = false;
      param.inValue = 'query';
      route.addParameter({ parameter: param });
    }

    const pageParam = new AcApiDocParameter();
    pageParam.name = AcDataDictionaryAutoApiConfig.selectParameterPageNumberKey;
    pageParam.description = 'Page number of rows';
    pageParam.required = false;
    pageParam.inValue = 'query';
    route.addParameter({ parameter: pageParam });

    const sizeParam = new AcApiDocParameter();
    sizeParam.name = AcDataDictionaryAutoApiConfig.selectParameterPageSizeKey;
    sizeParam.description = 'Number of rows in each page';
    sizeParam.required = false;
    sizeParam.inValue = 'query';
    route.addParameter({ parameter: sizeParam });

    const orderParam = new AcApiDocParameter();
    orderParam.name = AcDataDictionaryAutoApiConfig.selectParameterOrderByKey;
    orderParam.description = 'Order by value for rows';
    orderParam.required = false;
    orderParam.inValue = 'query';
    route.addParameter({ parameter: orderParam });

    for (const column of this.acDDTable.tableColumns) {
      const p = new AcApiDocParameter();
      p.name = column.columnName;
      p.description = `Filter values in column ${column.columnName}`;
      p.required = false;
      p.inValue = 'query';
      route.addParameter({ parameter: p });
    }

    const responses = AcApiDocUtils.getApiDocRouteResponsesForOperation({
      operation: AcEnumDDRowOperation.Select,
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
      let response = new AcWebApiResponse();
      try {
        const sqlDbTableResult = await this.acDataDictionaryAutoApi.getAcSqlDbTable({ request: acWebRequest, acDDTable: this.acDDTable });
        if (sqlDbTableResult.isSuccess()) {
          const acSqlDbTable: AcSqlDbTable = sqlDbTableResult.value;
          const autoApiResult = await AcWebDataDictionaryUtils.handleAutoSelectWebRequest({
            logger: args.logger,
            request: acWebRequest,
            dao: acSqlDbTable.dao!,
            tableName: this.acDDTable.tableName,
            httpMethod: AcEnumHttpMethod.Get,
          });
          if (autoApiResult.webApiResponse) {
            response = autoApiResult.webApiResponse;
          }
        } else {
          response.setFromResult({ result: sqlDbTableResult });
        }
        return response.toWebResponse();
      } catch (ex: any) {
        response.setException({ exception: ex });
      }
      return response.toWebResponse();
    };
  }

  getByIdAcApiDocRoute(): AcApiDocRoute {
    const route = new AcApiDocRoute();
    route.addTag({ tag: this.acDDTable.tableName });
    route.summary = `Get single ${this.acDDTable.tableName}`;
    const pkName = this.acDDTable.getPrimaryKeyColumnName();
    route.description = `Auto generated data dictionary api to get single row matching column value ${pkName} in table ${this.acDDTable.tableName}`;

    const param = new AcApiDocParameter();
    param.name = pkName;
    param.description = `${pkName} value of row to get`;
    param.required = true;
    param.inValue = 'path';
    route.addParameter({ parameter: param });

    const responses = AcApiDocUtils.getApiDocRouteResponsesForOperation({
      operation: AcEnumDDRowOperation.Select,
      acDDTable: this.acDDTable,
      acApiDoc: this.acDataDictionaryAutoApi.acWeb.acApiDoc,
    });
    for (const res of responses) {
      route.addResponse({ response: res });
    }
    return route;
  }

  getByIdHandler(): (args: IAcWebRequestHandlerArgs) => Promise<AcWebResponse> {
    return async (args: IAcWebRequestHandlerArgs) => {
      const acWebRequest = args.request;
      const response = new AcWebApiResponse();
      try {
        const sqlDbTableResult = await this.acDataDictionaryAutoApi.getAcSqlDbTable({ request: acWebRequest, acDDTable: this.acDDTable });
        if (sqlDbTableResult.isSuccess()) {
          const acSqlDbTable: AcSqlDbTable = sqlDbTableResult.value;
          const pkName = this.acDDTable.getPrimaryKeyColumnName();
          const primaryKeyValue = acWebRequest.pathParameters[pkName];

          const getResponse = await acSqlDbTable.getRows({
            condition: `${pkName} = @primaryKeyValue`,
            parameters: { '@primaryKeyValue': primaryKeyValue },
          });
          response.setFromSqlDaoResult({ result: getResponse });
        } else {
          response.setFromResult({ result: sqlDbTableResult });
        }
      } catch (ex: any) {
        response.setException({ exception: ex });
      }
      return response.toWebResponse();
    };
  }

  postAcApiDocRoute(): AcApiDocRoute {
    const route = new AcApiDocRoute();
    route.addTag({ tag: this.acDDTable.tableName });
    route.summary = `Get ${this.acDDTable.tableName}`;
    route.description = `Auto generated data dictionary api to get rows in table ${this.acDDTable.tableName}`;

    const queryColumns = this.acDDTable.getSearchQueryColumnNames();
    const properties: Record<string, any> = {
      [AcDataDictionaryAutoApiConfig.selectParameterPageNumberKey]: { type: AcEnumApiDataType.Integer },
      [AcDataDictionaryAutoApiConfig.selectParameterPageSizeKey]: { type: AcEnumApiDataType.Integer },
      [AcDataDictionaryAutoApiConfig.selectParameterOrderByKey]: { type: AcEnumApiDataType.String },
      [AcDataDictionaryAutoApiConfig.selectParameterFiltersKey]: { type: AcEnumApiDataType.Object },
      [AcDataDictionaryAutoApiConfig.selectParameterIncludeColumnsKey]: {
        type: AcEnumApiDataType.Array,
        items: { type: AcEnumApiDataType.String },
      },
      [AcDataDictionaryAutoApiConfig.selectParameterExcludeColumnsKey]: {
        type: AcEnumApiDataType.Array,
        items: { type: AcEnumApiDataType.String },
      },
    };

    if (queryColumns.length > 0) {
      properties[AcDataDictionaryAutoApiConfig.selectParameterQueryKey] = { type: AcEnumApiDataType.String };
    }

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
      operation: AcEnumDDRowOperation.Select,
      acDDTable: this.acDDTable,
      acApiDoc: this.acDataDictionaryAutoApi.acWeb.acApiDoc,
    });
    for (const res of responses) {
      route.addResponse({ response: res });
    }
    return route;
  }

  postHandler(): (args: IAcWebRequestHandlerArgs) => Promise<AcWebResponse> {
    return async (args: IAcWebRequestHandlerArgs) => {
      const logger = args.logger;
      const acWebRequest = args.request;
      let response = new AcWebApiResponse();
      try {
        logger.log(`[AcDataDictionaryAutoSelect] : Getting rows for table ${this.acDDTable.tableName} using post method...`);
        logger.log(['[AcDataDictionaryAutoSelect] : Request : ', acWebRequest]);
        const sqlDbTableResult = await this.acDataDictionaryAutoApi.getAcSqlDbTable({ request: acWebRequest, acDDTable: this.acDDTable });
        if (sqlDbTableResult.isSuccess()) {
          const acSqlDbTable: AcSqlDbTable = sqlDbTableResult.value;
          const autoApiResult = await AcWebDataDictionaryUtils.handleAutoSelectWebRequest({
            logger,
            request: acWebRequest,
            dao: acSqlDbTable.dao!,
            tableName: this.acDDTable.tableName,
          });
          if (autoApiResult.webApiResponse) {
            response = autoApiResult.webApiResponse;
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
