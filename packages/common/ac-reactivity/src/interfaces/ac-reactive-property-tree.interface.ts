export interface IAcReactivePropertyTree {
    [property: string]: true | IAcReactivePropertyTree;
}
