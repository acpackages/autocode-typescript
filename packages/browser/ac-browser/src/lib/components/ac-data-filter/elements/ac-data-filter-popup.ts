import { AcDataManager, AcEnumConditionOperator, AcFilter } from "@autocode-ts/autocode";
import { createPopper, Instance as PopperInstance } from "@popperjs/core";
import { acClearElement } from "../../../utils/ac-element-functions";
import { AcDataFilterElement, IAcDataFilterField } from "./ac-data-filter.element";

const NO_VALUE_OPS: AcEnumConditionOperator[] = [
  AcEnumConditionOperator.IsNull,
  AcEnumConditionOperator.IsNotNull,
  AcEnumConditionOperator.IsEmpty,
  AcEnumConditionOperator.IsNotEmpty,
];

interface IOperatorDef {
  operator: AcEnumConditionOperator;
  label: string;
}

export interface IAcDataFilterPopupOptions {
  filterElement?: AcDataFilterElement;
  dataManager?: AcDataManager;
  fields?: IAcDataFilterField[];
  anchorElement?: HTMLElement;
  /** When set, popup operates in single-field mode for this specific field */
  targetField?: IAcDataFilterField;
  title?: string;
  onApply?: (filters: AcFilter[]) => void;
  onClear?: () => void;
}

export class AcDataFilterPopup {
  private options: IAcDataFilterPopupOptions;
  private filterElement?: AcDataFilterElement;
  private popperInstance?: PopperInstance;
  private popupElement?: HTMLElement;
  private outsideClickHandler?: (e: MouseEvent) => void;

  get isOpen(): boolean {
    return !!this.popupElement;
  }

  get dataManager(): AcDataManager | undefined {
    return this.options.dataManager ?? this.filterElement?.dataManager;
  }

  get fields(): IAcDataFilterField[] {
    return this.options.fields ?? this.filterElement?.fields ?? [];
  }

  get targetField(): IAcDataFilterField | undefined {
    return this.options.targetField;
  }

  get isSingleFieldMode(): boolean {
    return !!this.targetField;
  }

  constructor(options: { filterElement: AcDataFilterElement } | IAcDataFilterPopupOptions) {
    if ('filterElement' in options && options.filterElement && Object.keys(options).length === 1) {
      this.filterElement = options.filterElement;
      this.options = { filterElement: options.filterElement };
    } else {
      this.options = options;
      this.filterElement = options.filterElement;
    }
  }

  show(anchorElement?: HTMLElement) {
    if (this.popupElement) return;

    const title = this.options.title ?? (this.targetField ? `Filter: ${this.targetField.label || this.targetField.key}` : 'Advanced Filters');

    this.popupElement = document.createElement('div');
    this.popupElement.className = 'ac-data-filter-popup ac-repeater-header-popup';
    this.popupElement.innerHTML = `
      <div class="ac-data-filter-popup-header ac-repeater-popup-header">
        <span>${title}</span>
        <button class="ac-data-filter-popup-close ac-repeater-popup-close" type="button">&times;</button>
      </div>
      <div class="ac-data-filter-rows-container ac-repeater-filter-rows-container" style="max-height: 300px; overflow-y: auto;"></div>
      <div class="ac-data-filter-actions ac-repeater-filter-actions">
        ${this.isSingleFieldMode ? '' : '<button class="ac-data-filter-btn ac-repeater-header-button ac-data-filter-add-btn" type="button">Add</button>'}
        <button class="ac-data-filter-btn ac-repeater-header-button ac-data-filter-clear-btn" type="button">Clear</button>
        <button class="ac-data-filter-btn ac-repeater-header-button ac-data-filter-apply-btn" type="button" style="background:#007bff; color:#fff; border-color:#007bff;">Apply</button>
      </div>
    `;

    document.body.appendChild(this.popupElement);
    this.popupElement.style.display = 'flex';

    const anchor = anchorElement ?? this.options.anchorElement ?? this.filterElement?.buttonElement ?? this.filterElement;
    if (anchor) {
      this.popperInstance = createPopper(anchor, this.popupElement, {
        strategy: 'fixed',
        placement: 'bottom-end',
        modifiers: [
          { name: 'flip', options: { fallbackPlacements: ['top-end', 'bottom-start', 'top-start'] } },
          { name: 'offset', options: { offset: [0, 6] } },
          { name: 'preventOverflow', options: { padding: 8 } },
        ],
      });
    }

    // Wire events
    this.popupElement.querySelector('.ac-data-filter-popup-close')?.addEventListener('click', () => this.hide());
    this.popupElement.querySelector('.ac-data-filter-add-btn')?.addEventListener('click', () => this.addFilterRow());
    this.popupElement.querySelector('.ac-data-filter-clear-btn')?.addEventListener('click', () => {
      this.clearFilters();
    });
    this.popupElement.querySelector('.ac-data-filter-apply-btn')?.addEventListener('click', () => {
      this.applyFilters();
      this.hide();
    });

    this.popupElement.addEventListener('click', (e) => e.stopPropagation());

    this.outsideClickHandler = (e: MouseEvent) => {
      const target = e.target as Node;
      const anchorEl = anchorElement ?? this.options.anchorElement ?? this.filterElement;
      if (this.popupElement && !this.popupElement.contains(target) && (!anchorEl || !anchorEl.contains(target))) {
        this.hide();
      }
    };
    document.addEventListener('click', this.outsideClickHandler);

    this.refreshFilterRows();
  }

