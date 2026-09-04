/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { stringToPascalCase } from '@autocode-ts/ac-extensions';
import { AcDataDictionary,AcDDConfig, AcDDFunction, AcDDRelationship, AcDDStoredProcedure, AcDDTable, AcDDTableColumn, AcDDTableColumnProperty, AcDDTableProperty, AcDDTrigger, AcDDView, AcDDViewColumn, AcEnumDDColumnProperty, AcEnumDDColumnType } from '@autocode-ts/ac-data-dictionary';
import { AcDDECodeGeneratorDefaultConfig } from '../consts/ac-dde-code-generator-default-config.const';
import { arrayColumnProperties, boolColumnProperties, numberColumnProperties, stringColumnProperties } from '../consts/ac-dde-property-groups.const';

export class AcDataDictionaryTypescriptCodeGenerator {
  dataDictionaryJson: any = {};
  tabsCount: number = 0;

  get tabs(): string {
    let result: string = ``;
    for (let i = 0; i < this.tabsCount; i++) {
      result += `\t`;
    }
    return result;
  }

  formatColumnValueString({ value, columnDetails, forceNumeric = false }: { value: any, columnDetails: any, forceNumeric?: boolean }): string {
    let result: string = value;
    const type = columnDetails[AcDDTableColumn.KeyColumnType];
    let isNumeric: boolean = false;
    if (forceNumeric == false) {
      switch (type) {
        case AcEnumDDColumnType.AutoIncrement:
        case AcEnumDDColumnType.AutoIndex:
        case AcEnumDDColumnType.Double:
        case AcEnumDDColumnType.Integer:
        case AcEnumDDColumnType.YesNo:
          isNumeric = true;
          break;
      }
    }
    else {
      isNumeric = true;
    }
    if (!isNumeric) {
      result = `"${value}"`;
    }
    return result;
  }

  getClassNameString({ className }: { className: string }): string {
    return stringToPascalCase(className);
  }

