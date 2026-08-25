/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-prototype-builtins */
import { AcDataDictionary, AcDDSelectStatement, AcDDTable, AcEnumDDColumnFormat, AcEnumDDColumnType, AcEnumDDRowEvent, AcEnumDDRowOperation, AcEnumDDSelectMode } from "@autocode-ts/ac-data-dictionary";
import { AcSqlDbBase } from "./ac-sql-db-base";
import { AcEncryption, AcEnumSqlDatabaseType, AcResult, Autocode } from "@autocode-ts/autocode";
import { AcSqlDaoResult } from "../models/ac-sql-dao-result.model";
import { AcSqlEventHandlersRegistry } from "../annotations/ac-sql-event-handler";
import { dateFormat } from "@autocode-ts/ac-extensions";
import { IAcSqlEventArgs } from "src/ac-sql";

export class AcSqlDbTable extends AcSqlDbBase {
  tableName!: string;
  acDDTable!: AcDDTable;

  constructor({ tableName, dataDictionaryName = "default" }: { tableName: string, dataDictionaryName?: string }) {
    super({ dataDictionaryName });
    this.setTable({ tableName: tableName });
  }

  async cascadeDeleteRows({ rows }: { rows: Array<Record<string, any>> }): Promise<AcResult> {
    const result = new AcResult();
    try {
      this.logger.log(`Checking cascade delete for table ${this.tableName}`);
      const tableRelationships = AcDataDictionary.getTableRelationships({ tableName: this.tableName });
      this.logger.log(["Table relationships : ", tableRelationships]);

      for (const row of rows) {
        this.logger.log(["Checking cascade delete for table row :", row]);
        for (const acRelationship of tableRelationships) {
          let deleteTableName = "";
          let deleteColumnName = "";
          let deleteColumnValue: any;
          this.logger.log(["Checking cascade delete for relationship : ", acRelationship]);

          if (acRelationship.sourceTable === this.tableName && acRelationship.cascadeDeleteDestination) {
            deleteTableName = acRelationship.destinationTable;
            deleteColumnName = acRelationship.destinationColumn;
            deleteColumnValue = row[acRelationship.sourceColumn];
          }
          if (acRelationship.destinationTable === this.tableName && acRelationship.cascadeDeleteSource) {
            deleteTableName = acRelationship.sourceTable;
            deleteColumnName = acRelationship.sourceColumn;
            deleteColumnValue = row[acRelationship.destinationColumn];
          }

          this.logger.log(`Performing cascade delete with related table ${deleteTableName} and column ${deleteColumnName} with value ${deleteColumnValue}`);
          if (deleteTableName && deleteColumnName) {
            if (Autocode.validPrimaryKey({ value: deleteColumnValue })) {
              this.logger.log(`Deleting related rows for primary key value : ${deleteColumnValue}`);
              const deleteCondition = `${deleteColumnName} = :deleteColumnValue`;
              const deleteAcTable = new AcSqlDbTable({ tableName: deleteTableName, dataDictionaryName: this.dataDictionaryName });
              const deleteResult = await deleteAcTable.deleteRows({
                condition: deleteCondition,
                parameters: { ":deleteColumnValue": deleteColumnValue }
              });
              if (deleteResult.isSuccess()) {
                this.logger.log(`Cascade delete successful for ${deleteTableName}`);
              } else {
                return result.setFromResult({ result: deleteResult, message: `Error in cascade delete: ${deleteResult.message}`, logger: this.logger });
              }
            } else {
              this.logger.log("No value for cascade delete records");
            }
          } else {
            this.logger.log("No table & column for cascade delete records");
          }
        }
      }

      result.setSuccess();
    } catch (ex: any) {
      result.setException({ exception: ex, stackTrace: ex.stack, logger: this.logger, logException: true });
    }
    return result;
  }

  async checkAndSetAutoNumberValues({ row }: { row: Record<string, any> }): Promise<AcResult> {
    const result = new AcResult();
    try {
      const checkColumns: string[] = [];
      const autoNumberColumns: Record<string, Record<string, any>> = {};

      for (const tableColumn of this.acDDTable.tableColumns) {
        let setAutoNumber = true;
        if (tableColumn.isAutoNumber()) {
          if (row[tableColumn.columnName] != undefined && row[tableColumn.columnName] !== null && row[tableColumn.columnName].toString() !== "") {
            setAutoNumber = false;
          }
          if (setAutoNumber) {
            autoNumberColumns[tableColumn.columnName] = {
              prefix: tableColumn.getAutoNumberPrefix(),
              length: tableColumn.getAutoNumberLength(),
              prefix_length: tableColumn.getAutoNumberPrefixLength()
            };
          }
        }
        if (tableColumn.checkInAutoNumber() || tableColumn.checkInModify()) {
          checkColumns.push(tableColumn.columnName);
        }
      }

      if (Object.keys(autoNumberColumns).length > 0) {
        const selectColumnsList = Object.keys(autoNumberColumns);
        let checkCondition = "";
        const checkConditionValues: Record<string, any> = {};

        if (checkColumns.length > 0) {
          for (const checkColumn of checkColumns) {
            checkCondition += ` AND ${checkColumn} = @checkColumn${checkColumn}`;
            if (row[checkColumn] != undefined) {
              checkConditionValues[`@checkColumn${checkColumn}`] = row[checkColumn];
            }
          }
        }

        const getRowsStatements: string[] = [];
        for (const name of selectColumnsList) {
          let columnGetRows = "";
          if (this.databaseType === AcEnumSqlDatabaseType.MySql) {
            const meta = autoNumberColumns[name];
            columnGetRows =
              `SELECT CONCAT('{"${name}':',IF(MAX(CAST(SUBSTRING(${name}, ${meta["prefix_length"]} + 1) AS UNSIGNED)) IS NULL,0,MAX(CAST(SUBSTRING(${name}, ${meta["prefix_length"]} + 1) AS UNSIGNED))),'}') AS max_json FROM ${this.tableName} WHERE ${name} LIKE '${meta["prefix"]}%' ${checkCondition}`;
          }
          if (columnGetRows) {
            getRowsStatements.push(columnGetRows);
          }
        }

        if (getRowsStatements.length > 0) {
          const getRows = getRowsStatements.join(" UNION ");
          const selectResponse = await this.dao!.getRows({ statement: getRows, parameters: checkConditionValues });

          if (selectResponse.isSuccess()) {
            const rows = selectResponse.rows;
            for (const data of rows) {
              const maxJson = JSON.parse(data["max_json"]);
              const name = Object.keys(maxJson)[0];
              let lastRecordId = maxJson[name] ?? 0;
              lastRecordId++;
              const meta = autoNumberColumns[name];
              const autoNumberValue = meta["prefix"] + this.updateValueLengthWithChars({ value: lastRecordId.toString(), char: "0", length: meta["length"] });
              row[name] = autoNumberValue;
            }
          } else {
            return result.setFromResult({ result: selectResponse });
          }
        }
      }

      result.setSuccess({ value: row });
    } catch (ex: any) {
      result.setException({ exception: ex, stackTrace: ex.stack, logger: this.logger, logException: true });
    }
    return result;
  }

