/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcBindJsonProperty, AcEnumSqlDatabaseType, AcJsonUtils, AcEnumLogicalOperator, AcEnumConditionOperator, AcFilterGroup, AcFilter } from "@autocode-ts/autocode";
import { AcDDConditionGroup } from "./ac-dd-condition-group.model";
import { AcDDCondition } from "./ac-dd-condition.model";
import { AcDataDictionary } from "./ac-data-dictionary.model";
import { AcEnumDDColumnType } from "../enums/ac-enum-dd-column-type.enum";
import { AcDDTableColumn } from "./ac-dd-table-column.model";
// import { AcDDConditionGroup } from "./ac-dd-condition-group.model";
// import { AcDataDictionary } from "./ac-data-dictionary.model";
// import { AcDDCondition } from "./ac-dd-condition.model";
// import { AcDDTableColumn } from "./ac-dd-table-column.model";
// import { AcEnumDDColumnType } from "../enums/ac-enum-dd-column-type.enum";

export class AcDDSelectStatement {
  static readonly KeyCondition = "condition";
  static readonly KeyConditionGroup = "conditionGroup";
  static readonly KeyDatabaseType = "databaseType";
  static readonly KeyDataDictionaryName = "dataDictionaryName";
  static readonly KeyExcludeColumns = "excludeColumns";
  static readonly KeyIncludeColumns = "includeColumns";
  static readonly KeyOrderBy = "orderBy";
  static readonly KeyPageNumber = "pageNumber";
  static readonly KeyPageSize = "pageSize";
  static readonly KeyParameters = "parameters";
  static readonly KeySelectStatement = "selectStatement";
  static readonly KeySqlStatement = "sqlStatement";
  static readonly KeyTableName = "tableName";
  static readonly KeyViewName = "viewName";
  static readonly KeySelectFrom = "selectFrom";

  condition: string = "";

  @AcBindJsonProperty({ key: AcDDSelectStatement.KeyConditionGroup })
  conditionGroup: AcDDConditionGroup = new AcDDConditionGroup();

  @AcBindJsonProperty({ key: AcDDSelectStatement.KeyDatabaseType })
  databaseType: string = "";

  @AcBindJsonProperty({ key: AcDDSelectStatement.KeyDataDictionaryName })
  dataDictionaryName: string = "";

  @AcBindJsonProperty({ key: AcDDSelectStatement.KeyExcludeColumns })
  excludeColumns: string[] = [];

  groupStack: AcDDConditionGroup[] = [];

  @AcBindJsonProperty({ key: AcDDSelectStatement.KeyIncludeColumns })
  includeColumns: string[] = [];

  @AcBindJsonProperty({ key: AcDDSelectStatement.KeyOrderBy })
  orderBy: string = "";

  @AcBindJsonProperty({ key: AcDDSelectStatement.KeyPageNumber })
  pageNumber: number = 0;

  @AcBindJsonProperty({ key: AcDDSelectStatement.KeyPageSize })
  pageSize: number = 0;

  parameters: Record<string, any> = {};

  @AcBindJsonProperty({ key: AcDDSelectStatement.KeySelectStatement })
  selectStatement: string = "";

  @AcBindJsonProperty({ key: AcDDSelectStatement.KeySqlStatement })
  sqlStatement: string = "";

  @AcBindJsonProperty({ key: AcDDSelectStatement.KeyTableName })
  tableName: string = "";

  @AcBindJsonProperty({ key: AcDDSelectStatement.KeyViewName })
  viewName: string = "";

  @AcBindJsonProperty({ key: AcDDSelectStatement.KeySelectFrom })
  selectFrom: string = "";

  constructor({ tableName = "", viewName = "", dataDictionaryName = "default" }: { tableName?: string, viewName?: string, dataDictionaryName?: string } = {}) {
    this.tableName = tableName;
    this.viewName = viewName;
    this.dataDictionaryName = dataDictionaryName;
    this.conditionGroup = new AcDDConditionGroup();
    this.conditionGroup.operator = AcEnumLogicalOperator.And;
    this.groupStack.push(this.conditionGroup);
  }

  static generateSqlStatement({
    selectStatement = "",
    condition = "",
    orderBy = "",
    pageNumber = 0,
    pageSize = 0,
    databaseType = AcEnumSqlDatabaseType.Unknown
  }: {
    selectStatement?: string,
    condition?: string,
    orderBy?: string,
    pageNumber?: number,
    pageSize?: number,
    databaseType?: string
  }): string {
    let sql = selectStatement ?? "";
    if (condition && condition.length > 0) {
      sql += ` WHERE ${condition}`;
    }
    if (orderBy && orderBy.length > 0) {
      sql += ` ORDER BY ${orderBy}`;
    }
    if (pageSize > 0 && pageNumber > 0) {
      sql += ` LIMIT ${(pageNumber - 1) * pageSize},${pageSize}`;
    }
    return sql;
  }