  getDataDictionaryString() {
    let result: string = `import { AcDataDictionary, AcDDTable, AcDDTableColumn, AcDDTableColumnProperty,AcEnumDDColumnType,AcEnumDDColumnProperty, AcEnumDDTableProperty } from "@autocode-ts/ac-data-dictionary"; \n`;
    result += `${this.getDDKeysString()}\n\n`;
    result += `export const ${AcDDECodeGeneratorDefaultConfig.dataDictionaryConstName} = {\n`;
    this.tabsCount++;

    result += `${this.tabs}[AcDataDictionary.KeyName] : "${this.dataDictionaryJson[AcDataDictionary.KeyName]}",\n`;
    result += `${this.tabs}[AcDataDictionary.KeyVersion] : ${this.dataDictionaryJson[AcDataDictionary.KeyVersion]},\n`;
    result += `${this.tabs}[AcDataDictionary.KeyTables] : {\n`;
    const tableStrings: string[] = [];
    if (this.dataDictionaryJson[AcDataDictionary.KeyTables]) {
      for (const tableDetails of Object.values(this.dataDictionaryJson[AcDataDictionary.KeyTables])) {
        tableStrings.push(this.getDDTableString({ tableDetails: tableDetails }));
      }
    }
    result += tableStrings.join(`,\n`) + `\n`;
    result += this.tabs + `},\n`;

    result += `${this.tabs}[AcDataDictionary.KeyViews] : {\n`;
    const viewStrings: string[] = [];
    if (this.dataDictionaryJson[AcDataDictionary.KeyViews]) {
      for (const viewDetails of Object.values(this.dataDictionaryJson[AcDataDictionary.KeyViews])) {
        viewStrings.push(this.getDDViewString({ viewDetails: viewDetails }));
      }
    }
    result += viewStrings.join(`,\n`) + `\n`;
    result += this.tabs + `},\n`;

    result += `${this.tabs}[AcDataDictionary.KeyRelationships] : [\n`;
    const relationshipStrings: string[] = [];
    if (this.dataDictionaryJson[AcDataDictionary.KeyRelationships]) {
      for (const relationshipDetails of Object.values(this.dataDictionaryJson[AcDataDictionary.KeyRelationships])) {
        relationshipStrings.push(this.getDDRelationshipString({ relationshipDetails: relationshipDetails }));
      }
    }
    result += relationshipStrings.join(`,\n`) + `\n`;
    result += this.tabs + `],\n`;

    result += `${this.tabs}[AcDataDictionary.KeyTriggers] : {\n`;
    const triggerStrings: string[] = [];
    if (this.dataDictionaryJson[AcDataDictionary.KeyTriggers]) {
      for (const triggerDetails of Object.values(this.dataDictionaryJson[AcDataDictionary.KeyTriggers])) {
        triggerStrings.push(this.getDDTriggerString({ triggerDetails: triggerDetails }));
      }
    }
    result += triggerStrings.join(`,\n`) + `\n`;
    result += this.tabs + `},\n`;

    result += `${this.tabs}[AcDataDictionary.KeyStoredProcedures] : {\n`;
    const storedProcedureStrings: string[] = [];
    if (this.dataDictionaryJson[AcDataDictionary.KeyTriggers]) {
      for (const storedProcedureDetails of Object.values(this.dataDictionaryJson[AcDataDictionary.KeyFunctions])) {
        storedProcedureStrings.push(this.getDDStoredProcedureString({ storedProcedureDetails: storedProcedureDetails }));
      }
    }
    result += storedProcedureStrings.join(`,\n`) + `\n`;
    result += this.tabs + `},\n`;

    result += `${this.tabs}[AcDataDictionary.KeyFunctions] : {\n`;
    const functionStrings: string[] = [];
    if (this.dataDictionaryJson[AcDataDictionary.KeyTriggers]) {
      for (const functionDetails of Object.values(this.dataDictionaryJson[AcDataDictionary.KeyFunctions])) {
        functionStrings.push(this.getDDFunctionString({ functionDetails: functionDetails }));
      }
    }
    result += functionStrings.join(`,\n`) + `\n`;
    result += this.tabs + `}\n`;
    result += `};`;
    return result;
  }

  getDDColumnProperties({ columnDetails }: { columnDetails: any }): string {
    let result: string = `{`;
    this.tabsCount++;
    const propertiesJson: string[] = [];
    if (columnDetails && columnDetails[AcDDTableColumn.KeyColumnProperties]) {
      const properties = columnDetails[AcDDTableColumn.KeyColumnProperties];
      for (const key of Object.keys(properties)) {
        const value = properties[key][AcDDTableColumnProperty.KeyPropertyValue];
        let propertyKey = stringToPascalCase(key.replaceAll('_', ' '));
        let propertyValue = `${value}`;
        let validProperty: boolean = false;
        if (boolColumnProperties.includes(key) && value == true) {
          validProperty = true;
        }
        else if (numberColumnProperties.includes(key) && value) {
          validProperty = true;
        }
        else if (arrayColumnProperties) {
          validProperty = true;
          propertyValue = JSON.stringify(value);
        }
        else if (value) {
          validProperty = true;
          propertyValue = `"${value}"`;
        }
        if (validProperty) {
          let propertyJson: string = '';
          propertyJson += `${this.tabs}[AcEnumDDColumnProperty.${propertyKey}] : {\n`;
          this.tabsCount++;
          propertyJson += `${this.tabs}[AcDDTableColumnProperty.KeyPropertyName] : AcEnumDDColumnProperty.${propertyKey},\n`;
          propertyJson += `${this.tabs}[AcDDTableColumnProperty.KeyPropertyValue] : ${propertyValue}\n`;
          this.tabsCount--;
          propertyJson += `${this.tabs}}`;
          propertiesJson.push(propertyJson);
        }
      }
    }

    if (propertiesJson.length > 0) {
      result += `\n` + propertiesJson.join(`,\n`) + ``;
    }
    this.tabsCount--;

    result += `\n${this.tabs}}`;
    return result;
  }

