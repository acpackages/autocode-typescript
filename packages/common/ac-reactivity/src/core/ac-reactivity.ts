import { IAcMakeReactiveOptions } from "../interfaces/ac-make-reactive-options.interface";
import { AcMetadataStore, RAW_TARGET } from "./ac-metadata-store";
import { AcSignal } from "./ac-signal";
import { updateParentLink, getReactiveValueType, emitChange } from "./ac-utilities";
import { AcProxyFactory } from "./ac-proxy-factory";

export class AcReactivity {
    public static makeReactive<T>(options: IAcMakeReactiveOptions<T>): T {
        const { instance, properties, onChange, batch = false } = options;

        if (!instance || (typeof instance !== "object" && typeof instance !== "function")) {
            return instance;
        }

        const rawInstance = (instance as any)[RAW_TARGET] || instance;
        const meta = AcMetadataStore.getOrCreate({ target: rawInstance });

        if (meta.root) {
            return instance;
        }

        meta.root = {
            properties,
            onChange,
            batch
        };

        const keys = Object.keys(properties);
        for (const key of keys) {
            AcReactivity._defineRootProperty({ instance: rawInstance, key });
        }

        return instance;
    }

    private static _defineRootProperty(options: { instance: any; key: string }): void {
        const { instance, key } = options;

        let targetProto = instance;
        let descriptor: PropertyDescriptor | undefined;
        while (targetProto) {
            descriptor = Object.getOwnPropertyDescriptor(targetProto, key);
            if (descriptor) break;
            targetProto = Object.getPrototypeOf(targetProto);
        }

        let initialValue: any;
        let originalGet: (() => any) | undefined;
        let originalSet: ((v: any) => void) | undefined;

        if (descriptor) {
            originalGet = descriptor.get;
            originalSet = descriptor.set;
            if (!descriptor.configurable) {
                return;
            }
            if (!originalGet) {
                initialValue = descriptor.value;
            }
        }

        const signal = new AcSignal({
            value: originalGet ? undefined : initialValue,
            onChange: (newValue, oldValue) => {
                const rawOld = oldValue && (oldValue as any)[RAW_TARGET] || oldValue;
                const rawNew = newValue && (newValue as any)[RAW_TARGET] || newValue;
                updateParentLink({ parent: instance, key, oldValue: rawOld, newValue: rawNew });

                const meta = AcMetadataStore.get({ target: instance });
                if (meta && meta.root) {
                    emitChange({
                        root: instance,
                        rootMetadata: meta.root,
                        change: {
                            property: key,
                            rootProperty: key,
                            oldValue,
                            newValue,
                            target: instance,
                            timestamp: Date.now(),
                            type: getReactiveValueType({ value: newValue }),
                            operation: "set"
                        }
                    });
                }
            }
        });

        if (initialValue && typeof initialValue === "object") {
            const rawInitVal = initialValue[RAW_TARGET] || initialValue;
            updateParentLink({ parent: instance, key, oldValue: null, newValue: rawInitVal });
        }

        Object.defineProperty(instance, key, {
            configurable: true,
            enumerable: descriptor ? descriptor.enumerable : true,
            get() {
                let currentVal: any;
                if (originalGet) {
                    currentVal = originalGet.call(this);
                    (signal as any)._value = currentVal;
                } else {
                    currentVal = signal.get();
                }

                if (currentVal && typeof currentVal === "object") {
                    const rawVal = currentVal[RAW_TARGET] || currentVal;
                    updateParentLink({ parent: this, key, oldValue: null, newValue: rawVal });
                    return AcProxyFactory.create({ target: rawVal });
                }

                return currentVal;
            },
            set(value) {
                if (originalSet) {
                    const oldValue = originalGet ? originalGet.call(this) : undefined;
                    originalSet.call(this, value);
                    const syncedVal = originalGet ? originalGet.call(this) : value;
                    signal.set({ value: syncedVal, oldValue });
                } else {
                    signal.set({ value });
                }
            }
        });
    }
}
