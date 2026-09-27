/* eslint-disable @typescript-eslint/no-explicit-any */
import { AcDataDictionary, AcDDTable, AcDDSelectStatement } from '@autocode-ts/ac-data-dictionary';
import { AcBaseSqlDao, AcSqlDbTable } from '@autocode-ts/ac-sql';
import { AcLogger, AcEnumLogicalOperator, AcEnumConditionOperator, AcEnumHttpMethod } from '@autocode-ts/autocode';
import { AcWebRequest } from '../../models/ac-web-request.model';
import { AcWebApiResponse } from '../../models/ac-web-api-response.model';
import { AcDataDictionaryWebAutoExecuteResult } from '../models/ac-data-dictionary-web-auto-execute-result.model';
import { AcDataDictionaryAutoApiConfig } from '../rest/ac-data-dictionary-auto-api-config.model';
import { stringToKebabCase } from '@autocode-ts/ac-extensions';

export class AcWebDataDictionaryUtils {
  static getTableNameForApiPath({ acDDTable }: { acDDTable: AcDDTable }): string {
    let result: string = acDDTable.getPluralName();
    result = stringToKebabCase(result);
    return result;
  }

  static async handleAutoDeleteWebRequest({
    logger,
    request,
    tableName = '',
    dataDictionaryName = 'default',
    dao,
  }: {
    logger: AcLogger;
    request: AcWebRequest;
    tableName?: string;
    dataDictionaryName?: string;
    httpMethod?: AcEnumHttpMethod;
    dao: AcBaseSqlDao;
  }): Promise<AcDataDictionaryWebAutoExecuteResult> {
    const result = new AcDataDictionaryWebAutoExecuteResult();
    const response = new AcWebApiResponse();
    try {
      const acDDTable = AcDataDictionary.getTable({ tableName, dataDictionaryName });
      if (acDDTable) {
        const key = acDDTable.getPrimaryKeyColumnName();
        logger.log(`Deleting for primary key field ${key}`);
        if (request.post && request.post[key] !== undefined) {
          logger.log(`Found primary key field ${key}`);
          const acSqlDbTable = new AcSqlDbTable({ tableName, dataDictionaryName });
          if (dao) acSqlDbTable.dao = dao;
          const deleteResult = await acSqlDbTable.deleteRows({
            primaryKeyValue: request.post[key],
          });
          response.setFromSqlDaoResult({ result: deleteResult });
        } else {
          logger.log(['Primary key field is missing in post', request.post]);
          response.message = 'parameters missing';
        }
      } else {
        response.setFailure({ message: `${tableName} does not exist in ${dataDictionaryName} data dictionary` });
      }
    } catch (ex: any) {
      response.setException({ exception: ex });
    }
    result.setFromResult({ result: response });
    result.webApiResponse = response;
    result.webResponse = response.toWebResponse();
    return result;
  }

  static async handleAutoInsertWebRequest({
    request,
    tableName = '',
    dataDictionaryName = 'default',
    dao,
  }: {
    logger: AcLogger;
    request: AcWebRequest;
    tableName?: string;
    dataDictionaryName?: string;
    httpMethod?: AcEnumHttpMethod;
    dao: AcBaseSqlDao;
  }): Promise<AcDataDictionaryWebAutoExecuteResult> {
    const result = new AcDataDictionaryWebAutoExecuteResult();
    const response = new AcWebApiResponse();
    try {
      const acDDTable = AcDataDictionary.getTable({ tableName, dataDictionaryName });
      if (acDDTable) {
        const acSqlDbTable = new AcSqlDbTable({ tableName, dataDictionaryName });
        if (dao) acSqlDbTable.dao = dao;
        if (request.post && request.post['row'] !== undefined) {
          const insertResult = await acSqlDbTable.insertRow({ row: request.post['row'] });
          response.setFromSqlDaoResult({ result: insertResult });
        } else if (request.post && request.post['rows'] !== undefined) {
          const insertRowsResult = await acSqlDbTable.insertRows({ rows: request.post['rows'] });
          response.setFromSqlDaoResult({ result: insertRowsResult });
        } else {
          response.message = 'parameters missing';
        }
      } else {
        response.setFailure({ message: `${tableName} does not exist in ${dataDictionaryName} data dictionary` });
      }
    } catch (ex: any) {
      response.setException({ exception: ex });
    }
    result.setFromResult({ result: response });
    result.webApiResponse = response;
    result.webResponse = response.toWebResponse();
    return result;
  }

