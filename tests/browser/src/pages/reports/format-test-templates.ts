export interface IReportFormatScenario {
  label: string;
  data: any;
}

export interface IReportFormatDefinition {
  id: string;
  name: string;
  category: string;
  badge: string;
  description: string;
  html: string;
  preProcessScript?: string;
  postProcessCallback?: (doc: Document) => void;
  scenarios: IReportFormatScenario[];
}

export const RETAIL_COMPACT_HTML = `<html>
  <head>
    <style type="text/css">
      .sr_no { min-width: 2.5%; width: 2.5%; max-width: 2.5%; }
      .item_description { text-align: left; }
      .item_hsn { text-align: center; min-width: 6%; width: 6%; max-width: 6%; }
      .item_qty { text-align: right; min-width: 6%; width: 6%; max-width: 6%; }
      .item_unit { text-align: center; min-width: 6%; width: 6%; max-width: 6%; }
      .item_rate { text-align: right; min-width: 7%; width: 7%; max-width: 7%; }
      .item_discount { text-align: right; min-width: 7%; width: 7%; max-width: 7%; }
      .item_rebate { text-align: right; min-width: 7%; width: 7%; max-width: 7%; }
      .item_tax_rate { text-align: right; min-width: 6%; width: 6%; max-width: 6%; }
      .item_tax_amount { text-align: right; min-width: 9%; width: 9%; max-width: 9%; }
      .cgst, .sgst, .igst { text-align: right; min-width: 7%; width: 7%; max-width: 7%; }
      .item_amount { text-align: right; min-width: 12%; width: 12%; max-width: 12%; }
      .main-details th, .main-details td {
        border-style: solid; border-width: 1px; border-color: black;
        padding-left: 3px; padding-right: 3px; border-left: none; border-top: none;
      }
      .main-details { border-left-style: solid; border-left-width: 1px; border-left-color: black; }
      .product-row td { max-height: 0.4cm; min-height: 0.4cm; height: 0.4cm; }
      p { margin-bottom: 0px !important; }
    </style>
  </head>
  <body>
    <div style="margin:auto;width:fit-content;font:arial;" ac-report>
      <div class="page" ac:style:padding-top="data.page.margin_top" ac:style:padding-left="data.page.margin_left"
        ac:style:padding-bottom="data.page.margin_bottom" ac:style:padding-right="data.page.margin_right" ac-page
        ac-page-size="A5" ac-page-orientation="landscape">
        <table style="width:100%;height:-webkit-fill-available;" cellspacing="0" cellpadding="0">
          <tr>
            <td ac-page-header style="vertical-align: top;text-align: center;height:10px;">
              <table width="100%" style="border-style: solid;border-color: black;border-width: 1px;" cellspacing="0">
                <tr>
                  <td style="padding-left: 5px;border-right-style:none;border-bottom-style: solid;border-bottom-color: black;border-bottom-width: 1px; width: 65%">
                    <strong style="font-size: 20px;text-transform: uppercase;">{{data.accountee.accountee_name}}</strong><br>
                    {{data.accountee_addresses[0].address_line_1}}, {{data.accountee_addresses[0].address_line_2}},<br>
                    {{data.accountee_addresses[0].city_name}} - {{data.accountee_addresses[0].postal_code}},
                    {{data.accountee_addresses[0].state_name}}, {{data.accountee_addresses[0].country_name}}<br> Ph.
                    <span>{{data.accountee_phone_numbers[0].phone_number_value}}</span>
                  </td>
                  <td style="text-align: center;border-bottom-style: solid;border-bottom-color: black;border-bottom-width: 1px;">
                    {{data.print_type}}<br> {{data.sale_invoice_title}} | {{data.memo_type}}
                  </td>
                </tr>
                <tr>
                  <td style="padding-left: 5px;border-right-style: none;"> M/S:
                    <strong>{{data.display_name}}</strong><br> {{data.sale_invoice_address[0].address_line_1}},
                    {{data.sale_invoice_address[0].address_line_2}},<br> {{data.sale_invoice_address[0].city_name}} -
                    {{data.sale_invoice_address[0].postal_code}}, {{data.sale_invoice_address[0].state_name}},
                    {{data.sale_invoice_address[0].country_name}}<br> Ph.
                    {{data.party_phone_numbers[0].phone_number_value}}<br> GST:- {{data.party.legal_identifier}}
                  </td>
                  <td style="border-left-style: none;text-align:right;">
                    <table style="width:100%;">
                      <tr>
                        <td class="text-end">Invoice No. : </td>
                        <td class="text-center"><b>{{data.sale_invoice.sale_invoice_number}}</b></td>
                      </tr>
                      <tr>
                        <td class="text-end">Invoice Date :</td>
                        <td class="text-center"><b>{{data.sale_invoice.sale_invoice_datetime | date:'dd-MM-yyyy'}}</b></td>
                      </tr>
                      <tr>
                        <td class="text-end">Vehicle&nbsp;No.&nbsp;:</td>
                        <td class="text-center"><b></b></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td ac-page-body style="vertical-align: top;">
              <table height="100%" class="main-details" width="100%" cellspacing="0" style="border-top: none;font-size: 12px;">
                <thead>
                  <tr style="max-height:0.4cm;min-height: 0.4cm;height:0.4cm;">
                    <th class="sr_no">#</th>
                    <th class="item_description">Item</th>
                    <th class="item_hsn">HSN</th>
                    <th class="item_qty">Qty</th>
                    <th class="item_unit">Unit</th>
                    <th class="item_rate" show-tax>Rate</th>
                    <th class="item_tax_rate" show-tax>Tax&nbsp;Rate</th>
                    <th class="item_tax_amount" show-tax>Taxable&nbsp;Amt</th>
                    <th class="cgst" ac:if="data.sale_invoice.supply_mode == 'INTRA'">CGST</th>
                    <th class="sgst" ac:if="data.sale_invoice.supply_mode == 'INTRA'">SGST</th>
                    <th class="igst" ac:if="data.sale_invoice.supply_mode == 'INTER'">IGST</th>
                    <th class="item_amount">Amount</th>
                  </tr>
                </thead>
                <tbody class="product-tbody" ac:for="let item of data.sale_invoice_products;let index;">
                  <tr class="product-row">
                    <td class="sr_no">{{index + 1}}</td>
                    <td class="item_description">{{item.product_description}}</td>
                    <td class="item_hsn">{{item.hsn_code}}</td>
                    <td class="item_qty">{{item.product_quantity | number:'2'}}</td>
                    <td class="item_unit">{{item.product_uom_name}}</td>
                    <td class="item_rate">{{item.product_price_gross | currency:'INR'}}</td>
                    <td class="item_tax_rate">{{item.tax_rate_percentage | percent:'2'}}</td>
                    <td class="item_tax_amount">{{item.taxable_amount | currency:'INR'}}</td>
                    <td class="cgst" ac:if="data.sale_invoice.supply_mode == 'INTRA'">
                      {{item.tax_amount/2 | currency:'INR'}}
                    </td>
                    <td class="sgst" ac:if="data.sale_invoice.supply_mode == 'INTRA'">
                      {{item.tax_amount/2 | currency:'INR'}}
                    </td>
                    <td class="igst" ac:if="data.sale_invoice.supply_mode == 'INTER'">
                      {{item.tax_amount | currency:'INR'}}
                    </td>
                    <td class="item_amount">{{item.product_amount | currency:'INR'}}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style="max-height:0.4cm;min-height: 0.4cm;height:0.4cm;border-top-style: solid;border-bottom-style: solid;border-width:1px">
                    <th colspan="2" style="text-align: left;">GST No. {{data.accountee.legal_identifier}}</th>
                    <th colspan="2" style="text-align: center;">Page {{page.number}} of {{report.pages}}</th>
                    <th class="total_text" colspan="2" style="text-align: right;"><span ac-report-footer>Total</span></th>
                    <th class="total_tax_rate" show-tax></th>
                    <th class="total_taxable_amount item_tax_amount">
                      <span ac-report-footer>{{data.sale_invoice_summary.total_taxable_amount | currency:'INR'}}</span>
                    </th>
                    <th class="total_cgst cgst" ac:if="data.sale_invoice.supply_mode == 'INTRA'">
                      <span ac-report-footer>{{data.sale_invoice_summary.total_cgst_amount | currency:'INR'}}</span>
                    </th>
                    <th class="total_sgst sgst" ac:if="data.sale_invoice.supply_mode == 'INTRA'">
                      <span ac-report-footer>{{data.sale_invoice_summary.total_sgst_amount | currency:'INR'}}</span>
                    </th>
                    <th class="total_igst igst" ac:if="data.sale_invoice.supply_mode == 'INTER'">
                      <span ac-report-footer>{{data.sale_invoice_summary.total_igst_amount | currency:'INR'}}</span>
                    </th>
                    <th class="total_amount item_amount">
                      <span ac-report-footer>{{data.sale_invoice_summary.total_amount | currency:'INR'}}</span>
                    </th>
                  </tr>
                </tfoot>
              </table>
            </td>
          </tr>
          <tr>
            <td ac-page-footer style="vertical-align: top;height:10px;font-size:14px;">
              <table width="100%" style="border: 1px solid black;" cellspacing="0">
                <tr style="border-bottom: 1px solid black;">
                  <td style="padding-left: 5px;vertical-align: top;width: 65%;">
                    <span style="text-align: justify-all;font-size: 12px;" ac:bind:innerHTML="data.terms_html"></span>
                  </td>
                  <td style="text-align: right;padding-right: 8px;">
                    <p style="margin: 0px;">for, {{data.accountee.accountee_name}}</p> <br>
                    <p style="margin: 0px;margin-top: 10px;">Authorised Signatory</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="border-top: 1px solid black;text-align: center;font-size: 10px">
                    This is computer-generated document. Generated with <b>Accountea</b>. For more information visit <b>www.accountea.com</b>.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>`;

