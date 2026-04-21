// AcEventEmitter for @AcOutput decorator
export class AcEventEmitter<T = any> {
    private listeners: Array<(value: T) => void> = [];

    emit(value?: T) {
        this.listeners.forEach(listener => listener(value as T));
    }

    subscribe(listener: (value: T) => void) {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }
}

// Metadata keys for decorators
const AC_INPUT_METADATA_KEY = Symbol('ac_input_metadata');
const AC_OUTPUT_METADATA_KEY = Symbol('ac_output_metadata');
const AC_VIEW_CHILD_METADATA_KEY = Symbol('ac_view_child_metadata');

// @AcInput decorator
export function AcInput(alias?: string) {
    return function (target: any, propertyKey: string) {
        if (!target.constructor[AC_INPUT_METADATA_KEY]) {
            target.constructor[AC_INPUT_METADATA_KEY] = {};
        }
        target.constructor[AC_INPUT_METADATA_KEY][propertyKey] = alias || propertyKey;
    };
}

// @AcOutput decorator
export function AcOutput(alias?: string) {
    return function (target: any, propertyKey: string) {
        if (!target.constructor[AC_OUTPUT_METADATA_KEY]) {
            target.constructor[AC_OUTPUT_METADATA_KEY] = {};
        }
        target.constructor[AC_OUTPUT_METADATA_KEY][propertyKey] = alias || propertyKey;
    };
}

// @AcViewChild decorator
export function AcViewChild(selector: string) {
    return function (target: any, propertyKey: string) {
        if (!target.constructor[AC_VIEW_CHILD_METADATA_KEY]) {
            target.constructor[AC_VIEW_CHILD_METADATA_KEY] = {};
        }
        target.constructor[AC_VIEW_CHILD_METADATA_KEY][propertyKey] = selector;
    };
}

// Helper to get input metadata
export function getAcInputMetadata(constructor: any): Record<string, string> {
    return constructor[AC_INPUT_METADATA_KEY] || {};
}

// Helper to get output metadata
export function getAcOutputMetadata(constructor: any): Record<string, string> {
    return constructor[AC_OUTPUT_METADATA_KEY] || {};
}

// Helper to get ViewChild metadata
export function getAcViewChildMetadata(constructor: any): Record<string, string> {
    return constructor[AC_VIEW_CHILD_METADATA_KEY] || {};
}