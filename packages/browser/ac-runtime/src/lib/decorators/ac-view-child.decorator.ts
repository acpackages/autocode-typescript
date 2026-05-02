import { AC_VIEW_CHILD_METADATA_KEY } from "../consts/symbols.const";

export function AcViewChild(selector: string) {
    return function (target: any, propertyKey: string) {
        if (!target.constructor[AC_VIEW_CHILD_METADATA_KEY]) {
            target.constructor[AC_VIEW_CHILD_METADATA_KEY] = {};
        }
        target.constructor[AC_VIEW_CHILD_METADATA_KEY][propertyKey] = {propertyKey,referenceKey:selector};
    };
}