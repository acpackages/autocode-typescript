import { AC_OUTPUT_METADATA_KEY } from "../consts/symbols.const";

export function AcOutput(alias?: string) {
    return function (target: any, propertyKey: string) {
        if (!target.constructor[AC_OUTPUT_METADATA_KEY]) {
            target.constructor[AC_OUTPUT_METADATA_KEY] = {};
        }
        target.constructor[AC_OUTPUT_METADATA_KEY][propertyKey] = alias || propertyKey;
    };
}

export function getAcOutputMetadata(constructor: any): Record<string, string> {
    return constructor[AC_OUTPUT_METADATA_KEY] || {};
}
