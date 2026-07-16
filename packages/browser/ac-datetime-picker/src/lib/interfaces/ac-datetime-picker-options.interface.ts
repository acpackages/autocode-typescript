import { AcEnumDateTimePickerMode } from '../enums/ac-enum-datetime-picker-mode.enum';
import { AcEnumDateTimePickerOutputType } from '../enums/ac-enum-datetime-picker-output-type.enum';
import { IAcDateTimePickerPreset } from './ac-datetime-picker-preset.interface';
import { IAcDateTimePickerRangeValue } from './ac-datetime-picker-range-value.interface';

/** Full configuration options for AcDateTimePickerElement. */
export interface IAcDateTimePickerOptions {
  mode?: AcEnumDateTimePickerMode;
  value?: string | IAcDateTimePickerRangeValue | null;
  min?: string | null;
  max?: string | null;
  disabledDates?: string[];
  format?: string;
  readonly?: boolean;
  disabled?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
  showTime?: boolean;
  showSeconds?: boolean;
  minuteStep?: number;
  hour12?: boolean;
  outputType?: AcEnumDateTimePickerOutputType;
  presets?: IAcDateTimePickerPreset[];
}