function createRetailCompactData(itemCount: number = 18) {
  const sampleItems = [
    { product_description: 'Vasant Haldar Powder 200gm', hsn_code: '09103030', product_quantity: 1, product_uom_name: 'NOS', product_price_gross: 82.86, tax_rate_percentage: 5, taxable_amount: 82.86, tax_amount: 4.14, product_amount: 87.00 },
    { product_description: 'Patanjali Dant Kanti Toothpaste 40gm', hsn_code: '33061020', product_quantity: 1, product_uom_name: 'NOS', product_price_gross: 19.05, tax_rate_percentage: 5, taxable_amount: 19.05, tax_amount: 0.96, product_amount: 20.00 },
    { product_description: 'Santoor Skin Moisturising Soap (Pack of 4*44gm)', hsn_code: '34011190', product_quantity: 1, product_uom_name: 'NOS', product_price_gross: 38.10, tax_rate_percentage: 5, taxable_amount: 38.10, tax_amount: 1.90, product_amount: 40.00 },
    { product_description: 'Parachute Advansed Jasmine Oil 42ml', hsn_code: '33059011', product_quantity: 2, product_uom_name: 'NOS', product_price_gross: 19.05, tax_rate_percentage: 5, taxable_amount: 38.10, tax_amount: 1.90, product_amount: 40.00 },
    { product_description: 'Bajaj Coconut Oil 45ml', hsn_code: '15131900', product_quantity: 1, product_uom_name: 'NOS', product_price_gross: 19.05, tax_rate_percentage: 5, taxable_amount: 19.05, tax_amount: 0.96, product_amount: 20.00 },
    { product_description: 'Society Tea 250gm', hsn_code: '09023020', product_quantity: 1, product_uom_name: 'NOS', product_price_gross: 119.05, tax_rate_percentage: 5, taxable_amount: 119.05, tax_amount: 5.96, product_amount: 125.00 },
    { product_description: 'Clinic Plus Health Shampoo Strength & Thick 5.5ml', hsn_code: '33051090', product_quantity: 3, product_uom_name: 'NOS', product_price_gross: 0.95, tax_rate_percentage: 5, taxable_amount: 2.86, tax_amount: 0.14, product_amount: 3.00 },
    { product_description: 'Loose Moong Dal 500gm', hsn_code: '0713', product_quantity: 1, product_uom_name: 'NOS', product_price_gross: 65.00, tax_rate_percentage: 0, taxable_amount: 65.00, tax_amount: 0, product_amount: 65.00 },
    { product_description: 'Loose Mogar Dal 500gm', hsn_code: '0713', product_quantity: 1, product_uom_name: 'NOS', product_price_gross: 65.00, tax_rate_percentage: 0, taxable_amount: 65.00, tax_amount: 0, product_amount: 65.00 },
    { product_description: 'Maggi 2Min Masala 52gm', hsn_code: '19023010', product_quantity: 2, product_uom_name: 'NOS', product_price_gross: 9.52, tax_rate_percentage: 5, taxable_amount: 19.05, tax_amount: 0.96, product_amount: 20.00 },
    { product_description: 'Havmor Vanilla Cup 55ml', hsn_code: '21050000', product_quantity: 1, product_uom_name: 'NOS', product_price_gross: 9.52, tax_rate_percentage: 5, taxable_amount: 9.52, tax_amount: 0.48, product_amount: 10.00 },
    { product_description: 'Loose Sugar S1 1kg', hsn_code: '1701', product_quantity: 1, product_uom_name: 'NOS', product_price_gross: 52.38, tax_rate_percentage: 5, taxable_amount: 52.38, tax_amount: 2.62, product_amount: 55.00 },
    { product_description: 'Loose Sabudana 500gm', hsn_code: '11062010', product_quantity: 1, product_uom_name: 'NOS', product_price_gross: 43.00, tax_rate_percentage: 0, taxable_amount: 43.00, tax_amount: 0, product_amount: 43.00 },
    { product_description: 'Loose Basmati Khusdil 1kg', hsn_code: '1006', product_quantity: 1, product_uom_name: 'NOS', product_price_gross: 90.00, tax_rate_percentage: 0, taxable_amount: 90.00, tax_amount: 0, product_amount: 90.00 },
    { product_description: 'Britannia Vita Marie Gold 70gm', hsn_code: '19053100', product_quantity: 1, product_uom_name: 'NOS', product_price_gross: 9.52, tax_rate_percentage: 5, taxable_amount: 9.52, tax_amount: 0.48, product_amount: 10.00 },
    { product_description: 'Mamra Patel 500gm', hsn_code: '19041020', product_quantity: 1, product_uom_name: 'NOS', product_price_gross: 38.10, tax_rate_percentage: 5, taxable_amount: 38.10, tax_amount: 1.90, product_amount: 40.00 },
    { product_description: 'Amul Dahi 700gm', hsn_code: '0403', product_quantity: 1, product_uom_name: 'NOS', product_price_gross: 50.00, tax_rate_percentage: 0, taxable_amount: 50.00, tax_amount: 0, product_amount: 50.00 },
    { product_description: 'Amul Butter Milk 680ml', hsn_code: '0403', product_quantity: 1, product_uom_name: 'NOS', product_price_gross: 20.00, tax_rate_percentage: 0, taxable_amount: 20.00, tax_amount: 0, product_amount: 20.00 }
  ];

  let items = sampleItems;
  if (itemCount !== 18) {
    items = Array.from({ length: itemCount }, (_, i) => ({
      product_description: `Product Item #${i + 1}`,
      hsn_code: `${1000 + i}`,
      product_quantity: 1 + (i % 5),
      product_uom_name: 'NOS',
      product_price_gross: 25.00 + i * 5,
      tax_rate_percentage: 5,
      taxable_amount: 25.00 + i * 5,
      tax_amount: (25.00 + i * 5) * 0.05,
      product_amount: (25.00 + i * 5) * 1.05
    }));
  }

  const taxableTotal = items.reduce((acc, x) => acc + x.taxable_amount, 0);
  const taxTotal = items.reduce((acc, x) => acc + x.tax_amount, 0);
  const grandTotal = items.reduce((acc, x) => acc + x.product_amount, 0);

  return {
    accountee: {
      accountee_name: 'SH MART',
      legal_identifier: '24HENPP2843N1ZS'
    },
    accountee_addresses: [
      {
        address_line_1: 'Opp. Walk Way Garden,',
        address_line_2: 'Pij Road, Near Canal',
        city_name: 'Nadiad',
        postal_code: '387002',
        state_name: 'Gujarat',
        country_name: 'India'
      }
    ],
    accountee_phone_numbers: [{ phone_number_value: '8866268666' }],
    print_type: 'Original for Receipent',
    sale_invoice_title: 'Tax Invoice',
    memo_type: 'Cash Memo',
    display_name: 'Walk-in Retail Customer',
    sale_invoice_address: [
      {
        address_line_1: 'Main Market Road',
        address_line_2: 'Near Town Hall',
        city_name: 'Nadiad',
        postal_code: '387001',
        state_name: 'Gujarat',
        country_name: 'India'
      }
    ],
    party_phone_numbers: [{ phone_number_value: '9876543210' }],
    party: { legal_identifier: 'URP' },
    sale_invoice: {
      sale_invoice_number: '30251',
      sale_invoice_datetime: '2026-10-08',
      supply_mode: 'INTRA'
    },
    sale_invoice_products: items,
    sale_invoice_summary: {
      total_taxable_amount: taxableTotal,
      total_cgst_amount: taxTotal / 2,
      total_sgst_amount: taxTotal / 2,
      total_amount: grandTotal
    },
    terms_html: 'Goods once sold cannot be returned. Subject to local jurisdiction.',
    page: { margin_top: '5mm', margin_bottom: '5mm', margin_left: '5mm', margin_right: '5mm' }
  };
}

