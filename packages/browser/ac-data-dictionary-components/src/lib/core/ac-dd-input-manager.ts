import { AcDataDictionary, AcDDTableColumn, AcEnumDDColumnType } from "@autocode-ts/ac-data-dictionary";
import { AcDatetimeInputElement, AcInputElement, AcNumberInput, AcSelectInputElement, AcTextareaInputElement, AcTextInputElement } from "@autocode-ts/ac-browser";
import { IAcDDInputDefinition } from "../interfaces/ac-dd-input-definition.interface";
import { AcDDInputFieldBaseElement } from "../elements/ac-dd-input-field-base-element.element";

export class AcDDInputManager {
  private static columnTypeInputs: Record<string, IAcDDInputDefinition> = {
    [AcEnumDDColumnType.AutoNumber]: { inputElement: AcTextInputElement },
    [AcEnumDDColumnType.Blob]: { inputElement: AcInputElement },
    [AcEnumDDColumnType.Date]: { inputElement: AcDatetimeInputElement, defaultProperties: { type: 'date' } },
    [AcEnumDDColumnType.Datetime]: { inputElement: AcDatetimeInputElement },
    [AcEnumDDColumnType.Double]: { inputElement: AcNumberInput },
    [AcEnumDDColumnType.Integer]: { inputElement: AcNumberInput },
    [AcEnumDDColumnType.Json]: { inputElement: AcTextInputElement, },
    [AcEnumDDColumnType.Password]: { inputElement: AcInputElement, defaultProperties: { type: 'password' } },
    [AcEnumDDColumnType.String]: { inputElement: AcTextInputElement },
    [AcEnumDDColumnType.Text]: { inputElement: AcTextInputElement },
    [AcEnumDDColumnType.Time]: { inputElement: AcTextInputElement },
    [AcEnumDDColumnType.YesNo]: { inputElement: AcTextInputElement },
  };
  private static inputDefinitions: Record<string, IAcDDInputDefinition> = {
    "text": { inputElement: AcTextInputElement },
    "dateTime": { inputElement: AcDatetimeInputElement },
    "number": { inputElement: AcNumberInput },
    "password": { inputElement: AcInputElement, defaultProperties: { type: 'password' } },
    "select": { inputElement: AcSelectInputElement },
    "textarea": { inputElement: AcTextareaInputElement },
  };
  private static inputElementProperties: Record<string, any> = {
  };
  private static foreignKeyInputs: Record<string, IAcDDInputDefinition> = {};
  static inputFieldElementClass: any = AcDDInputFieldBaseElement;
  static inputResolver?: Function;

  static getColumnInputDefinition({ columnName, tableName,dataDictionaryName = 'default' }: { columnName: string, tableName: string,dataDictionaryName?:string }): IAcDDInputDefinition {
    let result: IAcDDInputDefinition = { inputElement: AcInputElement, defaultProperties: {} };
    const ddTableColumn: AcDDTableColumn | null = AcDataDictionary.getTableColumn({ tableName, columnName,dataDictionaryName });
    let resolvedDefinition;
    if (this.inputResolver) {
      resolvedDefinition = this.inputResolver({columnName,tableName,ddTableColumn,dataDictionaryName});
      if(resolvedDefinition){
        result = resolvedDefinition;
      }
    }
    if (resolvedDefinition == undefined) {
      if (ddTableColumn) {
        const typeInputDefinition = this.columnTypeInputs[ddTableColumn.columnType];
        if (typeInputDefinition) {
          result.inputElement = typeInputDefinition.inputElement;
          if (typeInputDefinition.defaultProperties) {
            result.defaultProperties = { ...result.defaultProperties, ...typeInputDefinition.defaultProperties };
          }
        }
        const foreignKeys = ddTableColumn.getForeignKeyRelationships();
        if (foreignKeys.length > 0) {
          const relationship = foreignKeys[0];
          const foreignKeyInputDefinition = this.foreignKeyInputs[relationship.sourceTable];
          if (foreignKeyInputDefinition) {
            result.inputElement = foreignKeyInputDefinition.inputElement;
            if (foreignKeyInputDefinition.defaultProperties) {
              result.defaultProperties = { ...result.defaultProperties, ...foreignKeyInputDefinition.defaultProperties };
            }
          }
        }
        else {
          const options: any[] = ddTableColumn.getValueOptions();
          if (options.length > 0) {
            result.inputElement = AcSelectInputElement;
            result.defaultProperties['options'] = options;
          }
        }

      }
    }
    return result;
  }

  static getInputDefinition({ name }: { name: string }): IAcDDInputDefinition | undefined {
    return this.inputDefinitions[name];
  }

  static getInputNames(): string[] {
    return Object.keys(this.inputDefinitions);
  }

  static registerColumnTypeInput({ columnType, inputDefinition }: { columnType: AcEnumDDColumnType, inputDefinition: IAcDDInputDefinition }) {
    AcDDInputManager.columnTypeInputs[columnType] = inputDefinition;
  }

  static registerInputDefinition({ name, inputDefinition }: { name: string, inputDefinition: IAcDDInputDefinition }) {
    AcDDInputManager.inputDefinitions[name] = inputDefinition;
  }

  static registerForeignKeyInput({ primaryTableName, inputDefinition,dataDictionaryName }: { primaryTableName: string, inputDefinition: IAcDDInputDefinition,dataDictionaryName?:string }) {
    AcDDInputManager.foreignKeyInputs[primaryTableName] = inputDefinition;
  }
}
