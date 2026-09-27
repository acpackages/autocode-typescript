/* eslint-disable @typescript-eslint/no-explicit-any */
import { AcDDTable, AcDDTableColumn, AcEnumDDRowOperation } from '@autocode-ts/ac-data-dictionary';
import { AcSqlDbTable } from '@autocode-ts/ac-sql';
import { AcApiDocRoute } from '../../api-docs/models/ac-api-doc-route.model';
import { AcApiDocParameter } from '../../api-docs/models/ac-api-doc-parameter.model';
import { IAcWebRequestHandlerArgs } from '../../interfaces/ac-web-request-handler-args.interface';
import { AcWebResponse } from '../../models/ac-web-response.model';
import { AcWebApiResponse } from '../../models/ac-web-api-response.model';
import { AcApiDocUtils } from '../../api-docs/utils/ac-api-docs-utils';
import { AcWebDataDictionaryUtils } from '../utils/ac-web-data-dictionary-utils.utility';
import { AcDataDictionaryAutoApiConfig } from './ac-data-dictionary-auto-api-config.model';
import { AcDataDictionaryAutoApi } from './ac-data-dictionary-auto-api.controller';

export class AcDataDictionaryAutoSelectDistinct {
  readonly acDDTable: AcDDTable;
  readonly acDDTableColumn: AcDDTableColumn;
  readonly acDataDictionaryAutoApi: AcDataDictionaryAutoApi;

  constructor({
    acDDTable,
    acDDTableColumn,
    acDataDictionaryAutoApi,
  }: {
    acDDTable: AcDDTable;
    acDDTableColumn: AcDDTableColumn;
    acDataDictionaryAutoApi: AcDataDictionaryAutoApi;
  }) {
    this.acDDTable = acDDTable;
    this.acDDTableColumn = acDDTableColumn;
    this.acDataDictionaryAutoApi = acDataDictionaryAutoApi;

    const tableName = AcWebDataDictionaryUtils.getTableNameForApiPath({ acDDTable });
    const apiUrl = `${acDataDictionaryAutoApi.urlPrefix}/${tableName}/${AcDataDictionaryAutoApiConfig.pathForSelectDistinct}-${acDDTableColumn.columnName}`;

    acDataDictionaryAutoApi.acWeb.get({
      url: apiUrl,
      handler: this.getHandler(),
      acApiDocRoute: this.getAcApiDocRoute(),
    });
  }

  getAcApiDocRoute(): AcApiDocRoute {
    const route = new AcApiDocRoute();
    route.addTag({ tag: this.acDDTable.tableName });
    route.summary = `Get ${this.acDDTable.tableName}'s ${this.acDDTableColumn.columnName}`;
    route.description = `Auto generated data dictionary api to get distinct values from column ${this.acDDTableColumn.columnName} in table ${this.acDDTable.tableName}`;

    const queryParameter = new AcApiDocParameter();
    queryParameter.name = AcDataDictionaryAutoApiConfig.selectParameterQueryKey;
    queryParameter.description = `Filter values using like condition for column ${this.acDDTable.getPrimaryKeyColumnName()}`;
    queryParameter.required = false;
    queryParameter.inValue = 'query';
    route.addParameter({ parameter: queryParameter });

    const pageParameter = new AcApiDocParameter();
    pageParameter.name = 'page_number';
    pageParameter.description = 'Page number of rows';
    pageParameter.required = false;
    pageParameter.inValue = 'query';
    route.addParameter({ parameter: pageParameter });

    const countParameter = new AcApiDocParameter();
    countParameter.name = 'rows_count';
    countParameter.description = 'Number of rows in each page';
    countParameter.required = false;
    countParameter.inValue = 'query';
    route.addParameter({ parameter: countParameter });

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
          const autoApiResult = await AcWebDataDictionaryUtils.handleAutoSelectDistinctWebRequest({
            logger: args.logger,
            request: acWebRequest,
            dao: acSqlDbTable.dao!,
            tableName: this.acDDTable.tableName,
            columnName: this.acDDTableColumn.columnName,
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
}