export const FINANCIAL_STATEMENT_HTML = `<html>
  <head>
    <style>
      .report-side-head {
        text-align: left;
        border-bottom: none;
      }
      .no-top-border {
        border-top-style: none;
      }
      .no-bottom-border {
        border-top-style: none;
      }
      .border-bottom {
        border-bottom: solid 1px black !important;
      }
      .balance {
        padding: 2px 5px !important;
        width: 120px;
      }
      .account {
        padding: 2px 5px !important;
      }
    </style>
  </head>
  <body>
    <div class="report" style="margin:auto;width:fit-content;font:arial;" ac-report>
      <div class="page" ac:style:padding-top="data.page.margin_top" ac:style:padding-left="data.page.margin_left"
        ac:style:padding-bottom="data.page.margin_bottom" ac:style:padding-right="data.page.margin_right" ac-page
        ac-page-size="A4" ac-page-orientation="portrait">
        <table style="height:-webkit-fill-available;width:100%;">
          <tr>
            <td ac-page-header style="vertical-align: top;text-align: center;height:10px;">
              <h3 style="margin-bottom:0px;" class="accountee-name">{{data.accountee.accountee_name}}</h3><span
                class="report-title" style="text-transform:capitalize;"><b>{{data.type.toLowerCase()}}</b></span> as on
              <b>{{data.end_date | date:'dd-MM-yyyy'}}</b>
              <table class="mt-3" style="width:100%;border-top:solid 1px black;border-bottom:solid 1px black;"
                cellspacing="0">
                <thead>
                  <tr class="side-container">
                    <th class="side-debit report-side-head pb-1 debit-title"
                      style="min-width:50%;max-width: 50%;width: 50%;vertical-align: top;"> <span
                        ac:if="data.type == 'BALANCE SHEET'">Liabilities</span> <span
                        ac:if="['TRADING ACCOUNT','TRAIAL BALANCE'].includes(data.type)">Debit</span> <span
                        ac:if="data.type == 'PROFIT AND LOSS ACCOUNT'">Expenses</span> </th>
                    <th class="side-credit pb-1 credit-title"
                      style="min-width:50%;max-width: 50%;width: 50%;vertical-align: top;"> <span
                        ac:if="data.type == 'BALANCE SHEET'">Assets</span> <span
                        ac:if="['TRADING ACCOUNT','TRIAL BALANCE'].includes(data.type)">Credit</span> <span
                        ac:if="data.type == 'PROFIT AND LOSS ACCOUNT'">Incomes</span> </th>
                  </tr>
                </thead>
              </table>
            </td>
          </tr>
          <tr>
            <td ac-page-body style="vertical-align: top;">
              <table style="width:100%;height: 100%;" cellspacing="0">
                <tbody>
                  <tr class="side-container">
                    <td class="side-debit" style="min-width:50%;max-width: 50%;width: 50%;vertical-align: top;">
                      <table class="table table-striped mb-0" style="width:100%;">
                        <thead>
                          <tr>
                            <th class="text-left balance">Balance</th>
                            <th class="text-left account">Account</th>
                          </tr>
                        </thead>
                        <tbody ac:for="let item of data.debit_balances;let index;">
                          <tr class="tr-record-row" style="font-size:14px;">
                            <td class="balance ps-4">{{item.ledger_account_balance | currency:'INR'}}</td>
                            <td class="account">{{item.ledger_account_name}}</td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr ac:if="data.type=='PROFIT AND LOSS ACCOUNT' && data.gross_profit > 0" style="font-size: 14px;">
                            <td class="balance ps-4">{{data.gross_profit | currency:'INR'}}</td>
                            <td class="account">Gross Loss</td>
                          </tr>
                        </tfoot>
                      </table>
                    </td>
                    <td class="side-credit" style="min-width:50%;max-width: 50%;width: 50%;vertical-align: top;">
                      <table class="table table-striped mb-0" style="width:100%;">
                        <thead>
                          <tr>
                            <th class="text-left balance">Balance</th>
                            <th class="text-left account">Account</th>
                          </tr>
                        </thead>
                        <tbody ac:for="let item of data.credit_balances;let index;">
                          <tr class="tr-record-row" style="font-size:14px;">
                            <td class="balance ps-4">{{item.ledger_account_balance | currency:'INR'}}</td>
                            <td class="account">{{item.ledger_account_name}}</td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr ac:if="data.type=='PROFIT AND LOSS ACCOUNT' && data.gross_profit < 0" style="font-size: 14px;">
                            <td class="balance ps-4">{{data.gross_profit * -1 | currency:'INR'}}</td>
                            <td class="account">Gross Profit</td>
                          </tr>
                        </tfoot>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td ac-page-footer style="vertical-align: top;height:10px;font-size:14px;">
              <table style="width:100%;height: 100%;border-top:solid 1px black;" cellspacing="0">
                <tfoot>
                  <tr class="side-container">
                    <td class="side-debit" style="min-width:50%;max-width: 50%;width: 50%;vertical-align: top;">
                      <table style="width:100%;font-weight: bold;" cellspacing="0">
                        <tfoot>
                          <tr style="max-height:0.4cm;min-height: 0.4cm;height:0.4cm;">
                            <td class="balance debit-total-amount border-bottom text-end">{{data.debit_total | currency:'INR'}}</td>
                            <td class="account_name border-bottom ps-2"> <span
                                ac:if="data.type == 'BALANCE SHEET'">Liabilities</span> <span
                                ac:if="['TRADING ACCOUNT','TRAIAL BALANCE'].includes(data.type)">Debit</span> <span
                                ac:if="data.type == 'PROFIT AND LOSS ACCOUNT'">Expenses</span> Total </td>
                          </tr>
                          <tr style="max-height:0.4cm;min-height: 0.4cm;height:0.4cm;">
                            <td class="balance debit-balance-amount border-bottom text-end"><span ac:if="data.debit_balance > 0">{{data.debit_balance | currency:'INR'}}</span>&nbsp;</td>
                            <td class="account_name debit-balance-label border-bottom ps-2">{{data.debit_balance_label}}&nbsp;</td>
                          </tr>
                          <tr style="max-height:0.4cm;min-height: 0.4cm;height:0.4cm;">
                            <td class="balance total-amount border-bottom text-end">{{data.total | currency:'INR'}}</td>
                            <td class="account_name total_text border-bottom ps-2">Total</td>
                          </tr>
                        </tfoot>
                      </table>
                    </td>
                    <td class="side-credit" style="min-width:50%;max-width: 50%;width: 50%;vertical-align: top;">
                      <table style="width:100%;font-weight: bold;" cellspacing="0">
                        <tfoot>
                          <tr style="max-height:0.4cm;min-height: 0.4cm;height:0.4cm;">
                            <td class="balance credit-total-amount border-bottom text-end">{{data.credit_total | currency:'INR'}}</td>
                            <td class="account_name border-bottom ps-2"><span
                                ac:if="data.type == 'BALANCE SHEET'">Assets</span> <span
                                ac:if="['TRADING ACCOUNT','TRAIAL BALANCE'].includes(data.type)">Credit</span> <span
                                ac:if="data.type == 'PROFIT AND LOSS ACCOUNT'">Incomes</span> Total </td>
                          </tr>
                          <tr style="max-height:0.4cm;min-height: 0.4cm;height:0.4cm;">
                            <td class="balance credit-balance-amount border-bottom text-end">
                              <span ac:if="data.credit_balance > 0">{{data.credit_balance | currency:'INR'}}</span>
                              &nbsp;
                            </td>
                            <td class="account_name credit-balance-label border-bottom ps-2">
                              {{data.credit_balance_label}}
                              &nbsp;
                            </td>
                          </tr>
                          <tr style="max-height:0.4cm;min-height: 0.4cm;height:0.4cm;">
                            <td class="balance total-amount border-bottom text-end">{{data.total | currency:'INR'}}</td>
                            <td class="account_name total_text border-bottom ps-2">Total</td>
                          </tr>
                        </tfoot>
                      </table>
                    </td>
                  </tr>
                </tfoot>
              </table>
              <div class="mt-2 text-muted" style="font-size:12px;"><span class="float-start">Generated using <b>Accountea</b></span><span class="float-end">Page
                  {{page.number}} of {{report.pages}}</span> </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>`;

