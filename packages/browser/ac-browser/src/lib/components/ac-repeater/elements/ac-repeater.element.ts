import { AcElementBase } from "../../../core/_core.export";
import { acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_REPEATER_TAG } from "../consts/ac-repeater-tag.const";
import { AcRepeaterApi } from "../core/ac-repeater-api";

export class AcRepeaterElement extends AcElementBase{
  repeaterApi:AcRepeaterApi = new AcRepeaterApi({repeater:this});

  constructor(){
    super();
  }

  override init(){
    super.init();
    this.innerHTML = `
      <${AC_REPEATER_TAG.repeaterHeader}></${AC_REPEATER_TAG.repeaterHeader}>
      <${AC_REPEATER_TAG.repeaterBody}></${AC_REPEATER_TAG.repeaterBody}>
      <${AC_REPEATER_TAG.repeaterFooter}></${AC_REPEATER_TAG.repeaterFooter}>
    `;
  }

  override destroy(){
    this.repeaterApi.destroy();
    super.destroy();
  }
}

acRegisterCustomElement({tag:AC_REPEATER_TAG.repeater,type:AcRepeaterElement});
