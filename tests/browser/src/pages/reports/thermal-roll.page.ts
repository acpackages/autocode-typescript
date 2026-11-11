import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcReport } from "@autocode-ts/ac-report-engine";
import { acInitBwipjsPipe } from "@autocode-ts/ac-bwipjs-pipe";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'reports-thermal-roll-page',
  template: `
    <div class="app-page h-100 d-flex flex-column bg-secondary bg-opacity-10">
      <app-header
        [title]="'AcReport : Thermal Roll Paper & POS Receipts'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="flex-fill overflow-auto p-4">
        <div class="row g-4">
          <!-- Control Panel -->
          <div class="col-lg-3">
             <div class="card shadow-sm border-0 sticky-top" style="top: 1rem;">
                <div class="card-body">
                   <h6 class="fw-bold mb-3">POS Thermal Controls</h6>

                   <div class="alert alert-info py-2 px-3 small mb-3">
                      <i class="fa-solid fa-circle-info me-1"></i>
                      Thermal roll paper uses dynamic height trimming — the receipt automatically cuts to the exact length of the items!
                   </div>

                   <div class="mb-3">
                      <label class="form-label small fw-semibold">Store Branch</label>
                      <input type="text" class="form-control form-control-sm" [(acModel)]="data.storeName" (input)="generateReport()" />
                   </div>

                   <div class="mb-3">
                      <label class="form-label small fw-semibold">Payment Method</label>
                      <select class="form-select form-select-sm" [(acModel)]="data.paymentType" (change)="generateReport()">
                         <option value="CARD">Credit/Debit Card (Visa ****4412)</option>
                         <option value="CASH">Cash Tendered ($ 100.00)</option>
                         <option value="UPI">UPI / Digital Wallet</option>
                      </select>
                   </div>

                   <div class="d-grid gap-2 mb-3">
                      <button class="btn btn-sm btn-outline-success" (click)="addItem()">
                         <i class="fa-solid fa-plus me-1"></i> Add Item to Cart
                      </button>
                      <button class="btn btn-sm btn-outline-danger" (click)="removeItem()" [disabled]="data.items.length <= 1">
                         <i class="fa-solid fa-minus me-1"></i> Remove Last Item
                      </button>
                   </div>

                   <div class="d-grid gap-2 mt-4">
                      <button class="btn btn-primary btn-sm" (click)="generateReport()">
                        <i class="fa-solid fa-arrows-rotate me-2"></i> Regenerate Receipt
                      </button>
                      <button class="btn btn-outline-secondary btn-sm" (click)="printReport()">
                        <i class="fa-solid fa-print me-2"></i> Print Receipt
                      </button>
                   </div>
                </div>
             </div>
          </div>

          <!-- Report Preview -->
          <div class="col-lg-9">
             <div class="d-flex justify-content-center">
                <div class="receipt-wrapper p-3 bg-white shadow" #reportContainer ac-report>
                    <div class="receipt-content" ac-page ac-page-size="80mm" style="padding: 10px; width: 72mm; font-family: 'Courier New', Courier, monospace; font-size: 12px;">
                       
                       <!-- Header -->
                       <div class="text-center pb-2 mb-2 border-bottom">
                          <h6 class="fw-bold mb-0 text-uppercase">{{data.storeName}}</h6>
                          <div style="font-size: 11px;">Terminal #04 &bull; POS Ref: #TX-9042</div>
                          <div style="font-size: 10px;" class="text-muted">{{data.timestamp}}</div>
                       </div>

                       <!-- Items Table -->
                       <table class="w-100 mb-2" style="font-size: 11px;">
                          <thead>
                             <tr class="border-bottom">
                                <th class="text-start pb-1">Item</th>
                                <th class="text-center pb-1">Qty</th>
                                <th class="text-end pb-1">Price</th>
                             </tr>
                          </thead>
                          <tbody>
                             <tr *for="let item of data.items; index as i">
                                <td class="text-start py-1">{{item.name}}</td>
                                <td class="text-center py-1">{{item.qty}}</td>
                                <td class="text-end py-1 fw-bold">$ {{item.total}}</td>
                             </tr>
                          </tbody>
                       </table>

                       <!-- Totals Section -->
                       <div class="border-top pt-2 mb-2" style="font-size: 11px;">
                          <div class="d-flex justify-content-between mb-1">
                             <span>Subtotal:</span>
                             <span>$ {{subtotal}}</span>
                          </div>
                          <div class="d-flex justify-content-between mb-1">
                             <span>Sales Tax (8.25%):</span>
                             <span>$ {{tax}}</span>
                          </div>
                          <div class="d-flex justify-content-between fw-bold border-top border-bottom py-1 my-1" style="font-size: 13px;">
                             <span>TOTAL:</span>
                             <span>$ {{grandTotal}}</span>
                          </div>
                          <div class="d-flex justify-content-between text-muted" style="font-size: 10px;">
                             <span>Tender Method:</span>
                             <span>{{data.paymentType}}</span>
                          </div>
                       </div>

                       <!-- Barcode Section -->
                       <div class="text-center pt-2 border-top">
                          <div class="barcode mx-auto mb-1" style="width: fit-content;" 
                               [ac-report-barcode]="'POS-9042-881'" 
                               ac-barcode-type="code128"></div>
                          <div style="font-size: 9px;" class="text-muted">THANK YOU FOR YOUR BUSINESS!</div>
                       </div>

                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .receipt-wrapper {
      width: fit-content;
      background: #fafafa;
    }
  `
})
export class ReportsThermalRollPage {
  @AcViewChild('#reportContainer') reportContainer!: HTMLElement;
  report!: AcReport;