export const FINANCIAL_STATEMENT_SCRIPT = `
  if(data.debit_total > data.credit_total){
    data.total = data.debit_total;
  }
  else{
    data.total = data.credit_total;
  }
  if(data.type == 'BALANCE SHEET'){
    const creditBalances = [...data.credit_balances];
    const debitTotal = data.debit_total;
    data.debit_total = data.credit_total;
    data.credit_total = debitTotal;
    data.balance = data.balance * -1;
    data.credit_balances = [...data.debit_balances];
    data.debit_balances = creditBalances;
  }
  if(data.balance > 0){
    data.credit_balance = data.balance;
    if(data.type == 'TRADING ACCOUNT'){
      data.credit_balance_label = 'Gross Loss';
    }
    else if(data.type == 'PROFIT AND LOSS ACCOUNT'){
      data.credit_balance_label = 'Net Loss';
    }
    else if(data.type == 'BALANCE SHEET'){
      data.credit_balance_label = 'Net Loss';
    }
  }
  else{
    data.debit_balance = data.balance * -1;
    if(data.type == 'TRADING ACCOUNT'){
      data.debit_balance_label = 'Gross Profit';
    }
    else if(data.type == 'PROFIT AND LOSS ACCOUNT'){
      data.debit_balance_label = 'Net Profit';
    }
    else if(data.type == 'BALANCE SHEET'){
      data.debit_balance_label = 'Net Profit';
    }
  }
`;

