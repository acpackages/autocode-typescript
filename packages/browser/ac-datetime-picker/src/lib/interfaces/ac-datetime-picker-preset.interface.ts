/** A sidebar preset entry. */
export interface IAcDateTimePickerPreset {
  label: string;
  /** Returns the start and end Date for this preset in local time. */
  getValue: () => { start: Date; end: Date };
}
