export const dataDictionaryJson = {
  "name": "Accountea Pro Research & Analysis",
  "version": 1,
  "tables": {
    "product_mappings": {
      "tableName": "product_mappings",
      "tableColumns": {
        "product_mapping_id": {
          "columnName": "product_mapping_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product Mapping Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "extracted_name": {
          "columnName": "extracted_name",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Extracted Name"
            }
          }
        },
        "product_name": {
          "columnName": "product_name",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product Name"
            }
          }
        },
        "product_id": {
          "columnName": "product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product Id"
            }
          }
        },
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Accountee Id"
            }
          }
        },
        "prompt_id": {
          "columnName": "prompt_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Prompt"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "product_mappings"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "product_mapping"
        }
      }
    },
    "product_uom_mappings": {
      "tableName": "product_uom_mappings",
      "tableColumns": {
        "product_uom_mapping_id": {
          "columnName": "product_uom_mapping_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "UOM Mapping Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "extracted_uom_name": {
          "columnName": "extracted_uom_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Extracted Uom Name"
            }
          }
        },
        "product_uom_name": {
          "columnName": "product_uom_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product Uom"
            }
          }
        },
        "product_name": {
          "columnName": "product_name",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product Name"
            }
          }
        },
        "product_id": {
          "columnName": "product_id",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product Id"
            }
          }
        },
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Accountee Id"
            }
          }
        },
        "extracted_product_name": {
          "columnName": "extracted_product_name",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Extracted Product Name"
            }
          }
        },
        "prompt_id": {
          "columnName": "prompt_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Prompt Id"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "product_uom_mappings"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "product_uom_mapping"
        }
      }
    },
    "prompt_attachments": {
      "tableName": "prompt_attachments",
      "tableColumns": {
        "prompt_attachment_id": {
          "columnName": "prompt_attachment_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Attachment Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "prompt_id": {
          "columnName": "prompt_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Prompt"
            }
          }
        },
        "file_contents": {
          "columnName": "file_contents",
          "columnType": "BLOB",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "File Contents"
            }
          }
        },
        "file_name": {
          "columnName": "file_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "File Name"
            }
          }
        },
        "file_size": {
          "columnName": "file_size",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "File Size"
            }
          }
        },
        "file_type": {
          "columnName": "file_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "File Type"
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
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "prompt_attachments"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "prompt_attachment"
        }
      }
    },
    "prompts": {
      "tableName": "prompts",
      "tableColumns": {
        "prompt_id": {
          "columnName": "prompt_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Prompt Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "prompt_text": {
          "columnName": "prompt_text",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Prompt Text"
            }
          }
        },
        "prompt_response": {
          "columnName": "prompt_response",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Prompt Response"
            }
          }
        },
        "service_provider": {
          "columnName": "service_provider",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Service Provider"
            }
          }
        },
        "start_time": {
          "columnName": "start_time",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Start Time"
            }
          }
        },
        "end_time": {
          "columnName": "end_time",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "End Time"
            }
          }
        },
        "prompt_status": {
          "columnName": "prompt_status",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Status"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "prompts"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "prompt"
        }
      }
    },
    "party_mappings": {
      "tableName": "party_mappings",
      "tableColumns": {
        "party_mapping_id": {
          "columnName": "party_mapping_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Party Mapping Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "extracted_party_name": {
          "columnName": "extracted_party_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Extracted Party Name"
            }
          }
        },
        "party_name": {
          "columnName": "party_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Party Name"
            }
          }
        },
        "legal_identifier": {
          "columnName": "legal_identifier",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Legal Identifier"
            }
          }
        },
        "prompt_id": {
          "columnName": "prompt_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Prompt"
            }
          }
        },
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Party Id"
            }
          }
        },
        "supplier_id": {
          "columnName": "supplier_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Supplier Id"
            }
          }
        },
        "customer_id": {
          "columnName": "customer_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Customer Id"
            }
          }
        },
        "employee_id": {
          "columnName": "employee_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Employee Id"
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
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "party_mappings"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "party_mapping"
        }
      }
    }
  },
  "relationships": [
    {
      "destinationColumn": "prompt_id",
      "destinationTable": "prompt_attachments",
      "sourceColumn": "prompt_id",
      "sourceTable": "prompts"
    },
    {
      "destinationColumn": "prompt_id",
      "destinationTable": "party_mappings",
      "sourceColumn": "prompt_id",
      "sourceTable": "prompts"
    },
    {
      "destinationColumn": "prompt_id",
      "destinationTable": "product_uom_mappings",
      "sourceColumn": "prompt_id",
      "sourceTable": "prompts"
    },
    {
      "destinationColumn": "prompt_id",
      "destinationTable": "product_mappings",
      "sourceColumn": "prompt_id",
      "sourceTable": "prompts"
    }
  ]
};
