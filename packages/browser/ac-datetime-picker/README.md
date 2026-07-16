# @autocode-ts/ac-datetime-picker

A lightweight, dependency-minimal DateTime Picker web component built on [Air Datepicker](https://air-datepicker.com/).
Extends `AcInputBase` for seamless integration with AutoCode forms.

---

## Installation

```bash
npm install @autocode-ts/ac-datetime-picker air-datepicker
```

---

## Basic Usage

```html
<!-- Register the element (import once in your app entry) -->
<script type="module">
  import '@autocode-ts/ac-datetime-picker';
</script>

<!-- Date range picker (default) -->
<ac-datetime-picker mode="daterange"></ac-datetime-picker>

<!-- Single date -->
<ac-datetime-picker mode="date"></ac-datetime-picker>

<!-- Date + time -->
<ac-datetime-picker mode="datetime" show-time="true"></ac-datetime-picker>
```

---

## Modes

| Attribute value | Description |
|---|---|
| `date` | Single date |
| `datetime` | Single date + time |
| `daterange` | Date range (start + end) |
| `datetimerange` | Date range with time |
| `month` | Single month |
| `monthrange` | Month range |
| `year` | Single year |
| `yearrange` | Year range |

---

## JavaScript API

```js
const picker = document.querySelector('ac-datetime-picker');

// Set value programmatically
picker.setValue('2026-07-15T10:30:00');

// Set a range
picker.setValue({ start: '2026-07-01T00:00:00', end: '2026-07-31T23:59:59' });

// Get current value (ISO string or range object)
const value = picker.getValue();

// Open / close / toggle
picker.open();
picker.close();
picker.toggle();

// Clear selection
picker.clear();

// Destroy (removes listeners and Air Datepicker instances)
picker.destroy();
```

---

## Date Picker Examples

```html
<!-- Minimal date picker -->
<ac-datetime-picker mode="date"></ac-datetime-picker>

<!-- With min/max constraints -->
<ac-datetime-picker
  mode="date"
  min="2026-01-01"
  max="2026-12-31"
></ac-datetime-picker>

<!-- Pre-selected value -->
<ac-datetime-picker mode="date" value="2026-07-15"></ac-datetime-picker>
```

---

## Date Range Examples

```html
<!-- Default date range -->
<ac-datetime-picker mode="daterange"></ac-datetime-picker>

<!-- Without sidebar presets -->
<ac-datetime-picker mode="daterange" show-sidebar="false"></ac-datetime-picker>

<!-- Without footer (auto-apply on selection) -->
<ac-datetime-picker mode="daterange" show-footer="false"></ac-datetime-picker>

<!-- Pre-selected range via JS -->
<script>
  const picker = document.querySelector('ac-datetime-picker');
  picker.setValue({ start: '2026-07-01', end: '2026-07-31' });
</script>
```

---

## DateTime Examples

```html
<!-- DateTime with 12-hour clock -->
<ac-datetime-picker
  mode="datetime"
  show-time="true"
  hour12="true"
></ac-datetime-picker>

<!-- DateTime range with minute step -->
<ac-datetime-picker
  mode="datetimerange"
  show-time="true"
  minute-step="15"
></ac-datetime-picker>
```

---

## ISO 8601 Handling

The component always **accepts** and **returns** ISO 8601 strings. It never returns
`Date` objects, timestamps, or locale-formatted strings.

**Input — accepted formats:**
```
2026-07-15                   ← date-only
2026-07-15T10:30:00          ← local datetime
2026-07-15T10:30:00Z         ← UTC (Z)
2026-07-15T10:30:00+05:30    ← with offset
```

**Output — controlled by `outputType`:**

| `outputType` | Example output |
|---|---|
| `utc` (default) | `2026-07-15T05:00:00` |
| `local` | `2026-07-15T10:30:00` |
| `offset` | `2026-07-15T10:30:00+05:30` |

> **Note:** UTC output does **not** include a `Z` suffix.

---

## Time Zone Behaviour

- **Display:** Always shown in the user's **local system timezone**.
- **Input:** Any ISO string (including UTC or offset) is parsed and displayed in local time.
- **Output:** Converted back to the configured `outputType` on apply.

**Example:**
```
Input:   2026-07-15T18:30:00Z
Timezone: Asia/Kolkata (+05:30)
Display: 16 Jul 2026, 12:00 AM    ← shown in local time
Output (utc):    2026-07-16T00:00:00
Output (local):  2026-07-16T00:00:00
Output (offset): 2026-07-16T00:00:00+05:30
```

---

## Events

```js
picker.addEventListener('change',      e => console.log('changed', e.detail));
picker.addEventListener('apply',       e => console.log('applied', e.detail));
picker.addEventListener('cancel',      e => console.log('cancelled'));
picker.addEventListener('clear',       e => console.log('cleared'));
picker.addEventListener('open',        e => console.log('opened'));
picker.addEventListener('close',       e => console.log('closed'));
picker.addEventListener('presetSelect',e => console.log('preset', e.detail.preset));
```

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Description |
|---|---|---|---|---|
| `mode` | `mode` | `AcEnumDateTimePickerMode` | `daterange` | Picker mode |
| `value` | `value` | `string \| RangeValue \| null` | `null` | Current value |
| `min` | `min` | `string` | — | Minimum selectable date (ISO) |
| `max` | `max` | `string` | — | Maximum selectable date (ISO) |
| `format` | `format` | `string` | `DD MMM YYYY` | Display format |
| `readonly` | `readonly` | `boolean` | `false` | Read-only mode |
| `disabled` | `disabled` | `boolean` | `false` | Disabled state |
| `showSidebar` | `show-sidebar` | `boolean` | `true` | Show preset sidebar |
| `showFooter` | `show-footer` | `boolean` | `true` | Show footer buttons |
| `showTime` | `show-time` | `boolean` | `false` | Show time picker |
| `showSeconds` | `show-seconds` | `boolean` | `false` | Show seconds |
| `minuteStep` | `minute-step` | `number` | `1` | Minute increment |
| `hour12` | `hour12` | `boolean` | `false` | 12-hour clock |
| `outputType` | `output-type` | `AcEnumDateTimePickerOutputType` | `utc` | Output ISO format |
| `presets` | — | `IAcDateTimePickerPreset[]` | built-in | Custom sidebar presets |

### Methods

| Method | Description |
|---|---|
| `open()` | Open the popup |
| `close()` | Close the popup |
| `toggle()` | Toggle open/close |
| `clear()` | Clear selection |
| `focus()` | Focus the trigger input |
| `setValue(v)` | Set value (ISO string or range object) |
| `getValue()` | Get current value |
| `setStart(iso)` | Set start of range |
| `setEnd(iso)` | Set end of range |
| `refresh()` | Re-render presets and display |
| `destroy()` | Destroy and clean up |

---

## Custom Presets

```js
picker.presets = [
  {
    label: 'Last 3 Hours',
    getValue: () => ({
      start: new Date(Date.now() - 3 * 60 * 60 * 1000),
      end: new Date(),
    }),
  },
  // ... more presets
];
```

---

## Styling (CSS Variables)

Override any variable on the host or `:root`:

```css
ac-datetime-picker {
  --ac-dtp-accent: #10b981;
  --ac-dtp-accent-hover: #059669;
  --ac-dtp-font: 'Inter', sans-serif;
  --ac-dtp-input-radius: 4px;
  --ac-dtp-popup-radius: 8px;
  --ac-dtp-sidebar-width: 180px;
}
```

### Full variable reference

| Variable | Default | Description |
|---|---|---|
| `--ac-dtp-font` | system-ui | Font family |
| `--ac-dtp-font-size` | 13px | Base font size |
| `--ac-dtp-bg` | #ffffff | Popup background |
| `--ac-dtp-bg-alt` | #f9fafb | Alternate background |
| `--ac-dtp-border` | #e5e7eb | Border colour |
| `--ac-dtp-text` | #111827 | Primary text |
| `--ac-dtp-text-muted` | #6b7280 | Muted text |
| `--ac-dtp-accent` | #6366f1 | Accent / selected colour |
| `--ac-dtp-accent-hover` | #4f46e5 | Accent hover |
| `--ac-dtp-range-bg` | #eef2ff | Range highlight background |
| `--ac-dtp-sidebar-bg` | #f3f4f6 | Sidebar background |
| `--ac-dtp-sidebar-width` | 160px | Sidebar width |
| `--ac-dtp-input-height` | 36px | Input trigger height |
| `--ac-dtp-input-radius` | 6px | Input border radius |
| `--ac-dtp-popup-radius` | 10px | Popup border radius |
| `--ac-dtp-popup-z` | 9999 | Popup z-index |

---

## Dark Mode

```html
<!-- Via data-theme attribute on any ancestor -->
<div data-theme="dark">
  <ac-datetime-picker mode="daterange"></ac-datetime-picker>
</div>

<!-- Via .dark class -->
<div class="dark">
  <ac-datetime-picker mode="daterange"></ac-datetime-picker>
</div>

<!-- Directly on the element -->
<ac-datetime-picker data-theme="dark" mode="daterange"></ac-datetime-picker>
```

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Enter` / `Space` | Open / close popup |
| `Escape` | Close popup |
| `Tab` | Close popup and move focus |
| `Arrow keys` | Navigate days (via Air Datepicker) |
| `Page Up / Down` | Navigate months (via Air Datepicker) |