  getDDColumnTypeString({ columnType }: { columnType: any }): string {
    let result: string = columnType;
    switch (columnType) {
      case AcEnumDDColumnType.AutoIncrement:
        result = `AcEnumDDColumnType.AutoIncrement`;
        break;
      case AcEnumDDColumnType.AutoIndex:
        result = `AcEnumDDColumnType.AutoIndex`;
        break;
      case AcEnumDDColumnType.AutoNumber:
        result = `AcEnumDDColumnType.AutoNumber`;
        break;
      case AcEnumDDColumnType.Blob:
        result = `AcEnumDDColumnType.Blob`;
        break;
      case AcEnumDDColumnType.Date:
        result = `AcEnumDDColumnType.Date`;
        break;
      case AcEnumDDColumnType.Datetime:
        result = `AcEnumDDColumnType.Datetime`;
        break;
      case AcEnumDDColumnType.Double:
        result = `AcEnumDDColumnType.Double`;
        break;
      case AcEnumDDColumnType.Encrypted:
        result = `AcEnumDDColumnType.Encrypted`;
        break;
      case AcEnumDDColumnType.Integer:
        result = `AcEnumDDColumnType.Integer`;
        break;
      case AcEnumDDColumnType.Json:
        result = `AcEnumDDColumnType.Json`;
        break;
      case AcEnumDDColumnType.Password:
        result = `AcEnumDDColumnType.Password`;
        break;
      case AcEnumDDColumnType.String:
        result = `AcEnumDDColumnType.String`;
        break;
      case AcEnumDDColumnType.Text:
        result = `AcEnumDDColumnType.Text`;
        break;
      case AcEnumDDColumnType.Time:
        result = `AcEnumDDColumnType.Time`;
        break;
      case AcEnumDDColumnType.Timestamp:
        result = `AcEnumDDColumnType.Timestamp`;
        break;
      case AcEnumDDColumnType.Uuid:
        result = `AcEnumDDColumnType.Uuid`;
        break;
      case AcEnumDDColumnType.YesNo:
        result = `AcEnumDDColumnType.YesNo`;
        break;
    }
    return result;
  }

