import { AcElementBase } from '../../../core/ac-element-base';
import { acRegisterCustomElement } from '../../../utils/ac-element-functions';
import {
  AC_CARD_TAG,
  AC_CARD_HEADER_TAG,
  AC_CARD_BODY_TAG,
  AC_CARD_FOOTER_TAG,
} from '../consts/ac-card.const';

export class AcCardElement extends AcElementBase {}
export class AcCardHeaderElement extends AcElementBase {}
export class AcCardBodyElement extends AcElementBase {}
export class AcCardFooterElement extends AcElementBase {}

acRegisterCustomElement({ tag: AC_CARD_TAG, type: AcCardElement });
acRegisterCustomElement({ tag: AC_CARD_HEADER_TAG, type: AcCardHeaderElement });
acRegisterCustomElement({ tag: AC_CARD_BODY_TAG, type: AcCardBodyElement });
acRegisterCustomElement({ tag: AC_CARD_FOOTER_TAG, type: AcCardFooterElement });
