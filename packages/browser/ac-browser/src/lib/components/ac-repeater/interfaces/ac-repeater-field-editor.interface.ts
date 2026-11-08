export interface IAcRepeaterFieldEditor {
  getElement(): HTMLElement;
  getValue(): any;
  init(args: any): void;
  refresh(args: any): void;
  focus?(): void;
  blur?(): void;
  destroy?(): void;
}
