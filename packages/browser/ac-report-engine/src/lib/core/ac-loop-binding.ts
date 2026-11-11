/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { AC_REPORT_ATTRIBUTE, getAttrSelector } from "../consts/ac-report-html-attributes.const";
import { AC_REPORT_ENGINE_EVENTS } from "../consts/ac-report-engine-events.const";
import { AcReportPage } from "../models/ac-report-page.model";
import { AcReport } from "../models/ac-report.model";
import { AcExpression } from "./ac-expression";
import { AcReportEngine } from "./ac-report-engine";
import { AcTemplateProcessor } from "./ac-template-processor";
import { arrayRemove } from "@autocode-ts/ac-extensions";

export class AcLoopBinding {
  element: HTMLElement;
  context: any;
  processor: AcTemplateProcessor;

  get report(): AcReport {
    return this.processor.report;
  }

  get page(): AcReportPage {
    return this.processor.page;
  }

  set page(page: AcReportPage) {
    this.processor.page = page;
  }

  constructor({ element, context, processor }: { element: HTMLElement; context: any; processor: AcTemplateProcessor }) {
    this.element = element;
    this.context = context;
    this.processor = processor;
  }

  async apply(): Promise<boolean> {
    return await this.processAcFor();
  }

  private ensureTableHeaderContinuation(previousPage: AcReportPage, newPage: AcReportPage): void {
    const currentTable = this.element.tagName === 'TABLE' ? this.element : (this.element.closest('table') as HTMLElement | null);
    if (!currentTable) {
      return;
    }

    if (currentTable.querySelector('thead')) {
      return;
    }

    let prevThead: HTMLElement | null = null;
    const tableTempId = currentTable.getAttribute(AC_REPORT_ATTRIBUTE.tempId);
    if (tableTempId && previousPage.element) {
      const prevTable = previousPage.element.querySelector(`[${AC_REPORT_ATTRIBUTE.tempId}="${tableTempId}"]`);
      if (prevTable) {
        prevThead = prevTable.querySelector('thead');
      }
    }

    if (!prevThead && previousPage.element) {
      prevThead = previousPage.element.querySelector(`table thead, ${getAttrSelector(AC_REPORT_ATTRIBUTE.repeatHeader)}`);
    }

    if (prevThead) {
      const clonedThead = prevThead.cloneNode(true) as HTMLElement;
      currentTable.prepend(clonedThead);
    }
  }

  private ensureGroupHeaderContinuation(previousPage: AcReportPage, newPage: AcReportPage): void {
    if (!previousPage.element || !newPage.element) return;
    const groupHeaders = Array.from(previousPage.element.querySelectorAll(getAttrSelector(AC_REPORT_ATTRIBUTE.groupHeader))) as HTMLElement[];
    if (groupHeaders.length === 0) return;

    const lastGroupHeader = groupHeaders[groupHeaders.length - 1];
    if (lastGroupHeader) {
      const existingInNew = newPage.element.querySelector(getAttrSelector(AC_REPORT_ATTRIBUTE.groupHeader));
      if (!existingInNew) {
        const cloned = lastGroupHeader.cloneNode(true) as HTMLElement;
        const doc = this.element.ownerDocument || document;
        const contBadge = doc.createElement('span');
        contBadge.className = 'ac-group-continued-badge badge bg-secondary ms-2';
        contBadge.style.fontSize = '10px';
        contBadge.style.verticalAlign = 'middle';
        contBadge.textContent = '(Continued)';
        cloned.append(contBadge);

        const targetTable = this.element.tagName === 'TABLE' ? this.element : (this.element.closest('table') || this.element);
        if (targetTable && targetTable.parentElement) {
          targetTable.parentElement.insertBefore(cloned, targetTable);
        }
      }
    }
  }

