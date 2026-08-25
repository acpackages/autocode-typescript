/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDelayedCallback } from "../core/ac-delayed-callback";
import { AcEnumConditionOperator } from "../enums/ac-enum-condition-operator.enum";
import { AcEnumLogicalOperator } from "../enums/ac-enum-logical-operator.enum";
import { IAcFilterGroup } from "../interfaces/ac-filter-group.interface";
import { IAcFilter } from "../interfaces/ac-filter.interface";

export function acNullifyInstanceProperties({ instance, excludeKeys = [], delay = 10   }: { instance: any, excludeKeys?: (string | RegExp)[], delay?: number }): void {
  const execute = () => {
    const obj = instance;
    if (obj && obj !== Object.prototype) {
      const descriptors = Object.getOwnPropertyDescriptors(obj);

      for (const [key, descriptor] of Object.entries(descriptors)) {
        if (key === 'constructor') continue;
        if (descriptor.configurable === false) continue;

        try {
          if (descriptor.set) {
            instance[key] = null;
          }
          else if ('value' in descriptor) {
            instance[key] = null;
          }
        } catch {
        }
      }
    }
  };

  if (delay && delay > 0) {
    let delayedCallback: any = new AcDelayedCallback();
    delayedCallback.add({
      callback: () => {
        execute();
        delayedCallback = null;
      }, duration: delay
    });
  }
  else {
    execute();
  }
}

export function acEvaluateFilter({ filter, data }: { filter: IAcFilter, data: any }): boolean {
  const field = filter.key;
  if (!field) {
    return true;
  }

  const value = data[field];
  const filterValue = filter.value;
  const op = filter.operator ?? AcEnumConditionOperator.Unknown;

  const normalize = (v: any): any =>
    typeof v === "string" ? v.toLowerCase().trim() : v;

  let result: boolean;
  switch (op) {
    case AcEnumConditionOperator.EqualTo:
      result = normalize(value) == normalize(filterValue);
      break;

    case AcEnumConditionOperator.NotEqualTo:
      result = normalize(value) != normalize(filterValue);
      break;

    case AcEnumConditionOperator.GreaterThan:
      result = Number(value) > Number(filterValue);
      break;

    case AcEnumConditionOperator.GreaterThanEqualTo:
      result = Number(value) >= Number(filterValue);
      break;

    case AcEnumConditionOperator.LessThan:
      result = Number(value) < Number(filterValue);
      break;

    case AcEnumConditionOperator.LessThanEqualTo:
      result = Number(value) <= Number(filterValue);
      break;

    case AcEnumConditionOperator.Contains:
      result = (
        value != null &&
        filterValue != null &&
        value.toString().toLowerCase().includes(filterValue.toString().toLowerCase())
      );
      break;

    case AcEnumConditionOperator.NotContains:
      result = (
        value == null ||
        filterValue == null ||
        !value.toString().toLowerCase().includes(filterValue.toString().toLowerCase())
      );
      break;

    case AcEnumConditionOperator.StartsWith:
      result = (
        value != null &&
        filterValue != null &&
        value.toString().toLowerCase().startsWith(filterValue.toString().toLowerCase())
      );
      break;

    case AcEnumConditionOperator.EndsWith:
      result = (
        value != null &&
        filterValue != null &&
        value.toString().toLowerCase().endsWith(filterValue.toString().toLowerCase())
      );
      break;

    case AcEnumConditionOperator.In:
      result = Array.isArray(filterValue)
        ? filterValue.map(normalize).includes(normalize(value))
        : false;
      break;

    case AcEnumConditionOperator.NotIn:
      result = Array.isArray(filterValue)
        ? !filterValue.map(normalize).includes(normalize(value))
        : true;
      break;

    case AcEnumConditionOperator.Between:
      if (!Array.isArray(filterValue) || filterValue.length !== 2) {
        result = true;
      } else {
        const [min, max] = filterValue;
        if (min == null || min === "" || max == null || max === "" || value == null) {
          result = true;
        } else {
          const valNum = Number(value);
          const minNum = Number(min);
          const maxNum = Number(max);
          if (!isNaN(valNum) && !isNaN(minNum) && !isNaN(maxNum)) {
            result = valNum >= minNum && valNum <= maxNum;
          } else {
            const valDate = Date.parse(value);
            const minDate = Date.parse(min);
            const maxDate = Date.parse(max);
            if (!isNaN(valDate) && !isNaN(minDate) && !isNaN(maxDate)) {
              result = valDate >= minDate && valDate <= maxDate;
            } else {
              result = value >= min && value <= max;
            }
          }
        }
      }
      break;

    case AcEnumConditionOperator.IsNull:
      result = value === null || value === undefined;
      break;

    case AcEnumConditionOperator.IsNotNull:
      result = value !== null && value !== undefined;
      break;

    case AcEnumConditionOperator.IsEmpty:
      result = value === null || value === undefined || value === "";
      break;

    case AcEnumConditionOperator.IsNotEmpty:
      result = value !== null && value !== undefined && value !== "";
      break;

    default:
      result = true;
  }
  return result;
}

export function acEvaluateFilterGroup({ group, data }: { group: IAcFilterGroup, data: any }): boolean {
  const results: boolean[] = [];

  if (group.filters) {
    for (const filter of group.filters) {
      results.push(acEvaluateFilter({ filter, data }));
    }
  }

  if (group.filterGroups) {
    for (const subGroup of group.filterGroups) {
      results.push(acEvaluateFilterGroup({ group: subGroup, data }));
    }
  }

  let combinedResult: boolean;
  if (group.operator === AcEnumLogicalOperator.Or) {
    combinedResult = results.some(Boolean);
  } else {
    combinedResult = results.every(Boolean);
  }
  return combinedResult;
}

export function acEvaluateSearch({ searchQuery, data, searchKeys }: { searchQuery: string, data: any, searchKeys?: string[] }): boolean {
  let isValid: boolean = true;
  if (searchKeys == undefined) {
    searchKeys = Object.keys(data);
  }
  if (searchQuery) {
    isValid = false;
    for (const field of searchKeys) {
      if (!isValid) {
        const value = data[field];
        const valid: boolean = value != null && searchQuery != null && value.toString().toLowerCase().includes(searchQuery.toString().toLowerCase());
        if (valid) {
          isValid = true;
          break;
        }
      }
    }
  }
  return isValid;
}