  getDDKeysString(): string {
    let result: string = ``;
    result += this.tabs + `/* Keys Start */\n`;
    if (this.dataDictionaryJson) {
      if (this.dataDictionaryJson[AcDataDictionary.KeyTables]) {
        const tableKeys: string[] = [];
        const tableColumnKeys: string[] = [];
        for (const tableDetails of Object.values(this.dataDictionaryJson[AcDataDictionary.KeyTables] as any[])) {
          const tableName = tableDetails[AcDDTable.KeyTableName];
          this.tabsCount++;
          tableKeys.push(`${this.tabs}static readonly ${stringToPascalCase(tableName)} = "${tableName}";`);
          this.tabsCount--;

          const columnKeys: string[] = [];
          this.tabsCount++;
          for (const columnName of Object.keys(tableDetails[AcDDTable.KeyTableColumns])) {
            columnKeys.push(`${this.tabs}static readonly ${stringToPascalCase(columnName)} = "${columnName}";`);
          }

          if(this.dataDictionaryJson[AcDataDictionary.KeyConfig]){
            const config = this.dataDictionaryJson[AcDataDictionary.KeyConfig];
            if(config[AcDDConfig.KeyDeleteTimestampColumnKey] && config[AcDDConfig.KeyDeleteTimestampColumnKey]!=""){
              columnKeys.push(`${this.tabs}static readonly ${stringToPascalCase(config[AcDDConfig.KeyDeleteTimestampColumnKey])} = "${config[AcDDConfig.KeyDeleteTimestampColumnKey]}";`);
            }
            if(config[AcDDConfig.KeyInsertTimestampColumnKey] && config[AcDDConfig.KeyInsertTimestampColumnKey]!=""){
              columnKeys.push(`${this.tabs}static readonly ${stringToPascalCase(config[AcDDConfig.KeyInsertTimestampColumnKey])} = "${config[AcDDConfig.KeyInsertTimestampColumnKey]}";`);
            }
            if(config[AcDDConfig.KeyDeleteTimestampColumnKey] && config[AcDDConfig.KeyUpdateTimestampColumnKey]!=""){
              columnKeys.push(`${this.tabs}static readonly ${stringToPascalCase(config[AcDDConfig.KeyUpdateTimestampColumnKey])} = "${config[AcDDConfig.KeyUpdateTimestampColumnKey]}";`);
            }
          }

          this.tabsCount--;

          let tableColumnsKeyString = this.tabs + `export class ${AcDDECodeGeneratorDefaultConfig.tableNameColumnClassPrefix}${stringToPascalCase(tableName)} {\n`;
          tableColumnsKeyString += columnKeys.join(`\n`);
          tableColumnsKeyString += `\n${this.tabs}}`;
          tableColumnKeys.push(tableColumnsKeyString);

        }
        if (tableKeys.length > 0 || tableColumnKeys.length > 0) {
          result += this.tabs + `/* Table Keys Start */\n`;
          if (tableKeys.length > 0) {
            result += this.tabs + `\nexport class ${AcDDECodeGeneratorDefaultConfig.tableKeysClassName} {\n`;
            result += tableKeys.join(`\n`);
            result += `\n${this.tabs}}\n\n`;
          }
          if (tableColumnKeys.length > 0) {
            result += tableColumnKeys.join(`\n`);
            result += `\n\n`;
          }
          result += this.tabs + `/* Table Keys End */\n`;
        }
      }
      if (this.dataDictionaryJson[AcDataDictionary.KeyViews]) {
        const viewKeys: string[] = [];
        const viewColumnKeys: string[] = [];
        for (const viewDetails of Object.values(this.dataDictionaryJson[AcDataDictionary.KeyViews] as any[])) {
          const viewName = viewDetails[AcDDView.KeyViewName];
          this.tabsCount++;
          viewKeys.push(`${this.tabs}static readonly ${stringToPascalCase(viewName)} = "${viewName}";`);
          this.tabsCount--;

          const columnKeys: string[] = [];
          this.tabsCount++;
          for (const columnName of Object.keys(viewDetails[AcDDView.KeyViewColumns])) {
            columnKeys.push(`${this.tabs}static readonly ${stringToPascalCase(columnName)} = "${columnName}";`);
          }
          this.tabsCount--;

          let viewColumnsKeyString = this.tabs + `export class ${AcDDECodeGeneratorDefaultConfig.viewNameColumnClassPrefix}${stringToPascalCase(viewName)} {\n`;
          viewColumnsKeyString += columnKeys.join(`\n`);
          viewColumnsKeyString += `\n${this.tabs}}`;
          viewColumnKeys.push(viewColumnsKeyString);

        }
        if (viewKeys.length > 0 || viewColumnKeys.length > 0) {
          result += this.tabs + `/* View Keys Start */\n`;
          if (viewKeys.length > 0) {
            result += this.tabs + `\nexport class ${AcDDECodeGeneratorDefaultConfig.viewKeysClassName} {\n`;
            result += viewKeys.join(`\n`);
            result += `\n${this.tabs}}\n\n`;
          }
          if (viewColumnKeys.length > 0) {
            result += viewColumnKeys.join(`\n`);
            result += `\n\n`;
          }
          result += this.tabs + `/* View Keys End */\n`;
        }
      }
      if (this.dataDictionaryJson[AcDataDictionary.KeyStoredProcedures]) {
        const storedProcedureKeys: string[] = [];
        for (const storedProcedureDetails of Object.values(this.dataDictionaryJson[AcDataDictionary.KeyStoredProcedures] as any[])) {
          const storedProcedureName = storedProcedureDetails[AcDDStoredProcedure.KeyStoredProcedureName];
          this.tabsCount++;
          storedProcedureKeys.push(`${this.tabs}static readonly ${stringToPascalCase(storedProcedureName)} = "${storedProcedureName}";`);
          this.tabsCount--;
        }
        if (storedProcedureKeys.length > 0) {
          result += this.tabs + `/* Stored Procedure Keys Start */\n`;
          result += this.tabs + `\nexport class ${AcDDECodeGeneratorDefaultConfig.storeProcedureKeysClassName} {\n`;
          result += storedProcedureKeys.join(`\n`);
          result += `\n${this.tabs}}\n\n`;
          result += this.tabs + `/* Stored Procedure Keys End */\n`;
        }
      }
      if (this.dataDictionaryJson[AcDataDictionary.KeyTriggers]) {
        const triggerKeys: string[] = [];
        for (const triggerDetails of Object.values(this.dataDictionaryJson[AcDataDictionary.KeyTriggers] as any[])) {
          const triggerName = triggerDetails[AcDDTrigger.KeyTriggerName];
          this.tabsCount++;
          triggerKeys.push(`${this.tabs}static readonly ${stringToPascalCase(triggerName)} = "${triggerName}";`);
          this.tabsCount--;
        }
        if (triggerKeys.length > 0) {
          result += this.tabs + `/* Trigger Keys Start */\n`;
          result += this.tabs + `\nexport class ${AcDDECodeGeneratorDefaultConfig.triggerKeysClassName} {\n`;
          result += triggerKeys.join(`\n`);
          result += `\n${this.tabs}}\n\n`;
          result += this.tabs + `/* Trigger Keys End */\n`;
        }
      }
      if (this.dataDictionaryJson[AcDataDictionary.KeyFunctions]) {
        const functionKeys: string[] = [];
        for (const functionDetails of Object.values(this.dataDictionaryJson[AcDataDictionary.KeyFunctions] as any[])) {
          const functionName = functionDetails[AcDDFunction.KeyFunctionName];
          this.tabsCount++;
          functionKeys.push(`${this.tabs}static readonly ${stringToPascalCase(functionName)} = "${functionName}";`);
          this.tabsCount--;
        }
        if (functionKeys.length > 0) {
          result += this.tabs + `/* Function Keys Start */\n`;
          result += this.tabs + `\nexport class ${AcDDECodeGeneratorDefaultConfig.functionKeysClassName} {\n`;
          result += functionKeys.join(`\n`);
          result += `\n${this.tabs}}\n\n`;
          result += this.tabs + `/* Function Keys End */\n`;
        }
      }
      result += this.tabs + `/* Keys End */\n`;
    }
    return result;
  }