  hide() {
    if (this.popperInstance) {
      this.popperInstance.destroy();
      this.popperInstance = undefined;
    }
    if (this.popupElement) {
      this.popupElement.remove();
      this.popupElement = undefined;
    }
    if (this.outsideClickHandler) {
      document.removeEventListener('click', this.outsideClickHandler);
      this.outsideClickHandler = undefined;
    }
  }

  refreshFilterRows() {
    if (!this.popupElement) return;
    const container = this.popupElement.querySelector('.ac-data-filter-rows-container') as HTMLElement;
    if (!container) return;
    acClearElement({ element: container });

    const allFilters = this.dataManager?.filterGroup.filters ?? [];
    const filters = this.isSingleFieldMode
      ? allFilters.filter((f) => f.key === this.targetField!.key)
      : allFilters;

    if (filters.length === 0) {
      this.addFilterRow();
    } else {
      filters.forEach((filter) => this.addFilterRow(filter));
    }
  }

  private getFieldType(fieldKey?: string): string {
    if (this.isSingleFieldMode && this.targetField) {
      return this.targetField.type?.toUpperCase() ?? 'STRING';
    }
    const field = this.fields.find((f) => f.key === fieldKey);
    return field?.type?.toUpperCase() ?? 'STRING';
  }

  private getOperatorsForField(fieldType: string): IOperatorDef[] {
    if (fieldType === 'DATE' || fieldType === 'DATETIME') {
      return [
        { operator: AcEnumConditionOperator.EqualTo, label: "Equals" },
        { operator: AcEnumConditionOperator.NotEqualTo, label: "Not Equals" },
        { operator: AcEnumConditionOperator.GreaterThan, label: "After (>)" },
        { operator: AcEnumConditionOperator.GreaterThanEqualTo, label: "On or After (>=)" },
        { operator: AcEnumConditionOperator.LessThan, label: "Before (<)" },
        { operator: AcEnumConditionOperator.LessThanEqualTo, label: "On or Before (<=)" },
        { operator: AcEnumConditionOperator.Between, label: "Between" },
        { operator: AcEnumConditionOperator.IsNull, label: "Is Null" },
        { operator: AcEnumConditionOperator.IsNotNull, label: "Is Not Null" },
      ];
    }

    if (['NUMBER', 'INT', 'INTEGER', 'FLOAT', 'DECIMAL', 'NUMERIC'].includes(fieldType)) {
      return [
        { operator: AcEnumConditionOperator.EqualTo, label: "Equal To" },
        { operator: AcEnumConditionOperator.NotEqualTo, label: "Not Equal To" },
        { operator: AcEnumConditionOperator.GreaterThan, label: "Greater Than (>)" },
        { operator: AcEnumConditionOperator.GreaterThanEqualTo, label: "Greater Than or Equal To (>=)" },
        { operator: AcEnumConditionOperator.LessThan, label: "Less Than (<)" },
        { operator: AcEnumConditionOperator.LessThanEqualTo, label: "Less Than or Equal To (<=)" },
        { operator: AcEnumConditionOperator.Between, label: "Between" },
        { operator: AcEnumConditionOperator.IsNull, label: "Is Null" },
        { operator: AcEnumConditionOperator.IsNotNull, label: "Is Not Null" },
      ];
    }

    if (fieldType === 'BOOLEAN' || fieldType === 'BOOL') {
      return [
        { operator: AcEnumConditionOperator.EqualTo, label: "Equal To" },
        { operator: AcEnumConditionOperator.NotEqualTo, label: "Not Equal To" },
        { operator: AcEnumConditionOperator.IsNull, label: "Is Null" },
        { operator: AcEnumConditionOperator.IsNotNull, label: "Is Not Null" },
      ];
    }

    return [
      { operator: AcEnumConditionOperator.Contains, label: "Contains" },
      { operator: AcEnumConditionOperator.NotContains, label: "Not Contains" },
      { operator: AcEnumConditionOperator.EqualTo, label: "Equal To" },
      { operator: AcEnumConditionOperator.NotEqualTo, label: "Not Equal To" },
      { operator: AcEnumConditionOperator.StartsWith, label: "Starts With" },
      { operator: AcEnumConditionOperator.EndsWith, label: "Ends With" },
      { operator: AcEnumConditionOperator.IsNull, label: "Is Null" },
      { operator: AcEnumConditionOperator.IsNotNull, label: "Is Not Null" },
      { operator: AcEnumConditionOperator.IsEmpty, label: "Is Empty" },
      { operator: AcEnumConditionOperator.IsNotEmpty, label: "Is Not Empty" },
    ];
  }

