import { AcEnumApiDataFormat } from '../enums/ac-enum-api-data-format.enum';
import { AcEnumApiDataType } from '../enums/ac-enum-api-data-type.enum';
import { AcEnumHttpResponseCode } from '@autocode-ts/autocode';
import { AcApiDoc } from '../models/ac-api-doc.model';
import { AcApiDocModel } from '../models/ac-api-doc-model.model';
import { AcApiDocContent } from '../models/ac-api-doc-content.model';
import { AcApiDocResponse } from '../models/ac-api-doc-response.model';
import { AcEnumDDColumnType, AcDDTable } from '@autocode-ts/ac-data-dictionary';

export class AcApiDocUtils {
  static getApiDataFormatFromDataDictionaryDataType({
    dataType,
  }: {
    dataType: string;
  }): string {
    if (
      dataType === AcEnumDDColumnType.AutoIncrement ||
      dataType === AcEnumDDColumnType.Integer
    ) {
      return AcEnumApiDataFormat.Int64;
    } else if (dataType === AcEnumDDColumnType.Double) {
      return AcEnumApiDataFormat.Double;
    } else if (dataType === AcEnumDDColumnType.Date) {
      return AcEnumApiDataFormat.Date;
    } else if (dataType === AcEnumDDColumnType.Datetime) {
      return AcEnumApiDataFormat.DateTime;
    } else if (dataType === AcEnumDDColumnType.Password) {
      return AcEnumApiDataFormat.Password;
    }
    return '';
  }

  static getApiDataTypeFromDataDictionaryDataType({
    dataType,
  }: {
    dataType: string;
  }): string {
    if (
      dataType === AcEnumDDColumnType.AutoIncrement ||
      dataType === AcEnumDDColumnType.Integer
    ) {
      return AcEnumApiDataType.Integer;
    } else if (
      dataType === AcEnumDDColumnType.Json
    ) {
      return AcEnumApiDataType.Object;
    } else if (dataType === AcEnumDDColumnType.Double) {
      return AcEnumApiDataType.Number;
    }
    return AcEnumApiDataType.String;
  }

  static getApiModelRefFromAcDDTable({
    acDDTable,
    acApiDoc,
  }: {
    acDDTable: AcDDTable;
    acApiDoc: AcApiDoc;
  }): Record<string, any> {
    const existingModel = acApiDoc.models[acDDTable.tableName];
    if (existingModel) {
      return {
        $ref: `#/components/schemas/${existingModel.name}`,
      };
    }

    const acApiDocModel = new AcApiDocModel();
    acApiDocModel.name = acDDTable.tableName;

    const model: Record<string, any> = {};
    for (const column of acDDTable.tableColumns) {
      const columnType = this.getApiDataTypeFromDataDictionaryDataType({
        dataType: column.columnType,
      });
      const columnFormat = this.getApiDataFormatFromDataDictionaryDataType({
        dataType: column.columnType,
      });

      model[column.columnName] = { type: columnType };
      if (columnFormat) {
        model[column.columnName].format = columnFormat;
      }
    }

    acApiDocModel.properties = model;
    acApiDoc.addModel(acApiDocModel);

    return {
      $ref: `#/components/schemas/${acApiDoc.models[acDDTable.tableName].name}`,
    };
  }

  static getApiModelRefFromClass({
    clazz,
    acApiDoc,
  }: {
    clazz: any;
    acApiDoc: AcApiDoc;
  }): Record<string, any> {
    const schemaName = clazz.name;

    if (acApiDoc.models[schemaName]) {
      return {
        $ref: `#/components/schemas/${acApiDoc.models[schemaName].name}`,
      };
    }

    const acApiDocModel = new AcApiDocModel();
    acApiDocModel.name = schemaName;
    acApiDocModel.properties = {};

    const instance = new clazz();

    for (const key of Object.keys(instance)) {
      const value = instance[key];
      const typeName = typeof value;
      const propSchema: Record<string, any> = {};

      switch (typeName) {
        case 'number':
          propSchema['type'] = Number.isInteger(value) ? 'integer' : 'number';
          break;
        case 'boolean':
          propSchema['type'] = 'boolean';
          break;
        case 'string':
          propSchema['type'] = 'string';
          break;
        case 'object':
          if (Array.isArray(value)) {
            propSchema['type'] = 'array';
            propSchema['items'] = { type: 'object' }; // Default
          } else {
            propSchema['$ref'] = `#/components/schemas/${value?.constructor?.name || 'object'}`;
          }
          break;
        default:
          propSchema['type'] = 'string';
          break;
      }

      acApiDocModel.properties[key] = propSchema;
    }

    acApiDoc.addModel(acApiDocModel);

    return {
      $ref: `#/components/schemas/${schemaName}`,
    };
  }

  static getApiDocRouteResponsesForOperation({
    acDDTable,
    acApiDoc,
  }: {
    operation: string;
    acDDTable: AcDDTable;
    acApiDoc: AcApiDoc;
  }): AcApiDocResponse[] {
    const schema = this.getApiModelRefFromAcDDTable({
      acDDTable,
      acApiDoc,
    });

    const content = new AcApiDocContent();
    content.encoding = 'application/json';
    content.schema = {
      type: AcEnumApiDataType.Object,
      properties: {
        code: {
          type: AcEnumApiDataType.Integer,
          enum: [1, 2, 3],
        },
        status: {
          type: AcEnumApiDataType.String,
          enum: ['success', 'failure'],
        },
        message: {
          type: AcEnumApiDataType.String,
        },
        rows: {
          type: AcEnumApiDataType.Array,
          items: schema,
        },
      },
    };

    const response = new AcApiDocResponse();
    response.code = AcEnumHttpResponseCode.Ok;
    response.description = 'Successful operation';
    response.addContent({ content });

    return [response];
  }
}