function createBalanceSheetData(numDebit: number, numCredit: number) {
  const debitBalances = Array.from({ length: numDebit }, (_, i) => ({
    ledger_account_balance: 10000 + i * 250,
    ledger_account_name: `Capital & Reserves Account #${i + 1} Ltd`
  }));
  const creditBalances = Array.from({ length: numCredit }, (_, i) => ({
    ledger_account_balance: 12000 + i * 180,
    ledger_account_name: `Fixed & Current Asset Account #${i + 1} Corp`
  }));
  const debitTotal = debitBalances.reduce((acc, x) => acc + x.ledger_account_balance, 0);
  const creditTotal = creditBalances.reduce((acc, x) => acc + x.ledger_account_balance, 0);

  return {
    type: 'BALANCE SHEET',
    accountee: { accountee_name: 'ShreeHari Softech Corporation' },
    end_date: '2026-03-31',
    debit_balances: debitBalances,
    credit_balances: creditBalances,
    debit_total: debitTotal,
    credit_total: creditTotal,
    balance: creditTotal - debitTotal,
    page: { margin_top: '10mm', margin_bottom: '10mm', margin_left: '10mm', margin_right: '10mm' }
  };
}

export const LEDGER_STATEMENT_HTML = `<html>
  <head>
    <style>
      .account { padding: 4px 6px !important; }
      .date { width: 95px; padding: 4px 6px !important; white-space: nowrap; }
      .doc-no { width: 14%; padding: 4px 6px !important; }
      .debit, .credit, .balance { width: 15%; padding: 4px 6px !important; text-align: right; }
      table { border-collapse: collapse; width: 100%; }
    </style>
  </head>
  <body>
    <div class="report" style="margin:auto;width:fit-content;font-family: Arial, sans-serif;" ac-report>
      <div class="page" ac:style:padding-top="data.page.margin_top" ac:style:padding-left="data.page.margin_left"
        ac:style:padding-bottom="data.page.margin_bottom" ac:style:padding-right="data.page.margin_right" ac-page
        ac-page-size="A4" ac-page-orientation="portrait">
        <table style="height:-webkit-fill-available;width:100%;">
          <tr>
            <td ac-page-header style="vertical-align: top;text-align: center;height:10px;">
              <h3 style="margin-bottom:4px;" class="fw-bold">{{data.accountee.accountee_name}}</h3>
              <div class="text-muted small">Comprehensive Ledger Statement</div>
              <div class="mt-2 mb-3 pb-2 border-bottom text-center">
                Statement of <b>{{data.ledger_account.ledger_account_name}}</b><br>
                From <b>{{data.start_date | date:'dd-MM-yyyy'}}</b> to <b>{{data.end_date | date:'dd-MM-yyyy'}}</b>
              </div>
            </td>
          </tr>
          <tr>
            <td ac-page-body style="vertical-align: top;">
              <table class="table table-striped table-bordered mb-0">
                <thead class="table-light" ac:repeat-header>
                  <tr>
                    <th class="text-center date">Date</th>
                    <th class="text-center doc-no">Doc#</th>
                    <th class="text-start account">Description / Narration</th>
                    <th class="text-end debit">Debit</th>
                    <th class="text-end credit">Credit</th>
                    <th class="text-end balance">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="font-weight: 600; background: #f8fafc;" ac:if="data.opening_balance != 0">
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="account">Opening Balance</td>
                    <td class="text-end debit"><span ac:if="data.opening_balance > 0">{{data.opening_balance | currency:'INR'}}</span></td>
                    <td class="text-end credit"><span ac:if="data.opening_balance < 0">{{data.opening_balance * -1 | currency:'INR'}}</span></td>
                    <td class="text-end balance">{{data.opening_balance | currency:'INR'}}</td>
                  </tr>
                </tbody>
                <tbody ac:for="let item of data.transaction_entries;let index;">
                  <tr style="font-size:13px;">
                    <td class="text-center date">{{item.transaction_time | date:'dd-MM-yyyy'}}</td>
                    <td class="text-center doc-no">{{item.reference_number}}</td>
                    <td class="text-start account">{{item.transaction_entry_narration}}</td>
                    <td class="text-end debit"><span ac:if="item.is_credit == 0">{{item.debit_amount | currency:'INR'}}</span></td>
                    <td class="text-end credit"><span ac:if="item.is_credit == 1">{{item.credit_amount | currency:'INR'}}</span></td>
                    <td class="text-end balance">{{item.ledger_account_balance | currency:'INR'}}</td>
                  </tr>
                </tbody>
                <tfoot class="table-dark" ac-report-footer>
                  <tr style="font-weight:bold; font-size:13px;">
                    <th colspan="3" class="text-end">Closing Totals & Balance:</th>
                    <th class="text-end debit">{{data.debit_total | currency:'INR'}}</th>
                    <th class="text-end credit">{{data.credit_total | currency:'INR'}}</th>
                    <th class="text-end balance">{{data.balance | currency:'INR'}}</th>
                  </tr>
                </tfoot>
              </table>
            </td>
          </tr>
          <tr>
            <td ac-page-footer style="vertical-align: top;height:10px;font-size:12px;padding-top:10px;border-top:1px solid #cbd5e1;">
              <span class="float-start text-muted">Generated by <b>Accountea Engine</b></span>
              <span class="float-end text-muted">Page <b>{{page.number}}</b> of <b>{{report.pages}}</b></span>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>`;

