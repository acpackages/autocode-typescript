import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import { AcReport } from '../src/lib/models/ac-report.model';
import { AcReportEngine } from '../src/lib/core/ac-report-engine';
import { AcEnumPageOrientation } from '../src/lib/enums/ac-enum-page-orientations.enum';

describe('AcReportEngine Comprehensive Test Suite', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('1. Basic Data Binding & Expression Interpolation', async () => {
    const container = document.createElement('div');
    container.setAttribute('ac-report', '');
    container.innerHTML = `
      <div ac-page>
        <h1 class="title">{{ data.title }}</h1>
        <span class="user" ac:bind:title="data.user">{{ data.user }}</span>
        <div class="box" ac:class:active="data.isActive" ac:style:color="data.textColor">Content</div>
      </div>
    `;
    document.body.append(container);

    const report = new AcReport({ element: container });
    await report.generate({
      data: {
        title: 'Monthly Invoice',
        user: 'John Doe',
        isActive: true,
        textColor: 'red',
      },
    });

    const titleEl = container.querySelector('.title');
    expect(titleEl?.textContent?.trim()).toBe('Monthly Invoice');

    const userEl = container.querySelector('.user');
    expect(userEl?.textContent?.trim()).toBe('John Doe');
    expect(userEl?.getAttribute('title')).toBe('John Doe');

    const boxEl = container.querySelector('.box');
    expect(boxEl?.classList.contains('active')).toBe(true);
    expect((boxEl as HTMLElement)?.style.color).toBe('red');
  });

  it('2. Conditional Rendering (ac:if, ac:elseif, ac:else, ac:switch)', async () => {
    const container = document.createElement('div');
    container.setAttribute('ac-report', '');
    container.innerHTML = `
      <div ac-page>
        <div id="status-a" ac:if="data.status == 'A'">Status A</div>
        <div id="status-b" ac:elseif="data.status == 'B'">Status B</div>
        <div id="status-other" ac:else>Status Other</div>

        <div id="switch-box" ac:switch="data.role">
          <span id="role-admin" ac:switch:case="'admin'">Admin Access</span>
          <span id="role-user" ac:switch:case="'user'">User Access</span>
          <span id="role-guest" ac:switch:default>Guest Access</span>
        </div>
      </div>
    `;
    document.body.append(container);

    const report = new AcReport({ element: container });
    await report.generate({
      data: {
        status: 'B',
        role: 'admin',
      },
    });

    expect(container.querySelector('#status-a')).toBeNull();
    expect(container.querySelector('#status-b')?.textContent?.trim()).toBe('Status B');
    expect(container.querySelector('#status-other')).toBeNull();

    expect(container.querySelector('#role-admin')?.textContent?.trim()).toBe('Admin Access');
    expect(container.querySelector('#role-user')).toBeNull();
  });

  it('3. Loops & Pagination (ac:for)', async () => {
    const container = document.createElement('div');
    container.setAttribute('ac-report', '');
    container.innerHTML = `
      <div ac-page>
        <ul ac:for="let item of data.items; let i">
          <li>
            <span class="index">{{ i }}</span> - <span class="name">{{ item.name }}</span>
          </li>
        </ul>
      </div>
    `;
    document.body.append(container);

    const report = new AcReport({ element: container });
    await report.generate({
      data: {
        items: [
          { name: 'Item 1' },
          { name: 'Item 2' },
          { name: 'Item 3' },
        ],
      },
    });

    const items = container.querySelectorAll('li');
    expect(items.length).toBe(3);
    expect(items[0].querySelector('.name')?.textContent?.trim()).toBe('Item 1');
    expect(items[1].querySelector('.name')?.textContent?.trim()).toBe('Item 2');
    expect(items[2].querySelector('.name')?.textContent?.trim()).toBe('Item 3');
  });

  it('4. Page Breaks (ac:break-before, ac:break-after)', async () => {
    const container = document.createElement('div');
    container.setAttribute('ac-report', '');
    container.innerHTML = `
      <div ac-page>
        <div id="sec-1">Section 1</div>
        <div id="sec-2" ac:break-before>Section 2 - Forced Page 2</div>
      </div>
    `;
    document.body.append(container);

    const report = new AcReport({ element: container });
    await report.generate({ data: {} });

    expect(report.pages.length).toBeGreaterThanOrEqual(2);
  });

  it('5. Selective Header/Footer Visibility', async () => {
    const container = document.createElement('div');
    container.setAttribute('ac-report', '');
    container.innerHTML = `
      <div ac-page>
        <div class="page-hdr" ac:hide-on-first-page>Continuation Header</div>
        <div class="page-ftr" ac:hide-on-last-page>Standard Page Footer</div>
        <div class="first-only" ac:first-page-only>Cover Logo</div>
        <div class="last-only" ac:last-page-only>Final Signature</div>
      </div>
    `;
    document.body.append(container);

    const report = new AcReport({ element: container });
    report.addPage(); // Page 1
    report.addPage(); // Page 2
    await report.finalizePages();

    expect(report.pages.length).toBe(2);

    const page1 = report.pages[0];
    const page2 = report.pages[1];

    const p1Hdr = page1.element.querySelector('.page-hdr') as HTMLElement;
    const p1FirstOnly = page1.element.querySelector('.first-only') as HTMLElement;
    const p1LastOnly = page1.element.querySelector('.last-only') as HTMLElement;

    expect(p1Hdr.style.display).toBe('none');
    expect(p1FirstOnly.style.display).toBe('');
    expect(p1LastOnly.style.display).toBe('none');

    const p2Hdr = page2.element.querySelector('.page-hdr') as HTMLElement;
    const p2Ftr = page2.element.querySelector('.page-ftr') as HTMLElement;
    const p2LastOnly = page2.element.querySelector('.last-only') as HTMLElement;

    expect(p2Hdr.style.display).toBe('');
    expect(p2Ftr.style.display).toBe('none');
    expect(p2LastOnly.style.display).toBe('');
  });

  it('6. Margins & Document Watermark', async () => {
    const container = document.createElement('div');
    container.setAttribute('ac-report', '');
    container.setAttribute('ac:watermark', 'CONFIDENTIAL');
    container.innerHTML = `
      <div ac-page ac-page-margin="15mm 10mm">
        <div>Content</div>
      </div>
    `;
    document.body.append(container);

    const report = new AcReport({ element: container });
    await report.generate({ data: {} });

    const page = report.pages[0];
    expect(page.element.style.padding).toBe('15mm 10mm');
    expect(page.element.style.boxSizing).toBe('border-box');

    const watermark = page.element.querySelector('.ac-report-watermark');
    expect(watermark).not.toBeNull();
    expect(watermark?.textContent?.trim()).toBe('CONFIDENTIAL');
  });

  it('7. Mixed Page Orientations (Portrait & Landscape)', async () => {
    const container = document.createElement('div');
    container.setAttribute('ac-report', '');
    container.innerHTML = `
      <div id="p1" ac-page ac-page-orientation="PORTRAIT">
        <div>Portrait Cover</div>
      </div>
    `;
    document.body.append(container);

    const report = new AcReport({ element: container });
    const page1 = report.addPage();
    page1.element.setAttribute('ac-page-orientation', 'PORTRAIT');

    const page2 = report.addPage();
    page2.element.setAttribute('ac-page-orientation', 'LANDSCAPE');
    page2.pageOrientation = AcEnumPageOrientation.Landscape;

    await report.finalizePages();

    expect(page1.pageOrientation).toBe(AcEnumPageOrientation.Portrait);
    expect(page2.pageOrientation).toBe(AcEnumPageOrientation.Landscape);
    expect(page2.allocatedWidth).toBeGreaterThan(page1.allocatedWidth);
  });

  it('8. Running Subtotals (Brought Forward & Carried Forward)', async () => {
    const container = document.createElement('div');
    container.setAttribute('ac-report', '');
    container.innerHTML = `
      <div ac-page>
        <div>Page Content</div>
      </div>
    `;
    document.body.append(container);

    const report = new AcReport({ element: container });
    const page1 = report.addPage();
    const page2 = report.addPage();

    page1.recordValue('total', 150);
    page2.recordValue('total', 250);

    report.calculateSubtotals();

    expect(page1.broughtForward['total']).toBe(0);
    expect(page1.subtotals['total']).toBe(150);
    expect(page1.carriedForward['total']).toBe(150);

    expect(page2.broughtForward['total']).toBe(150);
    expect(page2.subtotals['total']).toBe(250);
    expect(page2.carriedForward['total']).toBe(400);
  });

  it('9. Runtime Page & Row Deletion with Dynamic Counters Refresh', async () => {
    const container = document.createElement('div');
    container.setAttribute('ac-report', '');
    container.innerHTML = `
      <div ac-page>
        <span class="counter">Page {{ page.number }} of {{ report.pages }}</span>
        <div class="row-container">
          <div class="row" id="row-1">Row 1</div>
          <div class="row" id="row-2">Row 2</div>
        </div>
      </div>
    `;
    document.body.append(container);

    const report = new AcReport({ element: container });
    report.addPage(); // Page 1
    report.addPage(); // Page 2
    await report.finalizePages();

    expect(report.pages.length).toBe(2);

    // Delete page 2
    const removed = await report.removePage(1);
    expect(removed).toBe(true);
    expect(report.pages.length).toBe(1);

    // Dynamic counter refreshed
    const counterEl = container.querySelector('.counter');
    expect(counterEl?.textContent).toBe('Page 1 of 1');
  });

  it('10. Custom Engine Pipes Registration', async () => {
    AcReportEngine.registerPipe('multiply', (val: number, factor = 2) => {
      return Number(val) * factor;
    });

    const registered = AcReportEngine.getPipe('multiply');
    expect(registered).toBeDefined();
    expect(registered!(10, 3)).toBe(30);

    const container = document.createElement('div');
    container.setAttribute('ac-report', '');
    container.innerHTML = `
      <div ac-page>
        <span class="result">{{ data.num | multiply:4 }}</span>
      </div>
    `;
    document.body.append(container);

    const report = new AcReport({ element: container });
    await report.generate({ data: { num: 5 } });

    const resultEl = container.querySelector('.result');
    expect(resultEl?.textContent?.trim()).toBe('20');
  });

  it('11. Standalone HTML Export', async () => {
    const container = document.createElement('div');
    container.setAttribute('ac-report', '');
    container.innerHTML = `
      <div ac-page>
        <h1>Exportable Report</h1>
      </div>
    `;
    document.body.append(container);

    const report = new AcReport({ element: container });
    await report.generate({ data: {} });

    const html = report.exportToHtml({ title: 'Test Export' });
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>Test Export</title>');
    expect(html).toContain('Exportable Report');
  });

  it('12. Lifecycle Cleanup (destroy)', async () => {
    const container = document.createElement('div');
    container.setAttribute('ac-report', '');
    container.innerHTML = `<div ac-page>Content</div>`;
    document.body.append(container);

    const report = new AcReport({ element: container });
    await report.generate({ data: {} });

    expect(report.pages.length).toBe(1);
    report.destroy();

    expect(report.pages.length).toBe(0);
    expect(report.dynamicPageBindings.length).toBe(0);
  });

  it('13. Table of Contents (TOC) with Section Page References', async () => {
    const container = document.createElement('div');
    container.setAttribute('ac-report', '');
    container.innerHTML = `
      <div ac-page>
        <div id="toc-box" ac:toc>
          <h3>Table of Contents</h3>
        </div>
        <div ac:section="Executive Overview">
          <h2>Executive Overview</h2>
        </div>
        <div ac:section="Technical Architecture">
          <h2>Technical Architecture</h2>
        </div>
      </div>
    `;
    document.body.append(container);

    const report = new AcReport({ element: container });
    await report.generate({ data: {} });

    const tocList = container.querySelector('.ac-report-toc-list');
    expect(tocList).not.toBeNull();
    const items = container.querySelectorAll('.ac-report-toc-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Executive Overview');
    expect(items[0].textContent).toContain('Page 1');
    expect(items[1].textContent).toContain('Technical Architecture');
    expect(items[1].textContent).toContain('Page 1');
  });

  it('14. Multi-Column Page Layout (ac-page-columns)', async () => {
    const container = document.createElement('div');
    container.setAttribute('ac-report', '');
    container.innerHTML = `
      <div ac-page ac-page-columns="2">
        <div ac-report-header>Header</div>
        <p>Column Content</p>
      </div>
    `;
    document.body.append(container);

    const report = new AcReport({ element: container });
    await report.generate({ data: {} });

    const pageEl = report.pages[0].element;
    expect(pageEl.style.columnCount).toBe('2');
    expect(pageEl.style.columnGap).toBe('15mm');
    const headerEl = pageEl.querySelector('[ac-report-header]') as HTMLElement;
    expect(headerEl.style.columnSpan).toBe('all');
  });

  it('15. Section-Level Page Numbering and Group Header Continuation', async () => {
    const container = document.createElement('div');
    container.setAttribute('ac-report', '');
    container.innerHTML = `
      <div ac-page ac:section-name="MainBody">
        <div ac:group-header="Order Group #101">Group #101</div>
        <div class="footer">Section: {{ page.sectionName }} - Page {{ page.sectionPageNumber }} of {{ page.sectionTotalPages }}</div>
      </div>
    `;
    document.body.append(container);

    const report = new AcReport({ element: container });
    await report.generate({ data: {} });

    expect(report.pages[0].sectionName).toBe('MainBody');
    expect(report.pages[0].sectionPageNumber).toBe(1);
    expect(report.pages[0].sectionTotalPages).toBe(1);
  });

  it('16. Multiple Parallel Loops with Overflow Pagination (Financial Statement Debit & Credit)', async () => {
    // Mock offsetHeight on HTMLElement to simulate layout reflow and overflow in jsdom
    const origOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get() {
        if (this.hasAttribute && this.hasAttribute('ac-page')) {
          // Count rows in debit and credit tables
          const debitRows = this.querySelectorAll('.side-debit tbody tr').length;
          const creditRows = this.querySelectorAll('.side-credit tbody tr').length;
          const maxRows = Math.max(debitRows, creditRows);
          // 200px base (header + footer) + 40px per row. Target A4 is ~1122px.
          // At 24 rows: 200 + 960 = 1160px > 1122px => overflow at row 24
          return 200 + maxRows * 40;
        }
        return 40;
      },
    });

    try {
      const container = document.createElement('div');
      container.setAttribute('ac-report', '');
      container.innerHTML = `
        <div class="page" ac-page ac-page-size="A4" ac-page-orientation="portrait">
          <div ac-page-header class="header">
            <h3>{{ data.companyName }}</h3>
            <span>Statement Type: {{ data.statementType }}</span>
          </div>
          <div ac-page-body>
            <table class="two-column-table">
              <tr>
                <td class="side-debit">
                  <table>
                    <thead><tr><th>Debit Account</th></tr></thead>
                    <tbody ac:for="let item of data.debitBalances; let i">
                      <tr class="debit-row"><td>{{ item.name }} - {{ item.amount }}</td></tr>
                    </tbody>
                  </table>
                </td>
                <td class="side-credit">
                  <table>
                    <thead><tr><th>Credit Account</th></tr></thead>
                    <tbody ac:for="let item of data.creditBalances; let j">
                      <tr class="credit-row"><td>{{ item.name }} - {{ item.amount }}</td></tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </table>
          </div>
          <div ac-page-footer class="footer">
            <span>Company: {{ data.companyName }} | Page {{ page.number }} of {{ report.pages }}</span>
          </div>
        </div>
      `;
      document.body.append(container);

      // 35 debit items and 30 credit items (overflows to page 2 at ~23 items)
      const debitBalances = Array.from({ length: 35 }, (_, i) => ({
        name: `Debit Account #${i + 1}`,
        amount: (i + 1) * 100,
      }));
      const creditBalances = Array.from({ length: 30 }, (_, i) => ({
        name: `Credit Account #${i + 1}`,
        amount: (i + 1) * 150,
      }));

      const report = new AcReport({ element: container });
      await report.generate({
        data: {
          companyName: 'Acme Financial Ltd',
          statementType: 'BALANCE SHEET',
          debitBalances,
          creditBalances,
        },
      });

      // Verify pagination occurred
      expect(report.pages.length).toBe(2);

      const page1 = report.pages[0].element;
      const page2 = report.pages[1].element;

      // Both loops must have rows on page 1
      const p1DebitRows = page1.querySelectorAll('.side-debit tbody tr');
      const p1CreditRows = page1.querySelectorAll('.side-credit tbody tr');
      expect(p1DebitRows.length).toBe(23);
      expect(p1CreditRows.length).toBe(23);

      // Both loops must have remaining rows on page 2
      const p2DebitRows = page2.querySelectorAll('.side-debit tbody tr');
      const p2CreditRows = page2.querySelectorAll('.side-credit tbody tr');
      expect(p2DebitRows.length).toBe(12); // 35 - 23
      expect(p2CreditRows.length).toBe(7);  // 30 - 23

      // Verify content is rendered correctly
      expect(p1DebitRows[0].textContent).toContain('Debit Account #1 - 100');
      expect(p2DebitRows[0].textContent).toContain('Debit Account #24 - 2400');
      expect(p1CreditRows[0].textContent).toContain('Credit Account #1 - 150');
      expect(p2CreditRows[0].textContent).toContain('Credit Account #24 - 3600');

      // Verify NO raw uncompiled expressions remain anywhere in the rendered report
      expect(container.innerHTML).not.toContain('{{');
      expect(container.innerHTML).not.toContain('}}');

      // Verify data bindings evaluated properly on both pages
      const headers = container.querySelectorAll('.header h3');
      expect(headers.length).toBe(2);
      expect(headers[0].textContent).toBe('Acme Financial Ltd');
      expect(headers[1].textContent).toBe('Acme Financial Ltd');

      const footers = container.querySelectorAll('.footer');
      expect(footers[0].textContent).toContain('Page 1 of 2');
      expect(footers[1].textContent).toContain('Page 2 of 2');
    } finally {
      if (origOffsetHeight) {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', origOffsetHeight);
      } else {
        delete (HTMLElement.prototype as any).offsetHeight;
      }
    }
  });

  it('17. Multiple Sequential Loops in Same Report with No Raw Expression Leakage', async () => {
    const container = document.createElement('div');
    container.setAttribute('ac-report', '');
    container.innerHTML = `
      <div ac-page>
        <h2>Invoice</h2>
        <table class="items-table">
          <tbody ac:for="let item of data.items">
            <tr class="item-row"><td>{{ item.desc }}</td><td>{{ item.price }}</td></tr>
          </tbody>
        </table>
        <table class="taxes-table">
          <tbody ac:for="let tax of data.taxes">
            <tr class="tax-row"><td>{{ tax.name }}</td><td>{{ tax.rate }}%</td></tr>
          </tbody>
        </table>
        <div class="footer">Client: {{ data.clientName }} - Page {{ page.number }}</div>
      </div>
    `;
    document.body.append(container);

    const report = new AcReport({ element: container });
    await report.generate({
      data: {
        clientName: 'Global Corp',
        items: [
          { desc: 'Widget A', price: 50 },
          { desc: 'Widget B', price: 75 },
        ],
        taxes: [
          { name: 'VAT', rate: 15 },
          { name: 'Service Tax', rate: 5 },
        ],
      },
    });

    const itemRows = container.querySelectorAll('.item-row');
    const taxRows = container.querySelectorAll('.tax-row');
    expect(itemRows.length).toBe(2);
    expect(taxRows.length).toBe(2);
    expect(itemRows[0].textContent).toContain('Widget A');
    expect(taxRows[0].textContent).toContain('VAT');
    expect(container.innerHTML).not.toContain('{{');
    expect(container.innerHTML).not.toContain('}}');
  });

  it('18. Accountea Financial Statement Exact Template Multi-Page', async () => {
    const filePath = 'F:/Projects/Accountea/V1/Github/accountea-pro-formats/formats/print-formats/com.accountea.default_financial_statement.html';
    if (!fs.existsSync(filePath)) {
      return;
    }
    const htmlContent = fs.readFileSync(filePath, 'utf-8');

    const origOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get() {
        if (this.hasAttribute && this.hasAttribute('ac-page')) {
          const debitRows = this.querySelectorAll('.side-debit tbody tr.tr-record-row').length;
          const creditRows = this.querySelectorAll('.side-credit tbody tr.tr-record-row').length;
          const maxRows = Math.max(debitRows, creditRows);
          return 200 + maxRows * 50; // overflow at ~19 rows
        }
        return 40;
      },
    });

    try {
      async function runCase(name: string, numDebit: number, numCredit: number) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const reportDiv = tempDiv.querySelector('[ac-report]') as HTMLElement;
        document.body.append(reportDiv);

        const debit_balances = Array.from({ length: numDebit }, (_, i) => ({
          ledger_account_name: `Debit Account ${i + 1}`,
          ledger_account_balance: (i + 1) * 1000,
        }));
        const credit_balances = Array.from({ length: numCredit }, (_, i) => ({
          ledger_account_name: `Credit Account ${i + 1}`,
          ledger_account_balance: (i + 1) * 1500,
        }));

        const report = new AcReport({ element: reportDiv });
        await report.generate({
          data: {
            accountee: { accountee_name: 'Shree Hari Enterprise' },
            type: 'BALANCE SHEET',
            end_date: '2026-03-31',
            debit_balances,
            credit_balances,
            debit_total: 1035000,
            credit_total: 487500,
            total: 1035000,
            balance: 0,
            page: { margin_top: '10mm', margin_bottom: '10mm', margin_left: '10mm', margin_right: '10mm' }
          },
        });

        console.log(`\n=== CASE: ${name} (Debit: ${numDebit}, Credit: ${numCredit}) ===`);
        console.log('Total pages:', report.pages.length);
        for (let p = 0; p < report.pages.length; p++) {
          const pageEl = report.pages[p].element;
          const dRows = pageEl.querySelectorAll('.side-debit tbody tr.tr-record-row').length;
          const cRows = pageEl.querySelectorAll('.side-credit tbody tr.tr-record-row').length;
          const hasDebitTbody = pageEl.querySelector('.side-debit tbody') !== null;
          const hasCreditTbody = pageEl.querySelector('.side-credit tbody') !== null;
          console.log(`Page ${p + 1}: Debit rows = ${dRows} (tbody: ${hasDebitTbody}), Credit rows = ${cRows} (tbody: ${hasCreditTbody})`);
        }
        reportDiv.remove();
      }

      await runCase('EXACT USER CASE: Debit 115, Credit 88', 115, 88);
      await runCase('Case 1: Debit 45, Credit 25', 45, 25);
      await runCase('Case 2: Debit 25, Credit 45', 25, 45);
      await runCase('Case 3: Debit 10, Credit 37', 10, 37);
      await runCase('Case 4: Debit 45, Credit 0', 45, 0);
      await runCase('Case 5: Debit 10, Credit 36', 10, 36);
      await runCase('Case 6: Debit 10, Credit 30', 10, 30);
      await runCase('Case 7: Debit 25, Credit 25', 25, 25);
      await runCase('Case 8: Debit 18, Credit 18', 18, 18);
    } finally {
      if (origOffsetHeight) {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', origOffsetHeight);
      } else {
        delete (HTMLElement.prototype as any).offsetHeight;
      }
    }
  });
});
