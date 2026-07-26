export interface IAcDDInputDefinition{
  inputElementTag?:string,
  inputElement?:new (...args: any[]) => any,
  defaultProperties?:any
}
