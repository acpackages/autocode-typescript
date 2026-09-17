import { AcElementBase } from '../../../core/ac-element-base';
import { acRegisterCustomElement } from '../../../utils/ac-element-functions';
import { AC_INPUT_GROUP_TAG, AC_INPUT_GROUP_TEXT_TAG } from '../consts/ac-input-group.const';

export class AcInputGroupElement extends AcElementBase {}
export class AcInputGroupTextElement extends AcElementBase {}

acRegisterCustomElement({ tag: AC_INPUT_GROUP_TAG, type: AcInputGroupElement });
acRegisterCustomElement({ tag: AC_INPUT_GROUP_TEXT_TAG, type: AcInputGroupTextElement });
