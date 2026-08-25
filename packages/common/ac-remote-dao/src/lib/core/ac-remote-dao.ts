import { AcBaseSqlDao, AcSqlDaoResult } from "@autocode-ts/ac-sql";
import { AcDDTable, AcDDTableColumn, AcDDTrigger, AcDDView, AcDDViewColumn, AcEnumDDColumnFormat, AcEnumDDColumnProperty, AcEnumDDRowOperation, AcEnumDDSelectMode } from "@autocode-ts/ac-data-dictionary";
import { AcEncryption, AcResult } from "@autocode-ts/autocode";
export class AcRemoteDao extends AcBaseSqlDao {

  override async checkDatabaseExist(): Promise<AcResult> {
    const result = new AcResult();
    try {

      const db = await this.loadFromIndexedDB();
      if (db) {
        result.setSuccess({ value: true, message: "found database in indexedDB" });
      }
      else {
        result.setSuccess({ value: false, message: "did not find database in indexedDB" });
      }

    } catch (ex) {
      result.setException({ exception: ex });
    }
    return result;
  }

  override async checkTableExist({ tableName }: { tableName: string }): Promise<AcResult> {
    const result = new AcResult();
    try {
      const db = await this._getConnection();
      const rows = this._exec(
        db,
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        [tableName]
      );
      const exists = rows.length > 0;
      result.setSuccess({
        value: exists,
        message: exists ? "Table exists" : "Table does not exist",
      });
    } catch (ex) {
      result.setException({ exception: ex });
    }
    return result;
  }

  override async createDatabase(): Promise<AcResult> {
    const result = new AcResult();
    try {
      await this._getConnection();
      result.setSuccess({ value: true, message: "Database created" });
      await this.saveToIndexedDB();
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
    try {
      const db = await this._getConnection();
      const whereClause = condition ? `WHERE ${condition}` : "";
      const statement = `DELETE FROM ${tableName} ${whereClause}`;
      const { statement: updatedStatement, statementParametersMap } =
        this.setSqlStatementParameters({ statement, passedParameters: parameters });
      const stmt = db.prepare(updatedStatement);
      stmt.bind(Object.values(statementParametersMap!));
      let changes = 0;
      while (stmt.step()) changes++;
      stmt.free();
      result.affectedRowsCount = db.getRowsModified();
      result.setSuccess();
      await this.saveToIndexedDB();
    } catch (ex) {
      result.setException({ exception: ex });
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
    try {
      const db = await this._getConnection();
      db.exec("BEGIN");
      for (const statement of statements) {
        const { statement: updatedStatement, statementParametersMap } =
          this.setSqlStatementParameters({ statement, passedParameters: parameters });
        const stmt = db.prepare(updatedStatement);
        stmt.bind(Object.values(statementParametersMap!));
        while (stmt.step()) {
          //
        }
        stmt.free();
      }
      db.exec("COMMIT");
      result.setSuccess();
      await this.saveToIndexedDB();
    } catch (ex) {
      const db = await this._getConnection();
      db.exec("ROLLBACK");
      result.setException({ exception: ex });
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
    try {
      const db = await this._getConnection();
      const { statement: updatedStatement, statementParametersMap } =
        this.setSqlStatementParameters({ statement, passedParameters: parameters });
      const stmt = db.prepare(updatedStatement);
      stmt.bind(Object.values(statementParametersMap!));
      while (stmt.step()) {
        //
      }
      stmt.free();
      result.setSuccess();
      await this.saveToIndexedDB();
    } catch (ex) {
      result.setException({ exception: ex });
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

  override async getDatabaseTables(): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult();
    try {
      const db = await this._getConnection();
      const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
      while (stmt.step()) {
        const row = stmt.getAsObject();
        result.rows.push({
          [AcDDTable.KeyTableName]: row["name"],
        });
      }
      stmt.free();
      result.setSuccess();
    } catch (ex: any) {
      console.error(ex);
      result.setException({ exception: ex, stackTrace: ex.stack });
    }
    return result;
  }

  override async getDatabaseTriggers(): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult();
    try {
      const db = await this._getConnection();
      const stmt = db.prepare("SELECT name, tbl_name, sql FROM sqlite_master WHERE type='trigger'");
      while (stmt.step()) {
        const row = stmt.getAsObject();
        result.rows.push({
          [AcDDTrigger.KeyTriggerName]: row["name"],
          table: row["tbl_name"],
          definition: row["sql"],
        });
      }
      stmt.free();
      result.setSuccess();
    } catch (ex: any) {
      console.error(ex);
      result.setException({ exception: ex, stackTrace: ex.stack });
    }
    return result;
  }

  override async getDatabaseViews(): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult();
    try {
      const db = await this._getConnection();
      const stmt = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='view'");
      while (stmt.step()) {
        const row = stmt.getAsObject();
        result.rows.push({
          [AcDDView.KeyViewName]: row["name"],
          definition: row["sql"],
        });
      }
      stmt.free();
      result.setSuccess();
    } catch (ex: any) {
      console.error(ex);
      result.setException({ exception: ex, stackTrace: ex.stack });
    }
    return result;
  }

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
      const { statement: finalStatement, statementParametersMap } =
        this.setSqlStatementParameters({ statement: updatedStatement, passedParameters: parameters });
      const stmt = db.prepare(finalStatement);
      stmt.bind(Object.values(statementParametersMap!));
      while (stmt.step()) {
        const row = stmt.getAsObject();
        if (mode === AcEnumDDSelectMode.Count) {
          result.totalRows = row["records_count"] as number;
        } else {
          result.rows.push(this.formatRow({ row, columnFormats }));
        }
      }
      stmt.free();
      result.setSuccess();
    } catch (ex: any) {
      console.error(ex);
      result.setException({ exception: ex, stackTrace: ex.stack });
    }
    return result;
  }

