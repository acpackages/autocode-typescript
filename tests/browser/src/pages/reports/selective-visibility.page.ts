import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcReport } from "@autocode-ts/ac-report-engine";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'reports-selective-visibility-page',
  template: `
    <div class="app-page h-100 d-flex flex-column bg-secondary bg-opacity-10">
      <app-header
        [title]="'AcReport : Selective Header & Footer Visibility'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="flex-fill overflow-auto p-4">
        <div class="row g-4">
          <!-- Control Panel -->
          <div class="col-lg-3">
             <div class="card shadow-sm border-0 sticky-top" style="top: 1rem;">
                <div class="card-body">
                   <h6 class="fw-bold mb-3">Selective Visibility</h6>

                   <div class="alert alert-info py-2 px-3 small mb-3">
                      <i class="fa-solid fa-circle-info me-1"></i>
                      Control whether headers, banners, or footers appear only on the first page, subsequent pages, or the final closing page using declarative directives!
                   </div>

                   <div class="mb-3">
                      <label class="form-label small fw-semibold">Content Length ({{data.articles.length}} rows)</label>
                      <div class="btn-group w-100 mb-2" role="group">
                         <button type="button" class="btn btn-outline-primary btn-sm" (click)="setRowCount(30)">30 (2 Pages)</button>
                         <button type="button" class="btn btn-outline-primary btn-sm" (click)="setRowCount(70)">70 (3-4 Pages)</button>
                      </div>
                      <input type="range" class="form-range" min="20" max="90" step="5" [(acModel)]="rowCount" (change)="onSliderChange()" />
                   </div>

                   <ul class="list-group list-group-flush small mb-3">
                      <li class="list-group-item px-0">
                         <span class="badge bg-primary me-2">ac:first-page-only</span> Cover Banner appears ONLY on Page 1
                      </li>
                      <li class="list-group-item px-0">
                         <span class="badge bg-secondary me-2">ac:hide-on-first-page</span> Compact Running Header on Pages 2..N
                      </li>
                      <li class="list-group-item px-0">
                         <span class="badge bg-success me-2">ac:last-page-only</span> Final Closing Summary ONLY on Last Page
                      </li>
                   </ul>

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
                 <div class="page" ac-page ac-page-size="A4" ac-page-orientation="portrait" style="padding: 25mm 20mm;">
                    
                    <!-- 1. Hero Cover Banner (PAGE 1 ONLY) -->
                    <div class="bg-primary text-white p-4 rounded mb-4 shadow-sm" ac:first-page-only>
                       <div class="d-flex justify-content-between align-items-center">
                          <div>
                             <span class="badge bg-light text-primary mb-2">PAGE 1 ONLY COVER BANNER</span>
                             <h2 class="fw-bold mb-1">Annual Operations Prospectus</h2>
                             <div class="opacity-75">AutoCode Strategic Infrastructure Report - Fiscal 2026</div>
                          </div>
                          <div class="text-end">
                             <div class="h1 mb-0"><i class="fa-solid fa-file-contract"></i></div>
                          </div>
                       </div>
                    </div>

                    <!-- 2. Compact Running Header (PAGES 2..N ONLY) -->
                    <div class="d-flex justify-content-between border-bottom pb-2 mb-3 text-muted small" ac:hide-on-first-page>
                       <div><i class="fa-solid fa-book-open me-1"></i> Annual Operations Prospectus &bull; Section Details</div>
                       <div>Confidential Internal Document</div>
                    </div>

                    <!-- Multi-page Article Items -->
                    <table class="table table-sm table-striped border mb-4">
                       <thead class="table-light">
                          <tr>
                             <th style="width: 50px;">#</th>
                             <th>Asset Code</th>
                             <th>Asset Title &amp; Specification</th>
                             <th class="text-end" style="width: 140px;">Valuation</th>
                          </tr>
                       </thead>
                       <tbody>
                          <tr *for="let item of data.articles; index as i">
                             <td>{{i + 1}}</td>
                             <td><code>{{item.code}}</code></td>
                             <td>{{item.title}}</td>
                             <td class="text-end fw-bold">$ {{item.val}}</td>
                          </tr>
                       </tbody>
                    </table>

                    <!-- 3. Final Closing Summary Box (LAST PAGE ONLY) -->
                    <div class="p-3 border border-2 border-success rounded bg-success bg-opacity-10 mt-3" ac:last-page-only>
                       <div class="d-flex justify-content-between align-items-center">
                          <div>
                             <span class="badge bg-success mb-1">LAST PAGE ONLY EXECUTION BLOCK</span>
                             <h6 class="fw-bold text-success mb-0">Prospectus Certification &amp; Sign-off</h6>
                             <div class="small text-muted">All valuations audited and certified by independent external examiners.</div>
                          </div>
                          <div class="text-end">
                             <button class="btn btn-sm btn-success"><i class="fa-solid fa-stamp me-1"></i> Certified</button>
                          </div>
                       </div>
                    </div>

                    <!-- Footer with Page Count -->
                    <div class="border-top pt-2 mt-auto d-flex justify-content-between small text-muted" ac-page-footer>
                       <div>Selective Visibility Engine &bull; AutoCode TS</div>
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
export class ReportsSelectiveVisibilityPage {
  @AcViewChild('#reportContainer') reportContainer!: HTMLElement;
  report!: AcReport;

  rowCount: number = 45;

  data = {
    articles: [] as Array<{ code: string; title: string; val: string }>
  };

  dropdownItems: IAppMenuItem[] = [
    { label: 'Actions', isHeader: true },
    { label: 'Print Preview', callback: () => this.printReport() }
  ];

  acOnInit() {
    this.populateArticles(this.rowCount);
    this.report = new AcReport({ element: this.reportContainer });
    this.generateReport();
  }

  setRowCount(count: number) {
    this.rowCount = count;
    this.populateArticles(count);
    this.generateReport();
  }

  onSliderChange() {
    this.populateArticles(Number(this.rowCount));
    this.generateReport();
  }

  populateArticles(count: number) {
    const list = [];
    for (let i = 1; i <= count; i++) {
      list.push({
        code: `ASSET-${2000 + i}`,
        title: `Enterprise Cloud Node Cluster Node #${i} - Standard High-Memory Instance`,
        val: (1450 + (i * 87) % 5200).toLocaleString()
      });
    }
    this.data.articles = list;
  }

  async generateReport() {
    this.report.clear();
    await this.report.generate({ data: this.data });
  }

  printReport() {
    this.report.print();
  }
}
