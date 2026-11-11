import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcReport } from "@autocode-ts/ac-report-engine";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'reports-loops-pagination-page',
  template: `
    <div class="app-page h-100 d-flex flex-column bg-secondary bg-opacity-10">
      <app-header
        [title]="'AcReport : Loops & Pagination'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="flex-fill overflow-auto p-4">
        <div class="row g-4">
          <!-- Control Panel -->
          <div class="col-lg-3">
             <div class="card shadow-sm border-0 sticky-top" style="top: 1rem;">
                <div class="card-body">
                   <h6 class="fw-bold mb-3">Pagination Controls</h6>

                   <div class="mb-3">
                      <label class="form-label small fw-semibold">Number of Records ({{data.items.length}} items)</label>
                      <div class="btn-group w-100 mb-2" role="group">
                         <button type="button" class="btn btn-outline-primary btn-sm" (click)="setRowCount(12)">12 (1 Page)</button>
                         <button type="button" class="btn btn-outline-primary btn-sm" (click)="setRowCount(40)">40 (2 Pages)</button>
                         <button type="button" class="btn btn-outline-primary btn-sm" (click)="setRowCount(85)">85 (3-4 Pages)</button>
                      </div>
                      <input type="range" class="form-range" min="5" max="120" step="5" [(acModel)]="customCount" (change)="onSliderChange()" />
                   </div>

                   <div class="mb-3">
                      <label class="form-label small fw-semibold">Client Project Filter</label>
                      <input type="text" class="form-control form-control-sm" [(acModel)]="data.projectName" (input)="generateReport()" />
                   </div>

                   <div class="p-3 bg-light rounded mb-3">
                      <div class="small text-muted mb-1">Generated Pages:</div>
                      <div class="h5 fw-bold text-primary mb-0">{{pageCountBadge}}</div>
                   </div>

                   <div class="d-grid gap-2 mt-4">
                      <button class="btn btn-primary btn-sm" (click)="generateReport()">
                        <i class="fa-solid fa-arrows-rotate me-2"></i> Regenerate Pages
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
                    
                    <!-- Report Header (Repeated on page clones by default) -->
                    <div class="d-flex justify-content-between border-bottom pb-3 mb-3" ac-report-header>
                       <div>
                          <h4 class="fw-bold text-dark mb-0">Project Audit Log</h4>
                          <span class="text-muted small">Project: {{data.projectName}} | Ledger: #AUD-2026-X</span>
                       </div>
                       <div class="text-end">
                          <span class="badge bg-secondary">System Timestamp: 2026-05-12</span>
                       </div>
                    </div>

                    <!-- Multi-page looped table -->
                    <table class="table table-sm table-striped border mb-3">
                       <thead class="table-dark">
                          <tr>
                             <th style="width: 60px;">#</th>
                             <th>Transaction Ref</th>
                             <th>Category</th>
                             <th>Description</th>
                             <th class="text-end" style="width: 120px;">Units</th>
                             <th class="text-end" style="width: 140px;">Cost</th>
                          </tr>
                       </thead>
                       <tbody>
                          <tr *for="let item of data.items; index as i">
                             <td>{{i + 1}}</td>
                             <td><code class="text-dark">{{item.ref}}</code></td>
                             <td><span class="badge bg-light text-dark border">{{item.category}}</span></td>
                             <td>{{item.description}}</td>
                             <td class="text-end">{{item.units}}</td>
                             <td class="text-end fw-bold">$ {{item.cost}}</td>
                          </tr>
                       </tbody>
                    </table>

                    <!-- Report Footer with Dynamic Page Number tokens -->
                    <div class="border-top pt-2 mt-auto d-flex justify-content-between small text-muted" ac-page-footer>
                       <div>Confidential Internal Document - AutoCode Engine</div>
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
export class ReportsLoopsPaginationPage {
  @AcViewChild('#reportContainer') reportContainer!: HTMLElement;
  report!: AcReport;

  customCount: number = 40;
  pageCountBadge: string = 'Calculating...';

  data = {
    projectName: 'Enterprise Core Migration',
    items: [] as Array<{ ref: string; category: string; description: string; units: number; cost: string }>
  };

  dropdownItems: IAppMenuItem[] = [
    { label: 'Actions', isHeader: true },
    { label: 'Print Preview', callback: () => this.printReport() }
  ];

  acOnInit() {
    this.populateSampleItems(this.customCount);
    this.report = new AcReport({ element: this.reportContainer });
    this.generateReport();
  }

  setRowCount(count: number) {
    this.customCount = count;
    this.populateSampleItems(count);
    this.generateReport();
  }

  onSliderChange() {
    this.populateSampleItems(Number(this.customCount));
    this.generateReport();
  }

  populateSampleItems(count: number) {
    const categories = ['Infrastructure', 'Security Audit', 'Microservices', 'Database Sharding', 'QA Automation'];
    const items = [];
    for (let i = 1; i <= count; i++) {
      const cat = categories[i % categories.length];
      const cost = (120 + (i * 37) % 850).toFixed(2);
      items.push({
        ref: `TXN-${1000 + i}`,
        category: cat,
        description: `Operational task execution milestone verification block #${i}`,
        units: 1 + (i % 8),
        cost: cost
      });
    }
    this.data.items = items;
  }

  async generateReport() {
    this.report.clear();
    await this.report.generate({ data: this.data });
    const pages = this.report.getPages();
    this.pageCountBadge = `${pages.length} Page${pages.length > 1 ? 's' : ''}`;
  }

  printReport() {
    this.report.print();
  }
}