  getDDFunctionString({ functionDetails }: { functionDetails: any }): string {
    let result: string = ``;
    this.tabsCount++;
    const functionName = functionDetails[AcDDFunction.KeyFunctionName];
    let functionCode: string = functionDetails[AcDDFunction.KeyFunctionCode] ?? "";
    functionCode = functionCode.trim();
    const keyName = `${AcDDECodeGeneratorDefaultConfig.functionKeysClassName}.${stringToPascalCase(functionName)}`;
    result += `[${keyName}] : {\n`;
    this.tabsCount++;
    result += `[AcDDFunction.KeyFunctionName] : ${keyName},\n`;
    result += `[AcDDFunction.KeyFunctionCode] : "${functionCode}"\n`;
    this.tabsCount--;
    result += `}`;
    this.tabsCount--;
    return result;
  }

  getDDRelationshipString({ relationshipDetails }: { relationshipDetails: any }): string {
    let result: string = `${this.tabs}{\n`;
    this.tabsCount++;
    const cascadeDeleteDestination = relationshipDetails[AcDDRelationship.KeyCascadeDeleteDestination] ?? false;
    const cascadeDeleteSource = relationshipDetails[AcDDRelationship.KeyCascadeDeleteSource] ?? false;
    const destinationColumn = relationshipDetails[AcDDRelationship.KeyDestinationColumn];
    const destinationTable = relationshipDetails[AcDDRelationship.KeyDestinationTable];
    const sourceTable = relationshipDetails[AcDDRelationship.KeySourceTable];
    const sourceColumn = relationshipDetails[AcDDRelationship.KeySourceColumn];
    this.tabsCount++;
    result += `${this.tabs}[AcDDRelationship.KeySourceTable] : ${AcDDECodeGeneratorDefaultConfig.tableKeysClassName}.${stringToPascalCase(sourceTable)},\n`;
    result += `${this.tabs}[AcDDRelationship.KeySourceColumn] : "${AcDDECodeGeneratorDefaultConfig.tableNameColumnClassPrefix}${stringToPascalCase(sourceTable)}.${stringToPascalCase(sourceColumn)}",\n`;
    result += `${this.tabs}[AcDDRelationship.KeyDestinationTable] : ${AcDDECodeGeneratorDefaultConfig.tableKeysClassName}.${stringToPascalCase(destinationTable)},\n`;
    result += `${this.tabs}[AcDDRelationship.KeyDestinationColumn] : "${AcDDECodeGeneratorDefaultConfig.tableNameColumnClassPrefix}${stringToPascalCase(destinationTable)}.${stringToPascalCase(destinationColumn)}",\n`;
    result += `${this.tabs}[AcDDRelationship.KeyCascadeDeleteDestination] : ${cascadeDeleteDestination},\n`;
    result += `${this.tabs}[AcDDRelationship.KeyCascadeDeleteSource] : ${cascadeDeleteSource}\n`;
    this.tabsCount--;
    result += `${this.tabs}}`;
    this.tabsCount--;
    return result;
  }

