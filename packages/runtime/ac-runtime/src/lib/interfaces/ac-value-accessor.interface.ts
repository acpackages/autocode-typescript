export interface IAcValueAccessor {
  acGetValue(): any;
  acRegisterOnChange(fn: (value: any) => void): void;
  acRegisterOnTouched?(fn: () => void): void;
  acSetDisabledState?(isDisabled: boolean): void;
  acSetValue(value: any): void;
  acValidate?(controlValue: any): Record<string, any> | null;
}
