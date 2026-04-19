import { AcElement } from "@autocode-ts/ac-runtime";
import { AcStorage, acWebviewChannel } from "@autocode-ts/ac-browser";
import { AcHttp, AcDataManager } from "@autocode-ts/autocode";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'utils-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'AutoCode Utilities'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="container py-4 flex-fill overflow-auto">
        <div class="row g-4">
          <!-- AcHttp -->
          <div class="col-md-6">
            <div class="card h-100 shadow-sm">
               <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 fw-bold"><i class="fa-solid fa-globe text-primary me-2"></i> AcHttp</h6>
                  <button class="btn btn-sm btn-outline-primary" (click)="testHttp()">Run Fetch</button>
               </div>
               <div class="card-body">
                  <p class="small text-muted">Test async HTTP requests using <code>AcHttp.getPromise</code>.</p>
                  <pre class="bg-light p-2 small border rounded" style="max-height: 150px;">{{httpResult || 'Click button to test...'}}</pre>
               </div>
            </div>
          </div>

          <!-- AcStorage -->
          <div class="col-md-6">
            <div class="card h-100 shadow-sm">
               <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 fw-bold"><i class="fa-solid fa-database text-success me-2"></i> AcStorage</h6>
                  <button class="btn btn-sm btn-outline-success" (click)="testStorage()">Get Local Data</button>
               </div>
               <div class="card-body">
                  <p class="small text-muted">Local browser storage wrapper with proxy support.</p>
                  <div class="d-flex gap-2 mb-2">
                     <input type="text" class="form-control form-control-sm" [(acModel)]="storageKey" placeholder="Key" />
                     <input type="text" class="form-control form-control-sm" [(acModel)]="storageVal" placeholder="Value" />
                     <button class="btn btn-sm btn-success" (click)="saveToStorage()">Save</button>
                  </div>
                  <pre class="bg-light p-2 small border rounded">{{storageResult || 'No data retrieved'}}</pre>
               </div>
            </div>
          </div>

          <!-- Native Bridge -->
          <div class="col-md-6">
            <div class="card h-100 shadow-sm border-0">
               <div class="card-header bg-danger bg-opacity-10 py-3 d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 fw-bold"><i class="fa-solid fa-bridge text-danger me-2"></i> Native Bridge</h6>
                  <button class="btn btn-sm btn-danger" (click)="testChannel()">Ping Channel</button>
               </div>
               <div class="card-body">
                  <p class="small text-muted">Communication with CEF/WebView container.</p>
                  <div class="alert alert-danger py-2 px-3 small d-flex justify-content-between align-items-center">
                     <span>App Browser Detected?</span>
                     <span class="badge" [acStyle]="{backgroundColor: isApp ? '#198754' : '#dc3545'}">{{isApp ? 'YES' : 'NO'}}</span>
                  </div>
               </div>
            </div>
          </div>

          <!-- AcDataManager -->
          <div class="col-md-12">
            <div class="card shadow-sm">
               <div class="card-header bg-white py-3">
                  <h6 class="mb-0 fw-bold"><i class="fa-solid fa-microchip text-warning me-2"></i> AcDataManager</h6>
               </div>
               <div class="card-body">
                  <p class="small text-muted">Logic for processing local/on-demand datasets (Filtering, Sorting, Searching).</p>
                  <div class="row align-items-center g-3">
                     <div class="col-auto">
                        <button class="btn btn-sm btn-warning" (click)="testDataManager()">Process Sample Data</button>
                     </div>
                     <div class="col">
                        <div class="progress" style="height: 10px;">
                           <div class="progress-bar bg-warning" [acStyle]="{width: dmProgress + '%'}"></div>
                        </div>
                     </div>
                  </div>
                  <pre class="mt-3 bg-dark text-warning p-3 small border rounded">{{dmResult || 'Awaiting processing...'}}</pre>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UtilsPage {
  httpResult = '';
  storageResult = '';
  dmResult = '';
  dmProgress = 0;
  isApp = false;

  storageKey = 'test_user';
  storageVal = 'John Doe';

  dropdownItems: IAppMenuItem[] = [{ label: 'Utility Settings', isHeader: true }];

  acOnInit() {
    this.isApp = acWebviewChannel.isAppBrowser();
  }

  testChannel() {
    acWebviewChannel.send({ data: 'Ping from migrated Utils page' });
    this.addLog('Native channel ping sent');
  }

  private addLog(msg: string) {
     console.log(`[Utils] ${msg}`);
  }

  async testHttp() {
    this.httpResult = 'Loading...';
    try {
      const res = await AcHttp.getPromise({ url: 'https://jsonplaceholder.typicode.com/todos/1' });
      this.httpResult = JSON.stringify(res, null, 2);
    } catch (e: any) {
      this.httpResult = 'Error: ' + e.message;
    }
  }

  testStorage() {
    const storage: any = new AcStorage();
    this.storageResult = `Keys: ${storage.keys().join(', ')}\nValues: ${JSON.stringify(storage.values())}`;
  }

  saveToStorage() {
    const storage: any = new AcStorage();
    storage[this.storageKey] = this.storageVal;
    this.testStorage();
  }

  testDataManager() {
    const dm = new AcDataManager();
    dm.data = [
      { id: 1, name: 'Apple', type: 'Fruit' },
      { id: 2, name: 'Potato', type: 'Vegetable' },
      { id: 3, name: 'Orange', type: 'Fruit' },
      { id: 4, name: 'Carrot', type: 'Vegetable' }
    ];

    dm.searchQuery = 'Fruit';
    dm.processRows();
    this.dmProgress = 100;
    this.dmResult = `Total Rows: ${dm.totalRows}\nResults:\n${JSON.stringify(dm.processedRows, null, 2)}`;
  }
}
