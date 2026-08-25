/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-prototype-builtins */
// ac-sqlite-dao.ts

import fs from "fs";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { AcBaseSqlDao, AcSqlDaoResult } from "@autocode-ts/ac-sql";
import { AcDDTable, AcDDTableColumn, AcDDTrigger, AcDDView, AcDDViewColumn, AcEnumDDColumnFormat, AcEnumDDColumnProperty, AcEnumDDRowOperation, AcEnumDDSelectMode } from "@autocode-ts/ac-data-dictionary";
import { AcEncryption, AcResult } from "@autocode-ts/autocode";

export class AcSqliteDao extends AcBaseSqlDao {
  private async _getConnection(): Promise<Database> {
    const db = await open({
      filename: this.sqlConnection.database, // in sqlite, "database" is just a file path
      driver: sqlite3.Database,
    });
    return db;
  }

  // No concept of "connection without database" in sqlite
  private async _getConnectionWithoutDatabase(): Promise<Database> {
    return this._getConnection();
  }

  override async checkDatabaseExist(): Promise<AcResult> {
    const result = new AcResult();
    try {
      // Check if file exists
      const exists = fs.existsSync(this.sqlConnection.database);
      result.setSuccess({
        value: exists,
        message: exists ? "Database exists" : "Database does not exist",
      });
    } catch (ex) {
      result.setException({ exception: ex });
    }
    return result;
  }

