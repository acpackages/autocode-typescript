import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcReport } from "@autocode-ts/ac-report-engine";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'reports-mixed-orientation-page',
  template: `
    <div class="app-page h-100 d-flex flex-column bg-secondary bg-opacity-10">
      <app-header
        [title]="'AcReport : Mixed Page Orientations'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="flex-fill overflow-auto p-4">
        <div class="row g-4">
          <!-- Control Panel -->
          <div class="col-lg-3">
             <div class="card shadow-sm border-0 sticky-top" style="top: 1rem;">
                <div class="card-body">
                   <h6 class="fw-bold mb-3">Mixed Orientations</h6>

                   <div class="alert alert-info py-2 px-3 small mb-3">
                      <i class="fa-solid fa-circle-info me-1"></i>
                      A single report can combine <strong>Portrait</strong> pages (for executive letters or contracts) with wide <strong>Landscape</strong> pages (for dense spreadsheets and matrices)!
                   </div>

                   <div class="mb-3">
                      <label class="form-label small fw-semibold">Middle Page Orientation</label>
                      <select class="form-select form-select-sm" [(acModel)]="matrixOrientation" (change)="onOrientationChange()">
                         <option value="landscape">Landscape (297mm Wide)</option>
                         <option value="portrait">Portrait (210mm Standard)</option>
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
                 
                 <!-- PAGE 1: PORTRAIT -->
                 <div class="page" ac-page ac-page-size="A4" ac-page-orientation="portrait" style="padding: 25mm 20mm; margin-bottom: 20px;">
                    <div class="d-flex justify-content-between border-bottom pb-3 mb-4">
                       <div>
                          <h3 class="fw-bold text-primary mb-1">Acme Global Corporation</h3>
                          <div class="text-muted small">Quarterly Business Review - Executive Dossier</div>
                       </div>
                       <div class="text-end">
                          <span class="badge bg-primary">Page 1: Portrait</span>
                       </div>
                    </div>

                    <div class="card border-0 bg-light p-4 mb-4">
                       <h5 class="fw-bold mb-3">Executive Summary</h5>
                       <p class="text-muted mb-3">
                          During the preceding fiscal quarter, corporate operations experienced unprecedented growth across digital infrastructure and SaaS subscription units. Global revenue reached new all-time highs while customer acquisition expenses decreased by 18.4%.
                       </p>
                       <p class="text-muted mb-0">
                          The subsequent page contains the complete 12-month cross-regional breakdown in wide Landscape format, detailing each operational business unit across all international markets.
                       </p>
                    </div>

                    <div class="border-top pt-2 mt-auto d-flex justify-content-between small text-muted" ac-page-footer>
                       <div>Document: QBR-2026-FINAL</div>
                       <div>Page 1 of 2</div>
                    </div>
                 </div>

                 <!-- PAGE 2: LANDSCAPE (Wide Matrix) -->
                 <div class="page" ac-page ac-page-size="A4" [attr.ac-page-orientation]="matrixOrientation" #landscapePage style="padding: 20mm;">
                    <div class="d-flex justify-content-between border-bottom pb-2 mb-3">
                       <div>
                          <h4 class="fw-bold text-dark mb-0">Cross-Regional Performance Matrix (12-Month Performance)</h4>
                          <span class="text-muted small">All values reported in Thousands USD ($000s)</span>
                       </div>
                       <div class="text-end">
                          <span class="badge bg-success">Page 2: {{matrixOrientation.toUpperCase()}}</span>
                       </div>
                    </div>

                    <table class="table table-sm table-bordered text-center align-middle" style="font-size: 11px;">
                       <thead class="table-dark">
                          <tr>
                             <th style="width: 140px;" class="text-start">Business Division</th>
                             <th>Jan</th><th>Feb</th><th>Mar</th><th>Apr</th><th>May</th><th>Jun</th>
                             <th>Jul</th><th>Aug</th><th>Sep</th><th>Oct</th><th>Nov</th><th>Dec</th>
                             <th class="table-primary text-dark fw-bold">FY Total</th>
                          </tr>
                       </thead>
                       <tbody>
                          <tr *for="let row of data.matrixRows; index as i">
                             <td class="text-start fw-bold">{{row.division}}</td>
                             <td>{{row.m1}}</td><td>{{row.m2}}</td><td>{{row.m3}}</td><td>{{row.m4}}</td>
                             <td>{{row.m5}}</td><td>{{row.m6}}</td><td>{{row.m7}}</td><td>{{row.m8}}</td>
                             <td>{{row.m9}}</td><td>{{row.m10}}</td><td>{{row.m11}}</td><td>{{row.m12}}</td>
                             <td class="table-light fw-bold text-primary">$ {{row.total}}</td>
                          </tr>
                       </tbody>
                    </table>

                    <div class="border-top pt-2 mt-auto d-flex justify-content-between small text-muted" ac-page-footer>
                       <div>Mixed Orientation Engine - Seamless Portrait &amp; Landscape</div>
                       <div>Page 2 of 2</div>
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
      width: fit-content;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
  `
})
export class ReportsMixedOrientationPage {
  @AcViewChild('#reportContainer') reportContainer!: HTMLElement;
  @AcViewChild('#landscapePage') landscapePage!: HTMLElement;
  report!: AcReport;

  matrixOrientation: string = 'landscape';

  data = {
    matrixRows: [
      { division: 'Enterprise Cloud Platform', m1: '820', m2: '840', m3: '890', m4: '910', m5: '950', m6: '980', m7: '1,020', m8: '1,050', m9: '1,100', m10: '1,150', m11: '1,200', m12: '1,280', total: '12,190' },
      { division: 'Security & Compliance Suite', m1: '410', m2: '430', m3: '450', m4: '470', m5: '490', m6: '510', m7: '530', m8: '560', m9: '590', m10: '620', m11: '650', m12: '690', total: '6,400' },
      { division: 'Data Pipeline Analytics', m1: '320', m2: '340', m3: '360', m4: '380', m5: '400', m6: '420', m7: '450', m8: '470', m9: '500', m10: '530', m11: '560', m12: '600', total: '5,330' },
      { division: 'AI & Machine Learning APIs', m1: '190', m2: '240', m3: '290', m4: '350', m5: '420', m6: '510', m7: '620', m8: '750', m9: '890', m10: '1,050', m11: '1,240', m12: '1,480', total: '8,030' },
      { division: 'Professional Services', m1: '150', m2: '160', m3: '155', m4: '165', m5: '170', m6: '160', m7: '175', m8: '180', m9: '185', m10: '190', m11: '195', m12: '210', total: '2,095' }
    ]
  };

  dropdownItems: IAppMenuItem[] = [
    { label: 'Actions', isHeader: true },
    { label: 'Print Preview', callback: () => this.printReport() }
  ];

  acOnInit() {
    this.initReport();
  }

  onOrientationChange() {
    if (this.landscapePage) {
      this.landscapePage.setAttribute('ac-page-orientation', this.matrixOrientation);
    }
    this.initReport();
  }

  initReport() {
    this.report = new AcReport({ element: this.reportContainer });
    this.generateReport();
  }

  async generateReport() {
    this.report.clear();
    await this.report.generate({ data: this.data });
  }

  printReport() {
    this.report.print();
  }
}
