import { acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AcCollapseAttributeName } from "../../ac-collapse/consts/ac-collapse-attribute-name.const";
import { AcCollapse } from "../../ac-collapse/elements/ac-collapse.element";
import { AcEnumCollapseEvent } from "../../ac-collapse/enums/ac-enum-collapse-event.enum";
import { AcEvents } from "@autocode-ts/autocode";
import { AC_ACCORDION_TAG } from "../consts/ac-accordion-tag.const";
import { AC_COLLAPSE_TAG } from "../../_components.export";
import { AcElementBase } from "../../../core/ac-element-base";

export class AcAccordion extends AcElementBase {
  collapses: AcCollapse[] = [];
  private collapseOpenListener = (event: any) => {
    const collapse = event.target;
    this.collapses.forEach((c) => {
      if (c !== collapse) c.close();
    });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    const collapseElements = Array.from(this.querySelectorAll(`${AC_COLLAPSE_TAG.collapse}`)) as AcCollapse[];
    for (const collapse of collapseElements) {
      this.collapses.push(collapse);
      collapse.addEventListener(AcEnumCollapseEvent.Open,this.collapseOpenListener);
    }
  }

  override disconnectedCallback(): void {
    for (const collapse of this.collapses) {
      collapse.removeEventListener(AcEnumCollapseEvent.Open,this.collapseOpenListener)
    }
  }

  override init(){
    super.init();
  }
}

acRegisterCustomElement({ tag: AC_ACCORDION_TAG.accordion, type: AcAccordion });
