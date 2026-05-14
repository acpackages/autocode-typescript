import { AC_INPUT_METADATA_KEY } from "../consts/symbols.const";

export function AcInput(alias?: string) {
    return function (target: any, propertyKey: string) {
        if (!target.constructor[AC_INPUT_METADATA_KEY]) {
            target.constructor[AC_INPUT_METADATA_KEY] = {};
        }
        target.constructor[AC_INPUT_METADATA_KEY][propertyKey] = alias || propertyKey;
    };
}

export function getAcInputMetadata(constructor: any): Record<string, string> {
    return constructor[AC_INPUT_METADATA_KEY] || {};
}