  getDDStoredProcedureString({ storedProcedureDetails }: { storedProcedureDetails: any }): string {
    let result: string = ``;
    this.tabsCount++;
    const storedProcedureName = storedProcedureDetails[AcDDStoredProcedure.KeyStoredProcedureName];
    let storedProcedureCode: string = storedProcedureDetails[AcDDStoredProcedure.KeyStoredProcedureCode] ?? "";
    storedProcedureCode = storedProcedureCode.trim();
    const keyName = `${AcDDECodeGeneratorDefaultConfig.storeProcedureKeysClassName}.${stringToPascalCase(storedProcedureName)}`;
    result += `[${keyName}] : {\n`;
    this.tabsCount++;
    result += `[AcDDStoredProcedure.KeyStoredProcedureName] : ${keyName},\n`;
    result += `[AcDDStoredProcedure.KeyStoredProcedureCode] : "${storedProcedureCode}"\n`;
    this.tabsCount--;
    result += `}`;
    this.tabsCount--;
    return result;
  }

  getDDTableProperties({ tableDetails }: { tableDetails: any }): string {
    let result: string = `{`;
    this.tabsCount++;
    const propertiesJson: string[] = [];
    if (tableDetails && tableDetails[AcDDTable.KeyTableProperties]) {
      const properties = tableDetails[AcDDTable.KeyTableProperties];
      for (const key of Object.keys(properties)) {
        const value = properties[key][AcDDTableProperty.KeyPropertyValue];
        let propertyKey = stringToPascalCase(key.replaceAll('_', ' '));
        let propertyValue = `${value}`;
        let validProperty: boolean = false;
        validProperty = true;
        propertyValue = `"${value}"`;
        if (validProperty) {
          let propertyJson: string = '';
          propertyJson += `${this.tabs}[AcEnumDDTableProperty.${propertyKey}] : {\n`;
          this.tabsCount++;
          propertyJson += `${this.tabs}[AcEnumDDTableProperty.KeyPropertyName] : AcEnumDDTableProperty.${propertyKey},\n`;
          propertyJson += `${this.tabs}[AcEnumDDTableProperty.KeyPropertyValue] : ${propertyValue}\n`;
          this.tabsCount--;
          propertyJson += `${this.tabs}}`;
          propertiesJson.push(propertyJson);
        }
      }
    }

    if (propertiesJson.length > 0) {
      result += `\n` + propertiesJson.join(`,\n`) + ``;
    }
    this.tabsCount--;

    result += `\n${this.tabs}}`;
    return result;
  }

