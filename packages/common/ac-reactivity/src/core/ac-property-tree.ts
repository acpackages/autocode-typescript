import { IAcReactivePropertyTree } from "../interfaces/ac-reactive-property-tree.interface";

export class AcPropertyTree {
    public static checkPath(options: {
        properties: IAcReactivePropertyTree;
        segments: (string | number)[];
    }): boolean {
        const { properties, segments } = options;
        let current: IAcReactivePropertyTree | true = properties;
        for (const segment of segments) {
            if (current === true) {
                return true;
            }
            const next: IAcReactivePropertyTree | true | undefined = (current as IAcReactivePropertyTree)[String(segment)];
            if (next === undefined) {
                return false;
            }
            current = next;
        }
        return true;
    }
}
