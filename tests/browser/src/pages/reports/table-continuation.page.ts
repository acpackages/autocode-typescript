import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcReport } from "@autocode-ts/ac-report-engine";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'reports-table-continuation-page',
  template: `
    <div class="app-page h-100 d-flex flex-column bg-secondary bg-opacity-10">
      <app-header
        [title]="'AcReport : Table Header Continuation'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="flex-fill overflow-auto p-4">
        <div class="row g-4">
          <!-- Control Panel -->
          <div class="col-lg-3">
             <div class="card shadow-sm border-0 sticky-top" style="top: 1rem;">
                <div class="card-body">
                   <h6 class="fw-bold mb-3">Table Continuation</h6>

                   <div class="alert alert-info py-2 px-3 small mb-3">
                      <i class="fa-solid fa-circle-info me-1"></i>
                      When a table splits across pages, <code>&lt;thead&gt;</code> is automatically injected at the top of the table on subsequent pages!
                   </div>

                   <div class="mb-3">
                      <label class="form-label small fw-semibold">Item Count ({{data.items.length}} items)</label>
                      <div class="btn-group w-100 mb-2" role="group">
                         <button type="button" class="btn btn-outline-primary btn-sm" (click)="setRowCount(25)">25 Rows</button>
                         <button type="button" class="btn btn-outline-primary btn-sm" (click)="setRowCount(60)">60 Rows</button>
                      </div>
                      <input type="range" class="form-range" min="15" max="80" step="5" [(acModel)]="rowCount" (change)="onSliderChange()" />
                   </div>

                   <div class="mb-3">
                      <label class="form-label small fw-semibold">Table Theme</label>
                      <select class="form-select form-select-sm" [(acModel)]="tableTheme" (change)="onThemeChange()">
                         <option value="table-primary">Primary Blue</option>
                         <option value="table-dark">Dark Minimal</option>
                         <option value="table-secondary">Neutral Slate</option>
                      </select>
                   </div>

                   <div class="d-grid gap-2 mt-4">
                      <button class="btn btn-primary btn-sm" (click)="generateReport()">
                        <i class="fa-solid fa-arrows-rotate me-2"></i> Regenerate
                      </button>
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
                    
                    <div class="d-flex justify-content-between border-bottom pb-3 mb-4" ac-report-header>
                       <div>
                          <h4 class="fw-bold text-dark mb-0">Component Inventory Manifest</h4>
                          <span class="text-muted small">Warehouse ID: WH-CENTRAL-09 | Multi-Page Continuation</span>
                       </div>
                       <div class="text-end">
                          <span class="badge bg-success">Status: Verified</span>
                       </div>
                    </div>

                    <!-- Multi-page table with thead -->
                    <table class="table table-sm table-bordered align-middle mb-4">
                       <thead class="table-primary" #tableHead>
                          <tr>
                             <th style="width: 50px;" class="text-center">#</th>
                             <th style="width: 140px;">Part Number</th>
                             <th>Product Specification</th>
                             <th style="width: 120px;">Bin Location</th>
                             <th style="width: 90px;" class="text-end">In Stock</th>
                             <th style="width: 110px;" class="text-end">Unit Cost</th>
                          </tr>
                       </thead>
                       <tbody>
                          <tr *for="let item of data.items; index as i">
                             <td class="text-center text-muted">{{i + 1}}</td>
                             <td><strong>{{item.partNo}}</strong></td>
                             <td>{{item.spec}}</td>
                             <td><code>{{item.bin}}</code></td>
                             <td class="text-end">{{item.qty}}</td>
                             <td class="text-end fw-bold">$ {{item.price}}</td>
                          </tr>
                       </tbody>
                    </table>

                    <!-- Page Footer with Dynamic Page Number tokens -->
                    <div class="border-top pt-2 mt-auto d-flex justify-content-between small text-muted" ac-page-footer>
                       <div>AutoCode Continued Table Engine - <code>&lt;thead&gt;</code> Auto-Repeat</div>
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
export class ReportsTableContinuationPage {
  @AcViewChild('#reportContainer') reportContainer!: HTMLElement;
  @AcViewChild('#tableHead') tableHead!: HTMLElement;
  report!: AcReport;

  rowCount: number = 55;
  tableTheme: string = 'table-primary';

  data = {
    items: [] as Array<{ partNo: string; spec: string; bin: string; qty: number; price: string }>
  };

  dropdownItems: IAppMenuItem[] = [
    { label: 'Actions', isHeader: true },
    { label: 'Print Preview', callback: () => this.printReport() }
  ];

  acOnInit() {
    this.populateParts(this.rowCount);
    this.report = new AcReport({ element: this.reportContainer });
    this.generateReport();
  }

  setRowCount(count: number) {
    this.rowCount = count;
    this.populateParts(count);
    this.generateReport();
  }

  onSliderChange() {
    this.populateParts(Number(this.rowCount));
    this.generateReport();
  }

  onThemeChange() {
    if (this.tableHead) {
      this.tableHead.className = this.tableTheme;
    }
    this.generateReport();
  }

  populateParts(count: number) {
    const parts = [
      { prefix: 'CPU-XEON', spec: 'Intel Xeon Platinum 8480+ 56-Core 2.0GHz Server CPU' },
      { prefix: 'NVME-4TB', spec: 'Enterprise Gen5 NVMe U.2 SSD 4000GB Solid State Drive' },
      { prefix: 'RAM-DDR5', spec: '64GB ECC Registered DDR5-4800MHz Server Memory Module' },
      { prefix: 'NIC-100G', spec: 'Dual-Port 100GbE QSFP28 PCIe 4.0 Network Interface Card' },
      { prefix: 'PSU-1600', spec: '1600W Titanium Redundant Hot-Swap Power Supply Unit' },
      { prefix: 'FAN-40MM', spec: '40x40x28mm 24000 RPM Ultra-High Airflow Server Chassis Fan' }
    ];

    const items = [];
    for (let i = 1; i <= count; i++) {
      const p = parts[(i - 1) % parts.length];
      items.push({
        partNo: `${p.prefix}-${100 + i}`,
        spec: p.spec,
        bin: `AISLE-${String.fromCharCode(65 + (i % 6))}-BAY-${10 + (i % 15)}`,
        qty: 15 + ((i * 13) % 200),
        price: (45 + ((i * 63) % 1800)).toFixed(2)
      });
    }
    this.data.items = items;
  }

  async generateReport() {
    this.report.clear();
    await this.report.generate({ data: this.data });
  }

  printReport() {
    this.report.print();
  }
}