  async checkUniqueValues({ row }: { row: Record<string, any> }): Promise<AcResult> {
    const result = new AcResult();
    try {
      const parameters: Record<string, any> = {};
      const conditions: string[] = [];
      const modifyConditions: string[] = [];
      const uniqueConditions: string[] = [];
      const uniqueColumns: string[] = [];
      const primaryKeyColumnName = this.acDDTable.getPrimaryKeyColumnName();

      if (primaryKeyColumnName) {
        if (row[primaryKeyColumnName] != undefined && Autocode.validPrimaryKey({ value: row[primaryKeyColumnName] })) {
          conditions.push(`${primaryKeyColumnName} != @primaryKeyValue`);
          parameters["@primaryKeyValue"] = row[primaryKeyColumnName];
        }
      }

      for (const tableColumn of this.acDDTable.tableColumns) {

        const value = row[tableColumn.columnName];
        if (value) {
          if (tableColumn.checkInModify()) {
            modifyConditions.push(`${tableColumn.columnName} = @modify_${tableColumn.columnName}`);
            parameters[`@modify_${tableColumn.columnName}`] = value;
          }
          if (tableColumn.isUniqueKey()) {
            uniqueConditions.push(`${tableColumn.columnName} = @unique_${tableColumn.columnName}`);
            parameters[`@unique_${tableColumn.columnName}`] = value;
            uniqueColumns.push(tableColumn.columnName);
          }
        }

      }

      if (uniqueConditions.length > 0) {
        if (modifyConditions.length > 0) {
          conditions.push(...modifyConditions);
        }
        conditions.push(`(${uniqueConditions.join(" OR ")})`);
        if (conditions.length > 0) {
          this.logger.log("Searching for Unique Records getting Repeated");
          const selectResponse = await this.getRows({
            condition: conditions.join(" AND "),
            parameters: parameters,
            mode: AcEnumDDSelectMode.Count
          });
          if (selectResponse.isSuccess()) {
            const rowsCount = selectResponse.rowsCount();
            if (rowsCount > 0) {
              result.setFailure({ value: { unique_columns: uniqueColumns }, message: "Unique key violated" });
            } else {
              result.setSuccess();
            }
          } else {
            result.setFromResult({ result: selectResponse });
          }
        } else {
          result.setSuccess();
        }
      } else {
        this.logger.log("No unique conditions found");
        result.setSuccess();
      }
    } catch (ex: any) {
      result.setException({ exception: ex, stackTrace: ex.stack, logger: this.logger, logException: true });
    }
    return result;
  }

