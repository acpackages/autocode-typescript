import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcReport } from "@autocode-ts/ac-report-engine";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'reports-custom-pipes-export-page',
  template: `
    <div class="app-page h-100 d-flex flex-column bg-secondary bg-opacity-10">
      <app-header
        [title]="'AcReport : Custom Pipes & HTML Export'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="flex-fill overflow-auto p-4">
        <div class="row g-4">
          <!-- Control Panel -->
          <div class="col-lg-3">
             <div class="card shadow-sm border-0 sticky-top" style="top: 1rem;">
                <div class="card-body">
                   <h6 class="fw-bold mb-3">Pipes &amp; Export Controls</h6>

                   <div class="alert alert-info py-2 px-3 small mb-3">
                      <i class="fa-solid fa-circle-info me-1"></i>
                      Register engine pipes with <code>report.registerPipe('name', fn)</code> and export fully self-contained HTML documents for offline archiving or email attachment!
                   </div>

                   <div class="mb-3">
                      <label class="form-label small fw-semibold">Currency Code (Used by custom pipe)</label>
                      <select class="form-select form-select-sm" [(acModel)]="activeCurrency" (change)="onCurrencyChange()">
                         <option value="USD">USD ($)</option>
                         <option value="EUR">EUR (€)</option>
                         <option value="GBP">GBP (£)</option>
                         <option value="INR">INR (₹)</option>
                      </select>
                   </div>

                   <div class="mb-3">
                      <label class="form-label small fw-semibold">Highlight Threshold</label>
                      <input type="number" class="form-control form-control-sm" [(acModel)]="highlightThreshold" (input)="generateReport()" />
                      <div class="small text-muted">Values above threshold highlighted via custom pipe</div>
                   </div>

                   <div class="d-grid gap-2 mb-3">
                      <button class="btn btn-sm btn-success" (click)="downloadHtmlExport()">
                         <i class="fa-solid fa-file-arrow-down me-1"></i> Download Standalone HTML
                      </button>
                      <button class="btn btn-sm btn-primary" (click)="printReport()">
                         <i class="fa-solid fa-print me-1"></i> Print / Save as PDF
                      </button>
                   </div>

                   <div class="d-grid gap-2 mt-4">
                      <button class="btn btn-outline-secondary btn-sm" (click)="generateReport()">
                        <i class="fa-solid fa-arrows-rotate me-2"></i> Regenerate
                      </button>
                   </div>
                </div>
             </div>
          </div>

          <!-- Report Preview -->
          <div class="col-lg-9">
             <div class="report-canvas p-4 bg-white shadow mx-auto" #reportContainer ac-report>
                 <div class="page" ac-page ac-page-size="A4" ac-page-orientation="portrait" style="padding: 25mm 20mm;">
                    
                    <div class="d-flex justify-content-between border-bottom pb-3 mb-4">
                       <div>
                          <h3 class="fw-bold text-dark mb-1">Global Trade Invoicing</h3>
                          <span class="text-muted small">Custom Transform Pipes &amp; Standalone Export Demonstration</span>
                       </div>
                       <div class="text-end">
                          <span class="badge bg-primary">Currency: {{activeCurrency}}</span>
                       </div>
                    </div>

                    <div class="p-3 bg-light rounded mb-4">
                       <h6 class="fw-bold mb-1">Registered Engine Pipes Active:</h6>
                       <ul class="small text-muted mb-0 ps-3">
                          <li><code>currFormat:currencyCode</code> &mdash; Formats numeric values to the selected global currency.</li>
                          <li><code>auditFlag:threshold</code> &mdash; Adds dynamic warning badges when amounts exceed the threshold.</li>
                       </ul>
                    </div>

                    <!-- Items Table -->
                    <table class="table table-bordered align-middle mb-4">
                       <thead class="table-dark">
                          <tr>
                             <th style="width: 50px;">#</th>
                             <th>Transaction Ref</th>
                             <th>Description</th>
                             <th class="text-end" style="width: 160px;">Formatted Value</th>
                             <th style="width: 120px;" class="text-center">Audit Status</th>
                          </tr>
                       </thead>
                       <tbody>
                          <tr *for="let row of data.invoices; index as i">
                             <td>{{i + 1}}</td>
                             <td><code>{{row.ref}}</code></td>
                             <td>{{row.desc}}</td>
                             <td class="text-end fw-bold">{{row.amount | currFormat:activeCurrency}}</td>
                             <td class="text-center">{{row.amount | auditFlag:highlightThreshold}}</td>
                          </tr>
                       </tbody>
                    </table>

                    <div class="border-top pt-2 mt-auto d-flex justify-content-between small text-muted" ac-page-footer>
                       <div>AutoCode TS Custom Pipe &amp; Export Engine</div>
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
export class ReportsCustomPipesExportPage {
  @AcViewChild('#reportContainer') reportContainer!: HTMLElement;
  report!: AcReport;

  activeCurrency: string = 'USD';
  highlightThreshold: number = 3000;

  data = {
    invoices: [
      { ref: 'INV-2026-901', desc: 'Enterprise Cloud Subscription (Annual)', amount: 4800 },
      { ref: 'INV-2026-902', desc: 'Specialist Cybersecurity Audit Consulting', amount: 3200 },
      { ref: 'INV-2026-903', desc: 'Continuous Integration Runner Fleet Tier', amount: 850 },
      { ref: 'INV-2026-904', desc: 'Managed High-Availability Database Shard', amount: 1950 },
      { ref: 'INV-2026-905', desc: 'Hardware Security Module Provisioning', amount: 5400 },
      { ref: 'INV-2026-906', desc: 'Multi-Region DNS Anycast Network License', amount: 1200 }
    ]
  };

  dropdownItems: IAppMenuItem[] = [
    { label: 'Actions', isHeader: true },
    { label: 'Export Standalone HTML', callback: () => this.downloadHtmlExport() },
    { label: 'Print Preview', callback: () => this.printReport() }
  ];

  acOnInit() {
    this.report = new AcReport({ element: this.reportContainer });
    this.registerCustomPipes();
    this.generateReport();
  }

  registerCustomPipes() {
    const currencySymbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹'
    };

    this.report.registerPipe('currFormat', (val: any, code: string = 'USD') => {
      const sym = currencySymbols[code] || '$';
      const num = Number(val) || 0;
      return `${sym} ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    });

    this.report.registerPipe('auditFlag', (val: any, threshold: number = 3000) => {
      const num = Number(val) || 0;
      if (num >= threshold) {
        return '<span class="badge bg-warning text-dark"><i class="fa-solid fa-flag me-1"></i> High Value</span>';
      }
      return '<span class="badge bg-light text-muted border">Standard</span>';
    });
  }

  onCurrencyChange() {
    this.generateReport();
  }

  async generateReport() {
    this.report.clear();
    this.registerCustomPipes();
    await this.report.generate({ data: this.data });
  }

  downloadHtmlExport() {
    this.report.exportToHtml({
      title: `Global Trade Invoice - ${this.activeCurrency}`,
      download: true,
      filename: `Trade-Invoice-${this.activeCurrency}-2026.html`
    });
  }

  printReport() {
    this.report.print();
  }
}
