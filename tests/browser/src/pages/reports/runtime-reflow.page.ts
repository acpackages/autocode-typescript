import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcReport } from "@autocode-ts/ac-report-engine";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'reports-runtime-reflow-page',
  template: `
    <div class="app-page h-100 d-flex flex-column bg-secondary bg-opacity-10">
      <app-header
        [title]="'AcReport : Runtime Deletion & Dynamic Reflow'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="flex-fill overflow-auto p-4">
        <div class="row g-4">
          <!-- Control Panel -->
          <div class="col-lg-3">
             <div class="card shadow-sm border-0 sticky-top" style="top: 1rem;">
                <div class="card-body">
                   <h6 class="fw-bold mb-3">Live Reflow Controls</h6>

                   <div class="alert alert-info py-2 px-3 small mb-3">
                      <i class="fa-solid fa-circle-info me-1"></i>
                      Click any <strong>Delete</strong> button inside the preview rows. 
                      <code>report.removeRow()</code> will remove that row, reflow rows upward from Page 2 to fill freed vertical space, and automatically re-index the page counters!
                   </div>

                   <div class="p-3 bg-light rounded mb-3">
                      <div class="d-flex justify-content-between mb-1">
                         <span class="small text-muted">Pages Active:</span>
                         <span class="fw-bold text-primary">{{livePageCount}}</span>
                      </div>
                      <div class="d-flex justify-content-between">
                         <span class="small text-muted">Items Remaining:</span>
                         <span class="fw-bold">{{data.inventory.length}}</span>
                      </div>
                   </div>

                   <div class="d-grid gap-2 mb-3">
                      <button class="btn btn-sm btn-outline-danger" (click)="deleteSecondPage()" [disabled]="livePageCount < 2">
                         <i class="fa-solid fa-trash me-1"></i> Remove Entire Page 2
                      </button>
                      <button class="btn btn-sm btn-outline-secondary" (click)="resetAndRegenerate()">
                         <i class="fa-solid fa-rotate-left me-1"></i> Reset Original 40 Items
                      </button>
                   </div>

                   <div class="d-grid gap-2 mt-4">
                      <button class="btn btn-outline-secondary btn-sm" (click)="printReport()">
                        <i class="fa-solid fa-print me-2"></i> Print Preview
                      </button>
                   </div>
                </div>
             </div>
          </div>

          <!-- Report Preview -->
          <div class="col-lg-9">
             <div class="report-canvas p-4 bg-white shadow mx-auto" #reportContainer ac-report>
                 <div class="page" ac-page ac-page-size="A4" ac-page-orientation="portrait" style="padding: 25mm 20mm 20mm 20mm;">
                    
                    <div class="d-flex justify-content-between border-bottom pb-3 mb-3" ac-report-header>
                       <div>
                          <h4 class="fw-bold text-dark mb-0">Dynamic Warehouse Audit</h4>
                          <span class="text-muted small">Interactive Row Deletion &amp; Automatic Upward Reflow</span>
                       </div>
                       <div class="text-end">
                          <span class="badge bg-warning text-dark">Live Interactive DOM</span>
                       </div>
                    </div>

                    <!-- Interactive Table with Delete Action Buttons -->
                    <table class="table table-sm table-bordered align-middle mb-3">
                       <thead class="table-dark">
                          <tr>
                             <th style="width: 50px;">#</th>
                             <th style="width: 140px;">SKU Code</th>
                             <th>Hardware Description</th>
                             <th style="width: 100px;" class="text-end">Qty</th>
                             <th style="width: 80px;" class="text-center">Action</th>
                          </tr>
                       </thead>
                       <tbody>
                          <tr *for="let item of data.inventory; index as i" class="inventory-row">
                             <td>{{i + 1}}</td>
                             <td><code>{{item.sku}}</code></td>
                             <td>{{item.title}}</td>
                             <td class="text-end fw-bold">{{item.stock}}</td>
                             <td class="text-center">
                                <button type="button" class="btn btn-outline-danger btn-xs py-0 px-2 btn-remove-row" style="font-size: 11px;">
                                   &times;
                                </button>
                             </td>
                          </tr>
                       </tbody>
                    </table>

                    <!-- Dynamic Footer Page Count -->
                    <div class="border-top pt-2 mt-auto d-flex justify-content-between small text-muted" ac-page-footer>
                       <div>AutoCode Dynamic Reflow Engine</div>
                       <div>Page {{page.pageNumber}} of {{page.totalPages}}</div>
                    </div>

                 </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .report-canvas {
      width: 210mm;
      min-height: 297mm;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
  `
})
export class ReportsRuntimeReflowPage {
  @AcViewChild('#reportContainer') reportContainer!: HTMLElement;
  report!: AcReport;

  livePageCount: number = 0;

  data = {
    inventory: [] as Array<{ sku: string; title: string; stock: number }>
  };

  dropdownItems: IAppMenuItem[] = [
    { label: 'Actions', isHeader: true },
    { label: 'Print Preview', callback: () => this.printReport() }
  ];

  acOnInit() {
    this.populateInventory(36);
    this.report = new AcReport({ element: this.reportContainer });
    this.generateReport();
  }

  populateInventory(count: number) {
    const list = [];
    for (let i = 1; i <= count; i++) {
      list.push({
        sku: `SKU-${5000 + i}`,
        title: `Industrial High-Density Rack Mount Switch Chassis Assembly Unit #${i}`,
        stock: 12 + ((i * 7) % 85)
      });
    }
    this.data.inventory = list;
  }

  async generateReport() {
    this.report.clear();
    await this.report.generate({ data: this.data });
    this.attachRowDeleteHandlers();
    this.updateCounters();
  }

  attachRowDeleteHandlers() {
    if (!this.reportContainer) return;
    const buttons = this.reportContainer.querySelectorAll('.btn-remove-row');
    buttons.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const targetBtn = e.currentTarget as HTMLElement;
        const rowEl = targetBtn.closest('tr');
        if (rowEl && this.report) {
          await this.report.removeRow(rowEl);
          this.updateCounters();
        }
      });
    });
  }

  async deleteSecondPage() {
    if (this.report && this.report.getPages().length > 1) {
      await this.report.removePage(1);
      this.attachRowDeleteHandlers();
      this.updateCounters();
    }
  }

  updateCounters() {
    if (this.report) {
      this.livePageCount = this.report.getPages().length;
    }
  }

  resetAndRegenerate() {
    this.populateInventory(36);
    this.generateReport();
  }

  printReport() {
    this.report.print();
  }
}