  static async handleAutoSaveWebRequest({
    request,
    tableName = '',
    dataDictionaryName = 'default',
    dao,
  }: {
    logger: AcLogger;
    request: AcWebRequest;
    tableName?: string;
    dataDictionaryName?: string;
    httpMethod?: AcEnumHttpMethod;
    dao: AcBaseSqlDao;
  }): Promise<AcDataDictionaryWebAutoExecuteResult> {
    const result = new AcDataDictionaryWebAutoExecuteResult();
    const response = new AcWebApiResponse();
    try {
      const acDDTable = AcDataDictionary.getTable({ tableName, dataDictionaryName });
      if (acDDTable) {
        const acSqlDbTable = new AcSqlDbTable({ tableName, dataDictionaryName });
        if (dao) acSqlDbTable.dao = dao;
        if (request.post && request.post['row'] !== undefined) {
          const saveResult = await acSqlDbTable.saveRow({ row: request.post['row'] });
          response.setFromSqlDaoResult({ result: saveResult });
        } else if (request.post && request.post['rows'] !== undefined) {
          const saveRowsResult = await acSqlDbTable.saveRows({ rows: request.post['rows'] });
          response.setFromSqlDaoResult({ result: saveRowsResult });
        } else {
          response.message = 'parameters missing';
        }
      } else {
        response.setFailure({ message: `${tableName} does not exist in ${dataDictionaryName} data dictionary` });
      }
    } catch (ex: any) {
      response.setException({ exception: ex });
    }
    result.setFromResult({ result: response });
    result.webApiResponse = response;
    result.webResponse = response.toWebResponse();
    return result;
  }

  static async handleAutoSelectDistinctWebRequest({
    request,
    tableName = '',
    columnName = '',
    dataDictionaryName = 'default',
    selectFrom = '',
    httpMethod = AcEnumHttpMethod.Post,
    dao,
  }: {
    logger: AcLogger;
    request: AcWebRequest;
    tableName?: string;
    columnName?: string;
    viewName?: string;
    dataDictionaryName?: string;
    selectFrom?: string;
    httpMethod?: AcEnumHttpMethod;
    dao: AcBaseSqlDao;
  }): Promise<AcDataDictionaryWebAutoExecuteResult> {
    const result = new AcDataDictionaryWebAutoExecuteResult();
    const response = new AcWebApiResponse();
    try {
      let query = '';
      let pageNumber = -1;
      let pageSize = -1;
      const isPost = httpMethod === AcEnumHttpMethod.Post;
      const params = isPost ? (request.post || {}) : (request.get || {});

      if (params[AcDataDictionaryAutoApiConfig.selectParameterQueryKey]) {
        query = String(params[AcDataDictionaryAutoApiConfig.selectParameterQueryKey]).trim();
      }

      let allRows = false;
      if (params[AcDataDictionaryAutoApiConfig.selectParameterAllRows]) {
        const val = String(params[AcDataDictionaryAutoApiConfig.selectParameterAllRows]).toLowerCase();
        if (val === 'yes' || val === 'true') {
          allRows = true;
        }
      }

      if (!allRows) {
        pageNumber = parseInt(params[AcDataDictionaryAutoApiConfig.selectParameterPageNumberKey], 10) || 1;
        pageSize = parseInt(params[AcDataDictionaryAutoApiConfig.selectParameterPageSizeKey], 10) || 50;
      }

      if (!selectFrom) {
        selectFrom = tableName;
      }

      if (selectFrom) {
        let condition = '';
        let queryParams: Record<string, any> = {};
        if (query) {
          condition = `${columnName} LIKE @query`;
          queryParams = { '@query': `%${query}%` };
        }

        const selectStatement = AcDDSelectStatement.generateSqlStatement({
          selectStatement: `SELECT DISTINCT ${columnName} FROM ${selectFrom} AS records`,
          pageNumber,
          pageSize,
          orderBy: columnName,
          condition,
        });

        const getResponse = await dao.getRows({ statement: selectStatement, parameters: queryParams });
        response.setFromSqlDaoResult({ result: getResponse });
      } else {
        response.setFailure({ message: `${tableName} does not exist in ${dataDictionaryName} data dictionary` });
      }
    } catch (ex: any) {
      response.setException({ exception: ex });
    }
    result.setFromResult({ result: response });
    result.webApiResponse = response;
    result.webResponse = response.toWebResponse();
    return result;
  }