  override async getTableColumns({ tableName }: { tableName: string }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Select });
    try {
      const db = await this._getConnection();
      const execResult = db.exec(`PRAGMA table_info(${tableName})`);

      if (execResult.length > 0) {
        const { columns, values } = execResult[0];
        for (const row of values) {
          const rowObj: Record<string, any> = {};
          columns.forEach((col, idx) => {
            rowObj[col] = row[idx];
          });

          const properties: Record<string, any> = {};
          if (rowObj["notnull"] === 1) {
            properties[AcEnumDDColumnProperty.NotNull] = true;
          }
          if (rowObj["pk"] === 1) {
            properties[AcEnumDDColumnProperty.PrimaryKey] = true;
          }
          if (rowObj["dflt_value"] !== null) {
            properties[AcEnumDDColumnProperty.DefaultValue] = rowObj["dflt_value"];
          }

          result.rows.push({
            [AcDDTableColumn.KeyColumnName]: rowObj["name"],
            [AcDDTableColumn.KeyColumnType]: rowObj["type"],
            [AcDDTableColumn.KeyColumnProperties]: properties,
          });
        }
      }

      result.setSuccess();
    } catch (ex: any) {
      console.error(ex);
      result.setException({ exception: ex, stackTrace: ex.stack });
    }
    return result;
  }

  override async getViewColumns({ viewName }: { viewName: string }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Select });
    try {
      const db = await this._getConnection();
      const execResult = db.exec(`PRAGMA table_info(${viewName})`);

      if (execResult.length > 0) {
        const { columns, values } = execResult[0];
        for (const row of values) {
          const rowObj: Record<string, any> = {};
          columns.forEach((col, idx) => {
            rowObj[col] = row[idx];
          });

          const properties: Record<string, any> = {};
          if (rowObj["notnull"] === 1) {
            properties[AcEnumDDColumnProperty.NotNull] = true;
          }
          if (rowObj["pk"] === 1) {
            properties[AcEnumDDColumnProperty.PrimaryKey] = true;
          }
          if (rowObj["dflt_value"] !== null) {
            properties[AcEnumDDColumnProperty.DefaultValue] = rowObj["dflt_value"];
          }

          result.rows.push({
            [AcDDViewColumn.KeyColumnName]: rowObj["name"],
            [AcDDViewColumn.KeyColumnType]: rowObj["type"],
            [AcDDViewColumn.KeyColumnProperties]: properties,
          });
        }
      }

      result.setSuccess();
    } catch (ex: any) {
      console.error(ex);
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
      const stmt = db.prepare(sql);
      stmt.bind(columns.map((c) => row[c]));
      stmt.step();  // <-- actually executes
      stmt.free();

      // get last insert ID
      const idRes = db.exec("SELECT last_insert_rowid() AS id");
      result.lastInsertedId = idRes[0]?.values?.[0]?.[0] ?? 0;

      result.setSuccess();
      await this.saveToIndexedDB();
    } catch (ex: any) {
      console.error(ex);
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
    let db: Database | null = null;

    try {
      db = await this._getConnection();

      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        const placeholders = columns.map(() => "?").join(", ");
        const sql = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${placeholders})`;

        db.exec("BEGIN");

        const stmt = db.prepare(sql);
        for (const row of rows) {
          stmt.bind(columns.map((c) => row[c]));
          stmt.step();
          stmt.reset(); // important for reuse
        }
        stmt.free();

        db.exec("COMMIT");

        result.setSuccess();
        await this.saveToIndexedDB();
      } else {
        result.setSuccess({ value: true, message: "No rows to insert." });
      }
    } catch (ex: any) {
      console.error(ex);
      if (db) {
        try {
          db.exec("ROLLBACK");
        } catch {
          //
        }
      }
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
      const setValues = Object.keys(row).map((key) => `${key} = ?`).join(", ");
      const sql = `UPDATE ${tableName} SET ${setValues} ${condition ? "WHERE " + condition : ""}`;
      const values = [...Object.values(row), ...Object.values(parameters)];
      this._exec(db, sql, values);
      result.affectedRowsCount = db.getRowsModified();
      result.setSuccess();
      await this.saveToIndexedDB();
    } catch (ex: any) {
      console.error(ex);
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
    try {
      const db = await this._getConnection();
      db.exec("BEGIN");
      for (const rowWithCondition of rowsWithConditions) {
        if ("row" in rowWithCondition && "condition" in rowWithCondition) {
          const row = rowWithCondition["row"] as Record<string, any>;
          const condition = rowWithCondition["condition"] as string;
          const conditionParameters = rowWithCondition["parameters"] ?? {};
          const setValues = Object.keys(row).map((key) => `${key} = ?`).join(", ");
          const sql = `UPDATE ${tableName} SET ${setValues} WHERE ${condition}`;
          const values = [...Object.values(row), ...Object.values(conditionParameters)];
          this._exec(db, sql, values);
          result.affectedRowsCount = (result.affectedRowsCount ?? 0) + db.getRowsModified();
        }
      }
      db.exec("COMMIT");
      result.setSuccess();
      await this.saveToIndexedDB();
    } catch (ex: any) {
      console.error(ex);
      const db = await this._getConnection();
      db.exec("ROLLBACK");
      result.setException({ exception: ex, stackTrace: ex.stack });
    }
    return result;
  }

  private loadFromIndexedDB(): Promise<Database | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("sqljs_dbs", 1);

      request.onupgradeneeded = () => {
        // Make sure the store exists
        if (!request.result.objectStoreNames.contains("databases")) {
          request.result.createObjectStore("databases");
        }
      };

      request.onsuccess = () => {
        const db = request.result; // <- keep a reference
        const tx = db.transaction("databases", "readonly");
        const store = tx.objectStore("databases");

        const getReq = store.get(this.sqlConnection.database);

        getReq.onsuccess = async () => {
          if (!this.SQL) {
            this.SQL = await initSqlJs({
              locateFile: file => AcSqliteDao.wasmUrl
            });
          }
          if (getReq.result) {
            const data = new Uint8Array(getReq.result as ArrayBuffer);
            resolve(new this.SQL.Database(data));
          } else {
            resolve(null);
          }
        };

        getReq.onerror = () => reject(getReq.error);

        tx.oncomplete = () => {
          db.close(); // ✅ always close to avoid "database is locked" errors
        };
      };

      request.onerror = () => reject(request.error);
    });
  }


  private saveToIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("sqljs_dbs", 1);

      request.onupgradeneeded = () => {
        const dbInstance = request.result;
        if (!dbInstance.objectStoreNames.contains("databases")) {
          dbInstance.createObjectStore("databases");
        }
      };

      request.onsuccess = () => {
        const dbInstance = request.result;
        const tx = dbInstance.transaction("databases", "readwrite");
        const store = tx.objectStore("databases");
        if (this.sqlConnection.database) {
          // Store ArrayBuffer instead of Uint8Array
          const putReq = store.put(this.db.export().buffer, this.sqlConnection.database);

          putReq.onsuccess = () => {
            resolve();
          };
          putReq.onerror = () => {
            reject(putReq.error);
          };
        }


      };

      request.onerror = () => reject(request.error);
    });
  }

  downloadDatabaseFile() {
    // Export database as Uint8Array
    const data:any = this.db.export();

    // Create a blob with correct MIME type
    const blob = new Blob([data], { type: "application/octet-stream" });

    AcBrowser.downloadFile({ content: blob, filename: `${this.sqlConnection.database}.sqlite` });
  }
}