  async processAcFor(): Promise<boolean> {
    try {
      const expr = this.element.getAttribute(AC_REPORT_ATTRIBUTE.templateFor);
      if (expr !== null) {
        let varKey = '';
        let indexKey = '';
        let contextKey = '';
        const context = this.context;
        let expression: string = expr.trim();
        while (expression.indexOf("  ") > 0) {
          expression = expression.replaceAll("  ", " ");
        }
        const exprSplit = expression.split(';');
        const forParts = exprSplit[0].trim().split(' ');
        if (forParts.length == 4) {
          if (forParts[0] == 'let' && forParts[2] == 'of') {
            varKey = forParts[1];
            contextKey = forParts[3];
          } else {
            AcReportEngine.logError('*Invalid acFor expression : ' + expr);
          }
        } else {
          AcReportEngine.logError('*Invalid acFor expression : ' + expr);
        }
        if (exprSplit.length > 1) {
          const indexStr = exprSplit[1];
          const indexParts = indexStr.trim().split(' ');
          if (indexParts.length > 1) {
            if (indexParts[0] == 'let') {
              indexKey = indexParts[1];
            } else {
              AcReportEngine.logError('*acFor index expression must start with let : ' + expr);
            }
          }
        }

        const elementId = this.element.getAttribute(AC_REPORT_ATTRIBUTE.tempId)!;
        const owningPage = this.report.findPageForElement(this.element) || this.report.pages[0];
        this.page = owningPage;
        this.report.activePage = owningPage;

        const childClones: HTMLElement[] = [];
        let childNode = this.element.firstElementChild;
        while (childNode) {
          childClones.push(childNode.cloneNode(true) as HTMLElement);
          childNode = childNode.nextElementSibling;
        }

        this.element.innerHTML = '';
        this.element.removeAttribute(AC_REPORT_ATTRIBUTE.templateFor);

        // Clear any placeholder clones of this loop on other existing pages so they don't hold raw template rows
        for (const p of this.report.pages) {
          if (p !== owningPage) {
            const otherEl = p.element.querySelector(`[${AC_REPORT_ATTRIBUTE.tempId}="${elementId}"]`) as HTMLElement;
            if (otherEl) {
              otherEl.innerHTML = '';
              otherEl.removeAttribute(AC_REPORT_ATTRIBUTE.templateFor);
            }
          }
        }

        this.report.activeLoopElementIds.push(elementId);
        const iteratorData = await AcExpression.evaluate({ expression: contextKey, context: context });

        if (iteratorData != '' && Array.isArray(iteratorData)) {
          const iteratorValues = Object.values(iteratorData);
          const previousActivePage = owningPage;
          const totalItems = iteratorValues.length;

          for (let i = 0; i < totalItems; i++) {
            // Cooperative non-blocking yielding & progress reporting
            if (i > 0 && i % 25 === 0) {
              this.report.events.execute({
                event: AC_REPORT_ENGINE_EVENTS.progress,
                args: {
                  current: i,
                  total: totalItems,
                  percentage: Math.round((i / totalItems) * 100),
                },
              });
              await new Promise((resolve) => setTimeout(resolve, 0));
            }

            const itemContext = { ...this.context, [varKey]: iteratorValues[i] };
            if (indexKey) {
              itemContext[indexKey] = i;
            }

            for (const child of childClones) {
              const childEl = child.cloneNode(true) as HTMLElement;
              const processor = new AcTemplateProcessor({ context: itemContext, element: childEl, page: this.processor.page });
              await processor.process();
              this.element.append(childEl);

              const childH = childEl.offsetHeight || 30;
              const hasOverflowed = this.page.isFixedHeight && this.page.checkOverflowWithEstimatedAddition(childH);

              if (hasOverflowed) {
                childEl.remove();
                const previousPage = this.page;
                const newPage = this.report.getNextPage();
                if (newPage) {
                  this.page = newPage;
                  const completedLoopElements = Array.from(newPage.element.querySelectorAll('[ac-report-loop-end-page-index]'));
                  for (const el of completedLoopElements) {
                    const index = parseInt(el.getAttribute('ac-report-loop-end-page-index')!);
                    if (index < newPage.index) {
                      const tableTags = ['TBODY', 'THEAD', 'TFOOT', 'TR', 'TD', 'TH', 'TABLE'];
                      if (tableTags.includes(el.tagName) || el.closest('table, td, th, .side-debit, .side-credit, [class*="col-"]')) {
                        el.innerHTML = '';
                        el.removeAttribute(AC_REPORT_ATTRIBUTE.templateFor);
                      } else {
                        el.remove();
                      }
                    }
                  }
                  itemContext.page = this.page.toJson();
                  let targetEl = this.page.element.querySelector(`[${AC_REPORT_ATTRIBUTE.tempId}="${elementId}"]`) as HTMLElement;
                  if (!targetEl) {
                    targetEl = this.page.element.querySelector(this.element.tagName.toLowerCase()) as HTMLElement;
                  }
                  if (targetEl) {
                    this.element = targetEl;
                    this.element.innerHTML = '';
                    this.element.removeAttribute(AC_REPORT_ATTRIBUTE.templateFor);
                    // Table Header Continuation on multi-page table splits
                    this.ensureTableHeaderContinuation(previousPage, newPage);
                    // Hierarchical Group Header Continuation on multi-page splits
                    this.ensureGroupHeaderContinuation(previousPage, newPage);
                    // Reuse already processed childEl
                    this.element.append(childEl);
                  }
                }
              }
              itemContext.page = this.page.toJson();
            }
          }

          // Emit final 100% progress
          this.report.events.execute({
            event: AC_REPORT_ENGINE_EVENTS.progress,
            args: {
              current: totalItems,
              total: totalItems,
              percentage: 100,
            },
          });

          this.element.setAttribute('ac-report-loop-end-page-index', this.page.index.toString());
          this.element.removeAttribute(AC_REPORT_ATTRIBUTE.templateFor);
          arrayRemove(this.report.activeLoopElementIds, elementId);
          for (const page of this.report.pages) {
            if (page.index > this.page.index) {
              const loopElement = page.element.querySelector(`[${AC_REPORT_ATTRIBUTE.tempId}="${elementId}"]`) as HTMLElement;
              if (loopElement) {
                loopElement.innerHTML = '';
                loopElement.removeAttribute(AC_REPORT_ATTRIBUTE.templateFor);
              }
            }
          }
        }
      }
      return true;
    } catch (e: any) {
      AcReportEngine.logError(e.message);
      return false;
    }
  }
}