  getDDTableString({ tableDetails }: { tableDetails: any }): string {
    let result: string = ``;
    this.tabsCount++;
    const tableName = tableDetails[AcDDTable.KeyTableName];
    const keyName = `${AcDDECodeGeneratorDefaultConfig.tableKeysClassName}.${stringToPascalCase(tableName)}`;
    result += `${this.tabs}[${keyName}] : {\n`;
    this.tabsCount++;
    result += `${this.tabs}[AcDDTable.KeyTableName] : ${keyName},\n`;
    result += `${this.tabs}[AcDDTable.KeyTableColumns] : {\n`;

    if (tableDetails[AcDDTable.KeyTableColumns]) {
      const columnStrings: string[] = [];
      for (const columnDetails of Object.values(tableDetails[AcDDTable.KeyTableColumns])) {
        columnStrings.push(this.getDDTableColumnString({ tableName: tableName, columnDetails: columnDetails }));
      }
      result += columnStrings.join(',\n');
    }

    result += `${this.tabs}\n${this.tabs}},\n`;
    result += `${this.tabs}[AcDDTable.KeyTableProperties] : ${this.getDDTableProperties({ tableDetails: tableDetails })}\n`;
    this.tabsCount--;
    result += `${this.tabs}}`;
    this.tabsCount--;
    return result;
  }

  getDDTableColumnString({ tableName, columnDetails }: { tableName: string, columnDetails: any }): string {
    let result: string = ``;
    this.tabsCount++;
    const columnName = columnDetails[AcDDTableColumn.KeyColumnName];
    const keyName = `${AcDDECodeGeneratorDefaultConfig.tableNameColumnClassPrefix}${stringToPascalCase(tableName)}.${stringToPascalCase(columnName)}`;
    result += `${this.tabs}[${keyName}] : {\n`;
    this.tabsCount++;
    result += `${this.tabs}[AcDDTableColumn.KeyColumnName] : ${keyName},\n`;
    result += `${this.tabs}[AcDDTableColumn.KeyColumnType] : ${this.getDDColumnTypeString({ columnType: columnDetails[AcDDTableColumn.KeyColumnType] })},\n`;
    result += `${this.tabs}[AcDDTableColumn.KeyColumnProperties] : ${this.getDDColumnProperties({ columnDetails: columnDetails })}\n`;
    this.tabsCount--;
    result += `${this.tabs}}`;
    this.tabsCount--;
    return result;
  }