  static instanceFromJson({ jsonData }: { jsonData: any }): AcDDSelectStatement {
    const instance = new AcDDSelectStatement();
    instance.fromJson({ jsonData });
    return instance;
  }

  addCondition({ key, operator, value }: { key: string, operator: string, value: any }): this {
    this.groupStack[this.groupStack.length - 1].addCondition({ key, operator, value });
    return this;
  }

  addConditionGroup({ conditions, operator = AcEnumLogicalOperator.And }: { conditions: any[], operator?: string }): this {
    this.groupStack[this.groupStack.length - 1].addConditionGroup({ conditions, operator });
    return this;
  }

  endGroup(): this {
    if (this.groupStack.length > 1) {
      this.groupStack[this.groupStack.length - 2].conditions.push(this.groupStack.pop()!);
    }
    return this;
  }

  fromJson({ jsonData }: { jsonData: any }): void {
    AcJsonUtils.setInstancePropertiesFromJsonData({ instance: this, jsonData });
  }

  getColumns(): string[] {
    let columns: string[] = [];
    if (this.includeColumns.length === 0 && this.excludeColumns.length === 0) {
      columns.push("*");
    } else if (this.includeColumns.length > 0) {
      columns = this.includeColumns;
    } else if (this.excludeColumns.length > 0) {
      if (this.tableName) {
        const table = AcDataDictionary.getTable({
          tableName: this.tableName,
          dataDictionaryName: this.dataDictionaryName
        });
        if (table) {
          for (const col of table.getColumnNames()) {
            if (!this.excludeColumns.includes(col)) {
              columns.push(col);
            }
          }
        }
      } else if (this.viewName) {
        const view = AcDataDictionary.getView({
          viewName: this.viewName,
          dataDictionaryName: this.dataDictionaryName
        });
        if (view) {
          for (const col of view.getColumnNames()) {
            if (!this.excludeColumns.includes(col)) {
              columns.push(col);
            }
          }
        }
      }
    }
    return columns;
  }

  getSqlStatement({ skipCondition = false, skipSelectStatement = false, skipLimit = false }: { skipCondition?: boolean, skipSelectStatement?: boolean, skipLimit?: boolean } = {}): string {
    if (!skipSelectStatement) {
      const columns = this.getColumns();
      if (!this.selectFrom) {
        if (this.tableName) {
          this.selectFrom = this.tableName;
        } else if (this.viewName) {
          this.selectFrom = this.viewName;
        }
      }

      this.selectStatement = `SELECT ${columns.join(",")} FROM ${this.selectFrom}`;
    }

    if (!skipCondition) {
      this.condition = "";
      this.parameters = {};
      this.setSqlConditionGroup({ acDDConditionGroup: this.conditionGroup, includeParenthesis: false });
    }

    this.sqlStatement = AcDDSelectStatement.generateSqlStatement({
      selectStatement: this.selectStatement,
      condition: this.condition,
      orderBy: this.orderBy,
      pageNumber: skipLimit ? 0 : this.pageNumber,
      pageSize: skipLimit ? 0 : this.pageSize,
      databaseType: this.databaseType
    });

    return this.sqlStatement;
  }

  setConditionsFromFilters({ filters }: { filters: any }): this {
    if (filters) {
      if (filters[AcFilterGroup.KeyFilters]) {
        const group = AcDDConditionGroup.instanceFromFilterGroup({ filterGroup: AcFilterGroup.instanceFromJson({ jsonData: filters }) });
        filters = group.toJson();
      }

      if (filters[AcDDConditionGroup.KeyConditions]) {
        const operator = filters[AcDDConditionGroup.KeyOperator] ?? AcEnumLogicalOperator.And;
        this.addConditionGroup({
          conditions: filters[AcDDConditionGroup.KeyConditions],
          operator
        });
      }
    }

    return this;
  }