  async deleteRows({ condition = '', primaryKeyValue = '', parameters = {}, executeAfterEvent = true, executeBeforeEvent = true }: { condition?: string, primaryKeyValue?: string, parameters?: Record<string, any>, executeAfterEvent?: boolean, executeBeforeEvent?: boolean }): Promise<AcSqlDaoResult> {
    this.logger.log(`Deleting row with condition : ${condition} & primaryKeyValue ${primaryKeyValue}`);
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Delete });

    try {
      let continueOperation = true;
      const primaryKeyColumnName = this.acDDTable.getPrimaryKeyColumnName();

      if (condition === '') {
        if (primaryKeyValue && primaryKeyColumnName) {
          condition = `${primaryKeyColumnName} = :primaryKeyValue`;
          parameters = { ':primaryKeyValue': primaryKeyValue };
        } else {
          continueOperation = false;
          result.setFailure({ message: 'Primary key column or column value is missing for delete operation' });
        }
      } else {
        condition = `${primaryKeyColumnName} IN (SELECT ${primaryKeyColumnName} FROM ${this.tableName} WHERE ${condition})`;
      }

      if (condition === '' && continueOperation) {
        continueOperation = false;
        result.setFailure({ message: 'Empty condition in delete operation! Prevented accidental full-table deletion.' });
      }

      if (continueOperation && executeBeforeEvent) {
        this.logger.log("Executing before delete event");
        if (AcSqlEventHandlersRegistry[this.tableName] &&
          AcSqlEventHandlersRegistry[this.tableName].hasMethodForEvent({ event: AcEnumDDRowEvent.BeforeDelete })) {
          const args: IAcSqlEventArgs = {
            sqlDbTableInstance: this,
            condition,
            parameters,
          };
          const eventResult = await AcSqlEventHandlersRegistry[this.tableName].handleEvent({
            event: AcEnumDDRowEvent.BeforeDelete,
            args,
          });
          if (eventResult.isSuccess()) {
            if (eventResult.condition !== undefined) condition = eventResult.condition;
            if (eventResult.parameters !== undefined) parameters = eventResult.parameters;
          } else {
            continueOperation = false;
            result.setFromResult({ result: eventResult, message: "Aborted from before delete row events" });
          }
        }
      }

      if (continueOperation) {
        this.logger.log([
          '',
          '',
          `Performing delete operation on table ${this.tableName} with condition : ${condition} and parameters : `,
          parameters,
          '',
          ''
        ]);

        const getResult = await this.getRows({ condition, parameters });
        if (getResult.isSuccess()) {
          result.rows = getResult.rows;

          const setNullResult = await this.setValuesNullBeforeDelete({ condition, parameters });
          if (setNullResult.isFailure()) {
            this.logger.error(['Error setting null before delete', setNullResult]);
            continueOperation = false;
            result.setFromResult({ result: setNullResult });
          }

          if (continueOperation) {
            const cascadeDeleteResult = await this.cascadeDeleteRows({ rows: result.rows });
            if (cascadeDeleteResult.isFailure()) {
              this.logger.error(['Error cascade deleting row', cascadeDeleteResult]);
              continueOperation = false;
              result.setFromResult({ result: setNullResult, logger: this.logger });
            } else {
              this.logger.log(['Cascade delete result', cascadeDeleteResult]);
            }
          }

          if (continueOperation) {
            const deleteResult = await this.dao!.deleteRows({ tableName: this.tableName, condition, parameters });
            if (deleteResult.isSuccess()) {
              result.affectedRowsCount = deleteResult.affectedRowsCount;
              result.setSuccess({ message: `${deleteResult.affectedRowsCount} row(s) deleted successfully` });
            } else {
              result.setFromResult({ result: deleteResult });
              if (deleteResult.message.includes('foreign key')) {
                result.message = 'Cannot delete row! Foreign key constraint is preventing from deleting rows!';
              }
            }
          }
        } else {
          if (getResult.isFailure()) {
            result.setFromResult({ result: getResult, logger: this.logger });
          } else {
            result.setFailure({ message: "No rows found matching deletion condition" });
          }
        }
      }

      if (continueOperation && executeAfterEvent) {
        if (AcSqlEventHandlersRegistry[this.tableName] &&
          AcSqlEventHandlersRegistry[this.tableName].hasMethodForEvent({ event: AcEnumDDRowEvent.AfterDelete })) {
          const args: IAcSqlEventArgs = {
            sqlDbTableInstance: this,
            result,
          };
          const eventResult = await AcSqlEventHandlersRegistry[this.tableName].handleEvent({
            event: AcEnumDDRowEvent.AfterDelete,
            args,
          });
          if (eventResult.isSuccess()) {
            if (eventResult.result !== undefined) result.setFromResult({ result: eventResult.result });
          } else {
            result.setFromResult({ result: eventResult });
          }
        }
      }
    } catch (ex: any) {
      result.setException({ exception: ex, stackTrace: ex.stack, logger: this.logger, logException: true });
    }

    return result;
  }

  async formatValues({
    row,
    insertMode = false,
    executeBeforeEvent = true,
    executeAfterEvent = true,
  }: {
    row: Record<string, any>;
    insertMode?: boolean;
    executeBeforeEvent?: boolean;
    executeAfterEvent?: boolean;
  }): Promise<AcResult> {
    const result = new AcResult();
    let continueOperation = true;
    row = { ...row };

    const columnNames = this.acDDTable.getColumnNames();
    for (const key of Object.keys(row)) {
      if (columnNames.includes(key)) {
        if (row[key] == undefined) {
          row[key] = null;
        }
      }
      else {
        delete row[key];
      }
    }

    if (executeBeforeEvent) {
      if (AcSqlEventHandlersRegistry[this.tableName] &&
        AcSqlEventHandlersRegistry[this.tableName].hasMethodForEvent({ event: AcEnumDDRowEvent.BeforeFormat })) {
        const args: IAcSqlEventArgs = {
          sqlDbTableInstance: this,
          row,
        };
        const eventResult = await AcSqlEventHandlersRegistry[this.tableName].handleEvent({
          event: AcEnumDDRowEvent.BeforeFormat,
          args,
        });
        if (eventResult.isSuccess()) {
          if (eventResult.row !== undefined) row = eventResult.row;
        } else {
          result.setFromResult({ result: eventResult });
          continueOperation = false;
        }
      }
    }

    if (continueOperation) {
      for (const column of this.acDDTable.tableColumns) {
        if (row[column.columnName] != undefined || insertMode) {
          let setColumnValue = row[column.columnName] != undefined;
          const formats = column.getColumnFormats();
          const type: any = column.columnType;
          let value = row[column.columnName] ?? "";

          if (value === "" && column.getDefaultValue() != null && insertMode) {
            value = column.getDefaultValue();
            setColumnValue = true;
          }

          if (setColumnValue) {
            if ([AcEnumDDColumnType.Date, AcEnumDDColumnType.Datetime, AcEnumDDColumnType.String].includes(type)) {
              value = String(value).trim();

              if (type === AcEnumDDColumnType.String) {
                if (formats.includes(AcEnumDDColumnFormat.Lowercase)) {
                  value = value.toLowerCase();
                }
                if (formats.includes(AcEnumDDColumnFormat.Uppercase)) {
                  value = value.toUpperCase();
                }
                if (formats.includes(AcEnumDDColumnFormat.Encrypt)) {
                  value = AcEncryption.encrypt({ plainText: value });
                }
              } else if ([AcEnumDDColumnType.Datetime, AcEnumDDColumnType.Date].includes(type) && value !== "") {
                try {
                  const date = new Date(value);
                  const format = type === AcEnumDDColumnType.Datetime ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd';
                  value = dateFormat(date, format); // You must implement `formatDate()`
                } catch (ex) {
                  this.logger.warn(`Error while setting dateTimeValue for ${column.columnName} in table ${this.tableName} with value: ${value}`);
                }
              }
            } else if ([AcEnumDDColumnType.Json].includes(type)) {
              value = typeof value === 'string' ? value : JSON.stringify(value);
            } else if (type === AcEnumDDColumnType.Password) {
              value = AcEncryption.encrypt({ plainText: value });
            }

            row[column.columnName] = value;
          }
        }
      }
    }

    if (continueOperation && executeAfterEvent) {
      if (AcSqlEventHandlersRegistry[this.tableName] &&
        AcSqlEventHandlersRegistry[this.tableName].hasMethodForEvent({ event: AcEnumDDRowEvent.AfterFormat })) {
        const args: IAcSqlEventArgs = {
          sqlDbTableInstance: this,
          row,
        };
        const eventResult = await AcSqlEventHandlersRegistry[this.tableName].handleEvent({
          event: AcEnumDDRowEvent.AfterFormat,
          args,
        });
        if (eventResult.isSuccess()) {
          if (eventResult.row !== undefined) row = eventResult.row;
        } else {
          result.setFromResult({ result: eventResult });
          continueOperation = false;
        }
      }
    }

    if (continueOperation) {
      result.setSuccess({ value: row });
    }

    return result;
  }

  getColumnFormats({ getPasswordColumns = false }: { getPasswordColumns?: boolean } = {}): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    for (const column of this.acDDTable.tableColumns) {
      const formats: string[] = [];

      if ([AcEnumDDColumnType.Json].includes(column.columnType as any)) {
        formats.push(AcEnumDDColumnFormat.Json);
      } else if (column.columnType === AcEnumDDColumnType.Date || column.columnType === AcEnumDDColumnType.Datetime || column.columnType === AcEnumDDColumnType.Timestamp) {
        formats.push(AcEnumDDColumnFormat.Date);
      } else if (column.columnType === AcEnumDDColumnType.Password && !getPasswordColumns) {
        formats.push(AcEnumDDColumnFormat.HideColumn);
      } else if (column.columnType === AcEnumDDColumnType.Encrypted) {
        formats.push(AcEnumDDColumnFormat.Encrypt);
      }

      if (formats.length > 0) {
        result[column.columnName] = formats;
      }
    }

    return result;
  }

  getSelectStatement(includeColumns: string[] = [], excludeColumns: string[] = []): string {
    let result = `SELECT * FROM ${this.tableName}`;
    let columns: string[] = [];

    if (includeColumns.length === 0 && excludeColumns.length === 0) {
      columns = ['*'];
    } else {
      if (includeColumns.length > 0) {
        columns = includeColumns;
      } else if (excludeColumns.length > 0) {
        columns = excludeColumns; // same logic as provided
      }
    }

    result = `SELECT ${columns.join(', ')} FROM ${this.tableName}`;
    return result;
  }

  async getDistinctColumnValues({
    columnName,
    condition = '',
    orderBy = '',
    mode = AcEnumDDSelectMode.List,
    pageNumber = -1,
    pageSize = -1,
    parameters = {}
  }: {
    columnName: string,
    condition?: string,
    orderBy?: string,
    mode?: AcEnumDDSelectMode,
    pageNumber?: number,
    pageSize?: number,
    parameters?: Record<string, any>
  }): Promise<AcSqlDaoResult> {
    let result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Select });

    try {
      const actualOrderBy = orderBy !== '' ? orderBy : columnName;
      let selectStatement = this.getSelectStatement();
      selectStatement = `SELECT DISTINCT ${columnName} FROM (${selectStatement}) AS recordsList`;

      if (condition !== '') {
        condition += ` AND ${columnName} IS NOT NULL AND ${columnName} != ''`;
      } else {
        condition = `${columnName} IS NOT NULL AND ${columnName} != ''`;
      }

      this.logger.log(['', '', 'Executing getDistinctColumnValues select statement']);

      const sqlStatement = AcDDSelectStatement.generateSqlStatement({
        selectStatement,
        condition,
        orderBy: actualOrderBy,
        pageNumber,
        pageSize,
        databaseType: this.databaseType
      });

      result = await this.dao!.getRows({
        statement: sqlStatement,
        parameters,
        mode
      });

    } catch (ex) {
      const error = ex as Error;
      result.setException({
        exception: error,
        stackTrace: error.stack,
        logger: this.logger,
        logException: true
      });
    }

    return result;
  }

  getColumnDefinitionForStatement(columnName: string): string {
    let result = '';
    const acDDTableColumn = this.acDDTable.getColumn({ columnName })!;
    let columnType = acDDTableColumn.columnType;
    const defaultValue = acDDTableColumn.getDefaultValue();
    let size = acDDTableColumn.getSize();

    let isAutoIncrementSet = false;
    let isPrimaryKeySet = false;

    if (this.databaseType === AcEnumSqlDatabaseType.MySql) {
      columnType = 'TEXT';

      switch (acDDTableColumn.columnType) {
        case AcEnumDDColumnType.AutoIncrement:
          columnType = 'INT AUTO_INCREMENT PRIMARY KEY';
          isAutoIncrementSet = true;
          isPrimaryKeySet = true;
          break;
        case AcEnumDDColumnType.Blob:
          if (size > 0) {
            if (size <= 255) columnType = 'TINYBLOB';
            else if (size <= 65535) columnType = 'BLOB';
            else if (size <= 16777215) columnType = 'MEDIUMBLOB';
          } else {
            columnType = 'LONGBLOB';
          }
          break;
        case AcEnumDDColumnType.Date:
          columnType = 'DATE';
          break;
        case AcEnumDDColumnType.Datetime:
          columnType = 'DATETIME';
          break;
        case AcEnumDDColumnType.Double:
          columnType = 'DOUBLE';
          break;
        case AcEnumDDColumnType.Uuid:
          columnType = 'CHAR(36)';
          break;
        case AcEnumDDColumnType.Integer:
          if (size > 0) {
            if (size <= 255) columnType = 'TINYINT';
            else if (size <= 65535) columnType = 'SMALLINT';
            else if (size <= 16777215) columnType = 'MEDIUMINT';
          } else {
            columnType = 'INT';
          }
          break;
        case AcEnumDDColumnType.Json:
          columnType = 'LONGTEXT';
          break;
        case AcEnumDDColumnType.String:
          if (size === 0) size = 255;
          columnType = `VARCHAR(${size})`;
          break;
        case AcEnumDDColumnType.Text:
          if (size > 0) {
            if (size <= 255) columnType = 'TINYTEXT';
            else if (size <= 65535) columnType = 'TEXT';
            else if (size <= 16777215) columnType = 'MEDIUMTEXT';
          } else {
            columnType = 'LONGTEXT';
          }
          break;
        case AcEnumDDColumnType.Time:
          columnType = 'TIME';
          break;
        case AcEnumDDColumnType.Timestamp:
          columnType = 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP';
          break;
      }

      result = `${columnName} ${columnType}`;
      if (acDDTableColumn.isAutoIncrement() && !isAutoIncrementSet) result += ' AUTO_INCREMENT';
      if (acDDTableColumn.isPrimaryKey() && !isPrimaryKeySet) result += ' PRIMARY KEY';
      if (acDDTableColumn.isUniqueKey()) result += ' UNIQUE';
      if (acDDTableColumn.isNotNull()) result += ' NOT NULL';
      // if (defaultValue != null) result += ` DEFAULT ${defaultValue}`;
    }

    else if (this.databaseType === AcEnumSqlDatabaseType.Sqlite) {
      switch (acDDTableColumn.columnType) {
        case AcEnumDDColumnType.AutoIncrement:
          columnType = 'INTEGER PRIMARY KEY AUTOINCREMENT';
          isAutoIncrementSet = true;
          isPrimaryKeySet = true;
          break;
        case AcEnumDDColumnType.Double:
          columnType = 'REAL';
          break;
        case AcEnumDDColumnType.Blob:
          columnType = 'BLOB';
          break;
        case AcEnumDDColumnType.Integer:
          columnType = 'INTEGER';
          break;
        default:
          columnType = 'TEXT';
          break;
      }

      result = `${columnName} ${columnType}`;
      if (acDDTableColumn.isAutoIncrement() && !isAutoIncrementSet) result += ' AUTOINCREMENT';
      if (acDDTableColumn.isPrimaryKey() && !isPrimaryKeySet) result += ' PRIMARY KEY';
      if (acDDTableColumn.isUniqueKey()) result += ' UNIQUE';
      if (acDDTableColumn.isNotNull()) result += ' NOT NULL';
      // if (defaultValue != null) result += ` DEFAULT ${defaultValue}`;
    }

    return result;
  }

  async getRows({
    selectStatement = "",
    condition = "",
    orderBy = "",
    mode = AcEnumDDSelectMode.List,
    pageNumber = -1,
    pageSize = -1,
    parameters = {},
  }: {
    selectStatement?: string;
    condition?: string;
    orderBy?: string;
    mode?: AcEnumDDSelectMode;
    pageNumber?: number;
    pageSize?: number;
    parameters?: { [key: string]: any };
  } = {}): Promise<AcSqlDaoResult> {
    let result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Select });
    try {
      const actualSelectStatement = selectStatement !== "" ? selectStatement : this.getSelectStatement();
      const sqlStatement = AcDDSelectStatement.generateSqlStatement({
        selectStatement: actualSelectStatement,
        condition,
        orderBy,
        pageNumber,
        pageSize,
        databaseType: this.databaseType,
      });
      result = await this.dao!.getRows({
        statement: sqlStatement,
        parameters,
        mode,
        columnFormats: this.getColumnFormats(),
      });
    } catch (ex: any) {
      result.setException({
        exception: ex,
        stackTrace: ex.stack,
        logger: this.logger,
        logException: true,
      });
    }
    return result;
  }

  async getRowsFromAcDDStatement({
    acDDSelectStatement,
  }: {
    acDDSelectStatement: AcDDSelectStatement;
  }): Promise<AcSqlDaoResult> {
    let result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Select });
    let sqlStatement:any;
    let sqlParameters:any;
    try {
      sqlStatement = acDDSelectStatement.getSqlStatement();
      sqlParameters = acDDSelectStatement.parameters;

      result = await this.dao!.getRows({
        statement: sqlStatement,
        parameters: sqlParameters,
        columnFormats: this.getColumnFormats(),
      });

      if (result.rows.length > 0) {
        const countSqlStatement = acDDSelectStatement.getSqlStatement({ skipLimit: true }); // skipLimit = true
        const countResult = await this.dao!.getRows({
          statement: countSqlStatement,
          parameters: sqlParameters,
        });
        if (countResult.isSuccess()) {
          result.totalRows = countResult.totalRows;
        }
      } else {
        result.totalRows = 0;
      }
    } catch (ex: any) {
      console.error(sqlStatement,sqlParameters)
      result.setException({
        exception: ex,
        stackTrace: ex.stack,
        logger: this.logger,
        logException: true,
      });
    }
    return result;
  }

  async insertRow({
    row,
    validateResult,
    executeAfterEvent = true,
    executeBeforeEvent = true,
  }: {
    row: Record<string, any>,
    validateResult?: AcResult,
    executeAfterEvent?: boolean,
    executeBeforeEvent?: boolean,
  }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Insert });
    try {

      const columnNames = this.acDDTable.getColumnNames();
      row = { ...row };
      for (const key of Object.keys(row)) {
        if (!columnNames.includes(key)) {
          delete row[key];
        }
      }
      this.logger.log(["Inserting row with data : ", row]);
      let continueOperation = true;
      validateResult = validateResult ?? await this.validateValues({ row, isInsert: true });
      this.logger.log(["Validation result : ", validateResult]);
      if (validateResult.isSuccess()) {
        for (const column of this.acDDTable.tableColumns) {
          if (((column.columnType === AcEnumDDColumnType.Uuid || column.columnType === AcEnumDDColumnType.String) && column.isPrimaryKey()) && !(column.columnName in row)
          ) {
            row[column.columnName] = Autocode.uuid();
          }
        }

        const primaryKeyColumn = this.acDDTable.getPrimaryKeyColumnName();
        let primaryKeyValue = row[primaryKeyColumn];

        if (Object.keys(row).length > 0) {
          const formatResult = await this.formatValues({ row, insertMode: true });

          if (formatResult.isSuccess()) {
            row = formatResult.value;
          } else {
            continueOperation = false;
            result.setFromResult({ result: formatResult });
          }

          if (continueOperation && executeBeforeEvent) {
            this.logger.log("Executing before insert event");
            if (AcSqlEventHandlersRegistry[this.tableName] &&
              AcSqlEventHandlersRegistry[this.tableName].hasMethodForEvent({ event: AcEnumDDRowEvent.BeforeInsert })) {
              const args: IAcSqlEventArgs = {
                sqlDbTableInstance: this,
                row,
              };
              const eventResult = await AcSqlEventHandlersRegistry[this.tableName].handleEvent({
                event: AcEnumDDRowEvent.BeforeInsert,
                args,
              });
              if (eventResult.isSuccess()) {
                if (eventResult.row !== undefined) row = eventResult.row;
              } else {
                continueOperation = false;
                result.setFromResult({
                  result: eventResult,
                  message: "Aborted from before insert row events"
                });
              }
            }
          }

          if (continueOperation) {
            this.logger.log(["Inserting data : ", row]);
            const insertResult = await this.dao!.insertRow({ tableName: this.tableName, row });
            if (insertResult.isSuccess()) {
              this.logger.log(insertResult.toString());
              result.setSuccess({ message: "Row inserted successfully" });
              result.primaryKeyColumn = primaryKeyColumn;
              result.primaryKeyValue = primaryKeyValue;
              if (primaryKeyColumn.length > 0) {
                if (!Autocode.validPrimaryKey({ value: primaryKeyValue }) && Autocode.validPrimaryKey({ value: insertResult.lastInsertedId })) {
                  primaryKeyValue = insertResult.lastInsertedId;
                }
              }
              result.lastInsertedId = primaryKeyValue;

              this.logger.log("Getting inserted row from database");
              const condition = `${primaryKeyColumn} = :primaryKeyValue`;
              const parameters = { ":primaryKeyValue": primaryKeyValue };
              this.logger.log(["Select condition", condition, parameters]);

              const selectResult = await this.getRows({ condition, parameters });
              if (selectResult.isSuccess()) {
                if (selectResult.hasRows()) {
                  result.rows = selectResult.rows;
                }
              } else {
                result.message = `Error getting inserted row : ${selectResult.message}`;
              }

              if (continueOperation && executeAfterEvent) {
                if (AcSqlEventHandlersRegistry[this.tableName] &&
                  AcSqlEventHandlersRegistry[this.tableName].hasMethodForEvent({ event: AcEnumDDRowEvent.AfterInsert })) {
                  const args: IAcSqlEventArgs = {
                    sqlDbTableInstance: this,
                    result,
                  };
                  const eventResult = await AcSqlEventHandlersRegistry[this.tableName].handleEvent({
                    event: AcEnumDDRowEvent.AfterInsert,
                    args,
                  });
                  if (!eventResult.isSuccess()) {
                    result.setFromResult({ result: eventResult });
                    result.message = "DB_SUCCESS_BUT_EVENT_FAILURE: " + result.message;
                  }
                }
              }
            } else {
              result.setFromResult({ result: insertResult });
            }
          }
        } else {
          result.message = 'No values for new row';
        }
      } else {
        result.setFromResult({ result: validateResult });
      }
    } catch (ex: any) {
      result.setException({
        exception: ex,
        stackTrace: ex.stack,
        logger: this.logger,
        logException: true
      });
    }
    return result;
  }

  async insertRows({
    rows,
    executeAfterEvent = true,
    executeBeforeEvent = true,
  }: {
    rows: Record<string, any>[],
    executeAfterEvent?: boolean,
    executeBeforeEvent?: boolean,
  }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Insert });
    try {
      this.logger.log(["Inserting rows : ", rows]);
      let continueOperation = true;

      const columnNames = this.acDDTable.getColumnNames();
      const rowsToInsert: Record<string, any>[] = [];
      const primaryKeyValues: any[] = [];
      const primaryKeyColumn = this.acDDTable.getPrimaryKeyColumnName();

      for (let row of rows) {
        if (continueOperation) {
          const validateResult = await this.validateValues({ row, isInsert: true });
          if (validateResult.isSuccess()) {

            for (const column of this.acDDTable.tableColumns) {
              if (((column.columnType === AcEnumDDColumnType.Uuid || column.columnType === AcEnumDDColumnType.String) && column.isPrimaryKey()) &&
                !(column.columnName in row)
              ) {
                row[column.columnName] = Autocode.uuid();
              }
            }
            if (primaryKeyColumn in row) {
              primaryKeyValues.push(row[primaryKeyColumn]);
            }

            if (Object.keys(row).length > 0) {
              const formatResult = await this.formatValues({ row, insertMode: true });

              if (formatResult.isSuccess()) {
                row = formatResult.value;
              } else {
                continueOperation = false;
                result.setFromResult({ result: formatResult });
                break;
              }

              if (continueOperation && executeBeforeEvent) {
                this.logger.log("Executing before insert event");
                if (AcSqlEventHandlersRegistry[this.tableName] &&
                  AcSqlEventHandlersRegistry[this.tableName].hasMethodForEvent({ event: AcEnumDDRowEvent.BeforeInsert })) {
                  const args: IAcSqlEventArgs = {
                    sqlDbTableInstance: this,
                    row,
                  };
                  const eventResult = await AcSqlEventHandlersRegistry[this.tableName].handleEvent({
                    event: AcEnumDDRowEvent.BeforeInsert,
                    args,
                  });
                  if (eventResult.isSuccess()) {
                    if (eventResult.row !== undefined) row = eventResult.row;
                  } else {
                    continueOperation = false;
                    result.setFromResult({
                      result: eventResult,
                      message: "Aborted from before insert row events"
                    });
                  }
                }
              }
              if (continueOperation) {
                rowsToInsert.push(row);
              }
            } else {
              result.message = 'No values for new row';
            }
          } else {
            result.setFromResult({ result: validateResult });
          }
        }
      }

      if (continueOperation) {
        this.logger.log(`Inserting ${rows.length} rows`);
        const insertResult = await this.dao!.insertRows({
          tableName: this.tableName,
          rows: rowsToInsert,
        });
        if (insertResult.isSuccess()) {
          this.logger.log(insertResult.toString());
          result.lastInsertedIds = primaryKeyValues;

          this.logger.log("Getting inserted rows from database");
          const condition = `${primaryKeyColumn} IN (:primaryKeyValue)`;
          const parameters = { ":primaryKeyValue": primaryKeyValues };
          this.logger.log(["Select condition", condition, parameters]);

          const selectResult = await this.getRows({ condition, parameters });
          if (selectResult.isSuccess()) {
            if (selectResult.hasRows()) {
              result.rows = selectResult.rows;
            }
          } else {
            result.message = `Error getting inserted rows : ${selectResult.message}`;
          }

          if (continueOperation && executeAfterEvent) {
            for (const row of result.rows) {
              if (AcSqlEventHandlersRegistry[this.tableName] &&
                AcSqlEventHandlersRegistry[this.tableName].hasMethodForEvent({ event: AcEnumDDRowEvent.AfterInsert })) {
                const args: IAcSqlEventArgs = {
                  sqlDbTableInstance: this,
                  row,
                  result,
                };
                const eventResult = await AcSqlEventHandlersRegistry[this.tableName].handleEvent({
                  event: AcEnumDDRowEvent.AfterInsert,
                  args,
                });
                if (!eventResult.isSuccess()) {
                  continueOperation = false;
                  result.setFromResult({ result: eventResult });
                  break;
                }
              }
            }
          }
        } else {
          continueOperation = false;
          result.setFromResult({ result: insertResult });
        }
      }

      if (continueOperation) {
        result.setSuccess({ message: "Rows inserted successfully" });
      }
    } catch (ex: any) {
      result.setException({
        exception: ex,
        stackTrace: ex.stack,
        logger: this.logger,
        logException: true
      });
    }

    return result;
  }

  async saveRow({
    row,
    executeAfterEvent = true,
    executeBeforeEvent = true,
  }: {
    row: Record<string, any>,
    executeAfterEvent?: boolean,
    executeBeforeEvent?: boolean
  }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Unknown });
    try {
      let continueOperation = true;
      let operation: AcEnumDDRowOperation = AcEnumDDRowOperation.Unknown;
      const primaryKeyColumn = this.acDDTable.getPrimaryKeyColumnName();
      let primaryKeyValue = row[primaryKeyColumn];
      let condition = "";
      let conditionParameters: Record<string, any> = {};

      if (Autocode.validPrimaryKey({ value: primaryKeyValue })) {
        this.logger.log("Found primary key value so primary key value will be used");
        condition = `${primaryKeyColumn} = :primaryKeyValue`;
        conditionParameters[":primaryKeyValue"] = primaryKeyValue;
      } else {
        const checkInSaveColumns: Record<string, any> = {};
        for (const column of this.acDDTable.tableColumns) {
          if (column.checkInSave()) {
            checkInSaveColumns[column.columnName] = row[column.columnName];
          }
        }
        this.logger.log("Not found primary key value so checking for columns while saving");
        if (Object.keys(checkInSaveColumns).length > 0) {
          const checkConditions: string[] = [];
          conditionParameters = {};
          for (const key in checkInSaveColumns) {
            checkConditions.push(`${key} = :${key}`);
            conditionParameters[`:${key}`] = checkInSaveColumns[key];
          }
          condition = checkConditions.join(" AND ");
        }
      }

      if (condition) {
        const getResult = await this.getRows({ condition, parameters: conditionParameters });
        if (getResult.isSuccess()) {
          if (getResult.hasRows()) {
            const existingRecord = getResult.rows[0];
            if (primaryKeyColumn in existingRecord) {
              primaryKeyValue = existingRecord[primaryKeyColumn];
              row[primaryKeyColumn] = primaryKeyValue;
              operation = AcEnumDDRowOperation.Update;
            } else {
              continueOperation = false;
              result.message = "Row does not have primary key value";
            }
          } else {
            operation = AcEnumDDRowOperation.Insert;
          }
        } else {
          continueOperation = false;
          result.setFromResult({ result: getResult });
        }
      } else {
        operation = AcEnumDDRowOperation.Insert;
      }

      if (continueOperation && ![AcEnumDDRowOperation.Insert, AcEnumDDRowOperation.Update].includes(operation as any)) {
        result.message = "Invalid Operation";
        continueOperation = false;
      }

      if (continueOperation) {
        this.logger.log(`Executing operation ${operation} in save.`);
        if (executeBeforeEvent) {
          if (AcSqlEventHandlersRegistry[this.tableName] &&
            AcSqlEventHandlersRegistry[this.tableName].hasMethodForEvent({ event: AcEnumDDRowEvent.BeforeSave })) {
            const args: IAcSqlEventArgs = {
              sqlDbTableInstance: this,
              row,
            };
            const eventResult = await AcSqlEventHandlersRegistry[this.tableName].handleEvent({
              event: AcEnumDDRowEvent.BeforeSave,
              args,
            });
            if (eventResult.isSuccess()) {
              if (eventResult.row !== undefined) row = eventResult.row;
            } else {
              continueOperation = false;
              result.setFromResult({
                result: eventResult,
                message: "Aborted from before update row events",
                logger: this.logger,
              });
            }
          }
        }

        if (operation === AcEnumDDRowOperation.Insert) {
          result.setFromResult({ result: await this.insertRow({ row }) });
        } else if (operation === AcEnumDDRowOperation.Update) {
          result.setFromResult({ result: await this.updateRow({ row }) });
        }

        if (continueOperation && executeAfterEvent) {
          if (AcSqlEventHandlersRegistry[this.tableName] &&
            AcSqlEventHandlersRegistry[this.tableName].hasMethodForEvent({ event: AcEnumDDRowEvent.AfterSave })) {
            const args: IAcSqlEventArgs = {
              sqlDbTableInstance: this,
              result,
            };
            const eventResult = await AcSqlEventHandlersRegistry[this.tableName].handleEvent({
              event: AcEnumDDRowEvent.AfterSave,
              args,
            });
            if (!eventResult.isSuccess()) {
              result.setFromResult({ result: eventResult });
            }
          }
        }
      }
    } catch (ex) {
      result.setException({ exception: ex, logger: this.logger, logException: true });
    }
    return result;
  }

  async saveRows({
    rows,
    executeAfterEvent = true,
    executeBeforeEvent = true,
  }: {
    rows: Record<string, any>[],
    executeAfterEvent?: boolean,
    executeBeforeEvent?: boolean
  }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Unknown });
    try {
      let continueOperation = true;
      const primaryKeyColumn = this.acDDTable.getPrimaryKeyColumnName();
      const rowsToInsert: Record<string, any>[] = [];
      const rowsToUpdate: Record<string, any>[] = [];

      for (const row of rows) {
        if (!continueOperation) break;
        let primaryKeyValue = row[primaryKeyColumn];
        let condition = "";
        let conditionParameters: Record<string, any> = {};

        if (Autocode.validPrimaryKey({ value: primaryKeyValue })) {
          this.logger.log("Found primary key value so primary key value will be used");
          condition = `${primaryKeyColumn} = :primaryKeyValue`;
          conditionParameters[":primaryKeyValue"] = primaryKeyValue;
        } else {
          const checkInSaveColumns: Record<string, any> = {};
          for (const column of this.acDDTable.tableColumns) {
            if (column.checkInSave()) {
              checkInSaveColumns[column.columnName] = row[column.columnName];
            }
          }
          this.logger.log("Not found primary key value so checking for columns while saving");
          if (Object.keys(checkInSaveColumns).length > 0) {
            const checkConditions: string[] = [];
            conditionParameters = {};
            for (const key in checkInSaveColumns) {
              checkConditions.push(`${key} = :${key}`);
              conditionParameters[`:${key}`] = checkInSaveColumns[key];
            }
            condition = checkConditions.join(" AND ");
          } else {
            continueOperation = false;
            result.setFailure({ value: "No values to check in save", logger: this.logger });
          }
        }

        if (condition) {
          const getResult = await this.getRows({ condition, parameters: conditionParameters });
          if (getResult.isSuccess()) {
            if (getResult.hasRows()) {
              const existingRecord = getResult.rows[0];
              if (primaryKeyColumn in existingRecord) {
                primaryKeyValue = existingRecord[primaryKeyColumn];
                row[primaryKeyColumn] = primaryKeyValue;
                rowsToUpdate.push(row);
              } else {
                continueOperation = false;
                result.message = "Row does not have primary key value";
              }
            } else {
              rowsToInsert.push(row);
            }
          } else {
            continueOperation = false;
            result.setFromResult({ result: getResult });
          }
        } else {
          rowsToInsert.push(row);
        }
      }

      if (continueOperation && executeBeforeEvent) {
        for (const row of [...rowsToInsert, ...rowsToUpdate]) {
          if (AcSqlEventHandlersRegistry[this.tableName] &&
            AcSqlEventHandlersRegistry[this.tableName].hasMethodForEvent({ event: AcEnumDDRowEvent.BeforeSave })) {
            const args: IAcSqlEventArgs = {
              sqlDbTableInstance: this,
              row,
            };
            const eventResult = await AcSqlEventHandlersRegistry[this.tableName].handleEvent({
              event: AcEnumDDRowEvent.BeforeSave,
              args,
            });
            if (eventResult.isSuccess()) {
              if (eventResult.row !== undefined) Object.assign(row, eventResult.row);
            } else {
              continueOperation = false;
              result.setFromResult({
                result: eventResult,
                message: "Aborted from before save row events",
                logger: this.logger,
              });
              break;
            }
          }
        }
      }

      const combinedRows: Record<string, any>[] = [];
      if (continueOperation) {
        const insertResult = await this.insertRows({ rows: rowsToInsert });
        if (insertResult.isFailure()) {
          continueOperation = false;
          result.setFromResult({ result: insertResult });
        } else {
          combinedRows.push(...insertResult.rows);
        }
      }

      if (continueOperation) {
        const updateResult = await this.updateRows({ rows: rowsToUpdate });
        if (updateResult.isFailure()) {
          continueOperation = false;
          result.setFromResult({ result: updateResult });
        } else {
          combinedRows.push(...updateResult.rows);
        }
      }

      if (continueOperation) {
        result.setSuccess({ message: "Rows saved successfully" });
        if (result.rows.length > 0) {
          combinedRows.push(...result.rows);
        }
        result.rows = combinedRows;
      }
    } catch (ex) {
      result.setException({ exception: ex, logger: this.logger, logException: true });
    }
    return result;
  }

  setTable({ tableName, dataDictionaryName }: { tableName: string, dataDictionaryName?: string }) {
    this.tableName = tableName;
    if (dataDictionaryName == undefined) {
      dataDictionaryName = this.dataDictionaryName;
    }
    this.acDDTable = AcDDTable.getInstance({ tableName, dataDictionaryName });
  }

  async setValuesNullBeforeDelete({
    condition,
    parameters = {},
  }: {
    condition: string;
    parameters?: { [key: string]: any };
  }): Promise<AcResult> {
    const result = new AcResult();
    try {
      let continueOperation = true;
      this.logger.log(`Checking cascade delete for table ${this.tableName}`);
      const tableRelationships = AcDataDictionary.getTableRelationships({
        tableName: this.tableName,
        dataDictionaryName: this.dataDictionaryName,
      });

      for (const acRelationship of tableRelationships) {
        if (continueOperation) {
          if (acRelationship.destinationTable === this.tableName) {
            const column = this.acDDTable.getColumn({ columnName: acRelationship.destinationColumn });
            if (column && column.isSetValuesNullBeforeDelete()) {
              const setNullStatement = `UPDATE ${acRelationship.sourceTable} SET ${acRelationship.sourceColumn} = NULL WHERE ${acRelationship.sourceColumn} IN (SELECT ${acRelationship.destinationColumn} FROM ${this.tableName} WHERE ${condition})`;
              this.logger.log(["Executing set null statement", setNullStatement]);
              const setNullResult = await this.dao!.executeStatement({
                statement: setNullStatement,
                parameters,
              });
              if (setNullResult.isSuccess()) {
                this.logger.success(setNullResult.toJson());
              } else {
                continueOperation = false;
                result.setFromResult({ result: setNullResult });
              }
            }
          }
        }
      }

      if (continueOperation) {
        result.setSuccess();
      }
    } catch (ex: any) {
      result.setException({ exception: ex, stackTrace: ex.stack, logger: this.logger, logException: true });
    }
    return result;
  }

  async updateRow({
    row,
    condition = "",
    parameters = {},
    validateResult,
    executeAfterEvent = true,
    executeBeforeEvent = true,
  }: {
    row: { [key: string]: any };
    condition?: string;
    parameters?: { [key: string]: any };
    validateResult?: AcResult;
    executeAfterEvent?: boolean;
    executeBeforeEvent?: boolean;
  }): Promise<AcSqlDaoResult> {
    this.logger.log(["Updating row with data : ", row]);
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Update });
    try {


      let continueOperation = true;
      validateResult ??= await this.validateValues({ row, isInsert: false });

      if (validateResult.isSuccess() && continueOperation) {
        this.logger.log(["Validation result : ", validateResult]);
        const primaryKeyColumn = this.acDDTable.getPrimaryKeyColumnName();
        const primaryKeyValue = row[primaryKeyColumn];

        const formatResult = await this.formatValues({ row });

        if (formatResult.isSuccess()) {
          row = formatResult.value;
        } else {
          continueOperation = false;
          result.setFromResult({ result: formatResult });
        }

        this.logger.log(["Formatted data : ", row]);

        if (!condition && Autocode.validPrimaryKey({ value: primaryKeyValue })) {
          condition = `${primaryKeyColumn} = :primaryKeyValue`;
          parameters = { ":primaryKeyValue": primaryKeyValue };
        }

        if (condition === "") {
          continueOperation = false;
          result.setFailure({ message: "Empty condition in update operation! Prevented accidental full-table update." });
        }
        this.logger.log(["Update condition : " + condition, parameters]);

        if (Object.keys(row).length > 0) {
          if (continueOperation && executeBeforeEvent) {
            if (AcSqlEventHandlersRegistry[this.tableName] && AcSqlEventHandlersRegistry[this.tableName].hasMethodForEvent({ event: AcEnumDDRowEvent.BeforeUpdate })) {
            this.logger.log("Executing before update event");
              const args: IAcSqlEventArgs = {
                sqlDbTableInstance: this,
                row,
              };
              const eventResult = await AcSqlEventHandlersRegistry[this.tableName].handleEvent({
                event: AcEnumDDRowEvent.BeforeUpdate,
                args,
              });
              if (eventResult.isSuccess()) {
                this.logger.log(["Before event result", eventResult]);
                if (eventResult.row !== undefined) row = eventResult.row;
              } else {
                this.logger.error(["Before event result", eventResult]);
                continueOperation = false;
                result.setFromResult({ result: eventResult, message: "Aborted from before update row events" });
              }
            }
            else{
              this.logger.log("Registery does not have before update event");
            }
          } else {
            this.logger.log("Skipping before update event");
          }

          if (continueOperation) {
            const updateResult = await this.dao!.updateRow({
              tableName: this.tableName,
              row,
              condition,
              parameters,
            });
            console.log(updateResult);
            if (updateResult.isSuccess()) {
              result.setSuccess({ message: "Row updated successfully", logger: this.logger });
              result.primaryKeyColumn = primaryKeyColumn;
              result.primaryKeyValue = primaryKeyValue;

              const selectResult = await this.getRows({ condition, parameters });
              if (selectResult.isSuccess()) {
                result.rows = selectResult.rows;
              } else {
                this.logger.error([`Error getting updated row : ${selectResult.message}`, selectResult]);
                result.message = `Error getting updated row : ${selectResult.message}`;
              }

              if (continueOperation && executeAfterEvent) {
                if (AcSqlEventHandlersRegistry[this.tableName] &&
                  AcSqlEventHandlersRegistry[this.tableName].hasMethodForEvent({ event: AcEnumDDRowEvent.AfterUpdate })) {
                  const args: IAcSqlEventArgs = {
                    sqlDbTableInstance: this,
                    result,
                  };
                  const eventResult = await AcSqlEventHandlersRegistry[this.tableName].handleEvent({
                    event: AcEnumDDRowEvent.AfterUpdate,
                    args,
                  });
                  if (eventResult.isSuccess()) {
                    this.logger.log(["After event result", eventResult]);
                  } else {
                    this.logger.error(["After event result", eventResult]);
                    result.setFromResult({ result: eventResult });
                  }
                }
              }
            } else {
              result.setFromResult({ result: updateResult, logger: this.logger });
            }
          }
        } else {
          this.logger.log("No data to update");
          result.message = 'No values to update row';
        }
      } else {
        this.logger.error(["Validation result : ", validateResult]);
        result.setFromResult({ result: validateResult! });
      }
    } catch (ex: any) {
      result.setException({ exception: ex, stackTrace: ex.stack, logger: this.logger, logException: true });
    }
    return result;
  }

  async updateRows({
    rows,
    executeAfterEvent = true,
    executeBeforeEvent = true,
  }: {
    rows: { [key: string]: any }[];
    executeAfterEvent?: boolean;
    executeBeforeEvent?: boolean;
  }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Update });
    try {
      let continueOperation = true;
      const columnNames = this.acDDTable.getColumnNames();

      const rowsWithConditions: {
        row: { [key: string]: any };
        condition: string;
        parameters: { [key: string]: any };
      }[] = [];
      const primaryKeyValues: any[] = [];
      const primaryKeyColumn = this.acDDTable.getPrimaryKeyColumnName();

      for (let index = 0; index < rows.length && continueOperation; index++) {
        let row = rows[index];

        this.logger.log(["Updating row with data : ", row]);

        const validateResult = await this.validateValues({ row, isInsert: false });
        if (validateResult.isSuccess()) {
          this.logger.log(["Validation result : ", validateResult]);
          const primaryKeyValue = row[primaryKeyColumn];

          const formatResult = await this.formatValues({ row });

          if (formatResult.isSuccess()) {
            row = formatResult.value;
          } else {
            continueOperation = false;
            result.setFromResult({ result: formatResult });
            break;
          }

          this.logger.log(["Formatted data : ", row]);

          if (Object.keys(row).length > 0 && Autocode.validPrimaryKey({ value: primaryKeyValue })) {
            const condition = `${primaryKeyColumn} = :primaryKeyValue${index}`;
            const parameters = { [`:primaryKeyValue${index}`]: primaryKeyValue };
            primaryKeyValues.push(primaryKeyValue);
            rowsWithConditions.push({ row, condition, parameters });
          }
        } else {
          this.logger.error(["Validation result : ", validateResult]);
          result.setFromResult({ result: validateResult });
          continueOperation = false;
          break;
        }
      }

      if (continueOperation && rowsWithConditions.length > 0) {
        if (executeBeforeEvent) {
          for (const rowDetails of rowsWithConditions) {
            this.logger.log("Executing before update event");
            if (AcSqlEventHandlersRegistry[this.tableName] &&
              AcSqlEventHandlersRegistry[this.tableName].hasMethodForEvent({ event: AcEnumDDRowEvent.BeforeUpdate })) {
              const args: IAcSqlEventArgs = {
                sqlDbTableInstance: this,
                row: rowDetails.row,
              };
              const eventResult = await AcSqlEventHandlersRegistry[this.tableName].handleEvent({
                event: AcEnumDDRowEvent.BeforeUpdate,
                args,
              });
              if (!eventResult.isSuccess()) {
                this.logger.error(["Before event result", eventResult]);
                result.setFromResult({ result: eventResult, message: "Aborted from before update row events" });
                continueOperation = false;
                break;
              }
              if (eventResult.row !== undefined) rowDetails.row = eventResult.row;
            }
          }
        } else {
          this.logger.log("Skipping before update event");
        }

        if (continueOperation) {
          const updateResult = await this.dao!.updateRows({
            tableName: this.tableName,
            rowsWithConditions,
          });

          if (updateResult.isSuccess()) {
            result.setSuccess({ message: "Rows updated successfully", logger: this.logger });

            const selectResult = await this.getRows({
              condition: `${primaryKeyColumn} IN (@primaryKeyValues)`,
              parameters: { "@primaryKeyValues": primaryKeyValues },
            });

            if (selectResult.isSuccess()) {
              result.rows = selectResult.rows;
            } else {
              this.logger.error([`Error getting updated row : ${selectResult.message}`, selectResult]);
              result.message = `Error getting updated row : ${selectResult.message}`;
              continueOperation = false;
            }

            if (continueOperation && executeAfterEvent) {
              if (AcSqlEventHandlersRegistry[this.tableName] &&
                AcSqlEventHandlersRegistry[this.tableName].hasMethodForEvent({ event: AcEnumDDRowEvent.AfterUpdate })) {
                const args: IAcSqlEventArgs = {
                  sqlDbTableInstance: this,
                  result,
                };
                const eventResult = await AcSqlEventHandlersRegistry[this.tableName].handleEvent({
                  event: AcEnumDDRowEvent.AfterUpdate,
                  args,
                });
                if (!eventResult.isSuccess()) {
                  this.logger.error(["After event result", eventResult]);
                  result.setFromResult({ result: eventResult });
                } else {
                  this.logger.log(["After event result", eventResult]);
                }
              }
            }
          } else {
            result.setFromResult({ result: updateResult, logger: this.logger });
          }
        }
      } else if (rowsWithConditions.length === 0) {
        result.message = "Nothing to update";
      }
    } catch (ex: any) {
      result.setException({ exception: ex, stackTrace: ex.stack, logger: this.logger, logException: true });
    }
    return result;
  }

  async updateValueLengthWithChars({
    value,
    char,
    length,
  }: {
    value: string;
    char: string;
    length: number;
  }): Promise<string> {
    let result = value;
    if (length > 0) {
      const currentLength = value.length;
      if (currentLength < length) {
        result = char.repeat(length - currentLength) + value;
      }
    }
    return result;
  }

  async validateValues({
    row,
    isInsert = false,
  }: {
    row: { [key: string]: any };
    isInsert?: boolean;
  }): Promise<AcResult> {
    const result = new AcResult();
    try {
      let continueOperation = true;

      for (const column of this.acDDTable.tableColumns) {
        const value = row[column.columnName];
        if (continueOperation && column.isRequired() && isInsert) {
          let validRequired = true;
          if (row[column.columnName] == undefined) {
            validRequired = false;
          } else if ((typeof value === "string" && value.trim() === "") || value == null) {
            validRequired = false;
          }
          if (!validRequired) {
            continueOperation = false;
            result.setFailure({ message: `${column.columnName} column value is missing` });
          }
        }

        if (continueOperation) {
          if (column.columnType === AcEnumDDColumnType.Integer || column.columnType === AcEnumDDColumnType.Double) {
            if (value != null && typeof value !== "number") {
              result.setFailure({ message: `Invalid numeric value for column : ${column.columnName}` });
              break;
            }
          } else if (
            column.columnType === AcEnumDDColumnType.Date ||
            column.columnType === AcEnumDDColumnType.Datetime ||
            column.columnType === AcEnumDDColumnType.Time
          ) {
            if (value != null && value !== "NOW") {
              try {
                new Date(value);
              } catch (ex: any) {
                result.setException({
                  message: `Invalid datetime value for column : ${column.columnName}`,
                  exception: ex,
                  stackTrace: ex.stack,
                });
                break;
              }
            }
          }
        }
      }

      if (continueOperation) {
        const checkResponse = await this.checkUniqueValues({ row });
        if (checkResponse.isFailure()) {
          continueOperation = false;
          result.setFromResult({ result: checkResponse });
        }
      }

      if (continueOperation) {
        result.setSuccess();
      }
    } catch (ex: any) {
      result.setException({ exception: ex, stackTrace: ex.stack, logger: this.logger, logException: true });
    }
    return result;
  }


}
