import { AcElementRenderer } from "../core/ac-element-renderer";

export interface IAcTemplateDef {
  html: string;
  _acContext?: any;
  _acEngine?: AcElementRenderer;
}
