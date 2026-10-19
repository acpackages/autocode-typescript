/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcBindJsonProperty } from "../annotations/ac-bind-json-property.annotation";
import { AcEvents } from "../core/ac-events";
import { AcEnumConditionOperator } from "../enums/ac-enum-condition-operator.enum";
import { AcEnumLogicalOperator } from "../enums/ac-enum-logical-operator.enum";
import { IAcFilterGroup } from "../interfaces/ac-filter-group.interface";
import { AcJsonUtils } from "../utils/ac-json-utils";
import { AcFilter } from "./ac-filter.model";


export class AcFilterGroup {
  static readonly KeyFilters = "filters";
  static readonly KeyFiltergroups = "filterGroups";
  static readonly KeyOperator = "operator";

  @AcBindJsonProperty({skipInFromJson:true,skipInToJson:true})
  events:AcEvents = new AcEvents();

  filters: AcFilter[] = [];
  filterGroups: AcFilterGroup[] = [];
  operator: AcEnumLogicalOperator = AcEnumLogicalOperator.And;

  static instanceFromJson({ jsonData }: { jsonData: any }): AcFilterGroup {
    const instance = new AcFilterGroup();
    instance.fromJson({ jsonData });
    return instance;
  }

  static instanceWithValues({
    operator,
    filters,
  }: {
    operator: AcEnumLogicalOperator;
    filters: AcFilter[];
  }): AcFilterGroup {
    const result = new AcFilterGroup();
    result.operator = operator;
    result.filters = filters;
    return result;
  }

  addFilter({ key, operator, value }: { key: string; operator: AcEnumConditionOperator; value?: any; }): this {
    this.addFilterModel({
      filter: AcFilter.instanceWithValues({
        key: key,
        operator: operator,
        value: value
      })
    });
    return this;
  }

  addFilterModel({ filter }: { filter: AcFilter; }): this {
    this.filters.push(filter);
    this.events.execute({event:'change',args:{ filter }});
    return this;
  }

  addFilterGroupModel({ filterGroup }: { filterGroup: AcFilterGroup; }): this {
    this.filterGroups.push(filterGroup);
    this.events.execute({event:'change',args:{ filterGroup }});
    return this;
  }

  clear() {
    this.filters = [];
    this.filterGroups = [];
    this.events.execute({event:'change',args:{  }});
  }

  clone(): AcFilterGroup {
    return new AcFilterGroup().fromJson({ jsonData: this.toJson() });
  }

  fromJson({ jsonData }: { jsonData: any }): this {
    AcJsonUtils.setInstancePropertiesFromJsonData({
      instance: this,
      jsonData,
    });
    return this;
  }

  hasFilters(): boolean {
    return this.filters.length > 0;
  }

  setFilter({ key, operator, value }: { key: string; operator: AcEnumConditionOperator; value: any; }): this {
    let found: boolean = false;
    for (const filter of this.filters) {
      if (filter.key == key && !found) {
        filter.operator = operator;
        filter.value = value;
        found = true;
        this.events.execute({event:'change',args:{ key, operator, value }});
        break;
      }
    }
    if (!found) {
      this.addFilterModel({
        filter: AcFilter.instanceWithValues({
          key: key,
          operator: operator,
          value: value
        })
      });
    }
    return this;
  }

  off({ event, callback, subscriptionId }: { event?: string, callback?: Function, subscriptionId?: string }): void {
    this.events.unsubscribe({ event, callback,subscriptionId });
  }

  on({ event, callback }: { event: string, callback: Function }): string {
    return this.events.subscribe({ event, callback });
  }

  toJson(): IAcFilterGroup {
    return AcJsonUtils.getJsonDataFromInstance({ instance: this }) as any;
  }

  toString(): string {
    return AcJsonUtils.prettyEncode({object:this.toJson()});
  }
}
