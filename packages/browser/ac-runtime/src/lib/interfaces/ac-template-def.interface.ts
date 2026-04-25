import { AcTemplateEngine } from "../engine/template-engine";

export interface IAcTemplateDef {
  html: string;
  _acContext?: any;
  _acEngine?: AcTemplateEngine;
}
