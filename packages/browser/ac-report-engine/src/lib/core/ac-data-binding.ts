/* eslint-disable @typescript-eslint/no-explicit-any */
import { stringToCamelCase } from "@autocode-ts/ac-extensions";
import { AC_REPORT_ATTRIBUTE } from "../consts/ac-report-html-attributes.const";
import { AcExpression } from "./ac-expression";
import { AcReportEngine } from "./ac-report-engine";

export class AcDataBinding {
  element!: HTMLElement;
  context!: any;

  constructor({ element, context }: { element: HTMLElement; context: any }) {
    this.element = element;
    this.context = context;
  }

  async apply() {
    const attributes = Array.from(this.element.attributes);
    const attrToRemove: string[] = [];
    for (const attr of attributes) {
      const expr = attr.value;
      if (attr.name.toLowerCase().startsWith(AC_REPORT_ATTRIBUTE.templateBindAttribute)) {
        const attrName = attr.name.slice(AC_REPORT_ATTRIBUTE.templateBindAttribute.length + 1);
        try {
          const value = await AcExpression.evaluate({ expression: expr, context: this.context });
          if (value !== undefined) {
            if (attrName.toLowerCase() == 'innerhtml') {
              this.element.innerHTML = value;
            } else if (attrName in this.element) {
              (this.element as any)[attrName] = value;
            } else {
              this.element.setAttribute(attrName, value);
            }
          }
          attrToRemove.push(attr.name);
        } catch (e) {
          AcReportEngine.logError(`Failed to bind '${attrName}' with expression "${expr}":`, e);
        }
      } else if (attr.name.toLowerCase().startsWith(AC_REPORT_ATTRIBUTE.templateClass)) {
        const attrName = attr.name.slice(AC_REPORT_ATTRIBUTE.templateClass.length + 1);
        attrToRemove.push(attr.name);
        const result = await AcExpression.evaluate({ expression: expr, context: this.context });
        if (result) {
          this.element.classList.add(attrName);
        }
      } else if (attr.name.toLowerCase().startsWith(AC_REPORT_ATTRIBUTE.templateStyle)) {
        const attrName = attr.name.slice(AC_REPORT_ATTRIBUTE.templateStyle.length + 1);
        const result = await AcExpression.evaluate({ expression: expr, context: this.context });
        const propertyName = stringToCamelCase(attrName);
        (this.element.style as any)[propertyName] = result;
        attrToRemove.push(attr.name);
      } else if (attr.name.startsWith('[') && attr.name.endsWith(']')) {
        const prop = attr.name.slice(1, -1);
        const val = await AcExpression.evaluate({ expression: attr.value, context: this.context });
        (this.element as any)[prop] = val;
        attrToRemove.push(attr.name);
      }
    }
    for (const name of attrToRemove) {
      this.element.removeAttribute(name);
    }
  }
}
