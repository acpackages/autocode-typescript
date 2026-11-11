/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { AC_REPORT_ATTRIBUTE } from "../consts/ac-report-html-attributes.const";
import { AcReportPage } from "../models/ac-report-page.model";
import { AcReport } from "../models/ac-report.model";
import { AcExpression } from "./ac-expression";
import { AcReportEngine } from "./ac-report-engine";
import { AcTemplateProcessor } from "./ac-template-processor";

export class AcConditionBinding {
  element: HTMLElement;
  context: any;
  processor: AcTemplateProcessor;
  report: AcReport;
  page: AcReportPage;

  constructor({ element, context, processor }: { element: HTMLElement, context: any, processor: AcTemplateProcessor }) {
    this.element = element;
    this.context = context;
    this.processor = processor;
    this.page = processor.page;
    this.report = processor.page.report;
  }

  async apply(): Promise<boolean> {
    return (
      await this.processConditionalChain() ||
      await this.processAcSwitch()
    );
  }

  async processConditionalChain(): Promise<boolean> {
    try {
      if (!this.element.hasAttribute(AC_REPORT_ATTRIBUTE.templateIf) && !this.element.hasAttribute(AC_REPORT_ATTRIBUTE.templateElseIf) && !this.element.hasAttribute(AC_REPORT_ATTRIBUTE.templateElse)) return false;

      const siblings = Array.from(this.element.parentElement?.children ?? []);
      const chain: HTMLElement[] = [];

      let started = false;
      const context = {...this.context};
      for (const sibling of siblings) {
        const s = sibling as HTMLElement;

        if (!started && s.hasAttribute(AC_REPORT_ATTRIBUTE.templateIf)) {
          started = true;
          chain.push(s);
          continue;
        }

        if (started && (s.hasAttribute(AC_REPORT_ATTRIBUTE.templateElseIf) || s.hasAttribute(AC_REPORT_ATTRIBUTE.templateElse))) {
          chain.push(s);
        } else if (started) {
          break; // End of chain
        }
      }

      let matched = false;
      for (const node of chain) {
        if (matched) {
          node.remove(); // Remove unrendered siblings
          continue;
        }

        if (node.hasAttribute(AC_REPORT_ATTRIBUTE.templateIf)) {
          const expr = node.getAttribute(AC_REPORT_ATTRIBUTE.templateIf)!;
          const ifResult = await AcExpression.evaluate({ expression: expr, context: context });
          if (ifResult == true) {
            matched = true;
            node.removeAttribute(AC_REPORT_ATTRIBUTE.templateIf);
          } else {
            node.remove();
          }
        } else if (node.hasAttribute(AC_REPORT_ATTRIBUTE.templateElseIf)) {
          const expr = node.getAttribute(AC_REPORT_ATTRIBUTE.templateElseIf)!;
          const elseIfResult = await AcExpression.evaluate({ expression: expr, context: context });
          if (elseIfResult == true) {
            matched = true;
            node.removeAttribute(AC_REPORT_ATTRIBUTE.templateElseIf);
          } else {
            node.remove();
          }
        } else if (node.hasAttribute(AC_REPORT_ATTRIBUTE.templateElse)) {
          matched = true;
          node.removeAttribute(AC_REPORT_ATTRIBUTE.templateElse);
        }
      }

      return true;
    }
    catch (ex) {
      AcReportEngine.logError(`Error processing condition chain`, ex);
      return false;
    }
  }

  async processAcSwitch(): Promise<boolean> {
    try {
      const switchExpr = this.element.getAttribute(AC_REPORT_ATTRIBUTE.templateSwitch);
      if (!switchExpr) return false;
      const context = this.context;
      const switchValue = await AcExpression.evaluate({ expression: switchExpr, context: context });
      let matched = false;

      const siblings = Array.from(this.element.children);
      for (const child of siblings) {
        if ((child as HTMLElement).hasAttribute(AC_REPORT_ATTRIBUTE.templateSwitchCase)) {
          const caseVal = await AcExpression.evaluate({ expression: (child as HTMLElement).getAttribute(AC_REPORT_ATTRIBUTE.templateSwitchCase)!, context: context });
          if (!matched && caseVal === switchValue) {
            matched = true;
          } else {
            child.remove();
          }
        }

        if ((child as HTMLElement).hasAttribute(AC_REPORT_ATTRIBUTE.templateSwitchDefault) && !matched) {
          matched = true;
        } else if ((child as HTMLElement).hasAttribute(AC_REPORT_ATTRIBUTE.templateSwitchDefault)) {
          child.remove();
        }
      }

      this.element.removeAttribute(AC_REPORT_ATTRIBUTE.templateSwitch);
      return true;
    }
    catch (ex) {
      AcReportEngine.logError(`Error processing switch`, ex);
      return false;
    }
  }
}
