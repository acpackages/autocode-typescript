/** CSS class names used throughout the picker DOM (standard single-hyphen convention). */
export const AC_DATETIME_PICKER_CSS_CLASS = {
  // Root wrapper
  root: 'ac-dtp',

  // Input trigger
  inputWrap: 'ac-dtp-input-wrap',
  inputWrapHasValue: 'ac-dtp-input-wrap-has-value',
  input: 'ac-dtp-input',

  // Dual range inputs
  rangeInputs: 'ac-dtp-range-inputs',
  inputStart: 'ac-dtp-input ac-dtp-input-start',
  inputEnd: 'ac-dtp-input ac-dtp-input-end',
  inputSeparator: 'ac-dtp-input-separator',

  clearBtn: 'ac-dtp-clear-btn',
  icon: 'ac-dtp-icon',

  // Popup
  popup: 'ac-dtp-popup',
  popupOpen: 'ac-dtp-popup-open',

  // Header (selected values)
  header: 'ac-dtp-header',
  headerInfo: 'ac-dtp-header-info',
  headerBlock: 'ac-dtp-header-block',
  headerStart: 'ac-dtp-header-start',
  headerEnd: 'ac-dtp-header-end',
  headerLabel: 'ac-dtp-header-label',
  headerValue: 'ac-dtp-header-value',
  headerValueActive: 'ac-dtp-header-value-active',
  headerSeparator: 'ac-dtp-header-separator',
  headerClose: 'ac-dtp-header-close',

  // Body layout
  body: 'ac-dtp-body',

  // Sidebar
  sidebar: 'ac-dtp-sidebar',
  presetList: 'ac-dtp-presets',
  presetItem: 'ac-dtp-preset',
  presetItemActive: 'ac-dtp-preset-active',

  // Main content & calendars
  mainContent: 'ac-dtp-main-content',
  calendars: 'ac-dtp-calendars',
  cal: 'ac-dtp-cal',
  calLeft: 'ac-dtp-cal ac-dtp-cal-left',
  calRight: 'ac-dtp-cal ac-dtp-cal-right',

  // Time section
  timeSection: 'ac-dtp-time-section',
  timeSectionVisible: 'ac-dtp-time-section-visible',

  // Footer
  footer: 'ac-dtp-footer',
  btn: 'ac-dtp-btn',
  btnCancel: 'ac-dtp-btn ac-dtp-btn-cancel',
  btnClear: 'ac-dtp-btn ac-dtp-btn-clear',
  btnApply: 'ac-dtp-btn ac-dtp-btn-apply',

  // State modifiers
  disabled: 'ac-dtp-disabled',
  readonly: 'ac-dtp-readonly',
  singleMode: 'ac-dtp-single',
  rangeMode: 'ac-dtp-range',
  noSidebar: 'ac-dtp-no-sidebar',
  hasTime: 'ac-dtp-has-time',

  // Display modes (desktop popover vs mobile bottom sheet)
  desktopPopup: 'ac-dtp-popup-desktop',
  mobileBottomSheet: 'ac-dtp-popup-bottomsheet',
  backdrop: 'ac-dtp-backdrop',
  backdropVisible: 'ac-dtp-backdrop-visible',
} as const;
