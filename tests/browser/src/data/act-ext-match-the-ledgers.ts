export const dataDictionaryJson = {
  "name": "Match The Ledgers",
  "version": 1,
  "tables": {
    "mtl_sessions": {
      "tableName": "mtl_sessions",
      "tableColumns": {
        "session_id": {
          "columnName": "session_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Session Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "session_name": {
          "columnName": "session_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Sesssion Name"
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
        "ledger_account_id": {
          "columnName": "ledger_account_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Ledger Account"
            }
          }
        },
        "external_source": {
          "columnName": "external_source",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "External Source"
            }
          }
        },
        "session_status": {
          "columnName": "session_status",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Session Status"
            }
          }
        },
        "session_start_time": {
          "columnName": "session_start_time",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Start Time"
            }
          }
        },
        "session_end_time": {
          "columnName": "session_end_time",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "End Time"
            }
          }
        },
        "opening_balance": {
          "columnName": "opening_balance",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Opening Balance"
            }
          }
        },
        "external_opening_balance": {
          "columnName": "external_opening_balance",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "External Opening Balance"
            }
          }
        },
        "closing_balance": {
          "columnName": "closing_balance",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Closing Balance"
            }
          }
        },
        "external_closing_balance": {
          "columnName": "external_closing_balance",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "External Closing Balance"
            }
          }
        },
        "session_remarks": {
          "columnName": "session_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remarks"
            }
          }
        },
        "reconciliation_start_time": {
          "columnName": "reconciliation_start_time",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Date From"
            }
          }
        },
        "reconciliation_end_time": {
          "columnName": "reconciliation_end_time",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Date To"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "mtl_sessions"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "mtl_session"
        }
      }
    },
    "mtl_external_entries": {
      "tableName": "mtl_external_entries",
      "tableColumns": {
        "external_entry_id": {
          "columnName": "external_entry_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "External Entry Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "external_entry_amount": {
          "columnName": "external_entry_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "External Entry Amount"
            }
          }
        },
        "external_entry_description": {
          "columnName": "external_entry_description",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "External Entry Description"
            }
          }
        },
        "is_credit": {
          "columnName": "is_credit",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Credit?"
            }
          }
        },
        "external_entry_time": {
          "columnName": "external_entry_time",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "External Entry Time"
            }
          }
        },
        "external_entry_remarks": {
          "columnName": "external_entry_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "External Entry Remarks"
            }
          }
        },
        "external_entry_json": {
          "columnName": "external_entry_json",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "External Entry Json"
            }
          }
        },
        "external_entry_index": {
          "columnName": "external_entry_index",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "External Entry Index"
            }
          }
        },
        "session_id": {
          "columnName": "session_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Session"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "mtl_external_entries"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "mtl_external_entry"
        }
      }
    },
    "mtl_entry_matches": {
      "tableName": "mtl_entry_matches",
      "tableColumns": {
        "entry_match_id": {
          "columnName": "entry_match_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Entry Match Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "transaction_entry_id": {
          "columnName": "transaction_entry_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Transaction Entry"
            }
          }
        },
        "external_entry_id": {
          "columnName": "external_entry_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Enternal Entry"
            }
          }
        },
        "transaction_id": {
          "columnName": "transaction_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Transaction"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "mtl_entry_matches"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "mtl_entry_match"
        }
      }
    },
    "mtl_entry_actions": {
      "tableName": "mtl_entry_actions",
      "tableColumns": {
        "entry_action_id": {
          "columnName": "entry_action_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Entry Action Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "external_entry_id": {
          "columnName": "external_entry_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Entry"
            }
          }
        },
        "transaction_id": {
          "columnName": "transaction_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Transaction"
            }
          }
        },
        "transaction_entry_id": {
          "columnName": "transaction_entry_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Transaction Entry"
            }
          }
        },
        "entry_action": {
          "columnName": "entry_action",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Entry Action"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "mtl_entry_actions"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "mtl_entry_action"
        }
      }
    },
    "mtl_session_medias": {
      "tableName": "mtl_session_medias",
      "tableColumns": {
        "session_media_id": {
          "columnName": "session_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Session Media"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "media_id": {
          "columnName": "media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Media"
            }
          }
        },
        "session_id": {
          "columnName": "session_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Session"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "mtl_session_medias"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "mtl_session_media"
        }
      }
    },
    "mtl_external_details": {
      "tableName": "mtl_external_details",
      "tableColumns": {
        "external_detail_id": {
          "columnName": "external_detail_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "External Detail Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "session_id": {
          "columnName": "session_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Session"
            }
          }
        },
        "external_detail_json": {
          "columnName": "external_detail_json",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "External Detail Json"
            }
          }
        },
        "raw_external_contents": {
          "columnName": "raw_external_contents",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Raw External Contentx"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "mtl_external_details"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "mtl_external_detail"
        }
      }
    }
  },
  "relationships": [
    {
      "destinationColumn": "session_id",
      "destinationTable": "mtl_external_details",
      "sourceColumn": "session_id",
      "sourceTable": "mtl_sessions"
    },
    {
      "destinationColumn": "session_id",
      "destinationTable": "mtl_session_medias",
      "sourceColumn": "session_id",
      "sourceTable": "mtl_sessions"
    },
    {
      "destinationColumn": "external_entry_id",
      "destinationTable": "mtl_entry_actions",
      "sourceColumn": "external_entry_id",
      "sourceTable": "mtl_external_entries"
    },
    {
      "destinationColumn": "external_entry_id",
      "destinationTable": "mtl_entry_matches",
      "sourceColumn": "external_entry_id",
      "sourceTable": "mtl_external_entries"
    },
    {
      "destinationColumn": "session_id",
      "destinationTable": "mtl_external_entries",
      "sourceColumn": "session_id",
      "sourceTable": "mtl_sessions"
    }
  ]
};