  private getInputType(fieldType: string): string {
    if (fieldType === 'DATE') return 'date';
    if (fieldType === 'DATETIME') return 'datetime-local';
    if (['NUMBER', 'INT', 'INTEGER', 'FLOAT', 'DECIMAL', 'NUMERIC'].includes(fieldType)) return 'number';
    return 'text';
  }

  addFilterRow(filter?: AcFilter) {
    if (!this.popupElement) return;
    const container = this.popupElement.querySelector('.ac-data-filter-rows-container') as HTMLElement;
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'ac-data-filter-row ac-repeater-filter-row';
    row.style.marginBottom = '8px';

    const isSingle = this.isSingleFieldMode;
    const initialFieldKey = isSingle
      ? this.targetField!.key
      : (filter?.key ?? (this.fields.filter(f => f.allowFilter !== false)[0]?.key ?? ''));

    const initialFieldType = this.getFieldType(initialFieldKey);
    const opDefs = this.getOperatorsForField(initialFieldType);
    const initialOp = filter?.operator ?? (opDefs.length > 0 ? opDefs[0].operator : AcEnumConditionOperator.EqualTo);
    const inputType = this.getInputType(initialFieldType);

    const isBetween = initialOp === AcEnumConditionOperator.Between;
    const isNoValue = NO_VALUE_OPS.includes(initialOp);

    let fromVal = '';
    let toVal = '';
    let singleVal = '';

    if (isBetween) {
      if (Array.isArray(filter?.value)) {
        fromVal = filter.value[0] ?? '';
        toVal = filter.value[1] ?? '';
      } else if (filter?.value && typeof filter.value === 'object') {
        fromVal = filter.value.from ?? '';
        toVal = filter.value.to ?? '';
      }
    } else {
      singleVal = filter?.value ?? '';
    }

    if (isSingle) {
      row.innerHTML = `
        <select class="filter-op" style="flex:1"></select>
        <input type="${inputType}" class="filter-val" style="flex:1.5; display: ${!isNoValue && !isBetween ? 'block' : 'none'}" value="${singleVal}">
        <div class="filter-val-between" style="display: ${isBetween ? 'flex' : 'none'}; gap: 4px; align-items: center; flex: 1.5;">
          <input type="${inputType}" class="filter-val-from" placeholder="From" style="flex: 1; min-width: 0; padding: 4px;" value="${fromVal}">
          <span style="font-size: 11px; color: #888;">to</span>
          <input type="${inputType}" class="filter-val-to" placeholder="To" style="flex: 1; min-width: 0; padding: 4px;" value="${toVal}">
        </div>
      `;
    } else {
      const filterableFields = this.fields.filter(f => f.allowFilter !== false);
      const fieldsOptions = `<option value="">Select Field...</option>` + filterableFields.map(f => `<option value="${f.key}" ${initialFieldKey === f.key ? 'selected' : ''}>${f.label}</option>`).join('');

      row.innerHTML = `
        <select class="filter-key" style="flex:1">${fieldsOptions}</select>
        <select class="filter-op"></select>
        <input type="${inputType}" class="filter-val" style="flex:1; display: ${!isNoValue && !isBetween ? 'block' : 'none'}" value="${singleVal}">
        <div class="filter-val-between" style="display: ${isBetween ? 'flex' : 'none'}; gap: 4px; align-items: center; flex: 1;">
          <input type="${inputType}" class="filter-val-from" placeholder="From" style="flex: 1; min-width: 0; padding: 4px;" value="${fromVal}">
          <span style="font-size: 11px; color: #888;">to</span>
          <input type="${inputType}" class="filter-val-to" placeholder="To" style="flex: 1; min-width: 0; padding: 4px;" value="${toVal}">
        </div>
        <button class="remove-filter-row" type="button" style="background:none; border:none; cursor:pointer; color:red; font-size:16px;">&times;</button>
      `;
    }

    const keySelect = row.querySelector('.filter-key') as HTMLSelectElement | null;
    const opSelect = row.querySelector('.filter-op') as HTMLSelectElement;
    const valInput = row.querySelector('.filter-val') as HTMLInputElement;
    const betweenContainer = row.querySelector('.filter-val-between') as HTMLElement;
    const fromInput = row.querySelector('.filter-val-from') as HTMLInputElement;
    const toInput = row.querySelector('.filter-val-to') as HTMLInputElement;

    const populateOperators = (selectedOp?: AcEnumConditionOperator) => {
      const currentKey = isSingle ? this.targetField!.key : (keySelect?.value ?? '');
      const fieldType = this.getFieldType(currentKey);
      const ops = this.getOperatorsForField(fieldType);
      const currentOp = selectedOp ?? (opSelect.value as AcEnumConditionOperator) ?? ops[0]?.operator;
      opSelect.innerHTML = ops.map(op => `<option value="${op.operator}" ${op.operator === currentOp ? 'selected' : ''}>${op.label}</option>`).join('');

      const inpType = this.getInputType(fieldType);
      valInput.type = inpType;
      fromInput.type = inpType;
      toInput.type = inpType;

      updateInputVisibility();
    };

    const updateInputVisibility = () => {
      const selectedOp = opSelect.value as AcEnumConditionOperator;
      if (NO_VALUE_OPS.includes(selectedOp)) {
        valInput.style.display = 'none';
        betweenContainer.style.display = 'none';
      } else if (selectedOp === AcEnumConditionOperator.Between) {
        valInput.style.display = 'none';
        betweenContainer.style.display = 'flex';
      } else {
        valInput.style.display = 'block';
        betweenContainer.style.display = 'none';
      }
    };

    populateOperators(initialOp);

    keySelect?.addEventListener('change', () => {
      populateOperators();
    });

    opSelect.addEventListener('change', () => {
      updateInputVisibility();
    });

    row.querySelector('.remove-filter-row')?.addEventListener('click', () => {
      row.remove();
    });

    container.appendChild(row);
  }