  override async checkTableExist({ tableName }: { tableName: string }): Promise<AcResult> {
    const result = new AcResult();
    let db: Database | null = null;
    try {
      db = await this._getConnection();
      const row = await db.get(
        `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
        [tableName]
      );
      const exists = !!row;
      result.setSuccess({
        value: exists,
        message: exists ? "Table exists" : "Table does not exist",
      });
    } catch (ex) {
      result.setException({ exception: ex });
    } finally {
      if (db) await db.close();
    }
    return result;
  }

  override async createDatabase(): Promise<AcResult> {
    const result = new AcResult();
    try {
      // Opening sqlite file auto-creates it if not exists
      await this._getConnection();
      result.setSuccess({ value: true, message: "Database created (sqlite file)" });
    } catch (ex) {
      result.setException({ exception: ex });
    }
    return result;
  }

  override async deleteRows({
    tableName,
    condition = "",
    parameters = {},
  }: {
    tableName: string;
    condition?: string;
    parameters?: Record<string, any>;
  }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Delete });
    let db: Database | null = null;
    try {
      db = await this._getConnection();
      const whereClause = condition ? `WHERE ${condition}` : "";
      const statement = `DELETE FROM ${tableName} ${whereClause}`;
      const { statement: updatedStatement, statementParametersList } =
        this.setSqlStatementParameters({
          statement,
          passedParameters: parameters,
          returnMap: false,
        });
      const res = await db.run(updatedStatement, statementParametersList!);
      result.affectedRowsCount = res.changes ?? 0;
      result.setSuccess();
    } catch (ex) {
      result.setException({ exception: ex });
    } finally {
      if (db) await db.close();
    }
    return result;
  }

  override async executeMultipleSqlStatements({
    statements,
    parameters = {},
  }: {
    statements: string[];
    parameters?: Record<string, any>;
  }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult();
    let db: Database | null = null;
    try {
      db = await this._getConnection();
      await db.exec("BEGIN TRANSACTION");
      for (const statement of statements) {
        const { statement: updatedStatement, statementParametersList } =
          this.setSqlStatementParameters({
            statement,
            passedParameters: parameters,
            returnMap: false,
          });
        await db.run(updatedStatement, statementParametersList!);
      }
      await db.exec("COMMIT");
      result.setSuccess();
    } catch (ex) {
      if (db) await db.exec("ROLLBACK");
      result.setException({ exception: ex });
    } finally {
      if (db) await db.close();
    }
    return result;
  }

  override async executeStatement({
    statement,
    operation = AcEnumDDRowOperation.Unknown,
    parameters = {},
  }: {
    statement: string;
    operation?: string;
    parameters?: Record<string, any>;
  }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation });
    let db: Database | null = null;
    try {
      db = await this._getConnection();
      const { statement: updatedStatement, statementParametersList } =
        this.setSqlStatementParameters({
          statement,
          passedParameters: parameters,
          returnMap: false,
        });
      await db.run(updatedStatement, statementParametersList!);
      result.setSuccess();
    } catch (ex) {
      result.setException({ exception: ex });
    } finally {
      if (db) await db.close();
    }
    return result;
  }

  override formatRow({
    row,
    columnFormats = {},
  }: {
    row: Record<string, any>;
    columnFormats?: Record<string, string[]>;
  }): Record<string, any> {
    const formattedRow = { ...row };
    for (const key in columnFormats) {
      const formats = columnFormats[key];
      if (formattedRow[key] != undefined) {
        let value = formattedRow[key];
        if (typeof value === "string") {
          if (formats.includes(AcEnumDDColumnFormat.Encrypt)) {
            value = AcEncryption.decrypt({ encryptedText: value });
          }
          if (formats.includes(AcEnumDDColumnFormat.Json)) {
            try {
              value = JSON.parse(value);
            } catch {
              value = null;
            }
          }
        }
        if (formats.includes(AcEnumDDColumnFormat.HideColumn)) {
          delete formattedRow[key];
        } else {
          formattedRow[key] = value;
        }
      }
    }
    return formattedRow;
  }

  override async getConnectionObject({ includeDatabase = true }: { includeDatabase?: boolean }): Promise<any> {
    return await this._getConnection();
  }

  // --- Metadata methods (SQLite does not support FUNCTIONS/PROCEDURES like MySQL) ---
  override async getDatabaseFunctions(): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult();
    result.setSuccess({ value: true, message: "SQLite does not support functions metadata" });
    return result;
  }

  override async getDatabaseStoredProcedures(): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult();
    result.setSuccess({ value: true, message: "SQLite does not support stored procedures" });
    return result;
  }

  override async getDatabaseTables(): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult();
    let db: Database | null = null;
    try {
      db = await this._getConnection();
      const rows = await db.all(`SELECT name FROM sqlite_master WHERE type='table'`);
      for (const row of rows) {
        result.rows.push({ [AcDDTable.KeyTableName]: row["name"] });
      }
      result.setSuccess();
    } catch (ex: any) {
      result.setException({ exception: ex });
    } finally {
      if (db) await db.close();
    }
    return result;
  }

  override async getDatabaseTriggers(): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult();
    let db: Database | null = null;
    try {
      db = await this._getConnection();
      const rows = await db.all(`SELECT name, tbl_name, sql FROM sqlite_master WHERE type='trigger'`);
      for (const row of rows) {
        result.rows.push({
          [AcDDTrigger.KeyTriggerName]: row["name"],
        });
      }
      result.setSuccess();
    } catch (ex: any) {
      result.setException({ exception: ex });
    } finally {
      if (db) await db.close();
    }
    return result;
  }

  override async getDatabaseViews(): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult();
    let db: Database | null = null;
    try {
      db = await this._getConnection();
      const rows = await db.all(`SELECT name FROM sqlite_master WHERE type='view'`);
      for (const row of rows) {
        result.rows.push({
          [AcDDView.KeyViewName]: row["name"],
        });
      }
      result.setSuccess();
    } catch (ex: any) {
      result.setException({ exception: ex });
    } finally {
      if (db) await db.close();
    }
    return result;
  }

  // --- Similar rewrites for getRows, getTableColumns, insertRow, insertRows, updateRow, updateRows ---
  // (use `db.all`, `db.get`, `db.run` accordingly, with sqlite_master/PRAGMA queries for schema info)

    override async getRows({
    statement,
    condition = "",
    parameters = {},
    mode = AcEnumDDSelectMode.List,
    columnFormats = {},
  }: {
    statement: string;
    condition?: string;
    parameters?: Record<string, any>;
    mode?: string;
    columnFormats?: Record<string, string[]>;
  }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Select });
    try {
      const db = await this._getConnection();
      let updatedStatement = statement;
      if (mode === AcEnumDDSelectMode.Count) {
        updatedStatement = `SELECT COUNT(*) AS records_count FROM (${statement}) AS records_list`;
      }
      if (condition) {
        updatedStatement += ` WHERE ${condition}`;
      }
      const { statement: finalStatement, statementParametersList } = this.setSqlStatementParameters({
        statement: updatedStatement,
        passedParameters: parameters,
        returnMap: false,
      });
      if (mode === AcEnumDDSelectMode.Count) {
        const row: any = await db.get(finalStatement, statementParametersList);
        result.totalRows = row?.records_count ?? 0;
      } else {
        const rows: any[] = await db.all(finalStatement, statementParametersList);
        for (const row of rows) {
          result.rows.push(this.formatRow({ row, columnFormats }));
        }
      }
      result.setSuccess();
    } catch (ex: any) {
      result.setException({ exception: ex, stackTrace: ex.stack });
    }
    return result;
  }

  override async getTableColumns({ tableName }: { tableName: string }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Select });
    try {
      const db = await this._getConnection();
      const rows: any[] = await db.all(`PRAGMA table_info(${tableName})`);
      for (const row of rows) {
        const properties: Record<string, any> = {};
        if (row.notnull === 1) {
          properties[AcEnumDDColumnProperty.NotNull] = true;
        }
        if (row.pk === 1) {
          properties[AcEnumDDColumnProperty.PrimaryKey] = true;
        }
        if (row.dflt_value !== null) {
          properties[AcEnumDDColumnProperty.DefaultValue] = row.dflt_value;
        }
        result.rows.push({
          [AcDDTableColumn.KeyColumnName]: row.name,
          [AcDDTableColumn.KeyColumnType]: row.type,
          [AcDDTableColumn.KeyColumnProperties]: properties,
        });
      }
      result.setSuccess();
    } catch (ex: any) {
      result.setException({ exception: ex, stackTrace: ex.stack });
    }
    return result;
  }

  override async getViewColumns({ viewName }: { viewName: string }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Select });
    try {
      // SQLite exposes view columns via PRAGMA table_info as well
      const db = await this._getConnection();
      const rows: any[] = await db.all(`PRAGMA table_info(${viewName})`);
      for (const row of rows) {
        const properties: Record<string, any> = {};
        if (row.notnull === 1) {
          properties[AcEnumDDColumnProperty.NotNull] = true;
        }
        if (row.pk === 1) {
          properties[AcEnumDDColumnProperty.PrimaryKey] = true;
        }
        if (row.dflt_value !== null) {
          properties[AcEnumDDColumnProperty.DefaultValue] = row.dflt_value;
        }
        result.rows.push({
          [AcDDViewColumn.KeyColumnName]: row.name,
          [AcDDViewColumn.KeyColumnType]: row.type,
          [AcDDViewColumn.KeyColumnProperties]: properties,
        });
      }
      result.setSuccess();
    } catch (ex: any) {
      result.setException({ exception: ex, stackTrace: ex.stack });
    }
    return result;
  }

  override async insertRow({
    tableName,
    row,
  }: {
    tableName: string;
    row: Record<string, any>;
  }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Insert });
    try {
      const db = await this._getConnection();
      const columns = Object.keys(row);
      const placeholders = columns.map(() => "?").join(", ");
      const sql = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${placeholders})`;
      const values = columns.map(c => row[c]);
      const insertResult = await db.run(sql, values);
      result.lastInsertedId = insertResult.lastID;
      result.setSuccess();
    } catch (ex:any) {
      result.setException({ exception: ex, stackTrace: ex.stack });
    }
    return result;
  }

  override async insertRows({
    tableName,
    rows,
  }: {
    tableName: string;
    rows: Array<Record<string, any>>;
  }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Insert });
    const db = await this._getConnection();
    try {
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        const placeholders = columns.map(() => "?").join(", ");
        const sql = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${placeholders})`;
        await db.exec("BEGIN");
        for (const row of rows) {
          const values = columns.map(c => row[c]);
          await db.run(sql, values);
        }
        await db.exec("COMMIT");
        result.setSuccess();
      } else {
        result.setSuccess({ value: true, message: "No rows to insert." });
      }
    } catch (ex:any) {
      await db.exec("ROLLBACK");
      result.setException({ exception: ex, stackTrace: ex.stack });
    }
    return result;
  }

  override async updateRow({
    tableName,
    row,
    condition = "",
    parameters = {},
  }: {
    tableName: string;
    row: Record<string, any>;
    condition?: string;
    parameters?: Record<string, any>;
  }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Update });
    try {

      const db = await this._getConnection();
      const columns = Object.keys(row);
      const setValues = columns.map((key) => `${key} = ?`).join(", ");

      const { statement: updatedCondition, statementParametersList: conditionParams } =
        this.setSqlStatementParameters({
          statement: condition,
          passedParameters: parameters,
          returnMap: false,
        });

      const sql = `UPDATE ${tableName} SET ${setValues} ${updatedCondition ? "WHERE " + updatedCondition : ""}`;
      const values = [...columns.map(c => row[c]), ...(conditionParams ?? [])];

      const updateResult = await db.run(sql, values);
      result.affectedRowsCount = updateResult.changes;
      result.setSuccess();
    } catch (ex:any) {
      result.setException({ exception: ex, stackTrace: ex.stack });
    }
    return result;
  }

  override async updateRows({
    tableName,
    rowsWithConditions,
  }: {
    tableName: string;
    rowsWithConditions: Array<Record<string, any>>;
  }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Update });
    const db = await this._getConnection();
    try {
      await db.exec("BEGIN");
      for (const rowWithCondition of rowsWithConditions) {
        if ("row" in rowWithCondition && "condition" in rowWithCondition) {
          const row = rowWithCondition["row"] as Record<string, any>;
          const condition = rowWithCondition["condition"] as string;
          const conditionParameters = rowWithCondition["parameters"] ?? {};

          const columns = Object.keys(row);
          const setValues = columns.map((key) => `${key} = ?`).join(", ");

          const { statement: updatedCondition, statementParametersList: conditionParams } =
            this.setSqlStatementParameters({
              statement: condition,
              passedParameters: conditionParameters,
              returnMap: false,
            });

          const sql = `UPDATE ${tableName} SET ${setValues} WHERE ${updatedCondition}`;
          const values = [...columns.map(c => row[c]), ...(conditionParams ?? [])];

          const updateResult = await db.run(sql, values);
          result.affectedRowsCount = (result.affectedRowsCount ?? 0) + (updateResult.changes ?? 0);
        }
      }
      await db.exec("COMMIT");
      result.setSuccess();
    } catch (ex:any) {
      await db.exec("ROLLBACK");
      result.setException({ exception: ex, stackTrace: ex.stack });
    }
    return result;
  }


}
