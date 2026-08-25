/* eslint-disable @typescript-eslint/no-explicit-any */
import { AcDataDictionary, AcDDTable, AcDDSelectStatement } from '@autocode-ts/ac-data-dictionary';
import { AcBaseSqlDao, AcSqlDbTable } from '@autocode-ts/ac-sql';
import { AcLogger, AcEnumLogicalOperator, AcEnumConditionOperator } from '@autocode-ts/autocode';
import { AcWebRequest } from '../../models/ac-web-request.model';
import { AcWebApiResponse } from '../../models/ac-web-api-response.model';
import { AcDataDictionaryWebAutoExecuteResult } from '../models/ac-data-dictionary-web-auto-execute-result.model';
import { AcDataDictionaryAutoApiConfig } from '../rest/ac-data-dictionary-auto-api-config.model';
import { stringToKebabCase } from '@autocode-ts/ac-extensions';

export class AcWebDataDictionaryUtils {
  static getTableNameForApiPath({ acDDTable }: { acDDTable: AcDDTable }): string {
    let result:string = acDDTable.getPluralName();
    result = stringToKebabCase(result);
    return result;
  }

  static async handleAutoSelectWebRequest({
    logger,
    request,
    tableName = '',
    viewName = '',
    dataDictionaryName = 'default',
    selectFrom = '',
    dao,
  }: {
    logger: AcLogger;
    request: AcWebRequest;
    tableName?: string;
    viewName?: string;
    dataDictionaryName?: string;
    selectFrom?: string;
    dao: AcBaseSqlDao;
  }): Promise<AcDataDictionaryWebAutoExecuteResult> {
    const result = new AcDataDictionaryWebAutoExecuteResult();
    const response = new AcWebApiResponse();
    try {
      logger.log(`Getting rows for table ${tableName} using post method...`);
      const ddSelectStatement = new AcDDSelectStatement({
        tableName: tableName,
        viewName: viewName,
        dataDictionaryName: dataDictionaryName,
      });

      if (selectFrom) {
        ddSelectStatement.selectFrom = selectFrom;
      }

      if (request.post[AcDataDictionaryAutoApiConfig.selectParameterIncludeColumnsKey]) {
        ddSelectStatement.includeColumns = request.post[AcDataDictionaryAutoApiConfig.selectParameterIncludeColumnsKey];
      }
      if (request.post[AcDataDictionaryAutoApiConfig.selectParameterExcludeColumnsKey]) {
        ddSelectStatement.excludeColumns = request.post[AcDataDictionaryAutoApiConfig.selectParameterExcludeColumnsKey];
      }

      if (request.post[AcDataDictionaryAutoApiConfig.selectParameterQueryKey]) {
        let queryColumns: string[] = [];
        if (ddSelectStatement.tableName) {
          const acDDTable = AcDataDictionary.getTable({ tableName: ddSelectStatement.tableName, dataDictionaryName: ddSelectStatement.dataDictionaryName });
          if (acDDTable) {
            queryColumns = acDDTable.getSearchQueryColumnNames();
          }
        } else if (ddSelectStatement.viewName) {
          const acDDView = AcDataDictionary.getView({ viewName: ddSelectStatement.viewName, dataDictionaryName: ddSelectStatement.dataDictionaryName });
          if (acDDView) {
            queryColumns = acDDView.getSearchQueryColumnNames();
          }
        }

        ddSelectStatement.startGroup({ operator: AcEnumLogicalOperator.Or });
        for (const columnName of queryColumns) {
          ddSelectStatement.addCondition({
            key: columnName,
            operator: AcEnumConditionOperator.Contains,
            value: request.post[AcDataDictionaryAutoApiConfig.selectParameterQueryKey],
          });
        }
        ddSelectStatement.endGroup();
      }

      if (request.post[AcDataDictionaryAutoApiConfig.selectParameterFiltersKey]) {
        const filters = request.post[AcDataDictionaryAutoApiConfig.selectParameterFiltersKey];
        ddSelectStatement.setConditionsFromFilters({ filters });
      }

      let allRows = false;
      if (request.post[AcDataDictionaryAutoApiConfig.selectParameterAllRows]) {
        const val = String(request.post[AcDataDictionaryAutoApiConfig.selectParameterAllRows]).toLowerCase();
        if (val === 'yes' || val === 'true') {
          allRows = true;
        }
      }

      // Add simple EqualTo conditions for columns found in request body
      if (ddSelectStatement.tableName) {
        const acDDTable = AcDataDictionary.getTable({ tableName: ddSelectStatement.tableName, dataDictionaryName: ddSelectStatement.dataDictionaryName });
        if (acDDTable) {
          for (const columnName of acDDTable.getColumnNames()) {
            if (request.post && request.post[columnName] != undefined) {
              ddSelectStatement.conditionGroup.addCondition({ key: columnName, operator: AcEnumConditionOperator.EqualTo, value: request.post[columnName] });
            }
          }
        }
      } else if (ddSelectStatement.viewName) {
        const acDDView = AcDataDictionary.getView({ viewName: ddSelectStatement.viewName, dataDictionaryName: ddSelectStatement.dataDictionaryName });
        if (acDDView) {
          for (const columnName of acDDView.getColumnNames()) {
            if (request.post && request.post[columnName] != undefined) {
              ddSelectStatement.conditionGroup.addCondition({ key: columnName, operator: AcEnumConditionOperator.EqualTo, value: request.post[columnName] });
            }
          }
        }
      }

      if (!allRows) {
        if (request.post[AcDataDictionaryAutoApiConfig.selectParameterPageNumberKey]) {
          ddSelectStatement.pageNumber = parseInt(request.post[AcDataDictionaryAutoApiConfig.selectParameterPageNumberKey], 10) || 1;
        } else {
          ddSelectStatement.pageNumber = 1;
        }
        if (request.post[AcDataDictionaryAutoApiConfig.selectParameterPageSizeKey]) {
          ddSelectStatement.pageSize = parseInt(request.post[AcDataDictionaryAutoApiConfig.selectParameterPageSizeKey], 10) || 50;
        } else {
          ddSelectStatement.pageSize = 50;
        }
      }

      if (request.post[AcDataDictionaryAutoApiConfig.selectParameterOrderByKey]) {
        ddSelectStatement.orderBy = request.post[AcDataDictionaryAutoApiConfig.selectParameterOrderByKey];
      }

      const acSqlDbTable = new AcSqlDbTable({ tableName: tableName, dataDictionaryName: dataDictionaryName });
      const getResponse = await acSqlDbTable.getRowsFromAcDDStatement({ acDDSelectStatement: ddSelectStatement });
      result.selectStatement = ddSelectStatement;
      response.setFromSqlDaoResult({ result: getResponse });
    } catch (ex: any) {
      response.setException({ exception: ex });
    }

    result.setFromResult({ result: response });
    result.webApiResponse = response;
    result.webResponse = response.toWebResponse();
    return result;
  }
}