  static async handleAutoSelectWebRequest({
    logger,
    request,
    tableName = '',
    viewName = '',
    dataDictionaryName = 'default',
    selectFrom = '',
    httpMethod = AcEnumHttpMethod.Post,
    dao,
  }: {
    logger: AcLogger;
    request: AcWebRequest;
    tableName?: string;
    viewName?: string;
    dataDictionaryName?: string;
    selectFrom?: string;
    httpMethod?: AcEnumHttpMethod;
    dao: AcBaseSqlDao;
  }): Promise<AcDataDictionaryWebAutoExecuteResult> {
    const result = new AcDataDictionaryWebAutoExecuteResult();
    const response = new AcWebApiResponse();
    try {
      logger.log(`[AcWebDataDictionaryUtils] : Getting rows for table ${tableName} using ${httpMethod} method...`);
      const ddSelectStatement = new AcDDSelectStatement({
        tableName,
        viewName,
        dataDictionaryName,
      });

      let queryColumns: string[] = [];
      let columnNames: string[] = [];

      if (tableName) {
        const acDDTable = AcDataDictionary.getTable({ tableName, dataDictionaryName });
        if (acDDTable) {
          ddSelectStatement.selectFrom = acDDTable.getSelectQueryFromName();
          queryColumns = acDDTable.getSearchQueryColumnNames();
          columnNames = acDDTable.getColumnNames();
          if (acDDTable.getSqlViewName()) {
            if (!viewName) {
              viewName = acDDTable.getSqlViewName();
            }
          }
          if (acDDTable.getOrderByValue()) {
            ddSelectStatement.orderBy = acDDTable.getOrderByValue();
          }
        }
      }

      if (viewName) {
        const acDDView = AcDataDictionary.getView({ viewName, dataDictionaryName });
        if (acDDView) {
          ddSelectStatement.selectFrom = viewName;
          queryColumns = acDDView.getSearchQueryColumnNames();
          columnNames = acDDView.getColumnNames();
        }
      }

      if (selectFrom) {
        ddSelectStatement.selectFrom = selectFrom;
      }

      const isPost = httpMethod === AcEnumHttpMethod.Post;
      const params = isPost ? (request.post || {}) : (request.get || {});

      if (isPost) {
        if (params[AcDataDictionaryAutoApiConfig.selectParameterIncludeColumnsKey]) {
          ddSelectStatement.includeColumns = params[AcDataDictionaryAutoApiConfig.selectParameterIncludeColumnsKey];
        }
        if (params[AcDataDictionaryAutoApiConfig.selectParameterExcludeColumnsKey]) {
          ddSelectStatement.excludeColumns = params[AcDataDictionaryAutoApiConfig.selectParameterExcludeColumnsKey];
        }
        if (params[AcDataDictionaryAutoApiConfig.selectParameterFiltersKey]) {
          ddSelectStatement.setConditionsFromFilters({ filters: params[AcDataDictionaryAutoApiConfig.selectParameterFiltersKey] });
        }
      }

      if (params[AcDataDictionaryAutoApiConfig.selectParameterQueryKey]) {
        ddSelectStatement.startGroup({ operator: AcEnumLogicalOperator.Or });
        for (const col of queryColumns) {
          ddSelectStatement.addCondition({
            key: col,
            operator: AcEnumConditionOperator.Contains,
            value: params[AcDataDictionaryAutoApiConfig.selectParameterQueryKey],
          });
        }
        ddSelectStatement.endGroup();
      }

      let allRows = false;
      if (params[AcDataDictionaryAutoApiConfig.selectParameterAllRows]) {
        const val = String(params[AcDataDictionaryAutoApiConfig.selectParameterAllRows]).toLowerCase();
        if (val === 'yes' || val === 'true') {
          allRows = true;
        }
      }

      for (const col of columnNames) {
        if (params[col] !== undefined) {
          ddSelectStatement.conditionGroup.addCondition({
            key: col,
            operator: AcEnumConditionOperator.EqualTo,
            value: params[col],
          });
        }
      }

      if (!allRows) {
        ddSelectStatement.pageNumber = parseInt(params[AcDataDictionaryAutoApiConfig.selectParameterPageNumberKey], 10) || 1;
        ddSelectStatement.pageSize = parseInt(params[AcDataDictionaryAutoApiConfig.selectParameterPageSizeKey], 10) || 50;
      }

      if (params[AcDataDictionaryAutoApiConfig.selectParameterOrderByKey]) {
        ddSelectStatement.orderBy = params[AcDataDictionaryAutoApiConfig.selectParameterOrderByKey];
      }

      const acSqlDbTable = new AcSqlDbTable({ tableName, dataDictionaryName });
      if (dao) acSqlDbTable.dao = dao;
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

  static async handleAutoUpdateWebRequest({
    request,
    tableName = '',
    dataDictionaryName = 'default',
    dao,
  }: {
    logger: AcLogger;
    request: AcWebRequest;
    tableName?: string;
    dataDictionaryName?: string;
    httpMethod?: AcEnumHttpMethod;
    dao: AcBaseSqlDao;
  }): Promise<AcDataDictionaryWebAutoExecuteResult> {
    const result = new AcDataDictionaryWebAutoExecuteResult();
    const response = new AcWebApiResponse();
    try {
      const acDDTable = AcDataDictionary.getTable({ tableName, dataDictionaryName });
      if (acDDTable) {
        const acSqlDbTable = new AcSqlDbTable({ tableName, dataDictionaryName });
        if (dao) acSqlDbTable.dao = dao;
        if (request.post && request.post['row'] !== undefined) {
          const updateResult = await acSqlDbTable.updateRow({ row: request.post['row'] });
          response.setFromSqlDaoResult({ result: updateResult });
        } else if (request.post && request.post['rows'] !== undefined) {
          const updateRowsResult = await acSqlDbTable.updateRows({ rows: request.post['rows'] });
          response.setFromSqlDaoResult({ result: updateRowsResult });
        } else {
          response.message = 'parameters missing';
        }
      } else {
        response.setFailure({ message: `${tableName} does not exist in ${dataDictionaryName} data dictionary` });
      }
    } catch (ex: any) {
      response.setException({ exception: ex });
    }
    result.setFromResult({ result: response });
    result.webApiResponse = response;
    result.webResponse = response.toWebResponse();
    return result;
  }
}
