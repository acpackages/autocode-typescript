/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AC_PAGE_SIZES, AcEvents, AcHooks, AcLogger, Autocode, IAcPageSizeDetails } from '@autocode-ts/autocode';
import { AcReportPage } from "./ac-report-page.model";
import { AC_REPORT_ATTRIBUTE, getAttrSelector } from '../consts/ac-report-html-attributes.const';
import { AcEnumPageOrientation } from '../enums/ac-enum-page-orientations.enum';
import { AcTemplateProcessor } from '../core/ac-template-processor';
import { AcReportEngine } from '../core/ac-report-engine';
import { AcExpression } from '../core/ac-expression';
import { AC_REPORT_ENGINE_EVENTS } from '../consts/ac-report-engine-events.const';

export interface IAcDynamicPageBinding {
  node: Node;
  originalTemplate: string;
  page: AcReportPage;
}

export class AcReport {
  reportElClone!: HTMLElement;
  pageElClone?: HTMLElement;
  element!: HTMLElement;
  activePage?: AcReportPage;
  pageOrientation: AcEnumPageOrientation = AcEnumPageOrientation.Portrait;
  pageSize: IAcPageSizeDetails = AC_PAGE_SIZES['A4'];
  pageHeight: number = 0;
  pageWidth: number = 0;
  pageHeightMM: number = 0;
  pageWidthMM: number = 0;
  mmConversionValue: number = 3.7795;
  pageMargin?: string;
  watermark?: string;
  data: any = {};
  pages: AcReportPage[] = [];
  events: AcEvents = new AcEvents();
  hooks: AcHooks = new AcHooks();
  logger: AcLogger = new AcLogger();
  activeLoopElementIds: string[] = [];
  dynamicPageBindings: IAcDynamicPageBinding[] = [];

  constructor({ element }: { element: HTMLElement }) {
    this.setTempIdsToElement({ element: element });
    AcReportEngine.init();
    this.reportElClone = element.cloneNode(true) as HTMLElement;
    this.element = element;
    this.init();
  }

