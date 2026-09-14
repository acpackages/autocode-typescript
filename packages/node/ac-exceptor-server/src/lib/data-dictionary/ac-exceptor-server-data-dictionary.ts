import {
  AcDataDictionary,
  AcDDTable,
  AcDDTableColumn,
  AcDDTableColumnProperty,
  AcDDTableProperty,
  AcDDRelationship,
  AcEnumDDColumnProperty,
  AcEnumDDColumnType,
  AcEnumDDTableConstraint,
  AcEnumDDTableProperty,
} from '@autocode-ts/ac-data-dictionary';
import { AcExceptorServerTables } from './ac-exceptor-server-tables';
import { TblExceptions, TblExceptionOccurrences } from './ac-exceptor-server-columns';

export const kAcExceptorServerDataDictionaryName = 'ac_exceptor_server';

export const kAcExceptorServerDataDictionaryJson = {
  [AcDataDictionary.KeyName]: kAcExceptorServerDataDictionaryName,
  [AcDataDictionary.KeyVersion]: 1,
  [AcDataDictionary.KeyTables]: {
    [AcExceptorServerTables.Exceptions]: {
      [AcDDTable.KeyTableName]: AcExceptorServerTables.Exceptions,
      [AcDDTable.KeyTableColumns]: {
        [TblExceptions.Id]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptions.Id,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.AutoIncrement,
          [AcDDTableColumn.KeyColumnProperties]: {
            [AcEnumDDColumnProperty.PrimaryKey]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.PrimaryKey,
              [AcDDTableColumnProperty.KeyPropertyValue]: true,
            },
          },
        },
        [TblExceptions.AppId]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptions.AppId,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.String,
          [AcDDTableColumn.KeySize]: 255,
          [AcDDTableColumn.KeyColumnProperties]: {
            [AcEnumDDColumnProperty.NotNull]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.NotNull,
              [AcDDTableColumnProperty.KeyPropertyValue]: true,
            },
            [AcEnumDDColumnProperty.DefaultValue]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.DefaultValue,
              [AcDDTableColumnProperty.KeyPropertyValue]: 'default',
            },
          },
        },
        [TblExceptions.Environment]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptions.Environment,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.String,
          [AcDDTableColumn.KeySize]: 100,
          [AcDDTableColumn.KeyColumnProperties]: {
            [AcEnumDDColumnProperty.NotNull]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.NotNull,
              [AcDDTableColumnProperty.KeyPropertyValue]: true,
            },
            [AcEnumDDColumnProperty.DefaultValue]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.DefaultValue,
              [AcDDTableColumnProperty.KeyPropertyValue]: 'production',
            },
          },
        },
        [TblExceptions.Fingerprint]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptions.Fingerprint,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.String,
          [AcDDTableColumn.KeySize]: 255,
          [AcDDTableColumn.KeyColumnProperties]: {
            [AcEnumDDColumnProperty.NotNull]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.NotNull,
              [AcDDTableColumnProperty.KeyPropertyValue]: true,
            },
          },
        },
        [TblExceptions.ExceptionType]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptions.ExceptionType,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.String,
          [AcDDTableColumn.KeySize]: 255,
          [AcDDTableColumn.KeyColumnProperties]: {
            [AcEnumDDColumnProperty.NotNull]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.NotNull,
              [AcDDTableColumnProperty.KeyPropertyValue]: true,
            },
          },
        },
        [TblExceptions.ExceptionMessage]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptions.ExceptionMessage,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.Text,
          [AcDDTableColumn.KeyColumnProperties]: {
            [AcEnumDDColumnProperty.NotNull]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.NotNull,
              [AcDDTableColumnProperty.KeyPropertyValue]: true,
            },
          },
        },
        [TblExceptions.LatestStackTrace]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptions.LatestStackTrace,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.Text,
          [AcDDTableColumn.KeyColumnProperties]: {},
        },
        [TblExceptions.FirstOccurredAt]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptions.FirstOccurredAt,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.String,
          [AcDDTableColumn.KeySize]: 50,
          [AcDDTableColumn.KeyColumnProperties]: {
            [AcEnumDDColumnProperty.NotNull]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.NotNull,
              [AcDDTableColumnProperty.KeyPropertyValue]: true,
            },
          },
        },
        [TblExceptions.LastOccurredAt]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptions.LastOccurredAt,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.String,
          [AcDDTableColumn.KeySize]: 50,
          [AcDDTableColumn.KeyColumnProperties]: {
            [AcEnumDDColumnProperty.NotNull]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.NotNull,
              [AcDDTableColumnProperty.KeyPropertyValue]: true,
            },
          },
        },
        [TblExceptions.OccurrenceCount]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptions.OccurrenceCount,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.Integer,
          [AcDDTableColumn.KeyColumnProperties]: {
            [AcEnumDDColumnProperty.NotNull]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.NotNull,
              [AcDDTableColumnProperty.KeyPropertyValue]: true,
            },
            [AcEnumDDColumnProperty.DefaultValue]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.DefaultValue,
              [AcDDTableColumnProperty.KeyPropertyValue]: 1,
            },
          },
        },
        [TblExceptions.AffectedDevicesCount]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptions.AffectedDevicesCount,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.Integer,
          [AcDDTableColumn.KeyColumnProperties]: {
            [AcEnumDDColumnProperty.NotNull]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.NotNull,
              [AcDDTableColumnProperty.KeyPropertyValue]: true,
            },
            [AcEnumDDColumnProperty.DefaultValue]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.DefaultValue,
              [AcDDTableColumnProperty.KeyPropertyValue]: 1,
            },
          },
        },
        [TblExceptions.Status]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptions.Status,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.String,
          [AcDDTableColumn.KeySize]: 50,
          [AcDDTableColumn.KeyColumnProperties]: {
            [AcEnumDDColumnProperty.NotNull]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.NotNull,
              [AcDDTableColumnProperty.KeyPropertyValue]: true,
            },
            [AcEnumDDColumnProperty.DefaultValue]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.DefaultValue,
              [AcDDTableColumnProperty.KeyPropertyValue]: 'open',
            },
          },
        },
        [TblExceptions.Severity]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptions.Severity,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.String,
          [AcDDTableColumn.KeySize]: 50,
          [AcDDTableColumn.KeyColumnProperties]: {
            [AcEnumDDColumnProperty.NotNull]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.NotNull,
              [AcDDTableColumnProperty.KeyPropertyValue]: true,
            },
            [AcEnumDDColumnProperty.DefaultValue]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.DefaultValue,
              [AcDDTableColumnProperty.KeyPropertyValue]: 'error',
            },
          },
        },
        [TblExceptions.IsHandled]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptions.IsHandled,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.Integer,
          [AcDDTableColumn.KeyColumnProperties]: {
            [AcEnumDDColumnProperty.NotNull]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.NotNull,
              [AcDDTableColumnProperty.KeyPropertyValue]: true,
            },
            [AcEnumDDColumnProperty.DefaultValue]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.DefaultValue,
              [AcDDTableColumnProperty.KeyPropertyValue]: 0,
            },
          },
        },
      },
      [AcDDTable.KeyTableProperties]: {
        [AcEnumDDTableProperty.Constraints]: {
          [AcDDTableProperty.KeyPropertyName]: AcEnumDDTableProperty.Constraints,
          [AcDDTableProperty.KeyPropertyValue]: [
            {
              type: AcEnumDDTableConstraint.CompositeUniqueKey,
              value: `${TblExceptions.AppId},${TblExceptions.Environment},${TblExceptions.Fingerprint}`,
            },
          ],
        },
      },
    },
    [AcExceptorServerTables.ExceptionOccurrences]: {
      [AcDDTable.KeyTableName]: AcExceptorServerTables.ExceptionOccurrences,
      [AcDDTable.KeyTableColumns]: {
        [TblExceptionOccurrences.Id]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptionOccurrences.Id,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.AutoIncrement,
          [AcDDTableColumn.KeyColumnProperties]: {
            [AcEnumDDColumnProperty.PrimaryKey]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.PrimaryKey,
              [AcDDTableColumnProperty.KeyPropertyValue]: true,
            },
          },
        },
        [TblExceptionOccurrences.ExceptionId]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptionOccurrences.ExceptionId,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.Integer,
          [AcDDTableColumn.KeyColumnProperties]: {
            [AcEnumDDColumnProperty.NotNull]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.NotNull,
              [AcDDTableColumnProperty.KeyPropertyValue]: true,
            },
          },
        },
        [TblExceptionOccurrences.OccurredAt]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptionOccurrences.OccurredAt,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.String,
          [AcDDTableColumn.KeySize]: 50,
          [AcDDTableColumn.KeyColumnProperties]: {
            [AcEnumDDColumnProperty.NotNull]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.NotNull,
              [AcDDTableColumnProperty.KeyPropertyValue]: true,
            },
          },
        },
        [TblExceptionOccurrences.ReceivedAt]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptionOccurrences.ReceivedAt,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.String,
          [AcDDTableColumn.KeySize]: 50,
          [AcDDTableColumn.KeyColumnProperties]: {
            [AcEnumDDColumnProperty.NotNull]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.NotNull,
              [AcDDTableColumnProperty.KeyPropertyValue]: true,
            },
          },
        },
        [TblExceptionOccurrences.DeviceId]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptionOccurrences.DeviceId,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.String,
          [AcDDTableColumn.KeySize]: 255,
          [AcDDTableColumn.KeyColumnProperties]: {},
        },
        [TblExceptionOccurrences.DeviceModel]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptionOccurrences.DeviceModel,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.String,
          [AcDDTableColumn.KeySize]: 255,
          [AcDDTableColumn.KeyColumnProperties]: {},
        },
        [TblExceptionOccurrences.OsName]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptionOccurrences.OsName,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.String,
          [AcDDTableColumn.KeySize]: 100,
          [AcDDTableColumn.KeyColumnProperties]: {},
        },
        [TblExceptionOccurrences.OsVersion]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptionOccurrences.OsVersion,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.String,
          [AcDDTableColumn.KeySize]: 100,
          [AcDDTableColumn.KeyColumnProperties]: {},
        },
        [TblExceptionOccurrences.AppVersion]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptionOccurrences.AppVersion,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.String,
          [AcDDTableColumn.KeySize]: 100,
          [AcDDTableColumn.KeyColumnProperties]: {},
        },
        [TblExceptionOccurrences.AppBuildNumber]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptionOccurrences.AppBuildNumber,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.String,
          [AcDDTableColumn.KeySize]: 100,
          [AcDDTableColumn.KeyColumnProperties]: {},
        },
        [TblExceptionOccurrences.UserId]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptionOccurrences.UserId,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.String,
          [AcDDTableColumn.KeySize]: 255,
          [AcDDTableColumn.KeyColumnProperties]: {},
        },
        [TblExceptionOccurrences.SessionId]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptionOccurrences.SessionId,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.String,
          [AcDDTableColumn.KeySize]: 255,
          [AcDDTableColumn.KeyColumnProperties]: {},
        },
        [TblExceptionOccurrences.IpAddress]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptionOccurrences.IpAddress,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.String,
          [AcDDTableColumn.KeySize]: 100,
          [AcDDTableColumn.KeyColumnProperties]: {},
        },
        [TblExceptionOccurrences.UserAgent]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptionOccurrences.UserAgent,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.Text,
          [AcDDTableColumn.KeyColumnProperties]: {},
        },
        [TblExceptionOccurrences.StackTrace]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptionOccurrences.StackTrace,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.Text,
          [AcDDTableColumn.KeyColumnProperties]: {},
        },
        [TblExceptionOccurrences.IsHandled]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptionOccurrences.IsHandled,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.Integer,
          [AcDDTableColumn.KeyColumnProperties]: {
            [AcEnumDDColumnProperty.NotNull]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.NotNull,
              [AcDDTableColumnProperty.KeyPropertyValue]: true,
            },
            [AcEnumDDColumnProperty.DefaultValue]: {
              [AcDDTableColumnProperty.KeyPropertyName]: AcEnumDDColumnProperty.DefaultValue,
              [AcDDTableColumnProperty.KeyPropertyValue]: 0,
            },
          },
        },
        [TblExceptionOccurrences.Metadata]: {
          [AcDDTableColumn.KeyColumnName]: TblExceptionOccurrences.Metadata,
          [AcDDTableColumn.KeyColumnType]: AcEnumDDColumnType.Text,
          [AcDDTableColumn.KeyColumnProperties]: {},
        },
      },
      [AcDDTable.KeyTableProperties]: {},
    },
  },
  [AcDataDictionary.KeyRelationships]: [
    {
      [AcDDRelationship.KeySourceTable]: AcExceptorServerTables.Exceptions,
      [AcDDRelationship.KeySourceColumn]: TblExceptions.Id,
      [AcDDRelationship.KeyDestinationTable]: AcExceptorServerTables.ExceptionOccurrences,
      [AcDDRelationship.KeyDestinationColumn]: TblExceptionOccurrences.ExceptionId,
      [AcDDRelationship.KeyCascadeDeleteDestination]: true,
      [AcDDRelationship.KeyCascadeDeleteSource]: false,
    },
  ],
};

export function registerExceptorServerDataDictionary({
  dataDictionaryName = kAcExceptorServerDataDictionaryName,
}: {
  dataDictionaryName?: string;
} = {}): void {
  AcDataDictionary.registerDataDictionaryJsonString({
    jsonString: JSON.stringify(kAcExceptorServerDataDictionaryJson),
    dataDictionaryName,
  });
}