  applyFilters() {
    if (!this.popupElement || !this.dataManager) return;
    const container = this.popupElement.querySelector('.ac-data-filter-rows-container') as HTMLElement;
    if (!container) return;

    const rowEls = container.querySelectorAll('.ac-data-filter-row');
    const newFiltersForField: AcFilter[] = [];

    if (this.isSingleFieldMode) {
      const targetKey = this.targetField!.key;
      // Filter out existing filters for this target field, keep other fields intact
      const remainingFilters = this.dataManager.filterGroup.filters.filter(f => f.key !== targetKey);
      this.dataManager.filterGroup.clear();
      remainingFilters.forEach(f => this.dataManager?.filterGroup.addFilterModel({ filter: f }));

      rowEls.forEach((row) => {
        const op = (row.querySelector('.filter-op') as HTMLSelectElement).value as AcEnumConditionOperator;
        if (NO_VALUE_OPS.includes(op)) {
          this.dataManager?.filterGroup.addFilter({ key: targetKey, operator: op, value: '' });
          newFiltersForField.push(AcFilter.instanceWithValues({ key: targetKey, operator: op, value: '' }));
        } else if (op === AcEnumConditionOperator.Between) {
          const fromVal = (row.querySelector('.filter-val-from') as HTMLInputElement).value;
          const toVal = (row.querySelector('.filter-val-to') as HTMLInputElement).value;
          if (fromVal !== '' || toVal !== '') {
            this.dataManager?.filterGroup.addFilter({ key: targetKey, operator: op, value: [fromVal, toVal] });
            newFiltersForField.push(AcFilter.instanceWithValues({ key: targetKey, operator: op, value: [fromVal, toVal] }));
          }
        } else {
          const val = (row.querySelector('.filter-val') as HTMLInputElement).value;
          if (val !== '') {
            this.dataManager?.filterGroup.addFilter({ key: targetKey, operator: op, value: val });
            newFiltersForField.push(AcFilter.instanceWithValues({ key: targetKey, operator: op, value: val }));
          }
        }
      });

      this.filterElement?.updateBadge();
      this.dataManager.refreshRows();
      this.options.onApply?.(newFiltersForField);
    } else {
      this.dataManager.filterGroup.clear();

      rowEls.forEach((row) => {
        const key = (row.querySelector('.filter-key') as HTMLSelectElement).value;
        const op = (row.querySelector('.filter-op') as HTMLSelectElement).value as AcEnumConditionOperator;

        if (!key) return;

        if (NO_VALUE_OPS.includes(op)) {
          this.dataManager?.filterGroup.addFilter({ key, operator: op, value: '' });
          newFiltersForField.push(AcFilter.instanceWithValues({ key, operator: op, value: '' }));
        } else if (op === AcEnumConditionOperator.Between) {
          const fromVal = (row.querySelector('.filter-val-from') as HTMLInputElement).value;
          const toVal = (row.querySelector('.filter-val-to') as HTMLInputElement).value;
          if (fromVal !== '' || toVal !== '') {
            this.dataManager?.filterGroup.addFilter({ key, operator: op, value: [fromVal, toVal] });
            newFiltersForField.push(AcFilter.instanceWithValues({ key, operator: op, value: [fromVal, toVal] }));
          }
        } else {
          const val = (row.querySelector('.filter-val') as HTMLInputElement).value;
          if (val !== '') {
            this.dataManager?.filterGroup.addFilter({ key, operator: op, value: val });
            newFiltersForField.push(AcFilter.instanceWithValues({ key, operator: op, value: val }));
          }
        }
      });

      this.filterElement?.updateBadge();
      this.dataManager.refreshRows();
      this.options.onApply?.(newFiltersForField);
    }
  }

  clearFilters() {
    if (!this.dataManager) return;

    if (this.isSingleFieldMode) {
      const targetKey = this.targetField!.key;
      const remainingFilters = this.dataManager.filterGroup.filters.filter(f => f.key !== targetKey);
      this.dataManager.filterGroup.clear();
      remainingFilters.forEach(f => this.dataManager?.filterGroup.addFilterModel({ filter: f }));
    } else {
      this.dataManager.filterGroup.clear();
    }

    this.filterElement?.updateBadge();
    this.dataManager.refreshRows();
    this.options.onClear?.();
    this.refreshFilterRows();
  }

  destroy() {
    this.hide();
  }
}