  static async preloadImages(container: HTMLElement, timeoutMs: number = 3000): Promise<void> {
    if (typeof document === 'undefined' || !container) return;
    const images = Array.from(container.querySelectorAll('img')) as HTMLImageElement[];
    if (images.length === 0) return;

    const promises = images.map((img) => {
      if (img.complete && img.naturalHeight !== 0) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        const cleanup = () => {
          img.removeEventListener('load', cleanup);
          img.removeEventListener('error', cleanup);
          resolve();
        };
        img.addEventListener('load', cleanup);
        img.addEventListener('error', cleanup);
        setTimeout(cleanup, timeoutMs);
      });
    });

    await Promise.all(promises);
  }

  addPage() {
    if (this.pages.length > 0) {
      const lastPageEl = this.pages[this.pages.length - 1].element as HTMLElement;
      const cloneEl = lastPageEl.cloneNode(true) as HTMLElement;
      const reportHeaderEls = Array.from(cloneEl.querySelectorAll(`[${AC_REPORT_ATTRIBUTE.reportHeader}]`)) as HTMLElement[];
      for (const reportHeader of reportHeaderEls) {
        reportHeader.remove();
      }
      const cloneFooterEls = Array.from(cloneEl.querySelectorAll(`[${AC_REPORT_ATTRIBUTE.reportFooter}]`)) as HTMLElement[];
      for (const footer of cloneFooterEls) {
        footer.setAttribute('ac-temp-style-display', footer.style.display);
        footer.style.display = 'none';
      }
      const reportFootererEls = Array.from(lastPageEl.querySelectorAll(`[${AC_REPORT_ATTRIBUTE.reportFooter}]`)) as HTMLElement[];
      for (const reportFooter of reportFootererEls) {
        reportFooter.remove();
      }
      const page = new AcReportPage({ element: cloneEl, index: this.pages.length, report: this, isFixedHeight: this.pageSize.isRoll != true });
      if (this.pageMargin) {
        page.element.style.padding = this.pageMargin;
        page.element.style.boxSizing = 'border-box';
      }
      this.suppressStretchingStyles(cloneEl);
      this.pages.push(page);
      this.activePage = page;
      this.element.append(cloneEl);
      if (this.activeLoopElementIds.length > 0) {
        for (let i = 0; i < this.activeLoopElementIds.length; i++) {
          const tempId = this.activeLoopElementIds[i];
          const loopEl = cloneEl.querySelector(`[${AC_REPORT_ATTRIBUTE.tempId}="${tempId}"]`) as HTMLElement;
          if (loopEl) {
            if (i < this.activeLoopElementIds.length - 1) {
              const subLoopId = this.activeLoopElementIds[i + 1];
              const subLoopEl = loopEl.querySelector(`[${AC_REPORT_ATTRIBUTE.tempId}="${subLoopId}"]`) as HTMLElement;
              if (subLoopEl) {
                const clone = subLoopEl.cloneNode(true) as HTMLElement;
                loopEl.innerHTML = '';
                loopEl.append(clone);
              }
              else {
                loopEl.innerHTML = '';
              }
            }
            else {
              loopEl.innerHTML = '';
            }
          }
        }
      }

      // Also empty any other loop containers on cloneEl so they do not hold uncompiled template rows
      const allLoopEls = Array.from(cloneEl.querySelectorAll(getAttrSelector(AC_REPORT_ATTRIBUTE.templateFor))) as HTMLElement[];
      for (const el of allLoopEls) {
        const tId = el.getAttribute(AC_REPORT_ATTRIBUTE.tempId);
        if (!tId || !this.activeLoopElementIds.includes(tId)) {
          el.innerHTML = '';
        }
      }
      this.events.execute({event:AC_REPORT_ENGINE_EVENTS.pageAdd,args:{page}});
    }
    else {
      const page = new AcReportPage({ element: this.pageElClone!.cloneNode(true) as HTMLElement, index: this.pages.length, report: this, isFixedHeight: this.pageSize.isRoll != true });
      if (this.pageMargin) {
        page.element.style.padding = this.pageMargin;
        page.element.style.boxSizing = 'border-box';
      }
      this.suppressStretchingStyles(page.element);
      const reportFooterEls = Array.from(page.element.querySelectorAll(`[${AC_REPORT_ATTRIBUTE.reportFooter}]`)) as HTMLElement[];
      for (const reportFooter of reportFooterEls) {
        reportFooter.setAttribute('ac-temp-style-display', reportFooter.style.display);
        reportFooter.style.display = 'none';
      }
      this.element.append(page.element);
      this.pages.push(page);
      this.activePage = page;
      this.events.execute({event:AC_REPORT_ENGINE_EVENTS.pageAdd,args:{page}});
    }
    return this.activePage;
  }

  applySelectiveVisibility(): void {
    const total = this.pages.length;
    for (let i = 0; i < total; i++) {
      const page = this.pages[i];
      const isFirst = (i === 0);
      const isLast = (i === total - 1);

      const hideOnFirst = Array.from(page.element.querySelectorAll(getAttrSelector(AC_REPORT_ATTRIBUTE.hideOnFirstPage))) as HTMLElement[];
      for (const el of hideOnFirst) {
        el.style.display = isFirst ? 'none' : '';
      }

      const hideOnLast = Array.from(page.element.querySelectorAll(getAttrSelector(AC_REPORT_ATTRIBUTE.hideOnLastPage))) as HTMLElement[];
      for (const el of hideOnLast) {
        el.style.display = isLast ? 'none' : '';
      }

      const firstOnly = Array.from(page.element.querySelectorAll(getAttrSelector(AC_REPORT_ATTRIBUTE.firstPageOnly))) as HTMLElement[];
      for (const el of firstOnly) {
        el.style.display = isFirst ? '' : 'none';
      }

      const lastOnly = Array.from(page.element.querySelectorAll(getAttrSelector(AC_REPORT_ATTRIBUTE.lastPageOnly))) as HTMLElement[];
      for (const el of lastOnly) {
        el.style.display = isLast ? '' : 'none';
      }
    }
  }

  applyWatermarks(): void {
    if (!this.watermark) {
      return;
    }
    for (const page of this.pages) {
      const existing = page.element.querySelector('.ac-report-watermark');
      if (existing) {
        existing.remove();
      }
      const doc = page.element.ownerDocument || document;
      page.element.style.position = 'relative';
      const watermarkEl = doc.createElement('div');
      watermarkEl.className = 'ac-report-watermark';
      watermarkEl.setAttribute(
        'style',
        'position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: hidden; display: flex; align-items: center; justify-content: center; z-index: 0; opacity: 0.12;'
      );
      const span = doc.createElement('span');
      span.setAttribute(
        'style',
        'font-size: 72px; font-weight: 800; transform: rotate(-45deg); text-transform: uppercase; user-select: none; letter-spacing: 4px; font-family: sans-serif;'
      );
      span.textContent = this.watermark;
      watermarkEl.append(span);
      page.element.prepend(watermarkEl);
    }
  }

  calculateSubtotals(): void {
    const allKeys = new Set<string>();
    for (const page of this.pages) {
      for (const k of Object.keys(page.subtotals)) {
        allKeys.add(k);
      }
    }
    const cumulative: Record<string, number> = {};
    for (const k of allKeys) {
      cumulative[k] = 0;
    }
    for (let i = 0; i < this.pages.length; i++) {
      const page = this.pages[i];
      page.broughtForward = { ...cumulative };
      for (const k of allKeys) {
        const val = page.subtotals[k] || 0;
        cumulative[k] = (cumulative[k] || 0) + val;
      }
      page.carriedForward = { ...cumulative };
    }
  }

  clear(){
    if (this.pages) {
      for (const page of this.pages) {
        page.destroy();
      }
    }
    this.dynamicPageBindings = [];
    const element = this.reportElClone.cloneNode(true) as HTMLElement;
    this.element.replaceWith(element);
    this.element = element;
    this.pages = [];
    this.activePage = undefined;
    this.init();
    this.events.execute({event:AC_REPORT_ENGINE_EVENTS.clear});
  }

  destroy(): void {
    if (this.pages) {
      for (const page of this.pages) {
        page.destroy();
      }
      this.pages = [];
    }
    this.dynamicPageBindings = [];
    this.activePage = undefined;
    (this as any).reportElClone = null;
    (this as any).pageElClone = null;
    (this as any).element = null;
    AcExpression.clearCache();
  }

  registerPipe(name: string, transform: (value: any, ...args: any[]) => any): void {
    AcReportEngine.registerPipe(name, transform);
  }

  exportToHtml(options?: { title?: string; download?: boolean; filename?: string }): string {
    const title = options?.title || 'Report';
    const widthMm = this.pageWidthMM > 0 ? this.pageWidthMM : 210;
    const heightMm = this.pageSize.isRoll ? 'auto' : (this.pageHeightMM > 0 ? `${this.pageHeightMM}mm` : '297mm');

    let styles = '';
    if (typeof document !== 'undefined') {
      const styleNodes = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
      for (const node of styleNodes) {
        styles += node.outerHTML + '\n';
      }
    }

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  ${styles}
  <style>
    @media print {
      @page {
        size: ${widthMm}mm ${heightMm};
        margin: 0;
      }
      body {
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      [${AC_REPORT_ATTRIBUTE.page}] {
        content-visibility: visible !important;
        page-break-after: always !important;
        break-after: page !important;
        margin: 0 !important;
        box-shadow: none !important;
      }
      [${AC_REPORT_ATTRIBUTE.page}]:last-of-type {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
    }
  </style>
</head>
<body>
  ${this.element.outerHTML}
</body>
</html>`;

    if (options?.download && typeof window !== 'undefined' && typeof document !== 'undefined') {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = options.filename || `${title.toLowerCase().replace(/\s+/g, '-')}.html`;
      document.body.append(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    return html;
  }

  private clearTempIdsFromElement({ element }: { element: HTMLElement }) {
    element.removeAttribute(AC_REPORT_ATTRIBUTE.tempId);
    let child = element.firstElementChild;
    while (child) {
      this.clearTempIdsFromElement({ element: child as HTMLElement });
      child = child.nextElementSibling;
    }
  }

  private suppressStretchingStyles(pageEl: HTMLElement): void {
    if (!pageEl) return;
    const candidates = Array.from(pageEl.querySelectorAll('table[height], table[style*="height"], [style*="fill-available"]')) as HTMLElement[];
    if (pageEl.matches && pageEl.matches('table[height], table[style*="height"], [style*="fill-available"]')) {
      candidates.unshift(pageEl);
    }
    for (const el of candidates) {
      const hAttr = el.getAttribute('height');
      const hStyle = el.style.height;
      if (hAttr && (hAttr === '100%' || hAttr.includes('%'))) {
        el.setAttribute('ac-temp-height-attr', hAttr);
        el.removeAttribute('height');
      }
      if (hStyle && (hStyle.includes('fill-available') || hStyle.includes('%') || hStyle.includes('100vh'))) {
        el.setAttribute('ac-temp-style-height', hStyle);
        el.style.height = 'auto';
      }
    }
  }

  private restoreStretchingStyles(): void {
    for (const page of this.pages) {
      const candidates = Array.from(page.element.querySelectorAll('[ac-temp-height-attr], [ac-temp-style-height]')) as HTMLElement[];
      if (page.element.matches && page.element.matches('[ac-temp-height-attr], [ac-temp-style-height]')) {
        candidates.unshift(page.element);
      }
      for (const el of candidates) {
        if (el.hasAttribute('ac-temp-height-attr')) {
          el.setAttribute('height', el.getAttribute('ac-temp-height-attr')!);
          el.removeAttribute('ac-temp-height-attr');
        }
        if (el.hasAttribute('ac-temp-style-height')) {
          el.style.height = el.getAttribute('ac-temp-style-height')!;
          el.removeAttribute('ac-temp-style-height');
        }
      }
    }
  }

  async finalizePages() {
    // Clean up empty trailing ghost pages where no loop items landed
    while (this.pages.length > 1) {
      const lastPage = this.pages[this.pages.length - 1];
      const recordRows = Array.from(lastPage.element.querySelectorAll('tr.tr-record-row, .tr-record-row, [ac-record-row], [ac-report-record]'));
      const loopEls = Array.from(lastPage.element.querySelectorAll('[ac-report-loop-end-page-index]')) as HTMLElement[];
      const hasAnyLoopRows = loopEls.some((el) => el.children.length > 0) || recordRows.length > 0;

      if (loopEls.length > 0 && !hasAnyLoopRows) {
        this.removePage(this.pages.length - 1);
      } else {
        break;
      }
    }

    if (this.pages.length > 0) {
      const lastPage = this.pages[this.pages.length - 1];
      const reportFootererEls = Array.from(lastPage.element.querySelectorAll(`[${AC_REPORT_ATTRIBUTE.reportFooter}]`)) as HTMLElement[];
      for (const reportFooter of reportFootererEls) {
        reportFooter.style.display = reportFooter.getAttribute('ac-temp-style-display') || '';
      }
    }

    if (!this.mmConversionValue || this.mmConversionValue <= 0 || isNaN(this.mmConversionValue)) {
      this.mmConversionValue = 3.7795;
    }

    // Per-page dimensions and mixed-orientation calculation
    for (const page of this.pages) {
      const pageEl = page.element;
      const isPortrait = page.pageOrientation === AcEnumPageOrientation.Portrait;
      const widthMm = isPortrait ? this.pageSize.widthMm : this.pageSize.heightMm;
      const heightMm = isPortrait ? this.pageSize.heightMm : this.pageSize.widthMm;

      if (this.pageSize.isRoll) {
        pageEl.style.height = 'auto';
        pageEl.style.maxHeight = 'none';
        pageEl.style.minHeight = '0';
        page.allocatedHeight = pageEl.offsetHeight || Math.round(heightMm * this.mmConversionValue);
        this.pageHeight = page.allocatedHeight;
        this.pageHeightMM = this.pageHeight / this.mmConversionValue;
      } else {
        const pageH = heightMm * this.mmConversionValue;
        pageEl.style.maxHeight = `${pageH}px`;
        pageEl.style.minHeight = `${pageH}px`;
        pageEl.style.height = `${pageH}px`;
        page.allocatedHeight = pageH;
      }

      const pageW = widthMm * this.mmConversionValue;
      pageEl.style.maxWidth = `${pageW}px`;
      pageEl.style.minWidth = `${pageW}px`;
      pageEl.style.width = `${pageW}px`;
      page.allocatedWidth = pageW;

      if (!this.pageSize.isRoll && typeof window !== 'undefined') {
        pageEl.style.contentVisibility = 'auto';
        pageEl.style.containIntrinsicSize = `${widthMm}mm ${heightMm}mm`;
      }
    }

    this.restoreStretchingStyles();

    this.applyMultiColumnLayout();
    this.calculateSections();
    this.calculateSubtotals();
    this.generateTableOfContents();
    this.dynamicPageBindings = [];
    for (const page of this.pages) {
      await this.processPageReportDataBindings(page.element, page);
    }
    this.clearTempIdsFromElement({ element: this.element });
    this.applySelectiveVisibility();
    this.applyWatermarks();
  }

  applyMultiColumnLayout(): void {
    for (const page of this.pages) {
      const pageEl = page.element;
      let colCount: string | null = null;
      if (pageEl.hasAttribute(AC_REPORT_ATTRIBUTE.pageColumns)) {
        colCount = pageEl.getAttribute(AC_REPORT_ATTRIBUTE.pageColumns);
      } else if (this.element.hasAttribute(AC_REPORT_ATTRIBUTE.pageColumns)) {
        colCount = this.element.getAttribute(AC_REPORT_ATTRIBUTE.pageColumns);
      }

      if (colCount && parseInt(colCount, 10) > 1) {
        pageEl.style.columnCount = colCount;
        pageEl.style.columnGap = '15mm';
        pageEl.style.columnFill = 'auto';

        const headersAndFooters = Array.from(pageEl.querySelectorAll(`[${AC_REPORT_ATTRIBUTE.reportHeader}], [${AC_REPORT_ATTRIBUTE.reportFooter}], [${AC_REPORT_ATTRIBUTE.pageHeader}], [${AC_REPORT_ATTRIBUTE.pageFooter}]`)) as HTMLElement[];
        for (const hf of headersAndFooters) {
          hf.style.columnSpan = 'all';
        }
      }
    }
  }

  calculateSections(): void {
    let currentSectionName = 'Default';
    const sectionPages: Map<string, AcReportPage[]> = new Map();

    for (const page of this.pages) {
      let val: string | null = null;
      if (page.element.hasAttribute(AC_REPORT_ATTRIBUTE.sectionName)) {
        val = page.element.getAttribute(AC_REPORT_ATTRIBUTE.sectionName);
      } else if (page.element.hasAttribute(AC_REPORT_ATTRIBUTE.section)) {
        val = page.element.getAttribute(AC_REPORT_ATTRIBUTE.section);
      } else {
        const secEl = page.element.querySelector(getAttrSelector(AC_REPORT_ATTRIBUTE.sectionName)) || page.element.querySelector(getAttrSelector(AC_REPORT_ATTRIBUTE.section));
        if (secEl) {
          val = secEl.getAttribute(AC_REPORT_ATTRIBUTE.sectionName) || secEl.getAttribute(AC_REPORT_ATTRIBUTE.section);
        }
      }
      if (val && val.trim()) {
        currentSectionName = val.trim();
      }
      page.sectionName = currentSectionName;
      if (!sectionPages.has(currentSectionName)) {
        sectionPages.set(currentSectionName, []);
      }
      sectionPages.get(currentSectionName)!.push(page);
    }

    for (const [secName, pages] of sectionPages.entries()) {
      const totalInSec = pages.length;
      for (let i = 0; i < totalInSec; i++) {
        pages[i].sectionPageNumber = i + 1;
        pages[i].sectionTotalPages = totalInSec;
      }
    }
  }

  generateTableOfContents(): void {
    interface ITocEntry {
      title: string;
      pageNumber: number;
    }

    const entries: ITocEntry[] = [];
    const seenTitles = new Set<string>();

    for (let i = 0; i < this.pages.length; i++) {
      const page = this.pages[i];
      const sectionEls = Array.from(page.element.querySelectorAll(getAttrSelector(AC_REPORT_ATTRIBUTE.section))) as HTMLElement[];
      for (const el of sectionEls) {
        const title = el.getAttribute(AC_REPORT_ATTRIBUTE.section) || el.textContent || `Section ${entries.length + 1}`;
        const cleanTitle = title.trim();
        if (cleanTitle && !seenTitles.has(cleanTitle)) {
          seenTitles.add(cleanTitle);
          entries.push({
            title: cleanTitle,
            pageNumber: page.pageNumber,
          });
        }
      }
    }

    if (entries.length === 0) return;

    const tocContainers = Array.from(this.element.querySelectorAll(`${getAttrSelector(AC_REPORT_ATTRIBUTE.toc)}, [ac-report-toc]`)) as HTMLElement[];
    for (const container of tocContainers) {
      const oldList = container.querySelector('.ac-report-toc-list');
      if (oldList) {
        oldList.remove();
      }

      const doc = container.ownerDocument || document;
      const listEl = doc.createElement('div');
      listEl.className = 'ac-report-toc-list';
      listEl.style.display = 'flex';
      listEl.style.flexDirection = 'column';
      listEl.style.gap = '8px';
      listEl.style.margin = '10px 0';

      for (const entry of entries) {
        const row = doc.createElement('div');
        row.className = 'ac-report-toc-item';
        row.style.display = 'flex';
        row.style.alignItems = 'baseline';
        row.style.justifyContent = 'space-between';
        row.style.fontSize = '13px';

        const titleSpan = doc.createElement('span');
        titleSpan.className = 'ac-report-toc-title fw-semibold';
        titleSpan.textContent = entry.title;

        const dotsSpan = doc.createElement('span');
        dotsSpan.className = 'ac-report-toc-dots';
        dotsSpan.style.flex = '1';
        dotsSpan.style.borderBottom = '1px dotted #94a3b8';
        dotsSpan.style.margin = '0 10px';

        const pageSpan = doc.createElement('span');
        pageSpan.className = 'ac-report-toc-page badge bg-light text-dark border';
        pageSpan.textContent = `Page ${entry.pageNumber}`;

        row.append(titleSpan, dotsSpan, pageSpan);
        listEl.append(row);
      }

      container.append(listEl);
    }
  }

  findPageForElement(element: HTMLElement): AcReportPage | undefined {
    for (const page of this.pages) {
      if (page.element && page.element.contains(element)) {
        return page;
      }
    }
    return undefined;
  }

  async generate({ data, callback }: { data: any, callback?: Function }) {
    await AcReport.preloadImages(this.element);
    const previousContain = this.element.style.contain;
    this.element.style.contain = 'layout style';
    this.data = data;

    if (this.pageElClone) {
      this.addPage();
    }
    const context = { data: data, report: {}, page: this.activePage?.toJson() };
    const processor = new AcTemplateProcessor({ context: context, element: this.element, page: this.activePage! });
    await processor.process();
    await this.finalizePages();
    this.element.style.contain = previousContain;

    if (callback) {
      callback();
    }
  }

  getNextPage() {
    if (this.activePage!.index < this.pages.length - 1) {
      this.activePage = this.pages[this.activePage!.index + 1];
    }
    else {
      this.addPage();
    }
    return this.activePage;
  }

  getPage(index: number): AcReportPage | undefined {
    return this.pages[index];
  }

  getPages(): AcReportPage[] {
    return [...this.pages];
  }

  private init(){
    if (this.reportElClone.querySelector(`[${AC_REPORT_ATTRIBUTE.page}]`)) {
      this.pageElClone = (this.reportElClone.querySelector(`[${AC_REPORT_ATTRIBUTE.page}]`) as HTMLElement).cloneNode(true) as HTMLElement;
      if (this.pageElClone.hasAttribute(AC_REPORT_ATTRIBUTE.pageSize)) {
        const size = this.pageElClone.getAttribute(AC_REPORT_ATTRIBUTE.pageSize)!.toUpperCase();
        if (AC_PAGE_SIZES[size]) {
          this.pageSize = AC_PAGE_SIZES[size];
        }
      }
      if (this.pageElClone.hasAttribute(AC_REPORT_ATTRIBUTE.pageOrientation)) {
        const orientation: any = this.pageElClone.getAttribute(AC_REPORT_ATTRIBUTE.pageOrientation)!.toUpperCase();
        if (Object.values(AcEnumPageOrientation).includes(orientation)) {
          this.pageOrientation = orientation;
        }
      }
      if (this.pageElClone.hasAttribute(AC_REPORT_ATTRIBUTE.pageMargin)) {
        this.pageMargin = this.pageElClone.getAttribute(AC_REPORT_ATTRIBUTE.pageMargin)!;
      } else if (this.element.hasAttribute(AC_REPORT_ATTRIBUTE.pageMargin)) {
        this.pageMargin = this.element.getAttribute(AC_REPORT_ATTRIBUTE.pageMargin)!;
      }

      if (this.element.hasAttribute(AC_REPORT_ATTRIBUTE.watermark)) {
        this.watermark = this.element.getAttribute(AC_REPORT_ATTRIBUTE.watermark)!;
      } else if (this.pageElClone?.hasAttribute(AC_REPORT_ATTRIBUTE.watermark)) {
        this.watermark = this.pageElClone.getAttribute(AC_REPORT_ATTRIBUTE.watermark)!;
      }

      this.setPageHeightWidth();
      this.element.querySelector(`[${AC_REPORT_ATTRIBUTE.page}]`)?.remove();
    }
    else {
      const page = new AcReportPage({ element: this.element, index: this.pages.length, report: this });
      this.pages.push(page);
      this.activePage = page;
    }
  }

  off({subscriptionId,subscriptionIds,event,callback}:{subscriptionId?:string,subscriptionIds?:string[],callback?:any,event?:string}){
    this.events.unsubscribe({subscriptionId,subscriptionIds,callback,event});
  }

  on({event,callback}:{event:string,callback:Function}):string{
    return this.events.subscribe({event,callback});
  }

  print(options?: { title?: string }): void {
    const doc = this.element?.ownerDocument || document;
    const win = doc.defaultView || window;
    const styleId = 'ac-report-print-styles';
    let styleEl = doc.getElementById(styleId) as HTMLStyleElement;
    if (!styleEl) {
      styleEl = doc.createElement('style');
      styleEl.id = styleId;
      doc.head.append(styleEl);
    }

    const widthMm = this.pageWidthMM > 0 ? this.pageWidthMM : 210;
    const heightMm = this.pageSize.isRoll ? 'auto' : (this.pageHeightMM > 0 ? `${this.pageHeightMM}mm` : '297mm');

    const hasLandscape = this.pages.some((p) => p.pageOrientation === AcEnumPageOrientation.Landscape);
    const hasPortrait = this.pages.some((p) => p.pageOrientation === AcEnumPageOrientation.Portrait);

    let orientationRule = '';
    if (hasLandscape && !hasPortrait) {
      orientationRule = 'size: landscape;';
    } else if (hasPortrait && !hasLandscape) {
      orientationRule = 'size: portrait;';
    } else {
      orientationRule = `size: ${widthMm}mm ${heightMm};`;
    }

    styleEl.textContent = `
      @media print {
        @page {
          ${orientationRule}
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        [${AC_REPORT_ATTRIBUTE.page}] {
          page-break-after: always !important;
          break-after: page !important;
          margin: 0 !important;
          box-shadow: none !important;
        }
        [${AC_REPORT_ATTRIBUTE.page}]:last-of-type {
          page-break-after: avoid !important;
          break-after: avoid !important;
        }
      }
    `;

    const originalTitle = doc.title;
    if (options?.title) {
      doc.title = options.title;
    }

    win.print();

    if (options?.title) {
      doc.title = originalTitle;
    }
  }

  async processAndAppendElement({ context, element, parentSelector }: { context: any, element: HTMLElement, parentSelector: string }) {
    if(!this.activePage){
       if (this.pageElClone) {
        this.addPage();
      }
    }
    const processor = new AcTemplateProcessor({ context, element, page: this.activePage! });
    await processor.process();
    this.activePage!.element.querySelector(parentSelector)!.append(element);
    if (this.activePage!.isFixedHeight && this.activePage!.isContentOverflow) {
      element.remove();
      const newPage = this.getNextPage();
      if (newPage) {
        this.activePage = newPage;
        this.activePage!.element.querySelector(parentSelector)!.innerHTML = '';
        this.activePage!.element.querySelector(parentSelector)!.append(element);
      }
    }
    this.events.execute({event:AC_REPORT_ENGINE_EVENTS.processElement,args:{element,context,parentSelector}});
  }

  async processPageReportDataBindings(node: Node, page: AcReportPage) {
    if (node.nodeType == Node.TEXT_NODE) {
      if (node.nodeValue) {
        const original = node.nodeValue;

        // Fast-path: skip text nodes without expression markers
        if (!original.includes('{{')) {
          return;
        }

        const regex = /{{\s*(.*?)\s*}}/g; // match all {{ expression }}

        // Find all matches
        const matches: { fullMatch: string; expression: string; start: number; end: number }[] = [];
        let match;
        while ((match = regex.exec(original)) !== null) {
          matches.push({
            fullMatch: match[0],
            expression: match[1],
            start: match.index,
            end: regex.lastIndex,
          });
        }

        if (matches.length === 0) {
          return; // No expressions to evaluate
        }

        // Store dynamic binding metadata so it can be re-evaluated when pages/rows are removed
        this.dynamicPageBindings.push({
          node,
          originalTemplate: original,
          page,
        });

        // Evaluate all expressions in parallel (async)
        const results = await Promise.all(
          matches.map(async ({ expression }) => {
            try {
              return await AcExpression.evaluate({
                expression,
                context: {
                  data: this.data,
                  page: page.toJson(),
                  report: this.toJson()
                },
              });
            } catch (e) {
              AcReportEngine.logError("Expression error:", expression, e);
              return "";
            }
          })
        );

        // Build the final string by replacing matches
        let result = '';
        let lastIndex = 0;

        matches.forEach((match, i) => {
          result += original.slice(lastIndex, match.start);
          result += results[i] ?? '';
          lastIndex = match.end;
        });

        result += original.slice(lastIndex);
        node.nodeValue = result;
      }
    }

    let subNode = node.firstChild;
    while (subNode) {
      const next = subNode.nextSibling;
      let continueOperation = true;
      if (subNode.nodeType === Node.ELEMENT_NODE) {
        const el: HTMLElement = subNode as HTMLElement;
        if (el.hasAttribute(AC_REPORT_ATTRIBUTE.templateFor)) {
          continueOperation = false;
        }
      }
      if (continueOperation) {
        await this.processPageReportDataBindings(subNode, page);
      }
      subNode = next;
    }
  }

  async refreshPageCounters(): Promise<void> {
    const activeBindings: IAcDynamicPageBinding[] = [];
    const reportContext = this.toJson();

    for (const binding of this.dynamicPageBindings) {
      if (binding.node && (binding.node.isConnected || (binding.page.element && binding.page.element.isConnected))) {
        activeBindings.push(binding);
        const original = binding.originalTemplate;
        const regex = /{{\s*(.*?)\s*}}/g;
        const matches: { fullMatch: string; expression: string; start: number; end: number }[] = [];
        let match;
        while ((match = regex.exec(original)) !== null) {
          matches.push({
            fullMatch: match[0],
            expression: match[1],
            start: match.index,
            end: regex.lastIndex,
          });
        }
        if (matches.length > 0) {
          const results = await Promise.all(
            matches.map(async ({ expression }) => {
              try {
                return await AcExpression.evaluate({
                  expression,
                  context: {
                    data: this.data,
                    page: binding.page.toJson(),
                    report: reportContext,
                  },
                });
              } catch (e) {
                AcReportEngine.logError("Expression error:", expression, e);
                return "";
              }
            })
          );
          let result = '';
          let lastIndex = 0;
          matches.forEach((m, i) => {
            result += original.slice(lastIndex, m.start);
            result += results[i] ?? '';
            lastIndex = m.end;
          });
          result += original.slice(lastIndex);
          binding.node.nodeValue = result;
        }
      }
    }
    this.dynamicPageBindings = activeBindings;
  }

  async removePage(pageOrIndex: number | AcReportPage): Promise<boolean> {
    let index = -1;
    if (typeof pageOrIndex === 'number') {
      index = pageOrIndex;
    } else if (pageOrIndex && typeof pageOrIndex.index === 'number') {
      index = this.pages.indexOf(pageOrIndex);
    }
    if (index < 0 || index >= this.pages.length) {
      return false;
    }
    const [removedPage] = this.pages.splice(index, 1);
    if (removedPage) {
      removedPage.destroy();
    }
    // Re-index remaining pages
    for (let i = 0; i < this.pages.length; i++) {
      this.pages[i].index = i;
    }
    if (this.activePage === removedPage) {
      this.activePage = this.pages[Math.min(index, this.pages.length - 1)];
    }
    this.calculateSubtotals();
    await this.refreshPageCounters();
    this.applySelectiveVisibility();
    this.applyWatermarks();
    this.events.execute({ event: AC_REPORT_ENGINE_EVENTS.pageRemove, args: { index, page: removedPage } });
    return true;
  }

  async removeRow(rowElement: HTMLElement): Promise<boolean> {
    const page = this.findPageForElement(rowElement);
    if (!page) {
      return false;
    }

    const parentContainer = rowElement.parentElement;
    rowElement.remove();

    // Upward content reflow: pull rows from subsequent pages into this page if space allows
    if (parentContainer && page.index < this.pages.length - 1) {
      let targetPage = page;
      for (let i = page.index + 1; i < this.pages.length; i++) {
        const nextPage = this.pages[i];
        const nextContainer =
          (parentContainer.hasAttribute(AC_REPORT_ATTRIBUTE.tempId)
            ? nextPage.element.querySelector(`[${AC_REPORT_ATTRIBUTE.tempId}="${parentContainer.getAttribute(AC_REPORT_ATTRIBUTE.tempId)}"]`)
            : null) || nextPage.element.querySelector(parentContainer.tagName.toLowerCase());

        if (nextContainer && nextContainer.firstElementChild) {
          while (nextContainer.firstElementChild) {
            const candidateRow = nextContainer.firstElementChild as HTMLElement;
            parentContainer.append(candidateRow);
            if (targetPage.isFixedHeight && targetPage.isContentOverflow) {
              candidateRow.remove();
              nextContainer.prepend(candidateRow);
              break;
            }
          }
        }
        targetPage = nextPage;
      }
    }

    await this.repaginate();
    this.events.execute({ event: AC_REPORT_ENGINE_EVENTS.rowRemove, args: { row: rowElement, page } });
    return true;
  }

  async repaginate(): Promise<void> {
    // Filter out pages whose elements were removed from the DOM
    const survivingPages: AcReportPage[] = [];
    for (const page of this.pages) {
      if (page.element && page.element.isConnected) {
        survivingPages.push(page);
      } else {
        page.destroy();
      }
    }
    this.pages = survivingPages;
    for (let i = 0; i < this.pages.length; i++) {
      this.pages[i].index = i;
    }
    if (this.activePage && (!this.activePage.element || !this.activePage.element.isConnected)) {
      this.activePage = this.pages[this.pages.length - 1];
    }
    this.calculateSubtotals();
    await this.refreshPageCounters();
    this.applySelectiveVisibility();
    this.applyWatermarks();
    this.events.execute({ event: AC_REPORT_ENGINE_EVENTS.repaginate, args: { pages: this.pages } });
  }

  setPageHeightWidth() {
    if (this.pageElClone) {
      const measureElement = this.pageElClone.cloneNode(true) as HTMLElement;
      measureElement.style.visibility = 'hidden';
      if (this.pageOrientation == AcEnumPageOrientation.Portrait) {
        if (this.pageSize.isRoll != true) {
          measureElement.style.minHeight = `max-content`;
          measureElement.style.height = `${this.pageSize.heightMm}mm`;
        }
        measureElement.style.maxWidth = `${this.pageSize.widthMm}mm`;
        measureElement.style.minWidth = `${this.pageSize.widthMm}mm`;
        measureElement.style.width = `${this.pageSize.widthMm}mm`;
        this.pageHeightMM = this.pageSize.heightMm;
        this.pageWidthMM = this.pageSize.widthMm;
      }
      else {
        if (this.pageSize.isRoll != true) {
          measureElement.style.maxHeight = `${this.pageSize.widthMm}mm`;
          measureElement.style.minHeight = `${this.pageSize.widthMm}mm`;
          measureElement.style.height = `${this.pageSize.widthMm}mm`;
        }
        measureElement.style.maxWidth = `${this.pageSize.heightMm}mm`;
        measureElement.style.minWidth = `${this.pageSize.heightMm}mm`;
        measureElement.style.width = `${this.pageSize.heightMm}mm`;
        this.pageHeightMM = this.pageSize.widthMm;
        this.pageWidthMM = this.pageSize.heightMm;
      }
      (this.element.ownerDocument.querySelector('body') as HTMLElement).append(measureElement);
      this.pageHeight = measureElement.offsetHeight || Math.round(this.pageHeightMM * 3.7795);
      this.pageWidth = measureElement.offsetWidth || Math.round(this.pageWidthMM * 3.7795);
      this.mmConversionValue = (this.pageWidthMM > 0 && this.pageWidth > 0) ? (this.pageWidth / this.pageWidthMM) : 3.7795;
      if (!this.mmConversionValue || this.mmConversionValue <= 0 || isNaN(this.mmConversionValue)) {
        this.mmConversionValue = 3.7795;
      }
      measureElement.remove();
    }
  }

  private setTempIdsToElement({ element }: { element: HTMLElement }) {
    element.setAttribute(AC_REPORT_ATTRIBUTE.tempId, Autocode.uuid());
    let child = element.firstElementChild;
    while (child) {
      this.setTempIdsToElement({ element: child as HTMLElement });
      child = child.nextElementSibling;
    }
  }

  toJson() {
    return {
      pages: this.pages.length
    };
  }
}
