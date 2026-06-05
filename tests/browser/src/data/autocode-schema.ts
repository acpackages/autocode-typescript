export const dataDictionaryJson = {
  "name": "Autocode Schema",
  "version": 1,
  "tables": {
    "_ac_schema_details": {
      "tableName": "_ac_schema_details",
      "tableColumns": {
        "ac_schema_detail_id": {
          "columnName": "ac_schema_detail_id",
          "columnType": "AUTO_INCREMENT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Schema Detail Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "ac_schema_detail_key": {
          "columnName": "ac_schema_detail_key",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Schema Detail Key"
            }
          }
        },
        "ac_schema_detail_string_value": {
          "columnName": "ac_schema_detail_string_value",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Schema Detail String Value"
            }
          }
        },
        "ac_schema_detail_numeric_value": {
          "columnName": "ac_schema_detail_numeric_value",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Schema Detail Numeric Value"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "schema_details"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "schema_detail"
        }
      }
    },
    "_ac_schema_logs": {
      "tableName": "_ac_schema_logs",
      "tableColumns": {
        "ac_schema_log_id": {
          "columnName": "ac_schema_log_id",
          "columnType": "AUTO_INCREMENT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Schema Log Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "ac_schema_operation": {
          "columnName": "ac_schema_operation",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Schema Operation"
            }
          }
        },
        "ac_schema_entity_type": {
          "columnName": "ac_schema_entity_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Schema Entity Type"
            }
          }
        },
        "ac_schema_entity_name": {
          "columnName": "ac_schema_entity_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Schema Entity Type"
            }
          }
        },
        "ac_schema_operation_statement": {
          "columnName": "ac_schema_operation_statement",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Schema Operation Statement"
            }
          }
        },
        "ac_schema_operation_result": {
          "columnName": "ac_schema_operation_result",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Schema Operation Result"
            }
          }
        },
        "ac_schema_operation_timestamp": {
          "columnName": "ac_schema_operation_timestamp",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Schema Operation Timestamp"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "schema_logs"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "schema_log"
        }
      }
    }
  }
};
