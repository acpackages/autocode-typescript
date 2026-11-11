import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcReport } from "@autocode-ts/ac-report-engine";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'reports-page-breaks-keep-together-page',
  template: `
    <div class="app-page h-100 d-flex flex-column bg-secondary bg-opacity-10">
      <app-header
        [title]="'AcReport : Page Breaks & Keep-Together'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="flex-fill overflow-auto p-4">
        <div class="row g-4">
          <!-- Control Panel -->
          <div class="col-lg-3">
             <div class="card shadow-sm border-0 sticky-top" style="top: 1rem;">
                <div class="card-body">
                   <h6 class="fw-bold mb-3">Layout &amp; Flow Controls</h6>

                   <div class="alert alert-info py-2 px-3 small mb-3">
                      <i class="fa-solid fa-circle-info me-1"></i>
                      <code>ac:keep-together</code> guarantees that an entire block (like a signature block, summary card, or certificate) stays on the same page. If it doesn't fit, it automatically moves to the top of the next page!
                   </div>

                   <div class="mb-3">
                      <label class="form-label small fw-semibold">Spacer Rows Before Signatures</label>
                      <input type="range" class="form-range" min="10" max="32" step="2" [(acModel)]="spacerRowCount" (change)="onSpacerChange()" />
                      <div class="small text-muted text-end">{{spacerRowCount}} rows in Section 1</div>
                   </div>

                   <div class="form-check form-switch mb-3">
                      <input class="form-check-input" type="checkbox" id="chkKeepTogether" [(acModel)]="useKeepTogether" (change)="toggleKeepTogether()">
                      <label class="form-check-label small fw-bold" for="chkKeepTogether">Enable ac:keep-together</label>
                      <div class="text-muted extra-small" style="font-size: 11px;">Prevents signature box from splitting midway across page margin</div>
                   </div>

                   <div class="form-check form-switch mb-3">
                      <input class="form-check-input" type="checkbox" id="chkBreakBefore" [(acModel)]="useBreakBefore" (change)="toggleBreakBefore()">
                      <label class="form-check-label small fw-bold" for="chkBreakBefore">Force ac:break-before on Appendix</label>
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
                 <div class="page" ac-page ac-page-size="A4" ac-page-orientation="portrait" style="padding: 25mm 20mm;">
                    
                    <div class="d-flex justify-content-between border-bottom pb-3 mb-4">
                       <div>
                          <h4 class="fw-bold text-dark mb-0">Master Services Agreement (MSA)</h4>
                          <span class="text-muted small">Contract Ref: CT-2026-MSA-084</span>
                       </div>
                       <div class="text-end">
                          <span class="badge bg-primary">Binding Legal Agreement</span>
                       </div>
                    </div>

                    <!-- Section 1: Dynamic Scope Table -->
                    <div class="mb-4">
                       <h6 class="fw-bold text-primary mb-2">Section 1: Service Deliverables &amp; Milestones</h6>
                       <table class="table table-sm table-bordered">
                          <thead class="bg-light">
                             <tr>
                                <th style="width: 50px;">#</th>
                                <th>Milestone Description</th>
                                <th style="width: 120px;" class="text-end">Target Date</th>
                                <th style="width: 120px;" class="text-end">Value</th>
                             </tr>
                          </thead>
                          <tbody>
                             <tr *for="let item of data.milestones; index as i">
                                <td>{{i + 1}}</td>
                                <td>{{item.name}}</td>
                                <td class="text-end text-muted">{{item.date}}</td>
                                <td class="text-end fw-bold">$ {{item.val}}</td>
                             </tr>
                          </tbody>
                       </table>
                    </div>

                    <!-- Signatures Card (tested with ac:keep-together) -->
                    <div class="card border border-2 border-primary mb-4 p-4 shadow-sm" #sigCard ac:keep-together>
                       <h6 class="fw-bold text-primary mb-3">
                          <i class="fa-solid fa-pen-nib me-2"></i> Section 2: Execution &amp; Authorized Signatures
                          <span class="badge bg-info text-dark float-end">ac:keep-together Active</span>
                       </h6>
                       <p class="small text-muted mb-4">
                          By executing this Agreement below, the authorized signatories warrant and represent that they have read, understood, and agreed to all terms, service level covenants, and payment schedules outlined herein.
                       </p>

                       <div class="row pt-4">
                          <div class="col-6">
                             <div class="border-top border-dark pt-2">
                                <div class="fw-bold">Executive Vice President</div>
                                <div class="small text-muted">AutoCode Global Enterprise Corp</div>
                                <div class="small text-muted mt-2">Signature: __________________________</div>
                                <div class="small text-muted mt-1">Date: 2026-05-12</div>
                             </div>
                          </div>
                          <div class="col-6">
                             <div class="border-top border-dark pt-2">
                                <div class="fw-bold">Chief Executive Officer</div>
                                <div class="small text-muted">Client Corporation Ltd.</div>
                                <div class="small text-muted mt-2">Signature: __________________________</div>
                                <div class="small text-muted mt-1">Date: 2026-05-12</div>
                             </div>
                          </div>
                       </div>
                    </div>

                    <!-- Appendix with optional ac:break-before -->
                    <div class="mt-4 p-4 border rounded bg-light" #appendixEl>
                       <h6 class="fw-bold text-secondary mb-2">Appendix A: Technical Security Standards</h6>
                       <p class="small text-muted mb-0">
                          All cloud processing, data storage, and network encryption adhere to NIST SP 800-53 Rev 5 and SOC 2 Type II specifications. Audit trail logs are retained in immutable WORM storage for a minimum duration of seven (7) years.
                       </p>
                    </div>

                    <div class="border-top pt-2 mt-auto d-flex justify-content-between small text-muted" ac-page-footer>
                       <div>Master Services Agreement - AutoCode TS Engine</div>
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
export class ReportsPageBreaksKeepTogetherPage {
  @AcViewChild('#reportContainer') reportContainer!: HTMLElement;
  @AcViewChild('#sigCard') sigCard!: HTMLElement;
  @AcViewChild('#appendixEl') appendixEl!: HTMLElement;
  report!: AcReport;

  spacerRowCount: number = 18;
  useKeepTogether: boolean = true;
  useBreakBefore: boolean = false;

  data = {
    milestones: [] as Array<{ name: string; date: string; val: string }>
  };

  dropdownItems: IAppMenuItem[] = [
    { label: 'Actions', isHeader: true },
    { label: 'Print Preview', callback: () => this.printReport() }
  ];

  acOnInit() {
    this.populateMilestones(this.spacerRowCount);
    this.report = new AcReport({ element: this.reportContainer });
    this.generateReport();
  }

  onSpacerChange() {
    this.populateMilestones(Number(this.spacerRowCount));
    this.generateReport();
  }

  toggleKeepTogether() {
    if (this.sigCard) {
      if (this.useKeepTogether) {
        this.sigCard.setAttribute('ac:keep-together', '');
      } else {
        this.sigCard.removeAttribute('ac:keep-together');
      }
    }
    this.generateReport();
  }

  toggleBreakBefore() {
    if (this.appendixEl) {
      if (this.useBreakBefore) {
        this.appendixEl.setAttribute('ac:break-before', '');
      } else {
        this.appendixEl.removeAttribute('ac:break-before');
      }
    }
    this.generateReport();
  }

  populateMilestones(count: number) {
    const list = [];
    for (let i = 1; i <= count; i++) {
      list.push({
        name: `Sprint Deliverable ${i}: API Gateway, Event Store & Cache Infrastructure Part #${i}`,
        date: `2026-0${1 + (i % 6)}-${10 + (i % 18)}`,
        val: (3200 + i * 450).toLocaleString()
      });
    }
    this.data.milestones = list;
  }

  async generateReport() {
    this.report.clear();
    await this.report.generate({ data: this.data });
  }

  printReport() {
    this.report.print();
  }
}
