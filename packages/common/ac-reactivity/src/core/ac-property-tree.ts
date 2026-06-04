export class AcPropertyTree {
    public static checkPath(options: {
        properties: string[];
        segments: (string | number)[];
    }): boolean {
        const { properties, segments } = options;
        if (segments.length === 0) {
            return true;
        }
        const pathStr = segments.join(".");
        return properties.some(p => {
            return p === pathStr || pathStr.startsWith(p + ".") || p.startsWith(pathStr + ".");
        });
    }
}
