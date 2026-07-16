/** CSS class names used throughout the picker DOM. */
export const AC_DATETIME_PICKER_CSS_CLASS = {
  // Root wrapper
  root: 'ac-dtp',
  // Input trigger
  inputWrap: 'ac-dtp__input-wrap',
  input: 'ac-dtp__input',
  icon: 'ac-dtp__icon',
  // Popup
  popup: 'ac-dtp__popup',
  popupOpen: 'ac-dtp__popup--open',
  // Header (selected values)
  header: 'ac-dtp__header',
  headerStart: 'ac-dtp__header-start',
  headerEnd: 'ac-dtp__header-end',
  headerLabel: 'ac-dtp__header-label',
  headerValue: 'ac-dtp__header-value',
  headerSeparator: 'ac-dtp__header-separator',
  // Body layout
  body: 'ac-dtp__body',
  // Sidebar
  sidebar: 'ac-dtp__sidebar',
  presetList: 'ac-dtp__presets',
  presetItem: 'ac-dtp__preset',
  presetItemActive: 'ac-dtp__preset--active',
  // Calendars
  calendars: 'ac-dtp__calendars',
  calLeft: 'ac-dtp__cal ac-dtp__cal--left',
  calRight: 'ac-dtp__cal ac-dtp__cal--right',
  // Footer
  footer: 'ac-dtp__footer',
  btnCancel: 'ac-dtp__btn ac-dtp__btn--cancel',
  btnClear: 'ac-dtp__btn ac-dtp__btn--clear',
  btnApply: 'ac-dtp__btn ac-dtp__btn--apply',
  // State modifiers
  disabled: 'ac-dtp--disabled',
  readonly: 'ac-dtp--readonly',
  singleMode: 'ac-dtp--single',
  rangeMode: 'ac-dtp--range',
} as const;
