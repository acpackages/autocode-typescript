export interface IAcRoute {
    path: string;
    element?: any;
    redirectTo?: string;
    outlet?: string; // default: 'primary'
    data?: any;
}