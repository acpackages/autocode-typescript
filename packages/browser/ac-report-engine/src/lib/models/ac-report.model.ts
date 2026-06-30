/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AC_PAGE_SIZES, AcEvents, AcHooks, AcLogger, Autocode, IAcPageSizeDetails } from '@autocode-ts/autocode';
import { AcReportPage } from "./ac-report-page.model";
import { AC_REPORT_ATTRIBUTE } from '../consts/ac-report-html-attributes.const';
import { AcEnumPageOrientation } from '../enums/ac-enum-page-orientations.enum';
import { AcTemplateProcessor } from '../core/ac-template-processor';
import { AcReportEngine } from '../core/ac-report-engine';
import { AcExpression } from '../core/ac-expression';
import { AC_REPORT_ENGINE_EVENTS } from '../consts/ac-report-engine-events.const';

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
  mmConversionValue: number = 1;
  pages: AcReportPage[] = [];
  events: AcEvents = new AcEvents();
  hooks: AcHooks = new AcHooks();
  logger: AcLogger = new AcLogger();
  activeLoopElementIds: string[] = [];

  constructor({ element }: { element: HTMLElement }) {
    this.setTempIdsToElement({ element: element });
    AcReportEngine.init();
    this.reportElClone = element.cloneNode(true) as HTMLElement;
    this.element = element;
    this.init();
  }

  addPage() {
    if (this.pages.length > 0) {
      const lastPageEl = this.pages[this.pages.length - 1].element as HTMLElement;
      const cloneEl = lastPageEl.cloneNode(true) as HTMLElement;
      const reportHeaderEls = Array.from(cloneEl.querySelectorAll(`[${AC_REPORT_ATTRIBUTE.reportHeader}]`)) as HTMLElement[];
      for (const reportHeader of reportHeaderEls) {
        reportHeader.remove();
      }
      const reportFootererEls = Array.from(lastPageEl.querySelectorAll(`[${AC_REPORT_ATTRIBUTE.reportFooter}]`)) as HTMLElement[];
      for (const reportFooter of reportFootererEls) {
        reportFooter.remove();
      }
      const page = new AcReportPage({ element: cloneEl, index: this.pages.length, report: this, isFixedHeight: this.pageSize.isRoll != true });
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
      this.events.execute({event:AC_REPORT_ENGINE_EVENTS.pageAdd,args:{page}});
    }
    else {
      const page = new AcReportPage({ element: this.pageElClone!.cloneNode(true) as HTMLElement, index: this.pages.length, report: this, isFixedHeight: this.pageSize.isRoll != true });
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

  clear(){
    const element = this.reportElClone.cloneNode(true) as HTMLElement;
    this.element.replaceWith(element);
    this.element = element;
    this.pages = [];
    this.activePage = undefined;
    this.init();
    this.events.execute({event:AC_REPORT_ENGINE_EVENTS.clear});
  }

  private clearTempIdsFromElement({ element }: { element: HTMLElement }) {
    element.removeAttribute(AC_REPORT_ATTRIBUTE.tempId);
    for (const child of Array.from(element.children) as HTMLElement[]) {
      this.clearTempIdsFromElement({ element: child });
    }
  }

  finalizePages() {
    const lastPage = this.pages[this.pages.length - 1];
    const reportFootererEls = Array.from(lastPage.element.querySelectorAll(`[${AC_REPORT_ATTRIBUTE.reportFooter}]`)) as HTMLElement[];
    for (const reportFooter of reportFootererEls) {
      reportFooter.style.display = reportFooter.getAttribute('ac-temp-style-display')!;
    }
    for (const page of Array.from(this.element.querySelectorAll(`[${AC_REPORT_ATTRIBUTE.page}]`)) as HTMLElement[]) {
      if (this.pageSize.isRoll != true) {
        page.style.maxHeight = `${this.pageHeight}px`;
        page.style.minHeight = `${this.pageHeight}px`;
        page.style.height = `${this.pageHeight}px`;
      }
      page.style.maxWidth = `${this.pageWidth}px`;
      page.style.minWidth = `${this.pageWidth}px`;
      page.style.width = `${this.pageWidth}px`;

      this.pageHeightMM = page.offsetHeight / this.mmConversionValue;
      this.pageWidthMM = page.offsetWidth / this.mmConversionValue;
      this.pageHeight = page.offsetHeight;
      this.pageWidth = page.offsetWidth;
    }
    for (const page of this.pages) {
      this.processPageReportDataBindings(page.element, page);
    }
    this.clearTempIdsFromElement({ element: this.element });
  }

  async generate({ data, callback }: { data: any, callback?: Function }) {
    if (this.pageElClone) {
      this.addPage();
    }
    const context = { data: data, report: {}, page: this.activePage?.toJson() };
    const processor = new AcTemplateProcessor({ context: context, element: this.element, page: this.activePage! });
    await processor.process();
    this.finalizePages();
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
    const el = node as HTMLElement;
    if (node.nodeType == Node.TEXT_NODE) {
      if (node.nodeValue) {
        const original = node.nodeValue;
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

        // Evaluate all expressions in parallel (async)
        const results = await Promise.all(
          matches.map(async ({ expression }) => {
            try {
              return await AcExpression.evaluate({
                expression,
                context: {
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
          // Add text before the match
          result += original.slice(lastIndex, match.start);
          // Add evaluated result
          result += results[i] ?? '';
          // Update cursor
          lastIndex = match.end;
        });

        // Add remaining text after last match
        result += original.slice(lastIndex);
        node.nodeValue = result;
      }
    }
    for (const subNode of Array.from(node.childNodes)) {
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
    }
  }

  setPageHeightWidth() {
    if (this.pageElClone) {
      const measureElement = this.pageElClone.cloneNode(true) as HTMLElement;
      measureElement.style.visibility = 'none';
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
      this.pageHeight = measureElement.offsetHeight;
      this.pageWidth = measureElement.offsetWidth;
      this.mmConversionValue = this.pageWidth / this.pageWidthMM;
      measureElement.remove();
    }
  }

  private setTempIdsToElement({ element }: { element: HTMLElement }) {
    element.setAttribute(AC_REPORT_ATTRIBUTE.tempId, Autocode.uuid());
    for (const child of Array.from(element.children) as HTMLElement[]) {
      this.setTempIdsToElement({ element: child });
    }
  }

  toJson() {
    return {
      pages: this.pages.length
    };
  }
}