function createLedgerData(entryCount: number) {
  let running = 50000;
  const entries = Array.from({ length: entryCount }, (_, i) => {
    const isCredit = i % 2 === 0 ? 0 : 1;
    const amount = 500 + (i * 120);
    running = isCredit === 0 ? running + amount : running - amount;
    return {
      transaction_time: '2026-04-15',
      reference_number: `TXN-${1000 + i}`,
      transaction_entry_narration: `Payment settlement for batch invoice order #${i + 101}`,
      is_credit: isCredit,
      debit_amount: isCredit === 0 ? amount : 0,
      credit_amount: isCredit === 1 ? amount : 0,
      ledger_account_balance: running
    };
  });

  const debitTotal = entries.reduce((acc, x) => acc + x.debit_amount, 0);
  const creditTotal = entries.reduce((acc, x) => acc + x.credit_amount, 0);

  return {
    accountee: { accountee_name: 'Apex Industrial Corporation' },
    ledger_account: { ledger_account_name: 'Sundry Debtors - Northern Region' },
    start_date: '2026-04-01',
    end_date: '2026-05-31',
    opening_balance: 50000,
    transaction_entries: entries,
    debit_total: debitTotal,
    credit_total: creditTotal,
    balance: running,
    page: { margin_top: '10mm', margin_bottom: '10mm', margin_left: '10mm', margin_right: '10mm' }
  };
}

export const THERMAL_POS_HTML = `<html>
  <head>
    <style type="text/css">
      table { border-collapse: collapse; font-size: 11px; width: 100%; font-family: monospace; }
      th, td { padding: 3px 2px; }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      .text-left { text-align: left; }
      hr { border: none; border-top: 1px dashed black; margin: 6px 0; }
    </style>
  </head>
  <body>
    <div style="margin:auto;width:fit-content;" ac-report>
      <div class="page" ac:style:padding-top="data.page.margin_top" ac:style:padding-left="data.page.margin_left"
        ac:style:padding-bottom="data.page.margin_bottom" ac:style:padding-right="data.page.margin_right" ac-page
        ac-page-size="ROLL_76" ac-page-orientation="portrait">
        <table style="width:100%;height:-webkit-fill-available;" cellspacing="0" cellpadding="0">
          <tr>
            <td ac-page-header style="vertical-align: top;text-align: center;height:10px;">
              <h4 style="margin:0;font-weight:bold;">{{data.accountee.accountee_name}}</h4>
              <div style="font-size:11px;">Store #42, City Mall Avenue</div>
              <div style="font-size:10px;">GST: {{data.accountee.legal_identifier}}</div>
              <hr>
              <div style="display:flex; justify-content:space-between; font-size:11px;">
                <span>Receipt: <b>#{{data.sale_invoice_number}}</b></span>
                <span>{{data.sale_invoice_datetime | date:'dd-MM-yyyy'}}</span>
              </div>
              <div style="font-size:11px; text-align:left;">Cashier: <b>Counter-01</b></div>
              <hr>
            </td>
          </tr>
          <tr>
            <td ac-page-body style="vertical-align: top;">
              <table>
                <thead>
                  <tr style="border-bottom: 1px solid black;">
                    <th class="text-left" style="width: 50%;">Item</th>
                    <th class="text-center" style="width: 15%;">Qty</th>
                    <th class="text-right" style="width: 15%;">Rate</th>
                    <th class="text-right" style="width: 20%;">Total</th>
                  </tr>
                </thead>
                <tbody ac:for="let item of data.products;let index;">
                  <tr>
                    <td class="text-left">{{item.name}}</td>
                    <td class="text-center">{{item.qty}}</td>
                    <td class="text-right">{{item.rate | currency:'INR'}}</td>
                    <td class="text-right">{{item.amount | currency:'INR'}}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td ac-page-footer style="vertical-align: top;height:10px;padding-top:10px;">
              <hr>
              <table>
                <tr>
                  <td class="text-left">Subtotal:</td>
                  <td class="text-right"><b>{{data.subtotal | currency:'INR'}}</b></td>
                </tr>
                <tr>
                  <td class="text-left">GST (5%):</td>
                  <td class="text-right">{{data.tax | currency:'INR'}}</td>
                </tr>
                <tr style="font-size: 13px; font-weight: bold;">
                  <td class="text-left">NET PAYABLE:</td>
                  <td class="text-right">{{data.grand_total | currency:'INR'}}</td>
                </tr>
              </table>
              <hr>
              <div style="text-align:center; font-size:11px; margin-top:8px;">
                *** THANK YOU FOR SHOPPING ***<br>
                Please visit us again!
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>`;

