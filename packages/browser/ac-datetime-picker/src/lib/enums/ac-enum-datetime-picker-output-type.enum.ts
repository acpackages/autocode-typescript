export enum AcEnumDateTimePickerOutputType {
  /** UTC time, no Z suffix: 2026-07-15T10:30:00 */
  Utc = 'utc',
  /** Local time: 2026-07-15T15:30:00 */
  Local = 'local',
  /** Local time with UTC offset: 2026-07-15T15:30:00+05:30 */
  Offset = 'offset',
}
