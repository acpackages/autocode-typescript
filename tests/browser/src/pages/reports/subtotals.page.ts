import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcReport } from "@autocode-ts/ac-report-engine";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'reports-subtotals-page',
  template: `
    <div class="app-page h-100 d-flex flex-column bg-secondary bg-opacity-10">
      <app-header
        [title]="'AcReport : Running Page Subtotals'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="flex-fill overflow-auto p-4">
        <div class="row g-4">
          <!-- Control Panel -->
          <div class="col-lg-3">
             <div class="card shadow-sm border-0 sticky-top" style="top: 1rem;">
                <div class="card-body">
                   <h6 class="fw-bold mb-3">Running Subtotals</h6>

                   <div class="alert alert-info py-2 px-3 small mb-3">
                      <i class="fa-solid fa-circle-info me-1"></i>
                      Using <code>ac:accumulate</code>, the report engine automatically computes running balances:
                      <ul class="mb-0 mt-1 ps-3">
                        <li><strong>Carried Forward</strong> at the bottom of pages that continue</li>
                        <li><strong>Brought Forward</strong> at the top of continuing pages</li>
                      </ul>
                   </div>

                   <div class="mb-3">
                      <label class="form-label small fw-semibold">Transaction Count ({{data.ledger.length}} items)</label>
                      <div class="btn-group w-100 mb-2" role="group">
                         <button type="button" class="btn btn-outline-primary btn-sm" (click)="setCount(35)">35 (2 Pages)</button>
                         <button type="button" class="btn btn-outline-primary btn-sm" (click)="setCount(70)">70 (3 Pages)</button>
                      </div>
                      <input type="range" class="form-range" min="20" max="90" step="5" [(acModel)]="itemCount" (change)="onSliderChange()" />
                   </div>

                   <div class="p-3 bg-light rounded mb-3">
                      <div class="small text-muted mb-1">Ledger Grand Total:</div>
                      <div class="h5 fw-bold text-success mb-0">$ {{grandTotal}}</div>
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
                    
                    <div class="d-flex justify-content-between border-bottom pb-3 mb-3" ac-report-header>
                       <div>
                          <h4 class="fw-bold text-dark mb-0">General Ledger Statement</h4>
                          <span class="text-muted small">Account #: AC-88290-GL &bull; Running Balances</span>
                       </div>
                       <div class="text-end">
                          <span class="badge bg-secondary">Fiscal 2026</span>
                       </div>
                    </div>

                    <!-- Brought Forward Subtotal (auto-computed on pages > 1) -->
                    <div class="alert alert-light border d-flex justify-content-between py-2 px-3 small fw-bold mb-3" ac-subtotal-brought-forward>
                       <span><i class="fa-solid fa-arrow-turn-down me-1"></i> Balance Brought Forward:</span>
                       <span class="text-primary">{{page.subtotalBroughtForward}}</span>
                    </div>

                    <!-- Multi-page ledger table with ac:accumulate -->
                    <table class="table table-sm table-hover border align-middle mb-3">
                       <thead class="table-light">
                          <tr>
                             <th style="width: 50px;">#</th>
                             <th style="width: 120px;">Date</th>
                             <th>Transaction Particulars</th>
                             <th style="width: 140px;" class="text-end">Amount</th>
                          </tr>
                       </thead>
                       <tbody>
                          <tr *for="let row of data.ledger; index as i" ac:accumulate="row.amount">
                             <td>{{i + 1}}</td>
                             <td class="text-muted">{{row.date}}</td>
                             <td>{{row.particulars}}</td>
                             <td class="text-end fw-bold">$ {{row.amountFormatted}}</td>
                          </tr>
                       </tbody>
                    </table>

                    <!-- Carried Forward Subtotal (auto-computed on split pages) -->
                    <div class="alert alert-light border d-flex justify-content-between py-2 px-3 small fw-bold mb-3" ac-subtotal-carried-forward>
                       <span><i class="fa-solid fa-arrow-turn-up me-1"></i> Balance Carried Forward to Next Page:</span>
                       <span class="text-primary">{{page.subtotalCarriedForward}}</span>
                    </div>

                    <!-- Report Footer with Page Tokens -->
                    <div class="border-top pt-2 mt-auto d-flex justify-content-between small text-muted" ac-page-footer>
                       <div>AutoCode Ledger Engine &bull; Automated Subtotals</div>
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
export class ReportsSubtotalsPage {
  @AcViewChild('#reportContainer') reportContainer!: HTMLElement;
  report!: AcReport;

  itemCount: number = 45;
  grandTotal: string = '0.00';

  data = {
    ledger: [] as Array<{ date: string; particulars: string; amount: number; amountFormatted: string }>
  };

  dropdownItems: IAppMenuItem[] = [
    { label: 'Actions', isHeader: true },
    { label: 'Print Preview', callback: () => this.printReport() }
  ];

  acOnInit() {
    this.populateLedger(this.itemCount);
    this.report = new AcReport({ element: this.reportContainer });
    this.generateReport();
  }

  setCount(count: number) {
    this.itemCount = count;
    this.populateLedger(count);
    this.generateReport();
  }

  onSliderChange() {
    this.populateLedger(Number(this.itemCount));
    this.generateReport();
  }

  populateLedger(count: number) {
    const list = [];
    let sum = 0;
    for (let i = 1; i <= count; i++) {
      const amount = 50 + ((i * 47) % 650);
      sum += amount;
      list.push({
        date: `2026-04-${(1 + (i % 28)).toString().padStart(2, '0')}`,
        particulars: `Operational Disbursement Voucher Ref #${20000 + i}`,
        amount: amount,
        amountFormatted: amount.toFixed(2)
      });
    }
    this.data.ledger = list;
    this.grandTotal = sum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  async generateReport() {
    this.report.clear();
    await this.report.generate({ data: this.data });
  }

  printReport() {
    this.report.print();
  }
}
