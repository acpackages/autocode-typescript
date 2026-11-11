import { AC_REPORT_ATTRIBUTE } from "../consts/ac-report-html-attributes.const";
import { AcReportPage } from "../models/ac-report-page.model";
import { AcReport } from "../models/ac-report.model";
import { AcConditionBinding } from "./ac-condition-binding";
import { AcDataBinding } from "./ac-data-binding";
import { AcExpression } from "./ac-expression";
import { AcLoopBinding } from "./ac-loop-binding";
import { AcReportEngine } from "./ac-report-engine";

export class AcTemplateProcessor {
  context: any = {};
  element: HTMLElement;
  page: AcReportPage;
  report: AcReport;

  constructor({ element, context, page }: { element: HTMLElement; context: any; page: AcReportPage }) {
    this.context = context;
    this.element = element;
    this.page = page;
    this.report = page.report;
  }

  async process() {
    await this.processDataBindings(this.element);
    await this.processLoops(this.element);
  }

  private hasConditionAttributes(el: HTMLElement): boolean {
    return (
      el.hasAttribute(AC_REPORT_ATTRIBUTE.templateIf) ||
      el.hasAttribute(AC_REPORT_ATTRIBUTE.templateElseIf) ||
      el.hasAttribute(AC_REPORT_ATTRIBUTE.templateElse) ||
      el.hasAttribute(AC_REPORT_ATTRIBUTE.templateSwitch)
    );
  }

  private hasDataBindingAttributes(el: HTMLElement): boolean {
    if (!el.attributes || el.attributes.length === 0) return false;
    for (let i = 0; i < el.attributes.length; i++) {
      const name = el.attributes[i].name.toLowerCase();
      if (
        name.startsWith(AC_REPORT_ATTRIBUTE.templateBindAttribute) ||
        name.startsWith(AC_REPORT_ATTRIBUTE.templateClass) ||
        name.startsWith(AC_REPORT_ATTRIBUTE.templateStyle) ||
        (name.startsWith('[') && name.endsWith(']'))
      ) {
        return true;
      }
    }
    return false;
  }

  async processDataBindings(node: Node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;

      // Handle page-break-before
      if (el.hasAttribute(AC_REPORT_ATTRIBUTE.pageBreakBefore)) {
        el.removeAttribute(AC_REPORT_ATTRIBUTE.pageBreakBefore);
        if (this.page.element && this.page.element.childNodes.length > 0) {
          const next = this.report.getNextPage();
          if (next) this.page = next;
        }
      }

      // Handle keep-together / no-break
      if (el.hasAttribute(AC_REPORT_ATTRIBUTE.keepTogether) || el.hasAttribute(AC_REPORT_ATTRIBUTE.noBreak)) {
        if (this.page.isFixedHeight && this.page.element) {
          const allocatedHeight = this.page.allocatedHeight > 0 ? this.page.allocatedHeight : this.report.pageHeight;
          const currentHeight = this.page.pageHeight;
          const elHeight = el.offsetHeight;
          if (currentHeight + elHeight > allocatedHeight && this.page.element.childNodes.length > 1) {
            const next = this.report.getNextPage();
            if (next) this.page = next;
          }
        }
      }

      if (this.hasConditionAttributes(el)) {
        const parentBefore = el.parentElement;
        const conBinding = new AcConditionBinding({ element: el, context: this.context, processor: this });
        await conBinding.apply();
        // If removed by conditional logic, stop processing
        if (parentBefore && !el.parentElement) {
          return;
        }
      }

      if (this.hasDataBindingAttributes(el)) {
        const dataBinding = new AcDataBinding({ element: el, context: this.context });
        await dataBinding.apply();
      }

      // Handle accumulate / subtotal
      if (el.hasAttribute(AC_REPORT_ATTRIBUTE.accumulate) || el.hasAttribute(AC_REPORT_ATTRIBUTE.subtotal)) {
        const attrExpr = el.getAttribute(AC_REPORT_ATTRIBUTE.accumulate) || el.getAttribute(AC_REPORT_ATTRIBUTE.subtotal)!;
        const parts = attrExpr.split(';').map((p) => p.trim());
        const expr = parts[0];
        let key = 'total';
        if (parts.length > 1 && parts[1].toLowerCase().startsWith('as ')) {
          key = parts[1].slice(3).trim();
        }
        try {
          const val = await AcExpression.evaluate({ expression: expr, context: this.context });
          if (typeof val === 'number' || !isNaN(Number(val))) {
            this.page.recordValue(key, Number(val));
          }
        } catch (e) {
          AcReportEngine.logError('Accumulate error:', e);
        }
      }

      // Handle page-break-after
      if (el.hasAttribute(AC_REPORT_ATTRIBUTE.pageBreakAfter)) {
        el.removeAttribute(AC_REPORT_ATTRIBUTE.pageBreakAfter);
        const next = this.report.getNextPage();
        if (next) this.page = next;
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      if (node.nodeValue) {
        const original = node.nodeValue;

        // Fast-path: skip text nodes without expression markers
        if (!original.includes('{{')) {
          return;
        }

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

        if (matches.length === 0) {
          return;
        }

        const results = await Promise.all(
          matches.map(async ({ expression }) => {
            try {
              if (expression.startsWith('page.') || expression.startsWith('report.')) {
                return `{{${expression}}}`;
              } else {
                return await AcExpression.evaluate({
                  expression,
                  context: this.context,
                });
              }
            } catch (e) {
              AcReportEngine.logError("Expression error:", expression, e);
              return "";
            }
          })
        );

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

    // Zero-allocation child traversal
    let child = node.firstChild;
    while (child) {
      const next = child.nextSibling;
      let continueOperation = true;
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el: HTMLElement = child as HTMLElement;
        if (el.hasAttribute(AC_REPORT_ATTRIBUTE.templateFor)) {
          continueOperation = false;
        }
      }
      if (continueOperation) {
        await this.processDataBindings(child);
      }
      child = next;
    }
  }

  private processedLoopTempIds = new Set<string>();

  async processLoops(node: Node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.hasAttribute(AC_REPORT_ATTRIBUTE.templateFor)) {
        const tempId = el.getAttribute(AC_REPORT_ATTRIBUTE.tempId);
        if (tempId) {
          if (this.processedLoopTempIds.has(tempId)) {
            return;
          }
          this.processedLoopTempIds.add(tempId);
        }
        const loopBinding = new AcLoopBinding({ element: el, context: this.context, processor: this });
        await loopBinding.apply();
        return; // Loop handles child iterations internally
      }
    }

    let child = node.firstChild;
    while (child) {
      const next = child.nextSibling;
      await this.processLoops(child);
      child = next;
    }
  }
}
