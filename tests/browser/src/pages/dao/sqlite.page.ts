import { AcElement } from "@autocode-ts/ac-runtime";
import { AcSqlConnection, AcSqlDatabase } from "@autocode-ts/ac-sql";
import { AcSqliteDao, initSqliteBrowserDao } from "@autocode-ts/ac-sqlite-dao-browser";
import { AcEnumSqlDatabaseType } from "@autocode-ts/autocode";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'dao-sqlite-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'SQLite (WASM) Test Page'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="container py-4 flex-fill overflow-auto">
        <p class="text-muted small">Testing in-memory SQLite (powered by <code>sql.js</code> and WASM) directly in your browser.</p>

        <div class="card shadow-sm mb-4">
          <div class="card-body">
             <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="card-title mb-0">Query Results</h5>
                <button class="btn btn-sm btn-primary" (click)="runTests()">Run Suite</button>
             </div>
             <div id="results" class="bg-dark text-light p-3 rounded" style="min-height: 200px; font-family: monospace; font-size: 0.85rem;">
                <div *for="let log of logs" class="mb-2">
                   <span class="text-info">[{{log.time}}]</span>
                   <span class="text-warning fw-bold ms-2">{{log.category}}:</span>
                   <pre class="ms-4 mt-1 opacity-75">{{log.data}}</pre>
                </div>
                <div *if="logs.length === 0" class="text-muted opacity-50 text-center py-5 italic">No logs yet. Click "Run Suite" to begin.</div>
             </div>
          </div>
        </div>

        <div class="alert alert-info border-0 shadow-sm d-flex gap-3">
           <i class="fa-solid fa-circle-info fs-4"></i>
           <div>
              <strong>Note:</strong> WASM binary is loaded from <code>assets/vendor/sql.js/sql-wasm.wasm</code>.
              Ensure the file is present in your public directory.
           </div>
        </div>
      </div>
    </div>
  `
})
export class DaoSqlitePage {
  logs: { time: string, category: string, data: string }[] = [];
  dropdownItems: IAppMenuItem[] = [{ label: 'Dao Config', isHeader: true }];

  async runTests() {
    this.logs = [];
    this.addLog('System', 'Initializing SQLite DAO...');

    try {
      initSqliteBrowserDao();
      AcSqlDatabase.databaseType = AcEnumSqlDatabaseType.Sqlite;
      const dao = new AcSqliteDao();
      dao.setSqlConnection({
        sqlConnection: AcSqlConnection.instanceFromJson({
          jsonData: { [AcSqlConnection.KeyConnectionDatabase]: 'test-db' }
        })
      });

      // Create Table
      await dao.executeStatement({
        statement: `
          CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, role TEXT);
          CREATE VIEW IF NOT EXISTS user_roles AS SELECT role FROM users;
        `
      });
      this.addLog('DDL', 'Table "users" and view "user_roles" created.');

      // Insert
      const insertRes = await dao.insertRow({ row: { id: 1, name: 'Antigravity', role: 'AI Assistant' }, tableName: 'users' });
      this.addLog('DML', `Inserted row ID: ${insertRes.rowsAffected}`);

      // Select
      const selectRes = await dao.getRows({ statement: 'SELECT * FROM users' });
      this.addLog('Query', JSON.stringify(selectRes.rows, null, 2));

      // Table Info
      const tables = await dao.getDatabaseTables();
      this.addLog('Metadata', `Tables found: ${tables.rows.map((t: any) => t.name).join(', ')}`);

    } catch (e: any) {
      this.addLog('Error', e.message || 'Unknown database error');
    }
  }

  private addLog(category: string, data: string) {
    this.logs.push({
      time: new Date().toLocaleTimeString(),
      category,
      data
    });
  }
}