  getDDViewString({ viewDetails }: { viewDetails: any }): string {
    let result: string = ``;
    this.tabsCount++;
    const viewName = viewDetails[AcDDView.KeyViewName];
    let viewQuery: string = viewDetails[AcDDView.KeyViewQuery] ?? ``;
    viewQuery = viewQuery.trim();
    const keyName = `${AcDDECodeGeneratorDefaultConfig.viewKeysClassName}.${stringToPascalCase(viewName)}`;
    result += `[${this.tabs}${keyName}] : {\n`;
    this.tabsCount++;
    result += `${this.tabs}[AcDDView.KeyViewName] : ${keyName},\n`;
    result += `${this.tabs}[AcDDView.KeyViewQuery] : "${viewQuery}",\n`;
    result += `${this.tabs}[AcDDView.KeyViewColumns] : {\n`;
    if (viewDetails[AcDDView.KeyViewColumns]) {
      const columnStrings: string[] = [];
      for (const columnDetails of Object.values(viewDetails[AcDDView.KeyViewColumns])) {
        columnStrings.push(this.getDDViewColumnString({ viewName: viewName, columnDetails: columnDetails }));
      }
      result += columnStrings.join(',\n');
    }
    result += `${this.tabs}\n${this.tabs}}\n`;
    this.tabsCount--;
    result += `${this.tabs}}`;
    this.tabsCount--;
    return result;
  }

  getDDViewColumnString({ viewName, columnDetails }: { viewName: string, columnDetails: any }): string {
    let result: string = ``;
    this.tabsCount++;
    const columnName = columnDetails[AcDDViewColumn.KeyColumnName];
    const columnSource = columnDetails[AcDDViewColumn.KeyColumnSource];
    const columnSourceName = columnDetails[AcDDViewColumn.KeyColumnSourceName];
    const keyName = `${AcDDECodeGeneratorDefaultConfig.viewNameColumnClassPrefix}${stringToPascalCase(viewName)}.${stringToPascalCase(columnName)}`;
    result += `[${this.tabs}${keyName}] : {\n`;
    this.tabsCount++;
    result += `${this.tabs}[AcDDViewColumn.KeyColumnName] : ${keyName},\n`;
    result += `${this.tabs}[AcDDViewColumn.KeyColumnSource] : "${columnSource}",\n`;
    result += `${this.tabs}[AcDDViewColumn.KeyColumnSourceName] : "${columnSourceName}",\n`;
    result += `${this.tabs}[AcDDViewColumn.KeyColumnType] : ${this.getDDColumnTypeString({ columnType: columnDetails[AcDDViewColumn.KeyColumnType] })},\n`;
    result += `${this.tabs}[AcDDViewColumn.KeyColumnProperties] : ${this.getDDColumnProperties({ columnDetails: columnDetails })}\n`;
    this.tabsCount--;
    result += `${this.tabs}}`;
    this.tabsCount--;
    return result;
  }

  getDDTriggerString({ triggerDetails }: { triggerDetails: any }): string {
    let result: string = ``;
    this.tabsCount++;
    const triggerName = triggerDetails[AcDDTrigger.KeyTriggerName];
    const triggerExecution = triggerDetails[AcDDTrigger.KeyTriggerExecution];
    const rowOperation = triggerDetails[AcDDTrigger.KeyRowOperation];
    const tableName = triggerDetails[AcDDTrigger.KeyTableName];
    let triggerCode: string = triggerDetails[AcDDTrigger.KeyTriggerCode] ?? "";
    const keyName = `${AcDDECodeGeneratorDefaultConfig.triggerKeysClassName}.${stringToPascalCase(triggerName)}`;
    triggerCode = triggerCode.trim();
    result += `${this.tabs}[${keyName}] : {\n`;
    this.tabsCount++;
    result += `${this.tabs}[AcDDTrigger.KeyTriggerName] : ${keyName},\n`;
    result += `${this.tabs}[AcDDTrigger.KeyTriggerExecution] : "${triggerExecution}",\n`;
    result += `${this.tabs}[AcDDTrigger.KeyRowOperation] : "${rowOperation}",\n`;
    result += `${this.tabs}[AcDDTrigger.KeyTableName] : ${AcDDECodeGeneratorDefaultConfig.tableKeysClassName}.${stringToPascalCase(tableName)},\n`;
    result += `${this.tabs}[AcDDTrigger.KeyTriggerCode] : "${triggerCode}"\n`;
    this.tabsCount--;
    result += `${this.tabs}}`;
    this.tabsCount--;
    return result;
  }


}
