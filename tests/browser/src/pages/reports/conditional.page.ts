import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcReport } from "@autocode-ts/ac-report-engine";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'reports-conditional-page',
  template: `
    <div class="app-page h-100 d-flex flex-column bg-secondary bg-opacity-10">
      <app-header
        [title]="'AcReport : Conditional Directives'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="flex-fill overflow-auto p-4">
        <div class="row g-4">
          <!-- Control Panel -->
          <div class="col-lg-3">
             <div class="card shadow-sm border-0 sticky-top" style="top: 1rem;">
                <div class="card-body">
                   <h6 class="fw-bold mb-3">Conditional Controls</h6>
                   
                   <div class="mb-3">
                      <label class="form-label small fw-semibold">Payment Status (ac:if / ac:elseif / ac:else)</label>
                      <select class="form-select form-select-sm" [(acModel)]="data.paymentStatus" (change)="generateReport()">
                         <option value="PAID">PAID (Success Green)</option>
                         <option value="PENDING">PENDING (Warning Yellow)</option>
                         <option value="OVERDUE">OVERDUE (Danger Red)</option>
                      </select>
                   </div>

                   <div class="mb-3">
                      <label class="form-label small fw-semibold">Membership Tier (ac:switch)</label>
                      <select class="form-select form-select-sm" [(acModel)]="data.membershipTier" (change)="generateReport()">
                         <option value="PLATINUM">PLATINUM (VIP)</option>
                         <option value="GOLD">GOLD (Priority)</option>
                         <option value="STANDARD">STANDARD (Regular)</option>
                      </select>
                   </div>

                   <div class="form-check form-switch mb-3">
                      <input class="form-check-input" type="checkbox" id="chkDiscounts" [(acModel)]="data.showDiscounts" (change)="generateReport()">
                      <label class="form-check-label small" for="chkDiscounts">Show Discount Section</label>
                   </div>

                   <div class="form-check form-switch mb-3">
                      <input class="form-check-input" type="checkbox" id="chkAudit" [(acModel)]="data.showAuditLog" (change)="generateReport()">
                      <label class="form-check-label small" for="chkAudit">Show Compliance Note</label>
                   </div>

                   <div class="d-grid gap-2 mt-4">
                      <button class="btn btn-primary btn-sm" (click)="generateReport()">
                        <i class="fa-solid fa-arrows-rotate me-2"></i> Re-evaluate Conditions
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
                 <div class="page" ac-page ac-page-size="A4" ac-page-orientation="portrait" style="padding: 30mm 20mm;">
                    <!-- Report Header -->
                    <div class="d-flex justify-content-between border-bottom pb-4 mb-4">
                       <div>
                          <h2 class="fw-bold text-primary mb-1">Global Enterprises Ltd.</h2>
                          <div class="text-muted small">Conditional Directives Verification Document</div>
                       </div>
                       <div class="text-end">
                          <h4 class="text-uppercase fw-light">Account Summary</h4>
                          <div class="fw-bold">Doc #: RPT-COND-001</div>
                          <div class="small">Generated: {{data.generatedDate}}</div>
                       </div>
                    </div>

                    <!-- Client Info -->
                    <div class="card border-0 bg-light p-3 mb-4">
                       <div class="row">
                          <div class="col-6">
                             <div class="text-muted small text-uppercase">Account Holder</div>
                             <div class="fw-bold">{{data.customerName}}</div>
                             <div class="small text-muted">{{data.email}}</div>
                          </div>
                          <div class="col-6 text-end">
                             <div class="text-muted small text-uppercase">Current Tier</div>
                             <span class="badge bg-primary px-3 py-2 fs-6">{{data.membershipTier}}</span>
                          </div>
                       </div>
                    </div>

                    <!-- 1. ac:if / ac:elseif / ac:else -->
                    <div class="mb-4">
                       <h5 class="fw-bold border-bottom pb-2">1. Payment Status (ac:if / ac:elseif / ac:else)</h5>
                       
                       <div class="p-3 mb-2 rounded bg-success bg-opacity-10 border border-success text-success" ac:if="data.paymentStatus === 'PAID'">
                          <div class="fw-bold"><i class="fa-solid fa-circle-check me-2"></i> Account in Good Standing (PAID)</div>
                          <div class="small">Payment received in full. All enterprise services and APIs are fully operational.</div>
                       </div>

                       <div class="p-3 mb-2 rounded bg-warning bg-opacity-10 border border-warning text-warning-emphasis" ac:elseif="data.paymentStatus === 'PENDING'">
                          <div class="fw-bold"><i class="fa-solid fa-triangle-exclamation me-2"></i> Payment Verification in Progress (PENDING)</div>
                          <div class="small">Your transaction is currently being processed by the settlement gateway. Grace period active.</div>
                       </div>

                       <div class="p-3 mb-2 rounded bg-danger bg-opacity-10 border border-danger text-danger" ac:else>
                          <div class="fw-bold"><i class="fa-solid fa-circle-xmark me-2"></i> Account Past Due (OVERDUE)</div>
                          <div class="small">Immediate action required: please settle outstanding balance to prevent service suspension.</div>
                       </div>
                    </div>

                    <!-- 2. ac:switch / ac:switch:case / ac:switch:default -->
                    <div class="mb-4">
                       <h5 class="fw-bold border-bottom pb-2">2. SLA &amp; Benefits (ac:switch)</h5>
                       <div ac:switch="data.membershipTier">
                          <div class="p-3 border rounded border-primary bg-primary bg-opacity-10" ac:switch:case="'PLATINUM'">
                             <div class="fw-bold text-primary"><i class="fa-solid fa-crown me-2"></i> Platinum VIP Tier</div>
                             <div class="small text-muted">Dedicated 24/7 technical architect, 99.999% SLA uptime, unlimited cloud compute quota.</div>
                          </div>
                          <div class="p-3 border rounded border-warning bg-warning bg-opacity-10" ac:switch:case="'GOLD'">
                             <div class="fw-bold text-warning-emphasis"><i class="fa-solid fa-medal me-2"></i> Gold Priority Tier</div>
                             <div class="small text-muted">Priority email/phone support (1hr response), 99.95% SLA uptime, 500GB daily sync.</div>
                          </div>
                          <div class="p-3 border rounded border-secondary bg-light" ac:switch:default>
                             <div class="fw-bold text-secondary"><i class="fa-solid fa-user me-2"></i> Standard Tier</div>
                             <div class="small text-muted">Community support forum, standard SLA uptime, standard API rate limits.</div>
                          </div>
                       </div>
                    </div>

                    <!-- 3. Optional Discount Section -->
                    <div class="mb-4" ac:if="data.showDiscounts">
                       <h5 class="fw-bold border-bottom pb-2">3. Promotional Credits &amp; Rebates</h5>
                       <div class="p-3 bg-info bg-opacity-10 border border-info rounded text-info-emphasis">
                          <div class="d-flex justify-content-between align-items-center">
                             <span>Q1 Volume Growth Incentive Rebate:</span>
                             <span class="fw-bold text-success">- $ 1,250.00</span>
                          </div>
                       </div>
                    </div>

                    <!-- 4. Optional Compliance Note -->
                    <div class="mt-4 p-3 border-top small text-muted" ac:if="data.showAuditLog">
                       <div class="fw-bold mb-1"><i class="fa-solid fa-shield-halved me-1"></i> Compliance &amp; Verification Note:</div>
                       <div>This statement was compiled following ISO/IEC 27001 data processing requirements. Log ID: AUD-89102-X.</div>
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
export class ReportsConditionalPage {
  @AcViewChild('#reportContainer') reportContainer!: HTMLElement;
  report!: AcReport;

  data = {
    customerName: 'Enterprise Holdings Inc.',
    email: 'billing@enterpriseholdings.com',
    generatedDate: '2026-05-12',
    paymentStatus: 'PAID',
    membershipTier: 'PLATINUM',
    showDiscounts: true,
    showAuditLog: true
  };

  dropdownItems: IAppMenuItem[] = [
    { label: 'Actions', isHeader: true },
    { label: 'Print Preview', callback: () => this.printReport() }
  ];

  acOnInit() {
    this.report = new AcReport({ element: this.reportContainer });
    this.generateReport();
  }

  generateReport() {
    this.report.clear();
    this.report.generate({ data: this.data });
  }

  printReport() {
    this.report.print();
  }
}