  setSqlCondition({ acDDCondition }: { acDDCondition: AcDDCondition }): this {
    let parameterName = "";
    const colName = acDDCondition.key;

    const newParam = (value: any) => {
      const key = `@parameter${Object.keys(this.parameters).length}`;
      this.parameters[key] = value;
      return key;
    };

    switch (acDDCondition.operator) {
      case AcEnumConditionOperator.Between:
        if (Array.isArray(acDDCondition.value) && acDDCondition.value.length === 2) {
          const p1 = newParam(acDDCondition.value[0]);
          this.condition += `${colName} BETWEEN ${p1}`;
          const p2 = newParam(acDDCondition.value[1]);
          this.condition += ` AND ${p2}`;
        }
        break;
      case AcEnumConditionOperator.Contains:
        return this.setSqlLikeStringCondition({ acDDCondition });
      case AcEnumConditionOperator.EndsWith:
        return this.setSqlLikeStringCondition({ acDDCondition, includeInBetween: false, includeStart: false });
      case AcEnumConditionOperator.StartsWith:
        return this.setSqlLikeStringCondition({ acDDCondition, includeInBetween: false, includeEnd: false });
      case AcEnumConditionOperator.EqualTo:
        parameterName = newParam(acDDCondition.value);
        this.condition += `${colName} = ${parameterName}`;
        break;
      case AcEnumConditionOperator.NotEqualTo:
        parameterName = newParam(acDDCondition.value);
        this.condition += `${colName} != ${parameterName}`;
        break;
      case AcEnumConditionOperator.GreaterThan:
        parameterName = newParam(acDDCondition.value);
        this.condition += `${colName} > ${parameterName}`;
        break;
      case AcEnumConditionOperator.GreaterThanEqualTo:
        parameterName = newParam(acDDCondition.value);
        this.condition += `${colName} >= ${parameterName}`;
        break;
      case AcEnumConditionOperator.LessThan:
        parameterName = newParam(acDDCondition.value);
        this.condition += `${colName} < ${parameterName}`;
        break;
      case AcEnumConditionOperator.LessThanEqualTo:
        parameterName = newParam(acDDCondition.value);
        this.condition += `${colName} <= ${parameterName}`;
        break;
      case AcEnumConditionOperator.In:
      case AcEnumConditionOperator.NotIn:
        parameterName = newParam(
          typeof acDDCondition.value === "string" ? acDDCondition.value.split(",") : acDDCondition.value
        );
        this.condition += `${colName} ${acDDCondition.operator === AcEnumConditionOperator.NotIn ? "NOT " : ""}IN (${parameterName})`;
        break;
      case AcEnumConditionOperator.IsNull:
        this.condition += `${colName} IS NULL`;
        break;
      case AcEnumConditionOperator.IsNotNull:
        this.condition += `${colName} IS NOT NULL`;
        break;
      case AcEnumConditionOperator.IsEmpty:
        this.condition += `${colName} = ''`;
        break;
      default:
        break;
    }
    return this;
  }

  setSqlConditionGroup({ acDDConditionGroup, includeParenthesis = true }: { acDDConditionGroup: AcDDConditionGroup, includeParenthesis?: boolean }): this {
    acDDConditionGroup.conditions.forEach((cond, index) => {
      if (index > 0) {
        this.condition += ` ${acDDConditionGroup.operator} `;
      }
      if (cond instanceof AcDDConditionGroup) {
        if (includeParenthesis) this.condition += "(";
        this.setSqlConditionGroup({ acDDConditionGroup: cond, includeParenthesis });
        if (includeParenthesis) this.condition += ")";
      } else if (cond instanceof AcDDCondition) {
        this.setSqlCondition({ acDDCondition: cond });
      }
    });
    return this;
  }

  setSqlLikeStringCondition({ acDDCondition, includeEnd = true, includeInBetween = true, includeStart = true }: {
    acDDCondition: AcDDCondition,
    includeEnd?: boolean,
    includeInBetween?: boolean,
    includeStart?: boolean
  }): this {
    let columnType: string | AcEnumDDColumnType = AcEnumDDColumnType.Unknown;
    if (this.tableName) {
      const col = AcDataDictionary.getTableColumn({
        tableName: this.tableName,
        columnName: acDDCondition.key,
        dataDictionaryName: this.dataDictionaryName
      });
      if (col) columnType = col.columnType;
    } else if (this.viewName) {
      const col = AcDataDictionary.getViewColumn({
        viewName: this.viewName,
        columnName: acDDCondition.key,
        dataDictionaryName: this.dataDictionaryName
      });
      if (col) columnType = col.columnType;
    }

    const colCheck = `LOWER(${acDDCondition.key})`;
    const likeValue = acDDCondition.value.toLowerCase();
    const jsonCol = "value";
    const parts: string[] = [];

    const addCondition = (pattern: string) => {
      const param = `@parameter${Object.keys(this.parameters).length}`;
      this.parameters[param] = pattern;
      parts.push(`${colCheck} LIKE ${param}`);
    };

    if (columnType === AcEnumDDColumnType.Json) {
      if (includeStart) addCondition(`%"${jsonCol}":"${likeValue}%"%`);
      if (includeInBetween) addCondition(`%"${jsonCol}":"%${likeValue}%"%`);
      if (includeEnd) addCondition(`%"${jsonCol}":"%${likeValue}"%`);
    } else {
      if (includeStart) addCondition(`${likeValue}%`);
      if (includeInBetween) addCondition(`%${likeValue}%`);
      if (includeEnd) addCondition(`${likeValue}%`);
    }

    if (parts.length) {
      this.condition += `(${parts.join(" OR ")})`;
    }

    return this;
  }

  startGroup({ operator = "AND" }: { operator?: string } = {}): this {
    const group = new AcDDConditionGroup();
    group.operator = operator;
    this.groupStack.push(group);
    return this;
  }

  toJson(): Record<string, any> {
    return AcJsonUtils.getJsonDataFromInstance({ instance: this });
  }

  toString(): string {
    return AcJsonUtils.prettyEncode({ object: this.toJson() });
  }
}
