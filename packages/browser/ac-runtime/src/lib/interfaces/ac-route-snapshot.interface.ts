export interface IAcRouteSnapshot {
    path: string;
    element: any;
    params: Record<string, string>;
    data: any;
    outlet: string;
}