function createThermalData(itemCount: number) {
  const items = Array.from({ length: itemCount }, (_, i) => {
    const qty = 1 + (i % 4);
    const rate = 45 + (i * 15);
    return {
      name: `SKU-${100 + i} Groceries`,
      qty: qty,
      rate: rate,
      amount: qty * rate
    };
  });
  const subtotal = items.reduce((acc, x) => acc + x.amount, 0);
  const tax = Math.round(subtotal * 0.05);

  return {
    accountee: {
      accountee_name: 'Metro Supermarket Express',
      legal_identifier: '24ABCDE1234F1Z5'
    },
    sale_invoice_number: 'POS/2026/9821',
    sale_invoice_datetime: '2026-05-12',
    products: items,
    subtotal: subtotal,
    tax: tax,
    grand_total: subtotal + tax,
    page: { margin_top: '5mm', margin_bottom: '5mm', margin_left: '4mm', margin_right: '4mm' }
  };
}

export const SALE_INVOICE_HTML = `<html>
  <head>
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #334155; }
      table { width: 100%; border-collapse: collapse; }
      .invoice-header { border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
      .company-title { color: #1e3a8a; font-weight: 800; font-size: 22px; margin: 0; }
      .invoice-badge { background: #2563eb; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold; }
      .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 20px; }
      .table-custom th { background-color: #f1f5f9; color: #1e293b; font-weight: 600; padding: 8px; border: 1px solid #cbd5e1; }
      .table-custom td { padding: 8px; border: 1px solid #e2e8f0; font-size: 13px; }
      .total-row td { font-weight: bold; background-color: #f8fafc; }
    </style>
  </head>
  <body>
    <div class="report" style="margin:auto;width:fit-content;" ac-report>
      <div class="page" ac:style:padding-top="data.page.margin_top" ac:style:padding-left="data.page.margin_left"
        ac:style:padding-bottom="data.page.margin_bottom" ac:style:padding-right="data.page.margin_right" ac-page
        ac-page-size="A4" ac-page-orientation="portrait">
        <table style="height:-webkit-fill-available;width:100%;">
          <tr>
            <td ac-page-header style="vertical-align: top;height:10px;">
              <div class="d-flex justify-content-between align-items-center invoice-header">
                <div>
                  <h2 class="company-title">{{data.seller.company_name}}</h2>
                  <div class="text-muted small">{{data.seller.address}} | GST: {{data.seller.gstin}}</div>
                </div>
                <div class="text-end">
                  <span class="invoice-badge">TAX INVOICE</span>
                  <div class="fw-bold mt-2">Inv #: {{data.invoice_number}}</div>
                  <div class="small text-muted">Date: {{data.invoice_date | date:'dd-MM-yyyy'}}</div>
                </div>
              </div>
              <div class="meta-box">
                <div class="row">
                  <div class="col-6">
                    <div class="text-uppercase text-muted small fw-bold mb-1">Bill To Customer</div>
                    <div class="fw-bold fs-6">{{data.buyer.customer_name}}</div>
                    <div class="small text-muted">{{data.buyer.address}}</div>
                    <div class="small text-muted">GSTIN: {{data.buyer.gstin}}</div>
                  </div>
                  <div class="col-6 text-end">
                    <div class="small"><b>Place of Supply:</b> {{data.buyer.state}}</div>
                    <div class="small"><b>Payment Mode:</b> {{data.payment_mode}}</div>
                    <div class="small"><b>Due Date:</b> {{data.due_date | date:'dd-MM-yyyy'}}</div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td ac-page-body style="vertical-align: top;">
              <table class="table-custom mb-4">
                <thead ac:repeat-header>
                  <tr>
                    <th style="width: 40px;" class="text-center">#</th>
                    <th class="text-start">Item Description</th>
                    <th style="width: 80px;" class="text-center">HSN</th>
                    <th style="width: 60px;" class="text-end">Qty</th>
                    <th style="width: 100px;" class="text-end">Unit Price</th>
                    <th style="width: 80px;" class="text-end">GST %</th>
                    <th style="width: 110px;" class="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody ac:for="let item of data.items;let index;">
                  <tr>
                    <td class="text-center text-muted">{{index + 1}}</td>
                    <td>
                      <div class="fw-semibold">{{item.name}}</div>
                      <div class="text-muted" style="font-size: 11px;">{{item.sku}}</div>
                    </td>
                    <td class="text-center">{{item.hsn}}</td>
                    <td class="text-end">{{item.qty}}</td>
                    <td class="text-end">{{item.rate | currency:'INR'}}</td>
                    <td class="text-end">{{item.gst_rate}}%</td>
                    <td class="text-end fw-semibold">{{item.amount | currency:'INR'}}</td>
                  </tr>
                </tbody>
                <tfoot ac-report-footer>
                  <tr class="total-row">
                    <td colspan="6" class="text-end">Taxable Amount:</td>
                    <td class="text-end">{{data.subtotal | currency:'INR'}}</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="6" class="text-end">Total GST (CGST + SGST):</td>
                    <td class="text-end">{{data.tax_total | currency:'INR'}}</td>
                  </tr>
                  <tr class="total-row" style="font-size: 15px; color: #1e3a8a;">
                    <td colspan="6" class="text-end fw-bold">Grand Total (INR):</td>
                    <td class="text-end fw-bold">{{data.grand_total | currency:'INR'}}</td>
                  </tr>
                </tfoot>
              </table>
            </td>
          </tr>
          <tr>
            <td ac-page-footer style="vertical-align: top;height:10px;font-size:12px;padding-top:10px;border-top:1px solid #e2e8f0;">
              <div class="d-flex justify-content-between text-muted">
                <div>Terms: Payment due within 30 days. Subject to local jurisdiction.</div>
                <div>Page {{page.number}} of {{report.pages}}</div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>`;

