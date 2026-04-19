/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcSqlConnection, AcSqlDaoResult, AcSqlDatabase } from "@autocode-ts/ac-sql";
import { AcSqliteDao, initSqliteBrowserDao } from "@autocode-ts/ac-sqlite-dao-browser"; // adjust import if needed
import { AcEnumSqlDatabaseType } from "@autocode-ts/autocode";

export class SQLiteDaoTestPage extends HTMLElement {
  private dao!: AcSqliteDao;

  async connectedCallback() {
    this.innerHTML = `
      <div class="container py-4">
        <h2 class="mb-4">SQLiteDao Test Page</h2>
        <p>This page demonstrates <code>SQLiteDao</code> methods using an in-memory sql.js database.</p>

        <div id="sqlite-test-results" class="border rounded p-3 bg-light">
          <p class="text-muted"><em>Running tests...</em></p>
        </div>

        <hr class="my-5">
        <p class="text-muted"><small>Backed by <code>sql.js</code> running fully in the browser. No server required.</small></p>
      </div>
    `;

    await this.runTests();
  }

  private async runTests() {
    const resultsContainer = this.querySelector("#sqlite-test-results") as HTMLElement;

    try {
      initSqliteBrowserDao();
      AcSqlDatabase.databaseType = AcEnumSqlDatabaseType.Sqlite;
      this.dao = new AcSqliteDao();
      this.dao.setSqlConnection({sqlConnection:AcSqlConnection.instanceFromJson({jsonData:{[AcSqlConnection.KeyConnectionDatabase]:'test'}})});

      // console.log(await this.dao.executeStatement({statement:`
      //   CREATE TABLE users (
      //     id INTEGER PRIMARY KEY,
      //     name TEXT NOT NULL,
      //     age INTEGER DEFAULT 18
      //   );
      //   CREATE VIEW user_names AS SELECT name FROM users;
      // `}));

      console.log(await this.dao.insertRow({row:{'name':'test','id':1},tableName:'users'}));
      console.log(await this.dao.getRows({statement:'SELECT * FROM users'}));
      console.log(await this.dao.updateRow({row:{'name':'test-modified'},tableName:'users',condition:'id = @id',parameters:{'@id':'1'}}));
      console.log(await this.dao.getRows({statement:'SELECT * FROM users',condition:'id = @id',parameters:{'@id':'2'}}));
      console.log(await this.dao.deleteRows({tableName:'users',condition:'id = @id',parameters:{'@id':'1'}}));
      console.log(await this.dao.getRows({statement:'SELECT * FROM users'}));

      const tests: { title: string; fn: () => Promise<AcSqlDaoResult> }[] = [
        { title: "Get Tables", fn: () => this.dao.getDatabaseTables() },
        { title: "Get Views", fn: () => this.dao.getDatabaseViews() },
        { title: "Get Triggers", fn: () => this.dao.getDatabaseTriggers() },
        { title: "Get Table Columns (users)", fn: () => this.dao.getTableColumns({ tableName: "users" }) },
        { title: "Get View Columns (user_names)", fn: () => this.dao.getViewColumns({ viewName: "user_names" }) },
      ];

      let html = ``;
      for (const t of tests) {
        const result = await t.fn();
        html += `
          <div class="mb-3">
            <h5>${t.title}</h5>
            <pre class="bg-white border rounded p-2"><code>${JSON.stringify(result.rows, null, 2)}</code></pre>
          </div>
        `;
      }

      resultsContainer.innerHTML = html;
    } catch (err: any) {
      resultsContainer.innerHTML = `
        <div class="alert alert-danger">
          <strong>Error:</strong> ${err.message || err}
        </div>
      `;
      console.error(err);
    }
  }
}
