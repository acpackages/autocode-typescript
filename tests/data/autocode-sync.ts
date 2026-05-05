export const dataDictionaryJson = {
  "name": "Autocode Sync",
  "version": 0,
  "tables": {
    "_ac_sync_details": {
      "tableName": "_ac_sync_details",
      "tableColumns": {
        "sync_detail_id": {
          "columnName": "sync_detail_id",
          "columnType": "AUTO_INCREMENT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Sync Detail Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "sync_detail_key": {
          "columnName": "sync_detail_key",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Sync Detail Key"
            }
          }
        },
        "sync_detail_string_value": {
          "columnName": "sync_detail_string_value",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Sync Detail String Value"
            }
          }
        },
        "sync_detail_numeric_value": {
          "columnName": "sync_detail_numeric_value",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Sync Detail Numeric Value"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "sync_details"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "sync_detail"
        }
      }
    },
    "_ac_sync_devices": {
      "tableName": "_ac_sync_devices",
      "tableColumns": {
        "sync_device_id": {
          "columnName": "sync_device_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Sync Device Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "is_source_of_truth": {
          "columnName": "is_source_of_truth",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Source of Truth?"
            }
          }
        },
        "last_synced_on": {
          "columnName": "last_synced_on",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Last Synced On"
            }
          }
        },
        "last_sync_change_log_id": {
          "columnName": "last_sync_change_log_id",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Last Sync Change Log Id"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "sync_devices"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "sync_device"
        }
      }
    },
    "_ac_sync_change_logs": {
      "tableName": "_ac_sync_change_logs",
      "tableColumns": {
        "sync_change_log_id": {
          "columnName": "sync_change_log_id",
          "columnType": "AUTO_INCREMENT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Sync Change Log Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "table_name": {
          "columnName": "table_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Table Name"
            }
          }
        },
        "row_id": {
          "columnName": "row_id",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Row Id"
            }
          }
        },
        "row_operation": {
          "columnName": "row_operation",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Row Operation"
            }
          }
        },
        "operation_timestamp": {
          "columnName": "operation_timestamp",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Operation Timestamp"
            }
          }
        },
        "row_payload": {
          "columnName": "row_payload",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Row Payload"
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": false
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "sync_change_logs"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "sync_change_log"
        }
      }
    },
    "_ac_sync_device_logs": {
      "tableName": "_ac_sync_device_logs",
      "tableColumns": {
        "sync_device_log_id": {
          "columnName": "sync_device_log_id",
          "columnType": "AUTO_INCREMENT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Sync Device Log Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "sync_device_id": {
          "columnName": "sync_device_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Sync Device Id"
            }
          }
        },
        "start_timestamp": {
          "columnName": "start_timestamp",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Start Timestamp"
            }
          }
        },
        "end_timestamp": {
          "columnName": "end_timestamp",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "End Timestamp"
            }
          }
        },
        "old_sync_change_log_id": {
          "columnName": "old_sync_change_log_id",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Old Sync Change Log Id"
            }
          }
        },
        "new_sync_change_log_id": {
          "columnName": "new_sync_change_log_id",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "New Sync Change Log Id"
            }
          }
        },
        "sync_operation_result": {
          "columnName": "sync_operation_result",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Sync Operation Result"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "sync_device_logs"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "sync_device_log"
        }
      }
    }
  }
};
