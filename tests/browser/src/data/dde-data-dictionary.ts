export const dataDictionaryJson = {
  "name": "ac_dde",
  "version": 1,
  "tables": {
    "data_dictionaries": {
      "table_name": "data_dictionaries",
      "table_columns": {
        "data_dictionary_id": {
          "column_name": "data_dictionary_id",
          "column_type": "uuid",
          "column_properties": {
            "primary_key": {
              "property_name": "primary_key",
              "property_value": true
            }
          }
        },
        "data_dictionary_name": {
          "column_name": "data_dictionary_name",
          "column_type": "string",
          "column_properties": {
            "check_in_save": {
              "property_name": "check_in_save",
              "property_value": true
            }
          }
        },
        "data_dictionary_version": {
          "column_name": "data_dictionary_version",
          "column_type": "integer"
        },
        "extensions_data": {
          "column_name": "extensions_data",
          "column_type": "json"
        }
      }
    },
    "functions": {
      "table_name": "functions",
      "table_columns": {
        "data_dictionary_id": {
          "column_name": "data_dictionary_id",
          "column_type": "uuid",
          "column_properties": {
            "check_in_save": {
              "property_name": "check_in_save",
              "property_value": true
            }
          }
        },
        "extensions_data": {
          "column_name": "extensions_data",
          "column_type": "json"
        },
        "function_id": {
          "column_name": "function_id",
          "column_type": "uuid",
          "column_properties": {
            "primary_key": {
              "property_name": "primary_key",
              "property_value": true
            }
          }
        },
        "function_name": {
          "column_name": "function_name",
          "column_type": "string",
          "column_properties": {
            "check_in_save": {
              "property_name": "check_in_save",
              "property_value": true
            }
          }
        },
        "function_code": {
          "column_name": "function_code",
          "column_type": "text"
        }
      }
    },
    "relationships": {
      "table_name": "relationships",
      "table_columns": {
        "data_dictionary_id": {
          "column_name": "data_dictionary_id",
          "column_type": "uuid",
          "column_properties": {}
        },
        "extensions_data": {
          "column_name": "extensions_data",
          "column_type": "json"
        },
        "cascade_delete_destination": {
          "column_name": "cascade_delete_destination",
          "column_type": "yes_no"
        },
        "cascade_delete_source": {
          "column_name": "cascade_delete_source",
          "column_type": "yes_no"
        },
        "destination_column_id": {
          "column_name": "destination_column_id",
          "column_type": "uuid",
          "column_properties": {
            "check_in_save": {
              "property_name": "check_in_save",
              "property_value": true
            }
          }
        },
        "destination_table_id": {
          "column_name": "destination_table_id",
          "column_type": "uuid",
          "column_properties": {
            "check_in_save": {
              "property_name": "check_in_save",
              "property_value": true
            }
          }
        },
        "relationship_id": {
          "column_name": "relationship_id",
          "column_type": "uuid",
          "column_properties": {
            "primary_key": {
              "property_name": "primary_key",
              "property_value": true
            }
          }
        },
        "source_column_id": {
          "column_name": "source_column_id",
          "column_type": "uuid",
          "column_properties": {
            "check_in_save": {
              "property_name": "check_in_save",
              "property_value": true
            }
          }
        },
        "source_table_id": {
          "column_name": "source_table_id",
          "column_type": "uuid",
          "column_properties": {
            "check_in_save": {
              "property_name": "check_in_save",
              "property_value": true
            }
          }
        }
      }
    },
    "stored_procedures": {
      "table_name": "stored_procedures",
      "table_columns": {
        "data_dictionary_id": {
          "column_name": "data_dictionary_id",
          "column_type": "uuid",
          "column_properties": {
            "check_in_save": {
              "property_name": "check_in_save",
              "property_value": true
            }
          }
        },
        "extensions_data": {
          "column_name": "extensions_data",
          "column_type": "json"
        },
        "stored_procedure_code": {
          "column_name": "stored_procedure_code",
          "column_type": "text"
        },
        "stored_procedure_id": {
          "column_name": "stored_procedure_id",
          "column_type": "uuid",
          "column_properties": {
            "primary_key": {
              "property_name": "primary_key",
              "property_value": true
            }
          }
        },
        "stored_procedure_name": {
          "column_name": "stored_procedure_name",
          "column_type": "string",
          "column_properties": {
            "check_in_save": {
              "property_name": "check_in_save",
              "property_value": true
            }
          }
        }
      }
    },
    "table_columns": {
      "table_name": "table_columns",
      "table_columns": {
        "data_dictionary_id": {
          "column_name": "data_dictionary_id",
          "column_type": "uuid",
          "column_properties": {
            "check_in_save": {
              "property_name": "check_in_save",
              "property_value": true
            }
          }
        },
        "extensions_data": {
          "column_name": "extensions_data",
          "column_type": "json"
        },
        "auto_increment": {
          "column_name": "auto_increment",
          "column_type": "yes_no"
        },
        "auto_number_length": {
          "column_name": "auto_number_length",
          "column_type": "integer"
        },
        "auto_number_prefix": {
          "column_name": "auto_number_prefix",
          "column_type": "string"
        },
        "check_in_auto_number": {
          "column_name": "check_in_auto_number",
          "column_type": "yes_no"
        },
        "check_in_modify": {
          "column_name": "check_in_modify",
          "column_type": "yes_no"
        },
        "check_in_save": {
          "column_name": "check_in_save",
          "column_type": "yes_no"
        },
        "column_id": {
          "column_name": "column_id",
          "column_type": "uuid",
          "column_properties": {
            "primary_key": {
              "property_name": "primary_key",
              "property_value": true
            }
          }
        },
        "column_name": {
          "column_name": "column_name",
          "column_type": "string",
          "column_properties": {
            "check_in_save": {
              "property_name": "check_in_save",
              "property_value": true
            }
          }
        },
        "column_properties": {
          "column_name": "column_properties",
          "column_type": "json"
        },
        "column_title": {
          "column_name": "column_title",
          "column_type": "string"
        },
        "column_type": {
          "column_name": "column_type",
          "column_type": "string"
        },
        "default_value": {
          "column_name": "default_value",
          "column_type": "string"
        },
        "foreign_key": {
          "column_name": "foreign_key",
          "column_type": "yes_no"
        },
        "format": {
          "column_name": "format",
          "column_type": "string"
        },
        "in_search_key": {
          "column_name": "in_search_key",
          "column_type": "yes_no"
        },
        "is_select_distinct": {
          "column_name": "is_select_distinct",
          "column_type": "yes_no"
        },
        "not_null": {
          "column_name": "not_null",
          "column_type": "yes_no"
        },
        "primary_key": {
          "column_name": "primary_key",
          "column_type": "yes_no"
        },
        "remarks": {
          "column_name": "remarks",
          "column_type": "text"
        },
        "required": {
          "column_name": "required",
          "column_type": "yes_no"
        },
        "select_options": {
          "column_name": "select_options",
          "column_type": "json"
        },
        "set_null_before_delete": {
          "column_name": "set_null_before_delete",
          "column_type": "yes_no"
        },
        "size": {
          "column_name": "size",
          "column_type": "integer"
        },
        "table_id": {
          "column_name": "table_id",
          "column_type": "uuid",
          "column_properties": {
            "check_in_save": {
              "property_name": "check_in_save",
              "property_value": true
            }
          }
        },
        "unique_key": {
          "column_name": "unique_key",
          "column_type": "yes_no"
        },
        "column_index": {
          "column_name": "column_index",
          "column_type": "integer",
          "column_properties": {}
        }
      }
    },
    "tables": {
      "table_name": "tables",
      "table_columns": {
        "data_dictionary_id": {
          "column_name": "data_dictionary_id",
          "column_type": "uuid",
          "column_properties": {
            "check_in_save": {
              "property_name": "check_in_save",
              "property_value": true
            }
          }
        },
        "extensions_data": {
          "column_name": "extensions_data",
          "column_type": "json"
        },
        "additional_filter_columns": {
          "column_name": "additional_filter_columns",
          "column_type": "string"
        },
        "table_index": {
          "column_name": "table_index",
          "column_type": "integer",
          "column_properties": {}
        },
        "order_by": {
          "column_name": "order_by",
          "column_type": "text"
        },
        "plural_name": {
          "column_name": "plural_name",
          "column_type": "string"
        },
        "select_query": {
          "column_name": "select_query",
          "column_type": "text"
        },
        "select_query_columns": {
          "column_name": "select_query_columns",
          "column_type": "text"
        },
        "select_request_columns": {
          "column_name": "select_request_columns",
          "column_type": "text"
        },
        "singular_name": {
          "column_name": "singular_name",
          "column_type": "string"
        },
        "view_id": {
          "column_name": "view_id",
          "column_type": "uuid"
        },
        "table_id": {
          "column_name": "table_id",
          "column_type": "uuid",
          "column_properties": {
            "primary_key": {
              "property_name": "primary_key",
              "property_value": true
            }
          }
        },
        "table_name": {
          "column_name": "table_name",
          "column_type": "string",
          "column_properties": {
            "check_in_save": {
              "property_name": "check_in_save",
              "property_value": true
            }
          }
        },
        "table_properties": {
          "column_name": "table_properties",
          "column_type": "json"
        }
      }
    },
    "triggers": {
      "table_name": "triggers",
      "table_columns": {
        "data_dictionary_id": {
          "column_name": "data_dictionary_id",
          "column_type": "uuid",
          "column_properties": {
            "check_in_save": {
              "property_name": "check_in_save",
              "property_value": true
            }
          }
        },
        "extensions_data": {
          "column_name": "extensions_data",
          "column_type": "json"
        },
        "row_operation": {
          "column_name": "row_operation",
          "column_type": "string"
        },
        "table_id": {
          "column_name": "table_id",
          "column_type": "uuid"
        },
        "trigger_code": {
          "column_name": "trigger_code",
          "column_type": "text"
        },
        "trigger_execution": {
          "column_name": "trigger_execution",
          "column_type": "string"
        },
        "trigger_id": {
          "column_name": "trigger_id",
          "column_type": "uuid",
          "column_properties": {
            "primary_key": {
              "property_name": "primary_key",
              "property_value": true
            }
          }
        },
        "trigger_name": {
          "column_name": "trigger_name",
          "column_type": "string",
          "column_properties": {
            "check_in_save": {
              "property_name": "check_in_save",
              "property_value": true
            }
          }
        }
      }
    },
    "view_columns": {
      "table_name": "view_columns",
      "table_columns": {
        "data_dictionary_id": {
          "column_name": "data_dictionary_id",
          "column_type": "uuid",
          "column_properties": {
            "check_in_save": {
              "property_name": "check_in_save",
              "property_value": true
            }
          }
        },
        "extensions_data": {
          "column_name": "extensions_data",
          "column_type": "json"
        },
        "column_id": {
          "column_name": "column_id",
          "column_type": "uuid",
          "column_properties": {
            "primary_key": {
              "property_name": "primary_key",
              "property_value": true
            }
          }
        },
        "column_name": {
          "column_name": "column_name",
          "column_type": "string"
        },
        "column_properties": {
          "column_name": "column_properties",
          "column_type": "json"
        },
        "column_source": {
          "column_name": "column_source",
          "column_type": "string"
        },
        "column_source_name": {
          "column_name": "column_source_name",
          "column_type": "string"
        },
        "column_type": {
          "column_name": "column_type",
          "column_type": "string"
        },
        "view_id": {
          "column_name": "view_id",
          "column_type": "uuid",
          "column_properties": {
            "check_in_save": {
              "property_name": "check_in_save",
              "property_value": true
            }
          }
        },
        "column_index": {
          "column_name": "column_index",
          "column_type": "integer",
          "column_properties": {}
        }
      }
    },
    "views": {
      "table_name": "views",
      "table_columns": {
        "data_dictionary_id": {
          "column_name": "data_dictionary_id",
          "column_type": "uuid",
          "column_properties": {
            "check_in_save": {
              "property_name": "check_in_save",
              "property_value": true
            }
          }
        },
        "extensions_data": {
          "column_name": "extensions_data",
          "column_type": "json"
        },
        "view_id": {
          "column_name": "view_id",
          "column_type": "uuid",
          "column_properties": {
            "primary_key": {
              "property_name": "primary_key",
              "property_value": true
            }
          }
        },
        "view_name": {
          "column_name": "view_name",
          "column_type": "string",
          "column_properties": {
            "check_in_save": {
              "property_name": "check_in_save",
              "property_value": true
            }
          }
        },
        "view_query": {
          "column_name": "view_query",
          "column_type": "text"
        },
        "view_index": {
          "column_name": "view_index",
          "column_type": "integer",
          "column_properties": {}
        }
      }
    },
    "state": {
      "table_name": "state",
      "table_columns": {
        "state_id": {
          "column_name": "state_id",
          "column_type": "uuid",
          "column_properties": {
            "primary_key": {
              "property_name": "primary_key",
              "property_value": true
            }
          }
        },
        "state_key": {
          "column_name": "state_key",
          "column_type": "string",
          "column_properties": {
            "check_in_save": {
              "property_name": "check_in_save",
              "property_value": true
            }
          }
        },
        "state_value": {
          "column_name": "state_value",
          "column_type": "json",
          "column_properties": {}
        }
      }
    }
  },
  "views": {},
  "relationships": [],
  "stored_procedures": {},
  "functions": {},
  "triggers": {}
};
