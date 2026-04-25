export const dataDictionaryJson = {
  "name": "Accountea Pro Internal",
  "version": 2,
  "tables": {
    "accountea_details": {
      "tableName": "accountea_details",
      "tableColumns": {
        "accountea_detail_id": {
          "columnName": "accountea_detail_id",
          "columnType": "AUTO_INCREMENT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Detail Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "accountea_detail_key": {
          "columnName": "accountea_detail_key",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Detail Key"
            }
          }
        },
        "accountea_detail_value": {
          "columnName": "accountea_detail_value",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Detail Value"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "accountea_details"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "accountea_detail"
        }
      }
    },
    "activity_logs": {
      "tableName": "activity_logs",
      "tableColumns": {
        "activity_log_id": {
          "columnName": "activity_log_id",
          "columnType": "AUTO_INCREMENT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Log Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "activity_log_type": {
          "columnName": "activity_log_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Log Type"
            }
          }
        },
        "activity_log_start_time": {
          "columnName": "activity_log_start_time",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Start Time"
            }
          }
        },
        "activity_log_end_time": {
          "columnName": "activity_log_end_time",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "End Time"
            }
          }
        },
        "activity_log_key": {
          "columnName": "activity_log_key",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Log Key"
            }
          }
        },
        "device_id": {
          "columnName": "device_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Device"
            }
          }
        },
        "activty_log_details": {
          "columnName": "activty_log_details",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Details"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "activity_logs"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "activity_log"
        }
      }
    },
    "device_authorizations": {
      "tableName": "device_authorizations",
      "tableColumns": {
        "device_authorization_id": {
          "columnName": "device_authorization_id",
          "columnType": "AUTO_INCREMENT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Authorization Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": false
            }
          }
        },
        "device_id": {
          "columnName": "device_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Device Id"
            }
          }
        },
        "device_authorization_status": {
          "columnName": "device_authorization_status",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Authorization Status"
            }
          }
        },
        "device_authorization_token": {
          "columnName": "device_authorization_token",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Authorization Token"
            }
          }
        },
        "device_authorized_on": {
          "columnName": "device_authorized_on",
          "columnType": "TIMESTAMP",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Authorized On"
            }
          }
        },
        "is_remote_server": {
          "columnName": "is_remote_server",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Remote Server"
            }
          }
        },
        "remote_server_details": {
          "columnName": "remote_server_details",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remote Server Details"
            }
          }
        },
        "device_name": {
          "columnName": "device_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Device Name"
            }
          }
        },
        "last_active_on": {
          "columnName": "last_active_on",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Last Active On"
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
        "last_sync_value": {
          "columnName": "last_sync_value",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Last Sync Value"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "device_authorizations"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "device_authorization"
        }
      }
    },
    "device_authorized_accountees": {
      "tableName": "device_authorized_accountees",
      "tableColumns": {
        "device_authorized_accountee_id": {
          "columnName": "device_authorized_accountee_id",
          "columnType": "AUTO_INCREMENT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Device Authorized Accountee Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "device_id": {
          "columnName": "device_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Device"
            }
          }
        },
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Accountee"
            }
          }
        },
        "device_accountee_authorization_token": {
          "columnName": "device_accountee_authorization_token",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Authorization Token"
            }
          }
        },
        "device_accountee_authorized_on": {
          "columnName": "device_accountee_authorized_on",
          "columnType": "TIMESTAMP",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Authorized On"
            }
          }
        },
        "device_accountee_authorization_status": {
          "columnName": "device_accountee_authorization_status",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Authorization Status"
            }
          }
        },
        "remote_accountee_details": {
          "columnName": "remote_accountee_details",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remote Accountee Details"
            }
          }
        },
        "is_remote": {
          "columnName": "is_remote",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Remote"
            }
          }
        },
        "is_syncable": {
          "columnName": "is_syncable",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Syncable"
            }
          }
        },
        "last_sync_value": {
          "columnName": "last_sync_value",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Last Sync Value"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "device_authorized_accountees"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "device_authorized_accountee"
        }
      }
    },
    "file_contents": {
      "tableName": "file_contents",
      "tableColumns": {
        "file_content_id": {
          "columnName": "file_content_id",
          "columnType": "AUTO_INCREMENT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "File Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "file_path": {
          "columnName": "file_path",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "File Path"
            }
          }
        },
        "file_content": {
          "columnName": "file_content",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "File Content"
            }
          }
        },
        "file_content_group": {
          "columnName": "file_content_group",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "File Content Group"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "file_contents"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "file_content"
        }
      }
    },
    "settings": {
      "tableName": "settings",
      "tableColumns": {
        "setting_id": {
          "columnName": "setting_id",
          "columnType": "AUTO_INCREMENT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Setting Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "setting_key": {
          "columnName": "setting_key",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Setting Key"
            }
          }
        },
        "setting_text_value": {
          "columnName": "setting_text_value",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Text Value"
            }
          }
        },
        "setting_numeric_value": {
          "columnName": "setting_numeric_value",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Numeric Value"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "settings"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "setting"
        }
      }
    }
  },
  "relationships": [
    {
      "destinationColumn": "device_id",
      "destinationTable": "device_authorized_accountees",
      "sourceColumn": "device_id",
      "sourceTable": "device_authorizations"
    },
    {
      "destinationColumn": "device_id",
      "destinationTable": "activity_logs",
      "sourceColumn": "device_id",
      "sourceTable": "device_authorizations"
    }
  ]
};