function createSaleInvoiceData(itemCount: number) {
  const items = Array.from({ length: itemCount }, (_, i) => {
    const qty = 2 + (i % 8);
    const rate = 850 + (i * 125);
    const amount = qty * rate;
    return {
      name: `High-Performance Polymer Component Model X-${i + 101}`,
      sku: `SKU-IND-${4000 + i}`,
      hsn: '8481',
      qty: qty,
      rate: rate,
      gst_rate: 18,
      amount: amount
    };
  });

  const subtotal = items.reduce((acc, x) => acc + x.amount, 0);
  const tax = Math.round(subtotal * 0.18);

  return {
    seller: {
      company_name: 'Apex Precision Technologies Ltd.',
      address: 'Plot 45, GIDC Industrial Estate, Surat, Gujarat - 395008',
      gstin: '24AAACA1122B1Z3'
    },
    buyer: {
      customer_name: 'Reliance Global Infrastructure Ltd.',
      address: '7th Floor, Maker Chambers IV, Nariman Point, Mumbai - 400021',
      gstin: '27AABCR9988C1Z1',
      state: 'Maharashtra (27)'
    },
    invoice_number: 'INV/2026-27/00482',
    invoice_date: '2026-05-18',
    due_date: '2026-06-17',
    payment_mode: 'NEFT / RTGS Online',
    items: items,
    subtotal: subtotal,
    tax_total: tax,
    grand_total: subtotal + tax,
    page: { margin_top: '12mm', margin_bottom: '12mm', margin_left: '12mm', margin_right: '12mm' }
  };
}

export const REPORT_FORMATS: IReportFormatDefinition[] = [
  {
    id: 'retail-compact',
    name: 'Retail Compact (A5 Landscape)',
    category: 'Retail & POS',
    badge: 'A5 Compact',
    description: 'Compact retail invoice format in A5 landscape with tax breakdowns and footer terms.',
    html: RETAIL_COMPACT_HTML,
    postProcessCallback: (doc: Document) => {
      for (const bodyEl of Array.from(doc.querySelectorAll('.product-tbody'))) {
        const adjustRow = doc.createElement('tr');
        adjustRow.innerHTML = '<td colspan="1000"></td>';
        bodyEl.append(adjustRow);
      }
    },
    scenarios: [
      {
        label: 'Exact Case: 18 Retail Items (SH MART)',
        data: createRetailCompactData(18)
      },
      {
        label: 'Short Invoice: 5 Retail Items',
        data: createRetailCompactData(5)
      },
      {
        label: 'Extended: 30 Retail Items',
        data: createRetailCompactData(30)
      }
    ]
  },
  {
    id: 'financial-statement',
    name: 'Balance Sheet (Multi-Loop)',
    category: 'Financial Statements',
    badge: 'Two-Column Loops',
    description: 'Two-column financial statement with parallel Debit/Liabilities & Credit/Assets loops and overflow pagination.',
    html: FINANCIAL_STATEMENT_HTML,
    preProcessScript: FINANCIAL_STATEMENT_SCRIPT,
    scenarios: [
      {
        label: 'Exact Case: 115 Liabilities × 88 Assets (7 Pages)',
        data: createBalanceSheetData(115, 88)
      },
      {
        label: 'Medium Case: 25 Liabilities × 25 Assets (2 Pages)',
        data: createBalanceSheetData(25, 25)
      },
      {
        label: 'Single Page: 10 Liabilities × 10 Assets (1 Page)',
        data: createBalanceSheetData(10, 10)
      },
      {
        label: 'Asymmetric: 45 Liabilities × 12 Assets (3 Pages)',
        data: createBalanceSheetData(45, 12)
      }
    ]
  },
  {
    id: 'sale-invoice',
    name: 'Tax Sale Invoice',
    category: 'Commercial Billing',
    badge: 'Tax Invoice',
    description: 'Commercial GST/Tax Sale Invoice with line items, tax breakdown, billing details, and page numbering.',
    html: SALE_INVOICE_HTML,
    scenarios: [
      {
        label: 'Multi-Page: 25 Line Items',
        data: createSaleInvoiceData(25)
      },
      {
        label: 'Single Page: 5 Line Items',
        data: createSaleInvoiceData(5)
      },
      {
        label: 'Extended: 60 Line Items',
        data: createSaleInvoiceData(60)
      }
    ]
  },
  {
    id: 'ledger-statement',
    name: 'Ledger Account Statement',
    category: 'Accounts & Ledgers',
    badge: 'Running Balances',
    description: 'Detailed account ledger statement with date-wise running balances, repeated table headers, and closing totals.',
    html: LEDGER_STATEMENT_HTML,
    scenarios: [
      {
        label: 'Multi-Page: 50 Transactions',
        data: createLedgerData(50)
      },
      {
        label: 'Single Page: 10 Transactions',
        data: createLedgerData(10)
      },
      {
        label: 'High Volume: 120 Transactions',
        data: createLedgerData(120)
      }
    ]
  },
  {
    id: 'thermal-pos',
    name: 'Thermal POS Receipt (80mm)',
    category: 'Point of Sale',
    badge: 'Roll Paper',
    description: 'Thermal POS roll receipt with continuous height calculation, itemized pricing, and store header.',
    html: THERMAL_POS_HTML,
    scenarios: [
      {
        label: 'Standard: 15 POS Items',
        data: createThermalData(15)
      },
      {
        label: 'Short: 4 POS Items',
        data: createThermalData(4)
      },
      {
        label: 'Long: 35 POS Items',
        data: createThermalData(35)
      }
    ]
  }
];