  data = {
    storeName: 'AutoCode Supermarket Express',
    timestamp: '2026-05-12 14:32:09',
    paymentType: 'CARD',
    items: [
      { name: 'Organic Almond Milk 1L', qty: 2, price: 3.49, total: '6.98' },
      { name: 'Artisan Sourdough Loaf', qty: 1, price: 4.50, total: '4.50' },
      { name: 'Fresh Hass Avocados (Pack)', qty: 1, price: 5.25, total: '5.25' },
      { name: 'Dark Roast Colombian Coffee', qty: 1, price: 11.99, total: '11.99' }
    ]
  };

  subtotal: string = '0.00';
  tax: string = '0.00';
  grandTotal: string = '0.00';

  dropdownItems: IAppMenuItem[] = [
    { label: 'Actions', isHeader: true },
    { label: 'Print Receipt', callback: () => this.printReport() }
  ];

  acOnInit() {
    acInitBwipjsPipe();
    this.calculateTotals();
    this.report = new AcReport({ element: this.reportContainer });
    this.generateReport();
  }

  calculateTotals() {
    let sum = 0;
    for (const it of this.data.items) {
      sum += Number(it.total);
    }
    this.subtotal = sum.toFixed(2);
    const taxAmt = sum * 0.0825;
    this.tax = taxAmt.toFixed(2);
    this.grandTotal = (sum + taxAmt).toFixed(2);
  }

  addItem() {
    const catalog = [
      { name: 'Sparkling Mineral Water', price: 1.99 },
      { name: 'Gourmet Chocolate 70%', price: 3.75 },
      { name: 'Extra Virgin Olive Oil', price: 14.50 },
      { name: 'Greek Yogurt 500g', price: 4.20 }
    ];
    const pick = catalog[this.data.items.length % catalog.length];
    this.data.items.push({
      name: pick.name,
      qty: 1,
      price: pick.price,
      total: pick.price.toFixed(2)
    });
    this.calculateTotals();
    this.generateReport();
  }

  removeItem() {
    if (this.data.items.length > 1) {
      this.data.items.pop();
      this.calculateTotals();
      this.generateReport();
    }
  }

  async generateReport() {
    this.report.clear();
    await this.report.generate({ data: this.data });
  }

  printReport() {
    this.report.print();
  }
}
