import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcReport } from "@autocode-ts/ac-report-engine";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'reports-margins-watermark-page',
  template: `
    <div class="app-page h-100 d-flex flex-column bg-secondary bg-opacity-10">
      <app-header
        [title]="'AcReport : Margins & Watermarks'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="flex-fill overflow-auto p-4">
        <div class="row g-4">
          <!-- Control Panel -->
          <div class="col-lg-3">
             <div class="card shadow-sm border-0 sticky-top" style="top: 1rem;">
                <div class="card-body">
                   <h6 class="fw-bold mb-3">Margins &amp; Watermarks</h6>

                   <div class="mb-3">
                      <label class="form-label small fw-semibold">Watermark Text</label>
                      <input type="text" class="form-control form-control-sm mb-2" [(acModel)]="watermarkText" (input)="updateWatermark()" />
                      <div class="btn-group btn-group-sm w-100" role="group">
                         <button type="button" class="btn btn-outline-secondary" (click)="setWatermark('CONFIDENTIAL')">CONFIDENTIAL</button>
                         <button type="button" class="btn btn-outline-secondary" (click)="setWatermark('DRAFT')">DRAFT</button>
                         <button type="button" class="btn btn-outline-secondary" (click)="setWatermark('TOP SECRET')">TOP SECRET</button>
                      </div>
                   </div>

                   <div class="mb-3">
                      <label class="form-label small fw-semibold">Page Margin Preset (ac-page-margin)</label>
                      <select class="form-select form-select-sm" [(acModel)]="selectedMargin" (change)="updateMargin()">
                         <option value="12mm">Compact (12mm)</option>
                         <option value="20mm">Standard (20mm)</option>
                         <option value="30mm">Wide (30mm)</option>
                         <option value="15mm 25mm">Mixed (15mm Top/Bottom, 25mm Left/Right)</option>
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
             <div class="report-canvas p-4 bg-white shadow mx-auto" #reportContainer ac-report [attr.ac:watermark]="watermarkText" [attr.ac-page-margin]="selectedMargin">
                 <div class="page" ac-page ac-page-size="A4" ac-page-orientation="portrait">
                    
                    <div class="d-flex justify-content-between border-bottom pb-3 mb-4">
                       <div>
                          <h4 class="fw-bold text-dark mb-0">Confidential Financial Forecast</h4>
                          <span class="text-muted small">AutoCode Strategic Planning &bull; 2026-2028</span>
                       </div>
                       <div class="text-end">
                          <span class="badge bg-danger text-uppercase">{{watermarkText}}</span>
                       </div>
                    </div>

                    <div class="card border-0 bg-light p-3 mb-4">
                       <h6 class="fw-bold mb-2">Executive Overview</h6>
                       <p class="small text-muted mb-0">
                          This document contains sensitive corporate financial projections and confidential R&amp;D allocations. Unauthorized reproduction, transmission, or copying is strictly forbidden. The background watermark indicates the sensitivity status of this distribution copy.
                       </p>
                    </div>

                    <table class="table table-bordered mb-4">
                       <thead class="table-light">
                          <tr>
                             <th>Quarter</th>
                             <th class="text-end">Revenue Projection</th>
                             <th class="text-end">R&amp;D Capital</th>
                             <th class="text-end">EBITDA Margin</th>
                          </tr>
                       </thead>
                       <tbody>
                          <tr>
                             <td><strong>Q1 2026</strong></td>
                             <td class="text-end">$ 12,450,000</td>
                             <td class="text-end">$ 3,200,000</td>
                             <td class="text-end fw-bold text-success">28.4%</td>
                          </tr>
                          <tr>
                             <td><strong>Q2 2026</strong></td>
                             <td class="text-end">$ 15,100,000</td>
                             <td class="text-end">$ 3,850,000</td>
                             <td class="text-end fw-bold text-success">31.2%</td>
                          </tr>
                          <tr>
                             <td><strong>Q3 2026</strong></td>
                             <td class="text-end">$ 18,900,000</td>
                             <td class="text-end">$ 4,100,000</td>
                             <td class="text-end fw-bold text-success">34.6%</td>
                          </tr>
                          <tr>
                             <td><strong>Q4 2026</strong></td>
                             <td class="text-end">$ 24,500,000</td>
                             <td class="text-end">$ 5,000,000</td>
                             <td class="text-end fw-bold text-success">37.8%</td>
                          </tr>
                       </tbody>
                    </table>

                    <div class="p-3 border rounded bg-white shadow-sm mb-4">
                       <h6 class="fw-bold text-primary mb-1">Declarative Margin &amp; Watermark Engine</h6>
                       <p class="small text-muted mb-0">
                          Current Margin: <code>{{selectedMargin}}</code> &bull; Watermark: <code>{{watermarkText}}</code>.<br>
                          The watermark is automatically rendered with print-safe opacity and rotated diagonally behind the page contents.
                       </p>
                    </div>

                    <div class="border-top pt-2 mt-auto d-flex justify-content-between small text-muted" ac-page-footer>
                       <div>Security Classification: Restricted</div>
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
export class ReportsMarginsWatermarkPage {
  @AcViewChild('#reportContainer') reportContainer!: HTMLElement;
  report!: AcReport;

  watermarkText: string = 'CONFIDENTIAL';
  selectedMargin: string = '20mm';

  dropdownItems: IAppMenuItem[] = [
    { label: 'Actions', isHeader: true },
    { label: 'Print Preview', callback: () => this.printReport() }
  ];

  acOnInit() {
    this.initReport();
  }

  setWatermark(text: string) {
    this.watermarkText = text;
    this.updateWatermark();
  }

  updateWatermark() {
    if (this.reportContainer) {
      this.reportContainer.setAttribute('ac:watermark', this.watermarkText);
    }
    this.initReport();
  }

  updateMargin() {
    if (this.reportContainer) {
      this.reportContainer.setAttribute('ac-page-margin', this.selectedMargin);
    }
    this.initReport();
  }

  initReport() {
    this.report = new AcReport({ element: this.reportContainer });
    this.generateReport();
  }

  async generateReport() {
    this.report.clear();
    await this.report.generate({ data: {} });
  }

  printReport() {
    this.report.print();
  }
}
