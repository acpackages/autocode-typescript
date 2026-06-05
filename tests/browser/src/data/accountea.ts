export const dataDictionaryJson = {
  "name": "Accountea",
  "version": 0,
  "tables": {
    "act_accountee_addresses": {
      "tableName": "act_accountee_addresses",
      "tableColumns": {
        "accountee_address_id": {
          "columnName": "accountee_address_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
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
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "address_id": {
          "columnName": "address_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Address"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "accountee_addresses"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "accountee_address"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_accountee_adresses"
        }
      }
    },
    "act_accountee_bank_accounts": {
      "tableName": "act_accountee_bank_accounts",
      "tableColumns": {
        "accountee_bank_account_id": {
          "columnName": "accountee_bank_account_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
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
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "bank_account_id": {
          "columnName": "bank_account_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Bank Account"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
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
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "accountee_bank_accounts"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "accountee_bank_account"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_accountee_bank_accounts"
        }
      }
    },
    "act_accountee_email_addresses": {
      "tableName": "act_accountee_email_addresses",
      "tableColumns": {
        "accountee_email_address_id": {
          "columnName": "accountee_email_address_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
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
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "email_address_id": {
          "columnName": "email_address_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Email Address"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "accountee_email_addresses"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "accountee_email_address"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_accountee_email_addresses"
        }
      }
    },
    "act_accountee_legal_documents": {
      "tableName": "act_accountee_legal_documents",
      "tableColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Accountee"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "accountee_legal_document_id": {
          "columnName": "accountee_legal_document_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "legal_document_id": {
          "columnName": "legal_document_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Legal Document"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "accountee_legal_documents"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "accountee_legal_document"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_accountee_legal_documents"
        }
      }
    },
    "act_accountee_medias": {
      "tableName": "act_accountee_medias",
      "tableColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Accountee"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "accountee_media_id": {
          "columnName": "accountee_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
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
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "accountee_medias"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "accountee_media"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_accountee_medias"
        }
      }
    },
    "act_accountee_phone_numbers": {
      "tableName": "act_accountee_phone_numbers",
      "tableColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Accountee"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "accountee_phone_number_id": {
          "columnName": "accountee_phone_number_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "phone_number_id": {
          "columnName": "phone_number_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Phone Number"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "accountee_phone_numbers"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "accountee_phone_number"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_accountee_phone_numbers"
        }
      }
    },
    "act_accountee_settings": {
      "tableName": "act_accountee_settings",
      "tableColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Accountee"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "accountee_setting_id": {
          "columnName": "accountee_setting_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "accountee_setting_name": {
          "columnName": "accountee_setting_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "accountee_setting_numeric_value": {
          "columnName": "accountee_setting_numeric_value",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Value"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "accountee_setting_text_value": {
          "columnName": "accountee_setting_text_value",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Value"
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
        "user_id": {
          "columnName": "user_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "User"
            }
          }
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "accountee_setting"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "accountee_settings"
        }
      }
    },
    "act_accountee_social_medias": {
      "tableName": "act_accountee_social_medias",
      "tableColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Accountee"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "social_media_id": {
          "columnName": "social_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Social Media"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "accountee_social_media_id": {
          "columnName": "accountee_social_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "accountee_social_medias"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "accountee_social_media"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_accountee_social_medias"
        }
      }
    },
    "act_accountee_websites": {
      "tableName": "act_accountee_websites",
      "tableColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Accountee"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "accountee_website_id": {
          "columnName": "accountee_website_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "website_id": {
          "columnName": "website_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Website"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "accountee_websites"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "accountee_website"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_accountee_websites"
        }
      }
    },
    "act_accountees": {
      "tableName": "act_accountees",
      "tableColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "accountee_image_media_id": {
          "columnName": "accountee_image_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Profile Image"
            }
          }
        },
        "accountee_name": {
          "columnName": "accountee_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "financial_year_end": {
          "columnName": "financial_year_end",
          "columnType": "DATE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Financial Year End"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "financial_year_start": {
          "columnName": "financial_year_start",
          "columnType": "DATE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Financial Year Start"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "accountee_remarks": {
          "columnName": "accountee_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remarks"
            }
          }
        },
        "accountee_type": {
          "columnName": "accountee_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Type"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "email_addresses": {
          "columnName": "email_addresses",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Email Addresses"
            },
            "VALUE_OPTIONS": {
              "propertyName": "VALUE_OPTIONS",
              "propertyValue": "Value Options"
            }
          }
        },
        "phone_numbers": {
          "columnName": "phone_numbers",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Phone Numbers"
            }
          }
        },
        "addresses": {
          "columnName": "addresses",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Addresses"
            }
          }
        },
        "fax_numbers": {
          "columnName": "fax_numbers",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Fax Numbers"
            }
          }
        },
        "websites": {
          "columnName": "websites",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Websites"
            }
          }
        },
        "bank_accounts": {
          "columnName": "bank_accounts",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Bank Accounts"
            }
          }
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Currency"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "INR"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "legal_identifier": {
          "columnName": "legal_identifier",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "GST No."
            }
          }
        },
        "accountee_taxing_type": {
          "columnName": "accountee_taxing_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Taxing Scheme"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "REGULAR"
            },
            "VALUE_OPTIONS": {
              "propertyName": "VALUE_OPTIONS",
              "propertyValue": [
                {
                  "value": "REGULAR",
                  "label": "Regular"
                },
                {
                  "value": "COMPOSITION",
                  "label": "Composition"
                }
              ]
            }
          }
        },
        "is_remote": {
          "columnName": "is_remote",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Remote?"
            }
          }
        }
      },
      "tableProperties": {
        "CONSTRAINTS": {
          "propertyName": "CONSTRAINTS",
          "propertyValue": [
            {
              "type": "COMPOSITE_UNIQUE_KEY",
              "value": "accountee_name,financial_year_end,financial_year_start"
            }
          ]
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "accountees"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "accountee"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_accountees"
        }
      }
    },
    "act_addresses": {
      "tableName": "act_addresses",
      "tableColumns": {
        "address_id": {
          "columnName": "address_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "address_label": {
          "columnName": "address_label",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Label"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "Default"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "address_line_1": {
          "columnName": "address_line_1",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Address Line 1"
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "address_line_2": {
          "columnName": "address_line_2",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Address Line 2"
            }
          }
        },
        "country_name": {
          "columnName": "country_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Country"
            }
          }
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Index"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        },
        "landmark": {
          "columnName": "landmark",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Landmark"
            }
          }
        },
        "latitude": {
          "columnName": "latitude",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Latitude"
            }
          }
        },
        "longitude": {
          "columnName": "longitude",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Longitude"
            }
          }
        },
        "postal_code": {
          "columnName": "postal_code",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Postal Code"
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "state_name": {
          "columnName": "state_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "State"
            }
          }
        },
        "city_name": {
          "columnName": "city_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "City"
            }
          }
        },
        "address_remarks": {
          "columnName": "address_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remarks"
            }
          }
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "address"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "addresses"
        }
      }
    },
    "act_asset_attributes": {
      "tableName": "act_asset_attributes",
      "tableColumns": {
        "asset_attribute_id": {
          "columnName": "asset_attribute_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "asset_attribute_label": {
          "columnName": "asset_attribute_label",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "asset_attribute_numeric_value": {
          "columnName": "asset_attribute_numeric_value",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Value"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "asset_attribute_string_value": {
          "columnName": "asset_attribute_string_value",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Value"
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "asset_id": {
          "columnName": "asset_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Asset"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Index"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "asset_attribute_remarks": {
          "columnName": "asset_attribute_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remarks"
            }
          }
        },
        "asset_attribute_media_id": {
          "columnName": "asset_attribute_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Media"
            }
          }
        },
        "value_type": {
          "columnName": "value_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Value Type"
            }
          }
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "asset_attribute"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "asset_attributes"
        }
      }
    },
    "act_asset_depreciations": {
      "tableName": "act_asset_depreciations",
      "tableColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Accountee"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "asset_depreciation_amount": {
          "columnName": "asset_depreciation_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Amount"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "asset_depreciation_date": {
          "columnName": "asset_depreciation_date",
          "columnType": "DATE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Date"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "asset_depreciation_id": {
          "columnName": "asset_depreciation_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "asset_depreciation_percentage": {
          "columnName": "asset_depreciation_percentage",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Percentage"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "asset_id": {
          "columnName": "asset_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Asset"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Currency"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "exchange_rate": {
          "columnName": "exchange_rate",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Exchange Rate"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "is_draft": {
          "columnName": "is_draft",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Draft?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "new_asset_value": {
          "columnName": "new_asset_value",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "New Value"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "old_asset_value": {
          "columnName": "old_asset_value",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Old Value"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "depreciation_status": {
          "columnName": "depreciation_status",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Status"
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
        "asset_depreciation_remarks": {
          "columnName": "asset_depreciation_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remarks"
            }
          }
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "asset_depreciation"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "asset_depreciations"
        }
      }
    },
    "act_asset_legal_documents": {
      "tableName": "act_asset_legal_documents",
      "tableColumns": {
        "asset_id": {
          "columnName": "asset_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Asset"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "asset_legal_document_id": {
          "columnName": "asset_legal_document_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "legal_document_id": {
          "columnName": "legal_document_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Legal Document"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "asset_legal_document"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "asset_legal_documents"
        }
      }
    },
    "act_asset_medias": {
      "tableName": "act_asset_medias",
      "tableColumns": {
        "asset_id": {
          "columnName": "asset_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Asset"
            }
          }
        },
        "asset_media_id": {
          "columnName": "asset_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
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
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "asset_media"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "asset_medias"
        }
      }
    },
    "act_assets": {
      "tableName": "act_assets",
      "tableColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Accountee"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "asset_barcode": {
          "columnName": "asset_barcode",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Barcode Value"
            }
          }
        },
        "asset_depreciation_occurance": {
          "columnName": "asset_depreciation_occurance",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Depreciation Occurance"
            }
          }
        },
        "asset_depreciation_percentage": {
          "columnName": "asset_depreciation_percentage",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Depreciation %"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "asset_details": {
          "columnName": "asset_details",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Details"
            }
          }
        },
        "asset_id": {
          "columnName": "asset_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "asset_image_media_id": {
          "columnName": "asset_image_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Profile Image"
            }
          }
        },
        "asset_name": {
          "columnName": "asset_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "asset_value": {
          "columnName": "asset_value",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Value"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Currency"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "exchange_rate": {
          "columnName": "exchange_rate",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Exchange Rate"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
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
        "asset_remarks": {
          "columnName": "asset_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remarks"
            }
          }
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "asset"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "assets"
        }
      }
    },
    "act_bank_accounts": {
      "tableName": "act_bank_accounts",
      "tableColumns": {
        "account_holder_name": {
          "columnName": "account_holder_name",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "account_number": {
          "columnName": "account_number",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Number"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "account_type": {
          "columnName": "account_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Type"
            }
          }
        },
        "bank_account_id": {
          "columnName": "bank_account_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "bank_code": {
          "columnName": "bank_code",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Bank Code"
            }
          }
        },
        "bank_name": {
          "columnName": "bank_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Bank"
            }
          }
        },
        "branch_code": {
          "columnName": "branch_code",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Branch Code"
            }
          }
        },
        "branch_name": {
          "columnName": "branch_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Branch"
            }
          }
        },
        "branch_address": {
          "columnName": "branch_address",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Branch Address"
            }
          }
        },
        "country_code": {
          "columnName": "country_code",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Country"
            }
          }
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Currency"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "iban": {
          "columnName": "iban",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "IBAN"
            }
          }
        },
        "ifsc": {
          "columnName": "ifsc",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "IFSC"
            }
          }
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Index"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        },
        "is_primary": {
          "columnName": "is_primary",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Primary?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        },
        "swift_bic": {
          "columnName": "swift_bic",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "SWIFT/BIC"
            }
          }
        },
        "bank_account_label": {
          "columnName": "bank_account_label",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Label"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "Default"
            }
          }
        },
        "bank_account_remarks": {
          "columnName": "bank_account_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remarks"
            }
          }
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "bank_account"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "bank_accounts"
        }
      }
    },
    "act_currencies": {
      "tableName": "act_currencies",
      "tableColumns": {
        "country_name": {
          "columnName": "country_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Country"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "currency_name": {
          "columnName": "currency_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "currency_symbol": {
          "columnName": "currency_symbol",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Symbol"
            }
          }
        },
        "exchange_rate": {
          "columnName": "exchange_rate",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Exchange Rate"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "currency"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "currencies"
        }
      }
    },
    "act_devices": {
      "tableName": "act_devices",
      "tableColumns": {
        "device_details": {
          "columnName": "device_details",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Details"
            }
          }
        },
        "device_id": {
          "columnName": "device_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "device_image_media_id": {
          "columnName": "device_image_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Profile Image"
            }
          }
        },
        "device_name": {
          "columnName": "device_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Name"
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "device_uuid": {
          "columnName": "device_uuid",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "UUID"
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        },
        "device_remarks": {
          "columnName": "device_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remarks"
            }
          }
        },
        "is_online": {
          "columnName": "is_online",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Online?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "device_type": {
          "columnName": "device_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Type"
            }
          }
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "devices"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "devices"
        }
      }
    },
    "act_email_addresses": {
      "tableName": "act_email_addresses",
      "tableColumns": {
        "email_address_id": {
          "columnName": "email_address_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "email_address_label": {
          "columnName": "email_address_label",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Label"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "Default"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "email_address_value": {
          "columnName": "email_address_value",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Value"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Index"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        },
        "email_address_remarks": {
          "columnName": "email_address_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remarks"
            }
          }
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "email_address"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "email_addresses"
        }
      }
    },
    "act_fax_numbers": {
      "tableName": "act_fax_numbers",
      "tableColumns": {
        "fax_number_id": {
          "columnName": "fax_number_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "fax_number_label": {
          "columnName": "fax_number_label",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Label"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "Default"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "fax_number_value": {
          "columnName": "fax_number_value",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Value"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Index"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        },
        "fax_number_remarks": {
          "columnName": "fax_number_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remarks"
            }
          }
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "fax_number"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "fax_numbers"
        }
      }
    },
    "act_ledger_account_mappings": {
      "tableName": "act_ledger_account_mappings",
      "tableColumns": {
        "ledger_account_mapping_id": {
          "columnName": "ledger_account_mapping_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
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
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "mapping_key": {
          "columnName": "mapping_key",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Mapping Key"
            },
            "FORMAT": {
              "propertyName": "FORMAT",
              "propertyValue": "UPPERCASE"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
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
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "mapping_description": {
          "columnName": "mapping_description",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Description"
            }
          }
        },
        "ledger_account_mapping_remarks": {
          "columnName": "ledger_account_mapping_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remarks"
            }
          }
        }
      },
      "tableProperties": {
        "CONSTRAINTS": {
          "propertyName": "CONSTRAINTS",
          "propertyValue": [
            {
              "value": "mapping_key,accountee_id",
              "type": "COMPOSITE_UNIQUE_KEY"
            }
          ]
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "ledger_account_mappings"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "ledger_account_mapping"
        }
      }
    },
    "act_ledger_account_types": {
      "tableName": "act_ledger_account_types",
      "tableColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Accountee"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "ledger_account_type_id": {
          "columnName": "ledger_account_type_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "ledger_account_type_index": {
          "columnName": "ledger_account_type_index",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Index"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "ledger_account_type_name": {
          "columnName": "ledger_account_type_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "parent_ledger_account_type_id": {
          "columnName": "parent_ledger_account_type_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Parent Type"
            }
          }
        },
        "ledger_account_type_remarks": {
          "columnName": "ledger_account_type_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remarks"
            }
          }
        },
        "ledger_account_type_description": {
          "columnName": "ledger_account_type_description",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Description"
            }
          }
        }
      },
      "tableProperties": {
        "CONSTRAINTS": {
          "propertyName": "CONSTRAINTS",
          "propertyValue": [
            {
              "type": "COMPOSITE_UNIQUE_KEY",
              "value": "parent_ledger_account_type_id,ledger_account_type_name,accountee_id"
            }
          ]
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "ledger_account_types"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "ledger_account_type"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_ledger_account_types"
        }
      }
    },
    "act_ledger_accounts": {
      "tableName": "act_ledger_accounts",
      "tableColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Accountee"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Currency"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": ""
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "reflecting_statement": {
          "columnName": "reflecting_statement",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Reflecting Statement"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            },
            "VALUE_OPTIONS": {
              "propertyName": "VALUE_OPTIONS",
              "propertyValue": [
                {
                  "label": "Adjustment",
                  "value": "ADJUSTMENT"
                },
                {
                  "label": "Trading Account",
                  "value": "TRADING ACCOUNT"
                },
                {
                  "label": "Profit & Loss Account",
                  "value": "PROFIT AND LOSS ACCOUNT"
                },
                {
                  "label": "Balance Sheet",
                  "value": "BALANCE SHEET"
                }
              ]
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        },
        "ledger_account_balance": {
          "columnName": "ledger_account_balance",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Balance"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "ledger_account_id": {
          "columnName": "ledger_account_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "ledger_account_name": {
          "columnName": "ledger_account_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "ledger_account_type_id": {
          "columnName": "ledger_account_type_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Type"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "ledger_account_remarks": {
          "columnName": "ledger_account_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remarks"
            }
          }
        },
        "is_expense": {
          "columnName": "is_expense",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Expense?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "is_income": {
          "columnName": "is_income",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Income?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "ledger_account_description": {
          "columnName": "ledger_account_description",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Description"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "ledger_accounts"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "ledger_account"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_ledger_accounts"
        }
      }
    },
    "act_legal_document_medias": {
      "tableName": "act_legal_document_medias",
      "tableColumns": {
        "legal_document_id": {
          "columnName": "legal_document_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Legal Document"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "legal_document_media_id": {
          "columnName": "legal_document_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
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
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "legal_document_media"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "legal_document_medias"
        }
      }
    },
    "act_legal_documents": {
      "tableName": "act_legal_documents",
      "tableColumns": {
        "expiry_date": {
          "columnName": "expiry_date",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Expiring On"
            }
          }
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Index"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        },
        "is_expired": {
          "columnName": "is_expired",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "is_expired"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "is_verified": {
          "columnName": "is_verified",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Verified?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "legal_document_id": {
          "columnName": "legal_document_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "legal_document_value": {
          "columnName": "legal_document_value",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Value"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "legal_document_label": {
          "columnName": "legal_document_label",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Label"
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "legal_document_remarks": {
          "columnName": "legal_document_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remarks"
            }
          }
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "legal_document"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "legal_documents"
        }
      }
    },
    "act_medias": {
      "tableName": "act_medias",
      "tableColumns": {
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Index"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "media_details": {
          "columnName": "media_details",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Details"
            }
          }
        },
        "media_id": {
          "columnName": "media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "media_name": {
          "columnName": "media_name",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Name"
            }
          }
        },
        "media_path": {
          "columnName": "media_path",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Path"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "media_size": {
          "columnName": "media_size",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Size"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "media_type": {
          "columnName": "media_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Type"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "media_remarks": {
          "columnName": "media_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remarks"
            }
          }
        },
        "media_for": {
          "columnName": "media_for",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "For"
            }
          }
        },
        "media_flag": {
          "columnName": "media_flag",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Flag"
            }
          }
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "media"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "medias"
        }
      }
    },
    "act_notifications": {
      "tableName": "act_notifications",
      "tableColumns": {
        "notification_details": {
          "columnName": "notification_details",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Details"
            }
          }
        },
        "notification_for": {
          "columnName": "notification_for",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "For"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "notification_icon_media_id": {
          "columnName": "notification_icon_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Icon"
            }
          }
        },
        "notification_id": {
          "columnName": "notification_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "notification_message": {
          "columnName": "notification_message",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Message"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "notification_title": {
          "columnName": "notification_title",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Title"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "notification_type": {
          "columnName": "notification_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Type"
            }
          }
        },
        "notification_status": {
          "columnName": "notification_status",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Status"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "user_id": {
          "columnName": "user_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "User"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "notification"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "notifications"
        }
      }
    },
    "act_parties": {
      "tableName": "act_parties",
      "tableColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Accountee"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
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
        "party_details": {
          "columnName": "party_details",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Details"
            }
          }
        },
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "party_name": {
          "columnName": "party_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "addresses": {
          "columnName": "addresses",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Addresses"
            }
          }
        },
        "email_addresses": {
          "columnName": "email_addresses",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Email Addresses"
            }
          }
        },
        "fax_numbers": {
          "columnName": "fax_numbers",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Fax Numbers"
            }
          }
        },
        "phone_numbers": {
          "columnName": "phone_numbers",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Phone Numbers"
            }
          }
        },
        "websites": {
          "columnName": "websites",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Websites"
            }
          }
        },
        "bank_accounts": {
          "columnName": "bank_accounts",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Bank Accounts"
            }
          }
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Currency"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "party_image_media_id": {
          "columnName": "party_image_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Party Image"
            }
          }
        },
        "legal_identifier": {
          "columnName": "legal_identifier",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "GST No"
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "party_remarks": {
          "columnName": "party_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remarks"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "parties"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "party"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_parties"
        }
      }
    },
    "act_party_addresses": {
      "tableName": "act_party_addresses",
      "tableColumns": {
        "address_id": {
          "columnName": "address_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Address"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "party_address_id": {
          "columnName": "party_address_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Party"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "party_addresses"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "party_address"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_party_addresses"
        }
      }
    },
    "act_party_bank_accounts": {
      "tableName": "act_party_bank_accounts",
      "tableColumns": {
        "bank_account_id": {
          "columnName": "bank_account_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Bank Account"
            }
          }
        },
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Party"
            }
          }
        },
        "party_bank_account_id": {
          "columnName": "party_bank_account_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "party_bank_accounts"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "party_bank_account"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_party_bank_accounts"
        }
      }
    },
    "act_party_contact_persons": {
      "tableName": "act_party_contact_persons",
      "tableColumns": {
        "contact_person_id": {
          "columnName": "contact_person_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Contact Person"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "party_contact_person_id": {
          "columnName": "party_contact_person_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Party"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "party_contact_persons"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "party_contact_person"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_party_contact_persons"
        }
      }
    },
    "act_party_email_addresses": {
      "tableName": "act_party_email_addresses",
      "tableColumns": {
        "email_address_id": {
          "columnName": "email_address_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Email Address"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "party_email_address_id": {
          "columnName": "party_email_address_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Party"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "party_email_addresses"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "party_email_address"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_party_email_addresses"
        }
      }
    },
    "act_party_fax_numbers": {
      "tableName": "act_party_fax_numbers",
      "tableColumns": {
        "fax_number_id": {
          "columnName": "fax_number_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Fax Number"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "party_fax_number_id": {
          "columnName": "party_fax_number_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Party"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "party_fax_numbers"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "party_fax_number"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_party_fax_numbers"
        }
      }
    },
    "act_party_legal_documents": {
      "tableName": "act_party_legal_documents",
      "tableColumns": {
        "legal_document_id": {
          "columnName": "legal_document_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Legal Document"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Party"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "party_legal_document_id": {
          "columnName": "party_legal_document_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "party_legal_documents"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "party_legal_document"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_party_legal_documents"
        }
      }
    },
    "act_party_medias": {
      "tableName": "act_party_medias",
      "tableColumns": {
        "media_id": {
          "columnName": "media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Media"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Party"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "party_media_id": {
          "columnName": "party_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "party_medias"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "party_media"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_party_medias"
        }
      }
    },
    "act_party_phone_numbers": {
      "tableName": "act_party_phone_numbers",
      "tableColumns": {
        "phone_number_id": {
          "columnName": "phone_number_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Phone Number"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Party"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "party_phone_number_id": {
          "columnName": "party_phone_number_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "party_phone_numbers"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "party_phone_number"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_party_phone_numbers"
        }
      }
    },
    "act_party_social_medias": {
      "tableName": "act_party_social_medias",
      "tableColumns": {
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Party"
            }
          }
        },
        "social_media_id": {
          "columnName": "social_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Social media"
            }
          }
        },
        "party_social_media_id": {
          "columnName": "party_social_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "party_social_medias"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "party_social_media"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_party_social_medias"
        }
      }
    },
    "act_party_websites": {
      "tableName": "act_party_websites",
      "tableColumns": {
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Party"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "party_website_id": {
          "columnName": "party_website_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "website_id": {
          "columnName": "website_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Website"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "party_websites"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "party_website"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_party_websites"
        }
      }
    },
    "act_payment_methods": {
      "tableName": "act_payment_methods",
      "tableColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Accountee"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Currency"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
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
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "payment_method_id": {
          "columnName": "payment_method_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "payment_method_image_media_id": {
          "columnName": "payment_method_image_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Profile Image"
            }
          }
        },
        "payment_method_name": {
          "columnName": "payment_method_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "use_for_expenses": {
          "columnName": "use_for_expenses",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Use For Expenses"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "use_for_incomes": {
          "columnName": "use_for_incomes",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Use For Incomes"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "payment_method_remarks": {
          "columnName": "payment_method_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remarks"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "payment_methods"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "payment_method"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_payment_methods"
        }
      }
    },
    "act_phone_numbers": {
      "tableName": "act_phone_numbers",
      "tableColumns": {
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Index"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        },
        "phone_number_id": {
          "columnName": "phone_number_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "phone_number_label": {
          "columnName": "phone_number_label",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Label"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "phone_number_value": {
          "columnName": "phone_number_value",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Value"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "phone_number_remarks": {
          "columnName": "phone_number_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remarks"
            }
          }
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "phone_number"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "phone_numbers"
        }
      }
    },
    "act_social_medias": {
      "tableName": "act_social_medias",
      "tableColumns": {
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Index"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        },
        "social_media_id": {
          "columnName": "social_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "social_media_type": {
          "columnName": "social_media_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Type"
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "social_media_value": {
          "columnName": "social_media_value",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Value"
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "social_media_remarks": {
          "columnName": "social_media_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remarks"
            }
          }
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "social_media"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "social_medias"
        }
      }
    },
    "act_transaction_entries": {
      "tableName": "act_transaction_entries",
      "tableColumns": {
        "transaction_entry_amount": {
          "columnName": "transaction_entry_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Amount"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Currency"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "exchange_rate": {
          "columnName": "exchange_rate",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Exchange Rate"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
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
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "reference_number": {
          "columnName": "reference_number",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Reference#"
            }
          }
        },
        "transaction_entry_id": {
          "columnName": "transaction_entry_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
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
        "payment_method_id": {
          "columnName": "payment_method_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Payment Method"
            }
          }
        },
        "tax_rate_percentage": {
          "columnName": "tax_rate_percentage",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Tax%"
            }
          }
        },
        "transaction_entry_description": {
          "columnName": "transaction_entry_description",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Description"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "transaction_entry_type": {
          "columnName": "transaction_entry_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Entry Type"
            }
          }
        },
        "is_credit": {
          "columnName": "is_credit",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Credit"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "transaction_entry_remarks": {
          "columnName": "transaction_entry_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remarks"
            }
          }
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "transaction_entry"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "transaction_entries"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "act_vw_transaction_entries"
        }
      }
    },
    "act_transaction_entry_medias": {
      "tableName": "act_transaction_entry_medias",
      "tableColumns": {
        "media_id": {
          "columnName": "media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Media"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
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
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "transaction_entry_media_id": {
          "columnName": "transaction_entry_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "transaction_entry_media"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "transaction_entry_medias"
        }
      }
    },
    "act_transactions": {
      "tableName": "act_transactions",
      "tableColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Accountee"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Currency"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "exchange_rate": {
          "columnName": "exchange_rate",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Exchange Rate"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "is_draft": {
          "columnName": "is_draft",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Draft?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "transaction_remarks": {
          "columnName": "transaction_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remarks"
            }
          }
        },
        "transaction_amount": {
          "columnName": "transaction_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Amount"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "transaction_details": {
          "columnName": "transaction_details",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Details"
            }
          }
        },
        "transaction_id": {
          "columnName": "transaction_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "transaction_narration": {
          "columnName": "transaction_narration",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Narration"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "transaction_number": {
          "columnName": "transaction_number",
          "columnType": "AUTO_NUMBER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Number"
            }
          }
        },
        "transaction_time": {
          "columnName": "transaction_time",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Date/Time"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "transaction_type": {
          "columnName": "transaction_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Type"
            }
          }
        },
        "debit_total": {
          "columnName": "debit_total",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Debit Total"
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": false
            }
          }
        },
        "credit_total": {
          "columnName": "credit_total",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Credit Total"
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": false
            }
          }
        },
        "debit_ledger_accounts": {
          "columnName": "debit_ledger_accounts",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Debit Ledger Accounts"
            }
          }
        },
        "credit_ledger_accounts": {
          "columnName": "credit_ledger_accounts",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Credit Ledger Accounts"
            }
          }
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "transaction"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "transactions"
        }
      }
    },
    "act_trigger_flags": {
      "tableName": "act_trigger_flags",
      "tableColumns": {
        "table_name": {
          "columnName": "table_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Table"
            }
          }
        },
        "trigger_flag_id": {
          "columnName": "trigger_flag_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "trigger_flag_name": {
          "columnName": "trigger_flag_name",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Name"
            }
          }
        },
        "trigger_flag_value": {
          "columnName": "trigger_flag_value",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Value"
            }
          }
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "trigger_flag"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "trigger_flags"
        }
      }
    },
    "act_websites": {
      "tableName": "act_websites",
      "tableColumns": {
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Index"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        },
        "website_id": {
          "columnName": "website_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "website_label": {
          "columnName": "website_label",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Label"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "Default"
            }
          }
        },
        "website_value": {
          "columnName": "website_value",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Value"
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "website_remarks": {
          "columnName": "website_remarks",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Remarks"
            }
          }
        }
      },
      "tableProperties": {
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "website"
        },
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "websites"
        }
      }
    }
  },
  "views": {
    "act_vw_accountee_address_values": {
      "viewName": "act_vw_accountee_address_values",
      "viewColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_addresses",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "accountee_addresses": {
          "columnName": "accountee_addresses",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "function",
          "columnSourceName": "",
          "columnSourceOriginalColumn": ""
        }
      },
      "viewQuery": "SELECT accountee_id,GROUP_CONCAT(\nDISTINCT TRIM(COALESCE(address_line_1, '') || \nCASE WHEN TRIM(COALESCE(address_line_2, '')) <> '' THEN ', ' || \nTRIM(address_line_2) ELSE '' END || \nCASE WHEN TRIM(COALESCE(postal_code, '')) <> '' THEN ', ' || \nTRIM(postal_code) ELSE '' END || \nCASE WHEN TRIM(COALESCE(city_name, '')) <> '' THEN ', ' \n|| TRIM(city_name) ELSE '' END || \nCASE WHEN TRIM(COALESCE(state_name, '')) <> '' THEN ', ' || \nTRIM(state_name) ELSE '' END || \nCASE WHEN TRIM(COALESCE(country_name, '')) <> '' THEN ', ' || \nTRIM(country_name) ELSE '' END )) AS accountee_addresses FROM act_accountee_addresses \nLEFT JOIN act_addresses ON act_addresses.address_id = act_accountee_addresses.address_id\nWHERE address_line_1 IS NOT NULL AND TRIM(address_line_1) <> ''\nGROUP BY accountee_id"
    },
    "act_vw_accountee_adresses": {
      "viewName": "act_vw_accountee_adresses",
      "viewColumns": {
        "accountee_address_id": {
          "columnName": "accountee_address_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_addresses",
          "columnSourceOriginalColumn": "accountee_address_id"
        },
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_addresses",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "address_id": {
          "columnName": "address_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "address_id"
        },
        "address_label": {
          "columnName": "address_label",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "address_label"
        },
        "address_line_1": {
          "columnName": "address_line_1",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "address_line_1"
        },
        "address_line_2": {
          "columnName": "address_line_2",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "address_line_2"
        },
        "country_name": {
          "columnName": "country_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "country_name"
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "display_index"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "is_active"
        },
        "landmark": {
          "columnName": "landmark",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "landmark"
        },
        "latitude": {
          "columnName": "latitude",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "latitude"
        },
        "longitude": {
          "columnName": "longitude",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "longitude"
        },
        "postal_code": {
          "columnName": "postal_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "postal_code"
        },
        "state_name": {
          "columnName": "state_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "state_name"
        },
        "city_name": {
          "columnName": "city_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "city_name"
        },
        "address_remarks": {
          "columnName": "address_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "address_remarks"
        }
      },
      "viewQuery": "SELECT act_accountee_addresses.accountee_address_id,act_accountee_addresses.accountee_id,act_addresses.* FROM act_accountee_addresses LEFT JOIN act_addresses ON act_accountee_addresses.address_id = act_addresses.address_id"
    },
    "act_vw_accountee_bank_account_values": {
      "viewName": "act_vw_accountee_bank_account_values",
      "viewColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_bank_accounts",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "accountee_bank_accounts": {
          "columnName": "accountee_bank_accounts",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "function",
          "columnSourceName": "",
          "columnSourceOriginalColumn": ""
        }
      },
      "viewQuery": "SELECT accountee_id,GROUP_CONCAT(DISTINCT account_number || '[' || bank_name || ']')AS accountee_bank_accounts\nFROM act_accountee_bank_accounts \nLEFT JOIN act_bank_accounts ON act_accountee_bank_accounts.bank_account_id = act_bank_accounts.bank_account_id \nWHERE account_number IS NOT NULL AND TRIM(account_number) <> '' \nGROUP BY accountee_id"
    },
    "act_vw_accountee_bank_accounts": {
      "viewName": "act_vw_accountee_bank_accounts",
      "viewColumns": {
        "accountee_bank_account_id": {
          "columnName": "accountee_bank_account_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_bank_accounts",
          "columnSourceOriginalColumn": "accountee_bank_account_id"
        },
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_bank_accounts",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "account_holder_name": {
          "columnName": "account_holder_name",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "account_holder_name"
        },
        "account_number": {
          "columnName": "account_number",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "account_number"
        },
        "account_type": {
          "columnName": "account_type",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "account_type"
        },
        "bank_account_id": {
          "columnName": "bank_account_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "bank_account_id"
        },
        "bank_code": {
          "columnName": "bank_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "bank_code"
        },
        "bank_name": {
          "columnName": "bank_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "bank_name"
        },
        "branch_code": {
          "columnName": "branch_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "branch_code"
        },
        "branch_name": {
          "columnName": "branch_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "branch_name"
        },
        "branch_address": {
          "columnName": "branch_address",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "branch_address"
        },
        "country_code": {
          "columnName": "country_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "country_code"
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "currency_code"
        },
        "iban": {
          "columnName": "iban",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "iban"
        },
        "ifsc": {
          "columnName": "ifsc",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "ifsc"
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "display_index"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "is_active"
        },
        "is_primary": {
          "columnName": "is_primary",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "is_primary"
        },
        "swift_bic": {
          "columnName": "swift_bic",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "swift_bic"
        },
        "bank_account_label": {
          "columnName": "bank_account_label",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "bank_account_label"
        },
        "bank_account_remarks": {
          "columnName": "bank_account_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "bank_account_remarks"
        }
      },
      "viewQuery": "SELECT act_accountee_bank_accounts.accountee_bank_account_id,act_accountee_bank_accounts.accountee_id,act_bank_accounts.* FROM act_accountee_bank_accounts LEFT JOIN act_bank_accounts ON act_accountee_bank_accounts.bank_account_id = act_bank_accounts.bank_account_id"
    },
    "act_vw_accountee_email_address_values": {
      "viewName": "act_vw_accountee_email_address_values",
      "viewColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_email_addresses",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "accountee_email_addresses": {
          "columnName": "accountee_email_addresses",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "function",
          "columnSourceName": "",
          "columnSourceOriginalColumn": ""
        }
      },
      "viewQuery": "SELECT accountee_id, GROUP_CONCAT(DISTINCT email_address_value) as accountee_email_addresses \nFROM act_accountee_email_addresses \nLEFT JOIN act_email_addresses ON act_accountee_email_addresses.email_address_id = act_email_addresses.email_address_id \nWHERE email_address_value IS NOT NULL AND TRIM(email_address_value) <> ''\nGROUP BY accountee_id"
    },
    "act_vw_accountee_email_addresses": {
      "viewName": "act_vw_accountee_email_addresses",
      "viewColumns": {
        "accountee_email_address_id": {
          "columnName": "accountee_email_address_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_email_addresses",
          "columnSourceOriginalColumn": "accountee_email_address_id"
        },
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_email_addresses",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "email_address_id": {
          "columnName": "email_address_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_email_addresses",
          "columnSourceOriginalColumn": "email_address_id"
        },
        "email_address_label": {
          "columnName": "email_address_label",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_email_addresses",
          "columnSourceOriginalColumn": "email_address_label"
        },
        "email_address_value": {
          "columnName": "email_address_value",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_email_addresses",
          "columnSourceOriginalColumn": "email_address_value"
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_email_addresses",
          "columnSourceOriginalColumn": "display_index"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_email_addresses",
          "columnSourceOriginalColumn": "is_active"
        },
        "email_address_remarks": {
          "columnName": "email_address_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_email_addresses",
          "columnSourceOriginalColumn": "email_address_remarks"
        }
      },
      "viewQuery": "SELECT act_accountee_email_addresses.accountee_email_address_id,act_accountee_email_addresses.accountee_id,act_email_addresses.* FROM act_accountee_email_addresses LEFT JOIN act_email_addresses ON act_accountee_email_addresses.email_address_id = act_email_addresses.email_address_id"
    },
    "act_vw_accountee_fax_number_values": {
      "viewName": "act_vw_accountee_fax_number_values",
      "viewColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_fax_numbers",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "accountee_fax_numbers": {
          "columnName": "accountee_fax_numbers",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "function",
          "columnSourceName": "",
          "columnSourceOriginalColumn": ""
        }
      },
      "viewQuery": "SELECT accountee_id, GROUP_CONCAT(DISTINCT fax_number_value) AS accountee_fax_numbers \nFROM act_accountee_fax_numbers \nLEFT JOIN act_fax_numbers ON act_fax_numbers.fax_number_id = act_accountee_fax_numbers.fax_number_id \nWHERE fax_number_value IS NOT NULL AND TRIM(fax_number_value) <> ''\nGROUP BY accountee_id"
    },
    "act_vw_accountee_fax_numbers": {
      "viewName": "act_vw_accountee_fax_numbers",
      "viewColumns": {
        "accountee_fax_number_id": {
          "columnName": "accountee_fax_number_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_fax_numbers",
          "columnSourceOriginalColumn": "accountee_fax_number_id"
        },
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_fax_numbers",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "fax_number_id": {
          "columnName": "fax_number_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_fax_numbers",
          "columnSourceOriginalColumn": "fax_number_id"
        },
        "fax_number_label": {
          "columnName": "fax_number_label",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_fax_numbers",
          "columnSourceOriginalColumn": "fax_number_label"
        },
        "fax_number_value": {
          "columnName": "fax_number_value",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_fax_numbers",
          "columnSourceOriginalColumn": "fax_number_value"
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_fax_numbers",
          "columnSourceOriginalColumn": "display_index"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_fax_numbers",
          "columnSourceOriginalColumn": "is_active"
        },
        "fax_number_remarks": {
          "columnName": "fax_number_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_fax_numbers",
          "columnSourceOriginalColumn": "fax_number_remarks"
        }
      },
      "viewQuery": "SELECT act_accountee_fax_numbers.accountee_fax_number_id,act_accountee_fax_numbers.accountee_id,act_fax_numbers.* FROM act_accountee_fax_numbers LEFT JOIN act_fax_numbers ON act_accountee_fax_numbers.fax_number_id = act_fax_numbers.fax_number_id"
    },
    "act_vw_accountee_legal_documents": {
      "viewName": "act_vw_accountee_legal_documents",
      "viewColumns": {
        "accountee_legal_document_id": {
          "columnName": "accountee_legal_document_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_legal_documents",
          "columnSourceOriginalColumn": "accountee_legal_document_id"
        },
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_legal_documents",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "expiry_date": {
          "columnName": "expiry_date",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_legal_documents",
          "columnSourceOriginalColumn": "expiry_date"
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_legal_documents",
          "columnSourceOriginalColumn": "display_index"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_legal_documents",
          "columnSourceOriginalColumn": "is_active"
        },
        "is_expired": {
          "columnName": "is_expired",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_legal_documents",
          "columnSourceOriginalColumn": "is_expired"
        },
        "is_verified": {
          "columnName": "is_verified",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_legal_documents",
          "columnSourceOriginalColumn": "is_verified"
        },
        "legal_document_id": {
          "columnName": "legal_document_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_legal_documents",
          "columnSourceOriginalColumn": "legal_document_id"
        },
        "legal_document_value": {
          "columnName": "legal_document_value",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_legal_documents",
          "columnSourceOriginalColumn": "legal_document_value"
        },
        "legal_document_label": {
          "columnName": "legal_document_label",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_legal_documents",
          "columnSourceOriginalColumn": "legal_document_label"
        },
        "legal_document_remarks": {
          "columnName": "legal_document_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_legal_documents",
          "columnSourceOriginalColumn": "legal_document_remarks"
        }
      },
      "viewQuery": "SELECT act_accountee_legal_documents.accountee_legal_document_id,act_accountee_legal_documents.accountee_id,act_legal_documents.* FROM act_accountee_legal_documents LEFT JOIN act_legal_documents ON act_accountee_legal_documents.legal_document_id = act_legal_documents.legal_document_id"
    },
    "act_vw_accountee_medias": {
      "viewName": "act_vw_accountee_medias",
      "viewColumns": {
        "accountee_media_id": {
          "columnName": "accountee_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_medias",
          "columnSourceOriginalColumn": "accountee_media_id"
        },
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_medias",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_medias",
          "columnSourceOriginalColumn": "display_index"
        },
        "media_details": {
          "columnName": "media_details",
          "columnType": "JSON",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_medias",
          "columnSourceOriginalColumn": "media_details"
        },
        "media_id": {
          "columnName": "media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_medias",
          "columnSourceOriginalColumn": "media_id"
        },
        "media_name": {
          "columnName": "media_name",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_medias",
          "columnSourceOriginalColumn": "media_name"
        },
        "media_path": {
          "columnName": "media_path",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_medias",
          "columnSourceOriginalColumn": "media_path"
        },
        "media_size": {
          "columnName": "media_size",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_medias",
          "columnSourceOriginalColumn": "media_size"
        },
        "media_type": {
          "columnName": "media_type",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_medias",
          "columnSourceOriginalColumn": "media_type"
        },
        "media_remarks": {
          "columnName": "media_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_medias",
          "columnSourceOriginalColumn": "media_remarks"
        }
      },
      "viewQuery": "SELECT act_accountee_medias.accountee_media_id,act_accountee_medias.accountee_id,act_medias.* FROM act_accountee_medias LEFT JOIN act_medias ON act_accountee_medias.media_id = act_medias.media_id"
    },
    "act_vw_accountee_phone_number_values": {
      "viewName": "act_vw_accountee_phone_number_values",
      "viewColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_phone_numbers",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "accountee_phone_numbers": {
          "columnName": "accountee_phone_numbers",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "function",
          "columnSourceName": "",
          "columnSourceOriginalColumn": ""
        }
      },
      "viewQuery": "SELECT accountee_id, GROUP_CONCAT(DISTINCT phone_number_value) AS accountee_phone_numbers \nFROM act_accountee_phone_numbers \nLEFT JOIN act_phone_numbers ON act_phone_numbers.phone_number_id = act_accountee_phone_numbers.phone_number_id\nWHERE phone_number_value IS NOT NULL AND TRIM(phone_number_value) <> ''\nGROUP BY accountee_id"
    },
    "act_vw_accountee_phone_numbers": {
      "viewName": "act_vw_accountee_phone_numbers",
      "viewColumns": {
        "accountee_phone_number_id": {
          "columnName": "accountee_phone_number_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_phone_numbers",
          "columnSourceOriginalColumn": "accountee_phone_number_id"
        },
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_phone_numbers",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_phone_numbers",
          "columnSourceOriginalColumn": "display_index"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_phone_numbers",
          "columnSourceOriginalColumn": "is_active"
        },
        "phone_number_id": {
          "columnName": "phone_number_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_phone_numbers",
          "columnSourceOriginalColumn": "phone_number_id"
        },
        "phone_number_label": {
          "columnName": "phone_number_label",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_phone_numbers",
          "columnSourceOriginalColumn": "phone_number_label"
        },
        "phone_number_value": {
          "columnName": "phone_number_value",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_phone_numbers",
          "columnSourceOriginalColumn": "phone_number_value"
        },
        "phone_number_remarks": {
          "columnName": "phone_number_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_phone_numbers",
          "columnSourceOriginalColumn": "phone_number_remarks"
        }
      },
      "viewQuery": "SELECT act_accountee_phone_numbers.accountee_phone_number_id,act_accountee_phone_numbers.accountee_id,act_phone_numbers.* FROM act_accountee_phone_numbers LEFT JOIN act_phone_numbers ON act_accountee_phone_numbers.phone_number_id = act_phone_numbers.phone_number_id"
    },
    "act_vw_accountee_social_medias": {
      "viewName": "act_vw_accountee_social_medias",
      "viewColumns": {
        "accountee_social_media_id": {
          "columnName": "accountee_social_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_social_medias",
          "columnSourceOriginalColumn": "accountee_social_media_id"
        },
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_social_medias",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_social_medias",
          "columnSourceOriginalColumn": "display_index"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_social_medias",
          "columnSourceOriginalColumn": "is_active"
        },
        "social_media_id": {
          "columnName": "social_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_social_medias",
          "columnSourceOriginalColumn": "social_media_id"
        },
        "social_media_type": {
          "columnName": "social_media_type",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_social_medias",
          "columnSourceOriginalColumn": "social_media_type"
        },
        "social_media_value": {
          "columnName": "social_media_value",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_social_medias",
          "columnSourceOriginalColumn": "social_media_value"
        },
        "social_media_remarks": {
          "columnName": "social_media_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_social_medias",
          "columnSourceOriginalColumn": "social_media_remarks"
        }
      },
      "viewQuery": "SELECT act_accountee_social_medias.accountee_social_media_id,act_accountee_social_medias.accountee_id,act_social_medias.* FROM act_accountee_social_medias LEFT JOIN act_social_medias ON act_accountee_social_medias.social_media_id = act_social_medias.social_media_id"
    },
    "act_vw_accountee_website_values": {
      "viewName": "act_vw_accountee_website_values",
      "viewColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_websites",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "accountee_websites": {
          "columnName": "accountee_websites",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "function",
          "columnSourceName": "",
          "columnSourceOriginalColumn": ""
        }
      },
      "viewQuery": "SELECT accountee_id, GROUP_CONCAT(DISTINCT website_value) AS accountee_websites FROM act_accountee_websites \nLEFT JOIN act_websites ON act_websites.website_id = act_accountee_websites.website_id\nWHERE website_value IS NOT NULL AND TRIM(website_value) <> ''\nGROUP BY accountee_id"
    },
    "act_vw_accountee_websites": {
      "viewName": "act_vw_accountee_websites",
      "viewColumns": {
        "accountee_website_id": {
          "columnName": "accountee_website_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_websites",
          "columnSourceOriginalColumn": "accountee_website_id"
        },
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountee_websites",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_websites",
          "columnSourceOriginalColumn": "display_index"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_websites",
          "columnSourceOriginalColumn": "is_active"
        },
        "website_id": {
          "columnName": "website_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_websites",
          "columnSourceOriginalColumn": "website_id"
        },
        "website_label": {
          "columnName": "website_label",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_websites",
          "columnSourceOriginalColumn": "website_label"
        },
        "website_value": {
          "columnName": "website_value",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_websites",
          "columnSourceOriginalColumn": "website_value"
        },
        "website_remarks": {
          "columnName": "website_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_websites",
          "columnSourceOriginalColumn": "website_remarks"
        }
      },
      "viewQuery": "SELECT act_accountee_websites.accountee_website_id,act_accountee_websites.accountee_id,act_websites.* FROM act_accountee_websites LEFT JOIN act_websites ON act_accountee_websites.website_id = act_websites.website_id"
    },
    "act_vw_accountees": {
      "viewName": "act_vw_accountees",
      "viewColumns": {
        "accountee_image_media": {
          "columnName": "accountee_image_media",
          "columnType": "JSON",
          "columnProperties": {},
          "columnSource": "function",
          "columnSourceName": "json_object",
          "columnSourceOriginalColumn": ""
        },
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountees",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "accountee_image_media_id": {
          "columnName": "accountee_image_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountees",
          "columnSourceOriginalColumn": "accountee_image_media_id"
        },
        "accountee_name": {
          "columnName": "accountee_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountees",
          "columnSourceOriginalColumn": "accountee_name"
        },
        "financial_year_end": {
          "columnName": "financial_year_end",
          "columnType": "DATE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountees",
          "columnSourceOriginalColumn": "financial_year_end"
        },
        "financial_year_start": {
          "columnName": "financial_year_start",
          "columnType": "DATE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountees",
          "columnSourceOriginalColumn": "financial_year_start"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountees",
          "columnSourceOriginalColumn": "is_active"
        },
        "accountee_remarks": {
          "columnName": "accountee_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountees",
          "columnSourceOriginalColumn": "accountee_remarks"
        },
        "accountee_type": {
          "columnName": "accountee_type",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountees",
          "columnSourceOriginalColumn": "accountee_type"
        },
        "email_addresses": {
          "columnName": "email_addresses",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountees",
          "columnSourceOriginalColumn": "email_addresses"
        },
        "phone_numbers": {
          "columnName": "phone_numbers",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountees",
          "columnSourceOriginalColumn": "phone_numbers"
        },
        "addresses": {
          "columnName": "addresses",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountees",
          "columnSourceOriginalColumn": "addresses"
        },
        "fax_numbers": {
          "columnName": "fax_numbers",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountees",
          "columnSourceOriginalColumn": "fax_numbers"
        },
        "websites": {
          "columnName": "websites",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountees",
          "columnSourceOriginalColumn": "websites"
        },
        "bank_accounts": {
          "columnName": "bank_accounts",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountees",
          "columnSourceOriginalColumn": "bank_accounts"
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountees",
          "columnSourceOriginalColumn": "currency_code"
        },
        "legal_identifier": {
          "columnName": "legal_identifier",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountees",
          "columnSourceOriginalColumn": "legal_identifier"
        },
        "accountee_taxing_type": {
          "columnName": "accountee_taxing_type",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountees",
          "columnSourceOriginalColumn": "accountee_taxing_type"
        },
        "is_remote": {
          "columnName": "is_remote",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_accountees",
          "columnSourceOriginalColumn": "is_remote"
        }
      },
      "viewQuery": "SELECT \n(CASE WHEN act_accountees.accountee_image_media_id IS NOT NULL THEN json_object('media_path', media_path,'media_details', media_details) ELSE NULL END) AS accountee_image_media,act_accountees.* FROM act_accountees LEFT JOIN act_medias ON act_accountees.accountee_image_media_id = act_medias.media_id"
    },
    "act_vw_assets": {
      "viewName": "act_vw_assets",
      "viewColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_assets",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "asset_barcode": {
          "columnName": "asset_barcode",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_assets",
          "columnSourceOriginalColumn": "asset_barcode"
        },
        "asset_depreciation_occurance": {
          "columnName": "asset_depreciation_occurance",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_assets",
          "columnSourceOriginalColumn": "asset_depreciation_occurance"
        },
        "asset_depreciation_percentage": {
          "columnName": "asset_depreciation_percentage",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_assets",
          "columnSourceOriginalColumn": "asset_depreciation_percentage"
        },
        "asset_details": {
          "columnName": "asset_details",
          "columnType": "JSON",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_assets",
          "columnSourceOriginalColumn": "asset_details"
        },
        "asset_id": {
          "columnName": "asset_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_assets",
          "columnSourceOriginalColumn": "asset_id"
        },
        "asset_image_media_id": {
          "columnName": "asset_image_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_assets",
          "columnSourceOriginalColumn": "asset_image_media_id"
        },
        "asset_name": {
          "columnName": "asset_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_assets",
          "columnSourceOriginalColumn": "asset_name"
        },
        "asset_value": {
          "columnName": "asset_value",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_assets",
          "columnSourceOriginalColumn": "asset_value"
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_assets",
          "columnSourceOriginalColumn": "currency_code"
        },
        "exchange_rate": {
          "columnName": "exchange_rate",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_assets",
          "columnSourceOriginalColumn": "exchange_rate"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_assets",
          "columnSourceOriginalColumn": "is_active"
        },
        "ledger_account_id": {
          "columnName": "ledger_account_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_assets",
          "columnSourceOriginalColumn": "ledger_account_id"
        },
        "asset_remarks": {
          "columnName": "asset_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_assets",
          "columnSourceOriginalColumn": "asset_remarks"
        }
      },
      "viewQuery": "SELECT * FROM act_assets"
    },
    "act_vw_ledger_account_summary": {
      "viewName": "act_vw_ledger_account_summary",
      "viewColumns": {
        "ledger_account_id": {
          "columnName": "ledger_account_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transaction_entries",
          "columnSourceOriginalColumn": "ledger_account_id"
        },
        "balance": {
          "columnName": "balance",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "function",
          "columnSourceName": "",
          "columnSourceOriginalColumn": ""
        },
        "debit_entries_count": {
          "columnName": "debit_entries_count",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "function",
          "columnSourceName": "",
          "columnSourceOriginalColumn": ""
        },
        "credit_entries_count": {
          "columnName": "credit_entries_count",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "function",
          "columnSourceName": "",
          "columnSourceOriginalColumn": ""
        }
      },
      "viewQuery": "SELECT SUM(CASE WHEN is_credit = 1 THEN  transaction_entry_amount * -1 ELSE transaction_entry_amount END) AS balance,\nSUM(CASE WHEN is_credit = 1 THEN  0 ELSE 1 END) AS debit_entries_count,\nSUM(CASE WHEN is_credit = 0 THEN  0 ELSE 1 END) AS credit_entries_count,\nledger_account_id\n FROM act_transaction_entries GROUP BY ledger_account_id"
    },
    "act_vw_ledger_account_types": {
      "viewName": "act_vw_ledger_account_types",
      "viewColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_ledger_account_types",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "ledger_account_type_id": {
          "columnName": "ledger_account_type_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_ledger_account_types",
          "columnSourceOriginalColumn": "ledger_account_type_id"
        },
        "ledger_account_type_index": {
          "columnName": "ledger_account_type_index",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_ledger_account_types",
          "columnSourceOriginalColumn": "ledger_account_type_index"
        },
        "ledger_account_type_name": {
          "columnName": "ledger_account_type_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_ledger_account_types",
          "columnSourceOriginalColumn": "ledger_account_type_name"
        },
        "parent_ledger_account_type_id": {
          "columnName": "parent_ledger_account_type_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_ledger_account_types",
          "columnSourceOriginalColumn": "parent_ledger_account_type_id"
        },
        "ledger_account_type_remarks": {
          "columnName": "ledger_account_type_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_ledger_account_types",
          "columnSourceOriginalColumn": "ledger_account_type_remarks"
        },
        "ledger_account_type_description": {
          "columnName": "ledger_account_type_description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_ledger_account_types",
          "columnSourceOriginalColumn": "ledger_account_type_description"
        }
      },
      "viewQuery": "SELECT * FROM act_ledger_account_types"
    },
    "act_vw_ledger_accounts": {
      "viewName": "act_vw_ledger_accounts",
      "viewColumns": {
        "ledger_account_type_name": {
          "columnName": "ledger_account_type_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Type"
            }
          },
          "columnSource": "table",
          "columnSourceName": "act_ledger_account_types",
          "columnSourceOriginalColumn": "ledger_account_type_name"
        },
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_ledger_accounts",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_ledger_accounts",
          "columnSourceOriginalColumn": "currency_code"
        },
        "reflecting_statement": {
          "columnName": "reflecting_statement",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_ledger_accounts",
          "columnSourceOriginalColumn": "reflecting_statement"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_ledger_accounts",
          "columnSourceOriginalColumn": "is_active"
        },
        "ledger_account_balance": {
          "columnName": "ledger_account_balance",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_ledger_accounts",
          "columnSourceOriginalColumn": "ledger_account_balance"
        },
        "ledger_account_id": {
          "columnName": "ledger_account_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_ledger_accounts",
          "columnSourceOriginalColumn": "ledger_account_id"
        },
        "ledger_account_name": {
          "columnName": "ledger_account_name",
          "columnType": "STRING",
          "columnProperties": {
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          },
          "columnSource": "table",
          "columnSourceName": "act_ledger_accounts",
          "columnSourceOriginalColumn": "ledger_account_name"
        },
        "ledger_account_type_id": {
          "columnName": "ledger_account_type_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_ledger_accounts",
          "columnSourceOriginalColumn": "ledger_account_type_id"
        },
        "ledger_account_remarks": {
          "columnName": "ledger_account_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_ledger_accounts",
          "columnSourceOriginalColumn": "ledger_account_remarks"
        },
        "is_expense": {
          "columnName": "is_expense",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_ledger_accounts",
          "columnSourceOriginalColumn": "is_expense"
        },
        "is_income": {
          "columnName": "is_income",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_ledger_accounts",
          "columnSourceOriginalColumn": "is_income"
        },
        "ledger_account_description": {
          "columnName": "ledger_account_description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_ledger_accounts",
          "columnSourceOriginalColumn": "ledger_account_description"
        }
      },
      "viewQuery": "SELECT act_ledger_account_types.ledger_account_type_name,act_ledger_accounts.* FROM act_ledger_accounts LEFT JOIN act_ledger_account_types ON act_ledger_accounts.ledger_account_type_id = act_ledger_account_types.ledger_account_type_id"
    },
    "act_vw_parties": {
      "viewName": "act_vw_parties",
      "viewColumns": {
        "party_image_media": {
          "columnName": "party_image_media",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Image"
            }
          },
          "columnSource": "function",
          "columnSourceName": "json_object",
          "columnSourceOriginalColumn": ""
        },
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_parties",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_parties",
          "columnSourceOriginalColumn": "is_active"
        },
        "ledger_account_id": {
          "columnName": "ledger_account_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_parties",
          "columnSourceOriginalColumn": "ledger_account_id"
        },
        "party_details": {
          "columnName": "party_details",
          "columnType": "JSON",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_parties",
          "columnSourceOriginalColumn": "party_details"
        },
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_parties",
          "columnSourceOriginalColumn": "party_id"
        },
        "party_name": {
          "columnName": "party_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_parties",
          "columnSourceOriginalColumn": "party_name"
        },
        "addresses": {
          "columnName": "addresses",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_parties",
          "columnSourceOriginalColumn": "addresses"
        },
        "email_addresses": {
          "columnName": "email_addresses",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_parties",
          "columnSourceOriginalColumn": "email_addresses"
        },
        "fax_numbers": {
          "columnName": "fax_numbers",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_parties",
          "columnSourceOriginalColumn": "fax_numbers"
        },
        "phone_numbers": {
          "columnName": "phone_numbers",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_parties",
          "columnSourceOriginalColumn": "phone_numbers"
        },
        "websites": {
          "columnName": "websites",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_parties",
          "columnSourceOriginalColumn": "websites"
        },
        "bank_accounts": {
          "columnName": "bank_accounts",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_parties",
          "columnSourceOriginalColumn": "bank_accounts"
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_parties",
          "columnSourceOriginalColumn": "currency_code"
        },
        "party_image_media_id": {
          "columnName": "party_image_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_parties",
          "columnSourceOriginalColumn": "party_image_media_id"
        },
        "legal_identifier": {
          "columnName": "legal_identifier",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_parties",
          "columnSourceOriginalColumn": "legal_identifier"
        },
        "party_remarks": {
          "columnName": "party_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_parties",
          "columnSourceOriginalColumn": "party_remarks"
        }
      },
      "viewQuery": "SELECT \n(CASE WHEN act_parties.party_image_media_id  IS NOT NULL THEN json_object('media_path', media_path,'media_details', media_details) ELSE NULL END) AS party_image_media,act_parties.* FROM act_parties LEFT JOIN act_medias ON act_parties.party_image_media_id = act_medias.media_id"
    },
    "act_vw_party_address_values": {
      "viewName": "act_vw_party_address_values",
      "viewColumns": {
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_addresses",
          "columnSourceOriginalColumn": "party_id"
        },
        "party_addresses": {
          "columnName": "party_addresses",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "function",
          "columnSourceName": "",
          "columnSourceOriginalColumn": ""
        }
      },
      "viewQuery": "SELECT party_id,GROUP_CONCAT(\nDISTINCT TRIM(COALESCE(address_line_1, '') || \nCASE WHEN TRIM(COALESCE(address_line_2, '')) <> '' THEN ', ' || \nTRIM(address_line_2) ELSE '' END || \nCASE WHEN TRIM(COALESCE(postal_code, '')) <> '' THEN ', ' || \nTRIM(postal_code) ELSE '' END || \nCASE WHEN TRIM(COALESCE(city_name, '')) <> '' THEN ', ' \n|| TRIM(city_name) ELSE '' END || \nCASE WHEN TRIM(COALESCE(state_name, '')) <> '' THEN ', ' || \nTRIM(state_name) ELSE '' END || \nCASE WHEN TRIM(COALESCE(country_name, '')) <> '' THEN ', ' || \nTRIM(country_name) ELSE '' END )) AS party_addresses FROM act_party_addresses \nLEFT JOIN act_addresses ON act_addresses.address_id = act_party_addresses.address_id\nWHERE address_line_1 IS NOT NULL AND TRIM(address_line_1) <> ''\nGROUP BY party_id"
    },
    "act_vw_party_addresses": {
      "viewName": "act_vw_party_addresses",
      "viewColumns": {
        "party_address_id": {
          "columnName": "party_address_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_addresses",
          "columnSourceOriginalColumn": "party_address_id"
        },
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_addresses",
          "columnSourceOriginalColumn": "party_id"
        },
        "address_id": {
          "columnName": "address_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "address_id"
        },
        "address_label": {
          "columnName": "address_label",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "address_label"
        },
        "address_line_1": {
          "columnName": "address_line_1",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "address_line_1"
        },
        "address_line_2": {
          "columnName": "address_line_2",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "address_line_2"
        },
        "country_name": {
          "columnName": "country_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "country_name"
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "display_index"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "is_active"
        },
        "landmark": {
          "columnName": "landmark",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "landmark"
        },
        "latitude": {
          "columnName": "latitude",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "latitude"
        },
        "longitude": {
          "columnName": "longitude",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "longitude"
        },
        "postal_code": {
          "columnName": "postal_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "postal_code"
        },
        "state_name": {
          "columnName": "state_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "state_name"
        },
        "city_name": {
          "columnName": "city_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "city_name"
        },
        "address_remarks": {
          "columnName": "address_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_addresses",
          "columnSourceOriginalColumn": "address_remarks"
        }
      },
      "viewQuery": "SELECT act_party_addresses.party_address_id,act_party_addresses.party_id,act_addresses.* FROM act_party_addresses LEFT JOIN act_addresses ON act_party_addresses.address_id = act_addresses.address_id"
    },
    "act_vw_party_bank_account_values": {
      "viewName": "act_vw_party_bank_account_values",
      "viewColumns": {
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_bank_accounts",
          "columnSourceOriginalColumn": "party_id"
        },
        "party_bank_accounts": {
          "columnName": "party_bank_accounts",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "function",
          "columnSourceName": "",
          "columnSourceOriginalColumn": ""
        }
      },
      "viewQuery": "SELECT party_id,GROUP_CONCAT(DISTINCT account_number || '[' || bank_name || ']')AS party_bank_accounts\nFROM act_party_bank_accounts \nLEFT JOIN act_bank_accounts ON act_party_bank_accounts.bank_account_id = act_bank_accounts.bank_account_id \nWHERE account_number IS NOT NULL AND TRIM(account_number) <> '' \nGROUP BY party_id"
    },
    "act_vw_party_bank_accounts": {
      "viewName": "act_vw_party_bank_accounts",
      "viewColumns": {
        "bank_label": {
          "columnName": "bank_label",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "bank_label"
        },
        "party_bank_account_id": {
          "columnName": "party_bank_account_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_bank_accounts",
          "columnSourceOriginalColumn": "party_bank_account_id"
        },
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_bank_accounts",
          "columnSourceOriginalColumn": "party_id"
        },
        "account_holder_name": {
          "columnName": "account_holder_name",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "account_holder_name"
        },
        "account_number": {
          "columnName": "account_number",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "account_number"
        },
        "account_type": {
          "columnName": "account_type",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "account_type"
        },
        "bank_account_id": {
          "columnName": "bank_account_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "bank_account_id"
        },
        "bank_code": {
          "columnName": "bank_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "bank_code"
        },
        "bank_name": {
          "columnName": "bank_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "bank_name"
        },
        "branch_code": {
          "columnName": "branch_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "branch_code"
        },
        "branch_name": {
          "columnName": "branch_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "branch_name"
        },
        "branch_address": {
          "columnName": "branch_address",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "branch_address"
        },
        "country_code": {
          "columnName": "country_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "country_code"
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "currency_code"
        },
        "iban": {
          "columnName": "iban",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "iban"
        },
        "ifsc": {
          "columnName": "ifsc",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "ifsc"
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "display_index"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "is_active"
        },
        "is_primary": {
          "columnName": "is_primary",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "is_primary"
        },
        "swift_bic": {
          "columnName": "swift_bic",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "swift_bic"
        },
        "bank_account_label": {
          "columnName": "bank_account_label",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "bank_account_label"
        },
        "bank_account_remarks": {
          "columnName": "bank_account_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_bank_accounts",
          "columnSourceOriginalColumn": "bank_account_remarks"
        }
      },
      "viewQuery": "SELECT act_party_bank_accounts.party_bank_account_id,act_party_bank_accounts.party_id,act_bank_accounts.* FROM act_party_bank_accounts LEFT JOIN act_bank_accounts ON act_party_bank_accounts.bank_account_id = act_bank_accounts.bank_account_id"
    },
    "act_vw_party_contact_persons": {
      "viewName": "act_vw_party_contact_persons",
      "viewColumns": {
        "party_contact_person_id": {
          "columnName": "party_contact_person_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_contact_persons",
          "columnSourceOriginalColumn": "party_contact_person_id"
        },
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_contact_persons",
          "columnSourceOriginalColumn": "party_id"
        },
        "contact_person_id": {
          "columnName": "contact_person_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_contact_persons",
          "columnSourceOriginalColumn": "contact_person_id"
        },
        "contact_person_image_media_id": {
          "columnName": "contact_person_image_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_contact_persons",
          "columnSourceOriginalColumn": "contact_person_image_media_id"
        },
        "contact_person_name": {
          "columnName": "contact_person_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_contact_persons",
          "columnSourceOriginalColumn": "contact_person_name"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_contact_persons",
          "columnSourceOriginalColumn": "is_active"
        },
        "contact_person_remarks": {
          "columnName": "contact_person_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_contact_persons",
          "columnSourceOriginalColumn": "contact_person_remarks"
        }
      },
      "viewQuery": "SELECT act_party_contact_persons.party_contact_person_id,act_party_contact_persons.party_id,act_contact_persons.* FROM act_party_contact_persons LEFT JOIN act_contact_persons ON act_party_contact_persons.contact_person_id = act_contact_persons.contact_person_id"
    },
    "act_vw_party_email_address_values": {
      "viewName": "act_vw_party_email_address_values",
      "viewColumns": {
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_email_addresses",
          "columnSourceOriginalColumn": "party_id"
        },
        "party_email_addresses": {
          "columnName": "party_email_addresses",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "function",
          "columnSourceName": "",
          "columnSourceOriginalColumn": ""
        }
      },
      "viewQuery": "SELECT party_id, GROUP_CONCAT(DISTINCT email_address_value) as party_email_addresses \nFROM act_party_email_addresses \nLEFT JOIN act_email_addresses ON act_party_email_addresses.email_address_id = act_email_addresses.email_address_id \nWHERE email_address_value IS NOT NULL AND TRIM(email_address_value) <> ''\nGROUP BY party_id"
    },
    "act_vw_party_email_addresses": {
      "viewName": "act_vw_party_email_addresses",
      "viewColumns": {
        "party_email_address_id": {
          "columnName": "party_email_address_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_email_addresses",
          "columnSourceOriginalColumn": "party_email_address_id"
        },
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_email_addresses",
          "columnSourceOriginalColumn": "party_id"
        },
        "email_address_id": {
          "columnName": "email_address_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_email_addresses",
          "columnSourceOriginalColumn": "email_address_id"
        },
        "email_address_label": {
          "columnName": "email_address_label",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_email_addresses",
          "columnSourceOriginalColumn": "email_address_label"
        },
        "email_address_value": {
          "columnName": "email_address_value",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_email_addresses",
          "columnSourceOriginalColumn": "email_address_value"
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_email_addresses",
          "columnSourceOriginalColumn": "display_index"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_email_addresses",
          "columnSourceOriginalColumn": "is_active"
        },
        "email_address_remarks": {
          "columnName": "email_address_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_email_addresses",
          "columnSourceOriginalColumn": "email_address_remarks"
        }
      },
      "viewQuery": "SELECT act_party_email_addresses.party_email_address_id,act_party_email_addresses.party_id,act_email_addresses.* FROM act_party_email_addresses LEFT JOIN act_email_addresses ON act_party_email_addresses.email_address_id = act_email_addresses.email_address_id"
    },
    "act_vw_party_fax_number_values": {
      "viewName": "act_vw_party_fax_number_values",
      "viewColumns": {
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_fax_numbers",
          "columnSourceOriginalColumn": "party_id"
        },
        "party_fax_numbers": {
          "columnName": "party_fax_numbers",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "function",
          "columnSourceName": "",
          "columnSourceOriginalColumn": ""
        }
      },
      "viewQuery": "SELECT party_id, GROUP_CONCAT(DISTINCT fax_number_value) AS party_fax_numbers \nFROM act_party_fax_numbers \nLEFT JOIN act_fax_numbers ON act_fax_numbers.fax_number_id = act_party_fax_numbers.fax_number_id \nWHERE fax_number_value IS NOT NULL AND TRIM(fax_number_value) <> ''\nGROUP BY party_id"
    },
    "act_vw_party_fax_numbers": {
      "viewName": "act_vw_party_fax_numbers",
      "viewColumns": {
        "party_fax_number_id": {
          "columnName": "party_fax_number_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_fax_numbers",
          "columnSourceOriginalColumn": "party_fax_number_id"
        },
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_fax_numbers",
          "columnSourceOriginalColumn": "party_id"
        },
        "fax_number_id": {
          "columnName": "fax_number_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_fax_numbers",
          "columnSourceOriginalColumn": "fax_number_id"
        },
        "fax_number_label": {
          "columnName": "fax_number_label",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_fax_numbers",
          "columnSourceOriginalColumn": "fax_number_label"
        },
        "fax_number_value": {
          "columnName": "fax_number_value",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_fax_numbers",
          "columnSourceOriginalColumn": "fax_number_value"
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_fax_numbers",
          "columnSourceOriginalColumn": "display_index"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_fax_numbers",
          "columnSourceOriginalColumn": "is_active"
        },
        "fax_number_remarks": {
          "columnName": "fax_number_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_fax_numbers",
          "columnSourceOriginalColumn": "fax_number_remarks"
        }
      },
      "viewQuery": "SELECT act_party_fax_numbers.party_fax_number_id,act_party_fax_numbers.party_id,act_fax_numbers.* FROM act_party_fax_numbers LEFT JOIN act_fax_numbers ON act_party_fax_numbers.fax_number_id = act_fax_numbers.fax_number_id"
    },
    "act_vw_party_legal_documents": {
      "viewName": "act_vw_party_legal_documents",
      "viewColumns": {
        "party_legal_document_id": {
          "columnName": "party_legal_document_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_legal_documents",
          "columnSourceOriginalColumn": "party_legal_document_id"
        },
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_legal_documents",
          "columnSourceOriginalColumn": "party_id"
        },
        "expiry_date": {
          "columnName": "expiry_date",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_legal_documents",
          "columnSourceOriginalColumn": "expiry_date"
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_legal_documents",
          "columnSourceOriginalColumn": "display_index"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_legal_documents",
          "columnSourceOriginalColumn": "is_active"
        },
        "is_expired": {
          "columnName": "is_expired",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_legal_documents",
          "columnSourceOriginalColumn": "is_expired"
        },
        "is_verified": {
          "columnName": "is_verified",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_legal_documents",
          "columnSourceOriginalColumn": "is_verified"
        },
        "legal_document_id": {
          "columnName": "legal_document_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_legal_documents",
          "columnSourceOriginalColumn": "legal_document_id"
        },
        "legal_document_value": {
          "columnName": "legal_document_value",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_legal_documents",
          "columnSourceOriginalColumn": "legal_document_value"
        },
        "legal_document_label": {
          "columnName": "legal_document_label",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_legal_documents",
          "columnSourceOriginalColumn": "legal_document_label"
        },
        "legal_document_remarks": {
          "columnName": "legal_document_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_legal_documents",
          "columnSourceOriginalColumn": "legal_document_remarks"
        }
      },
      "viewQuery": "SELECT act_party_legal_documents.party_legal_document_id,act_party_legal_documents.party_id,act_legal_documents.* FROM act_party_legal_documents LEFT JOIN act_legal_documents ON act_party_legal_documents.legal_document_id = act_legal_documents.legal_document_id"
    },
    "act_vw_party_medias": {
      "viewName": "act_vw_party_medias",
      "viewColumns": {
        "party_media_id": {
          "columnName": "party_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_medias",
          "columnSourceOriginalColumn": "party_media_id"
        },
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_medias",
          "columnSourceOriginalColumn": "party_id"
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_medias",
          "columnSourceOriginalColumn": "display_index"
        },
        "media_details": {
          "columnName": "media_details",
          "columnType": "JSON",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_medias",
          "columnSourceOriginalColumn": "media_details"
        },
        "media_id": {
          "columnName": "media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_medias",
          "columnSourceOriginalColumn": "media_id"
        },
        "media_name": {
          "columnName": "media_name",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_medias",
          "columnSourceOriginalColumn": "media_name"
        },
        "media_path": {
          "columnName": "media_path",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_medias",
          "columnSourceOriginalColumn": "media_path"
        },
        "media_size": {
          "columnName": "media_size",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_medias",
          "columnSourceOriginalColumn": "media_size"
        },
        "media_type": {
          "columnName": "media_type",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_medias",
          "columnSourceOriginalColumn": "media_type"
        },
        "media_remarks": {
          "columnName": "media_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_medias",
          "columnSourceOriginalColumn": "media_remarks"
        }
      },
      "viewQuery": "SELECT act_party_medias.party_media_id,act_party_medias.party_id,act_medias.* FROM act_party_medias LEFT JOIN act_medias ON act_party_medias.media_id = act_medias.media_id"
    },
    "act_vw_party_phone_number_values": {
      "viewName": "act_vw_party_phone_number_values",
      "viewColumns": {
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_phone_numbers",
          "columnSourceOriginalColumn": "party_id"
        },
        "party_phone_numbers": {
          "columnName": "party_phone_numbers",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "function",
          "columnSourceName": "",
          "columnSourceOriginalColumn": ""
        }
      },
      "viewQuery": "SELECT party_id, GROUP_CONCAT(DISTINCT phone_number_value) AS party_phone_numbers \nFROM act_party_phone_numbers \nLEFT JOIN act_phone_numbers ON act_phone_numbers.phone_number_id = act_party_phone_numbers.phone_number_id\nWHERE phone_number_value IS NOT NULL AND TRIM(phone_number_value) <> ''\nGROUP BY party_id"
    },
    "act_vw_party_phone_numbers": {
      "viewName": "act_vw_party_phone_numbers",
      "viewColumns": {
        "party_phone_number_id": {
          "columnName": "party_phone_number_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_phone_numbers",
          "columnSourceOriginalColumn": "party_phone_number_id"
        },
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_phone_numbers",
          "columnSourceOriginalColumn": "party_id"
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_phone_numbers",
          "columnSourceOriginalColumn": "display_index"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_phone_numbers",
          "columnSourceOriginalColumn": "is_active"
        },
        "phone_number_id": {
          "columnName": "phone_number_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_phone_numbers",
          "columnSourceOriginalColumn": "phone_number_id"
        },
        "phone_number_label": {
          "columnName": "phone_number_label",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_phone_numbers",
          "columnSourceOriginalColumn": "phone_number_label"
        },
        "phone_number_value": {
          "columnName": "phone_number_value",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_phone_numbers",
          "columnSourceOriginalColumn": "phone_number_value"
        },
        "phone_number_remarks": {
          "columnName": "phone_number_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_phone_numbers",
          "columnSourceOriginalColumn": "phone_number_remarks"
        }
      },
      "viewQuery": "SELECT act_party_phone_numbers.party_phone_number_id,act_party_phone_numbers.party_id,act_phone_numbers.* FROM act_party_phone_numbers LEFT JOIN act_phone_numbers ON act_party_phone_numbers.phone_number_id = act_phone_numbers.phone_number_id"
    },
    "act_vw_party_social_medias": {
      "viewName": "act_vw_party_social_medias",
      "viewColumns": {
        "party_social_media_id": {
          "columnName": "party_social_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_social_medias",
          "columnSourceOriginalColumn": "party_social_media_id"
        },
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_social_medias",
          "columnSourceOriginalColumn": "party_id"
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_social_medias",
          "columnSourceOriginalColumn": "display_index"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_social_medias",
          "columnSourceOriginalColumn": "is_active"
        },
        "social_media_id": {
          "columnName": "social_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_social_medias",
          "columnSourceOriginalColumn": "social_media_id"
        },
        "social_media_type": {
          "columnName": "social_media_type",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_social_medias",
          "columnSourceOriginalColumn": "social_media_type"
        },
        "social_media_value": {
          "columnName": "social_media_value",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_social_medias",
          "columnSourceOriginalColumn": "social_media_value"
        },
        "social_media_remarks": {
          "columnName": "social_media_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_social_medias",
          "columnSourceOriginalColumn": "social_media_remarks"
        }
      },
      "viewQuery": "SELECT act_party_social_medias.party_social_media_id,act_party_social_medias.party_id,act_social_medias.* FROM act_party_social_medias LEFT JOIN act_social_medias ON act_party_social_medias.social_media_id = act_social_medias.social_media_id"
    },
    "act_vw_party_website_values": {
      "viewName": "act_vw_party_website_values",
      "viewColumns": {
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_websites",
          "columnSourceOriginalColumn": "party_id"
        },
        "party_websites": {
          "columnName": "party_websites",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "function",
          "columnSourceName": "",
          "columnSourceOriginalColumn": ""
        }
      },
      "viewQuery": "SELECT party_id, GROUP_CONCAT(DISTINCT website_value) AS party_websites FROM act_party_websites \nLEFT JOIN act_websites ON act_websites.website_id = act_party_websites.website_id\nWHERE website_value IS NOT NULL AND TRIM(website_value) <> ''\nGROUP BY party_id"
    },
    "act_vw_party_websites": {
      "viewName": "act_vw_party_websites",
      "viewColumns": {
        "party_website_id": {
          "columnName": "party_website_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_websites",
          "columnSourceOriginalColumn": "party_website_id"
        },
        "party_id": {
          "columnName": "party_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_party_websites",
          "columnSourceOriginalColumn": "party_id"
        },
        "display_index": {
          "columnName": "display_index",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_websites",
          "columnSourceOriginalColumn": "display_index"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_websites",
          "columnSourceOriginalColumn": "is_active"
        },
        "website_id": {
          "columnName": "website_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_websites",
          "columnSourceOriginalColumn": "website_id"
        },
        "website_label": {
          "columnName": "website_label",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_websites",
          "columnSourceOriginalColumn": "website_label"
        },
        "website_value": {
          "columnName": "website_value",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_websites",
          "columnSourceOriginalColumn": "website_value"
        },
        "website_remarks": {
          "columnName": "website_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_websites",
          "columnSourceOriginalColumn": "website_remarks"
        }
      },
      "viewQuery": "SELECT act_party_websites.party_website_id,act_party_websites.party_id,act_websites.* FROM act_party_websites LEFT JOIN act_websites ON act_party_websites.website_id = act_websites.website_id"
    },
    "act_vw_payment_methods": {
      "viewName": "act_vw_payment_methods",
      "viewColumns": {
        "payment_method_image_media": {
          "columnName": "payment_method_image_media",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Image"
            }
          },
          "columnSource": "function",
          "columnSourceName": "json_object",
          "columnSourceOriginalColumn": ""
        },
        "ledger_account_name": {
          "columnName": "ledger_account_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_ledger_accounts",
          "columnSourceOriginalColumn": "ledger_account_name"
        },
        "reflecting_statement": {
          "columnName": "reflecting_statement",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_ledger_accounts",
          "columnSourceOriginalColumn": "reflecting_statement"
        },
        "ledger_account_balance": {
          "columnName": "ledger_account_balance",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_ledger_accounts",
          "columnSourceOriginalColumn": "ledger_account_balance"
        },
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_payment_methods",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_payment_methods",
          "columnSourceOriginalColumn": "currency_code"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_payment_methods",
          "columnSourceOriginalColumn": "is_active"
        },
        "ledger_account_id": {
          "columnName": "ledger_account_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_payment_methods",
          "columnSourceOriginalColumn": "ledger_account_id"
        },
        "payment_method_id": {
          "columnName": "payment_method_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_payment_methods",
          "columnSourceOriginalColumn": "payment_method_id"
        },
        "payment_method_image_media_id": {
          "columnName": "payment_method_image_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_payment_methods",
          "columnSourceOriginalColumn": "payment_method_image_media_id"
        },
        "payment_method_name": {
          "columnName": "payment_method_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_payment_methods",
          "columnSourceOriginalColumn": "payment_method_name"
        },
        "use_for_expenses": {
          "columnName": "use_for_expenses",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_payment_methods",
          "columnSourceOriginalColumn": "use_for_expenses"
        },
        "use_for_incomes": {
          "columnName": "use_for_incomes",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_payment_methods",
          "columnSourceOriginalColumn": "use_for_incomes"
        },
        "payment_method_remarks": {
          "columnName": "payment_method_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_payment_methods",
          "columnSourceOriginalColumn": "payment_method_remarks"
        }
      },
      "viewQuery": "SELECT act_ledger_accounts.ledger_account_name,act_ledger_accounts.reflecting_statement,act_ledger_accounts.ledger_account_balance,\n(CASE WHEN act_payment_methods.payment_method_image_media_id IS NOT NULL THEN json_object('media_path', media_path,'media_details', media_details) ELSE NULL END) AS payment_method_image_media,act_payment_methods.* FROM act_payment_methods LEFT JOIN act_ledger_accounts ON act_payment_methods.ledger_account_id = act_ledger_accounts.ledger_account_id LEFT JOIN act_medias ON act_payment_methods.payment_method_image_media_id = act_medias.media_id"
    },
    "act_vw_transaction_credit_entries": {
      "viewName": "act_vw_transaction_credit_entries",
      "viewColumns": {
        "credit_amount": {
          "columnName": "credit_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Credit Amount"
            }
          },
          "columnSource": "function",
          "columnSourceName": "sum",
          "columnSourceOriginalColumn": ""
        },
        "credit_ledger_account_id": {
          "columnName": "credit_ledger_account_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transaction_entries",
          "columnSourceOriginalColumn": "credit_ledger_account_id"
        },
        "transaction_id": {
          "columnName": "transaction_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transaction_entries",
          "columnSourceOriginalColumn": "transaction_id"
        },
        "transaction_entries_count": {
          "columnName": "transaction_entries_count",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Entries"
            }
          },
          "columnSource": "function",
          "columnSourceName": "count",
          "columnSourceOriginalColumn": ""
        }
      },
      "viewQuery": "SELECT SUM(transaction_entry_amount) as credit_amount,count(ledger_account_id) AS entries_count,ledger_account_id,transaction_id FROM act_transaction_entries GROUP BY transaction_id,ledger_account_id HAVING is_credit = 1"
    },
    "act_vw_transaction_debit_entries": {
      "viewName": "act_vw_transaction_debit_entries",
      "viewColumns": {
        "debit_amount": {
          "columnName": "debit_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Debit Amount"
            }
          },
          "columnSource": "function",
          "columnSourceName": "sum",
          "columnSourceOriginalColumn": ""
        },
        "debit_ledger_account_id": {
          "columnName": "debit_ledger_account_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transaction_entries",
          "columnSourceOriginalColumn": "debit_ledger_account_id"
        },
        "transaction_id": {
          "columnName": "transaction_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transaction_entries",
          "columnSourceOriginalColumn": "transaction_id"
        },
        "entries_count": {
          "columnName": "entries_count",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Entries"
            }
          },
          "columnSource": "function",
          "columnSourceName": "count",
          "columnSourceOriginalColumn": ""
        }
      },
      "viewQuery": "SELECT SUM(transaction_entry_amount) as debit_amount,count(ledger_account_id) AS entries_count, ledger_account_id,transaction_id FROM act_transaction_entries GROUP BY transaction_id,ledger_account_id HAVING is_credit=0"
    },
    "act_vw_transaction_entries": {
      "viewName": "act_vw_transaction_entries",
      "viewColumns": {
        "debit_ledger_account_name": {
          "columnName": "debit_ledger_account_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Debit Account"
            }
          },
          "columnSource": "view",
          "columnSourceName": "act_vw_ledger_accounts",
          "columnSourceOriginalColumn": "ledger_account_name"
        },
        "debit_ledger_account_balance": {
          "columnName": "debit_ledger_account_balance",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "view",
          "columnSourceName": "act_vw_ledger_accounts",
          "columnSourceOriginalColumn": "ledger_account_balance"
        },
        "debit_ledger_account_type_name": {
          "columnName": "debit_ledger_account_type_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "view",
          "columnSourceName": "act_vw_ledger_accounts",
          "columnSourceOriginalColumn": "ledger_account_type_name"
        },
        "debit_reflecting_statement": {
          "columnName": "debit_reflecting_statement",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "view",
          "columnSourceName": "act_vw_ledger_accounts",
          "columnSourceOriginalColumn": "reflecting_statement"
        },
        "credit_ledger_account_name": {
          "columnName": "credit_ledger_account_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Credit Account"
            }
          },
          "columnSource": "view",
          "columnSourceName": "act_vw_ledger_accounts",
          "columnSourceOriginalColumn": "ledger_account_name"
        },
        "credit_ledger_account_balance": {
          "columnName": "credit_ledger_account_balance",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "view",
          "columnSourceName": "act_vw_ledger_accounts",
          "columnSourceOriginalColumn": "ledger_account_balance"
        },
        "credit_ledger_account_type_name": {
          "columnName": "credit_ledger_account_type_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "view",
          "columnSourceName": "act_vw_ledger_accounts",
          "columnSourceOriginalColumn": "ledger_account_type_name"
        },
        "credit_reflecting_statement": {
          "columnName": "credit_reflecting_statement",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "view",
          "columnSourceName": "act_vw_ledger_accounts",
          "columnSourceOriginalColumn": "reflecting_statement"
        },
        "debit_amount": {
          "columnName": "debit_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Debit Amount"
            }
          },
          "columnSource": "table",
          "columnSourceName": "act_transaction_entries",
          "columnSourceOriginalColumn": "transaction_entry_amount"
        },
        "credit_amount": {
          "columnName": "credit_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Credit Amount"
            }
          },
          "columnSource": "table",
          "columnSourceName": "act_transaction_entries",
          "columnSourceOriginalColumn": "transaction_entry_amount"
        },
        "transaction_entry_narration": {
          "columnName": "transaction_entry_narration",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Narration"
            }
          },
          "columnSource": "function",
          "columnSourceName": "",
          "columnSourceOriginalColumn": ""
        },
        "ledger_account_name": {
          "columnName": "ledger_account_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "view",
          "columnSourceName": "act_vw_ledger_accounts",
          "columnSourceOriginalColumn": "ledger_account_name"
        },
        "ledger_account_type_name": {
          "columnName": "ledger_account_type_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "view",
          "columnSourceName": "act_vw_ledger_accounts",
          "columnSourceOriginalColumn": "ledger_account_type_name"
        },
        "reflecting_statement": {
          "columnName": "reflecting_statement",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "view",
          "columnSourceName": "act_vw_ledger_accounts",
          "columnSourceOriginalColumn": "reflecting_statement"
        },
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transactions",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "transaction_narration": {
          "columnName": "transaction_narration",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transactions",
          "columnSourceOriginalColumn": "transaction_narration"
        },
        "transaction_time": {
          "columnName": "transaction_time",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transactions",
          "columnSourceOriginalColumn": "transaction_time"
        },
        "transaction_type": {
          "columnName": "transaction_type",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transactions",
          "columnSourceOriginalColumn": "transaction_type"
        },
        "debit_ledger_accounts": {
          "columnName": "debit_ledger_accounts",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transactions",
          "columnSourceOriginalColumn": "debit_ledger_accounts"
        },
        "credit_ledger_accounts": {
          "columnName": "credit_ledger_accounts",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transactions",
          "columnSourceOriginalColumn": "credit_ledger_accounts"
        },
        "transaction_entry_amount": {
          "columnName": "transaction_entry_amount",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transaction_entries",
          "columnSourceOriginalColumn": "transaction_entry_amount"
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transaction_entries",
          "columnSourceOriginalColumn": "currency_code"
        },
        "exchange_rate": {
          "columnName": "exchange_rate",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transaction_entries",
          "columnSourceOriginalColumn": "exchange_rate"
        },
        "ledger_account_id": {
          "columnName": "ledger_account_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transaction_entries",
          "columnSourceOriginalColumn": "ledger_account_id"
        },
        "reference_number": {
          "columnName": "reference_number",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transaction_entries",
          "columnSourceOriginalColumn": "reference_number"
        },
        "transaction_entry_id": {
          "columnName": "transaction_entry_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transaction_entries",
          "columnSourceOriginalColumn": "transaction_entry_id"
        },
        "transaction_id": {
          "columnName": "transaction_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transaction_entries",
          "columnSourceOriginalColumn": "transaction_id"
        },
        "payment_method_id": {
          "columnName": "payment_method_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transaction_entries",
          "columnSourceOriginalColumn": "payment_method_id"
        },
        "tax_rate_percentage": {
          "columnName": "tax_rate_percentage",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transaction_entries",
          "columnSourceOriginalColumn": "tax_rate_percentage"
        },
        "transaction_entry_description": {
          "columnName": "transaction_entry_description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transaction_entries",
          "columnSourceOriginalColumn": "transaction_entry_description"
        },
        "transaction_entry_type": {
          "columnName": "transaction_entry_type",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transaction_entries",
          "columnSourceOriginalColumn": "transaction_entry_type"
        },
        "is_credit": {
          "columnName": "is_credit",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transaction_entries",
          "columnSourceOriginalColumn": "is_credit"
        },
        "transaction_entry_remarks": {
          "columnName": "transaction_entry_remarks",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transaction_entries",
          "columnSourceOriginalColumn": "transaction_entry_remarks"
        }
      },
      "viewQuery": "SELECT \nCASE WHEN act_transaction_entries.transaction_entry_description IS NULL OR act_transaction_entries.transaction_entry_description = '' THEN act_transactions.transaction_narration ELSE act_transaction_entries.transaction_entry_description END AS transaction_entry_narration, \nCASE WHEN is_credit = 0 THEN  act_vw_ledger_accounts.ledger_account_name ELSE '' END AS debit_ledger_account_name,\nCASE WHEN is_credit = 0 THEN  act_vw_ledger_accounts.ledger_account_type_name ELSE '' END AS debit_ledger_account_type_name,\nCASE WHEN is_credit = 0 THEN  act_vw_ledger_accounts.reflecting_statement ELSE '' END AS debit_reflecting_statement,\nCASE WHEN is_credit = 0 THEN  act_vw_ledger_accounts.ledger_account_balance ELSE 0 END AS debit_ledger_account_balance,\nCASE WHEN is_credit = 0 THEN  act_transaction_entries.transaction_entry_amount ELSE 0 END AS debit_amount,\nCASE WHEN is_credit = 1 THEN  act_vw_ledger_accounts.ledger_account_name ELSE '' END AS credit_ledger_account_name,\nCASE WHEN is_credit = 1 THEN  act_vw_ledger_accounts.ledger_account_type_name ELSE '' END AS credit_ledger_account_type_name,\nCASE WHEN is_credit = 1 THEN  act_vw_ledger_accounts.reflecting_statement ELSE '' END AS credit_reflecting_statement,\nCASE WHEN is_credit = 1 THEN  act_vw_ledger_accounts.ledger_account_balance ELSE 0 END AS credit_ledger_account_balance,\nCASE WHEN is_credit = 1 THEN  act_transaction_entries.transaction_entry_amount ELSE 0 END AS credit_amount,\nact_vw_ledger_accounts.ledger_account_name,\nact_vw_ledger_accounts.ledger_account_type_name,\nact_vw_ledger_accounts.reflecting_statement,\nact_transactions.accountee_id,\nact_transactions.transaction_narration,\nact_transactions.transaction_time,\nact_transactions.transaction_type,\nact_transactions.debit_ledger_accounts,\nact_transactions.credit_ledger_accounts,\nact_transaction_entries.* FROM act_transaction_entries \nLEFT JOIN act_transactions ON act_transactions.transaction_id = act_transaction_entries.transaction_id\nLEFT JOIN act_vw_ledger_accounts ON act_transaction_entries.ledger_account_id = act_vw_ledger_accounts.ledger_account_id"
    },
    "act_vw_transaction_summary": {
      "viewName": "act_vw_transaction_summary",
      "viewColumns": {
        "transaction_id": {
          "columnName": "transaction_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "act_transactions",
          "columnSourceOriginalColumn": "transaction_id"
        },
        "total_debit_amount": {
          "columnName": "total_debit_amount",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "function",
          "columnSourceName": "sum",
          "columnSourceOriginalColumn": ""
        },
        "total_credit_amount": {
          "columnName": "total_credit_amount",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "function",
          "columnSourceName": "sum",
          "columnSourceOriginalColumn": ""
        },
        "total_debit_entries_count": {
          "columnName": "total_debit_entries_count",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "function",
          "columnSourceName": "count",
          "columnSourceOriginalColumn": ""
        },
        "total_credit_entries_count": {
          "columnName": "total_credit_entries_count",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "function",
          "columnSourceName": "count",
          "columnSourceOriginalColumn": ""
        },
        "reflecting_debit_ledger_accounts": {
          "columnName": "reflecting_debit_ledger_accounts",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "function",
          "columnSourceName": "group_concat",
          "columnSourceOriginalColumn": ""
        },
        "reflecting_credit_ledger_accounts": {
          "columnName": "reflecting_credit_ledger_accounts",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "function",
          "columnSourceName": "group_concat",
          "columnSourceOriginalColumn": ""
        }
      },
      "viewQuery": "SELECT act_transactions.transaction_id, total_debit_amount, total_credit_amount, total_debit_entries_count, total_credit_entries_count, reflecting_debit_ledger_accounts, reflecting_credit_ledger_accounts FROM act_transactions LEFT JOIN\n(SELECT SUM(transaction_entry_amount) AS total_debit_amount,COUNT(transaction_entry_id) AS total_debit_entries_count,GROUP_CONCAT(ledger_account_name,', ') AS reflecting_debit_ledger_accounts, transaction_id FROM act_vw_transaction_entries WHERE is_credit=0 GROUP BY transaction_id) AS debit_summary\nON act_transactions.transaction_id = debit_summary.transaction_id LEFT JOIN \n(SELECT SUM(transaction_entry_amount) AS total_credit_amount,COUNT(transaction_entry_id) AS total_credit_entries_count,GROUP_CONCAT(ledger_account_name,', ') AS reflecting_credit_ledger_accounts, transaction_id FROM act_vw_transaction_entries WHERE is_credit=1 GROUP BY transaction_id) AS credit_summary\nON act_transactions.transaction_id = credit_summary.transaction_id"
    }
  },
  "relationships": [
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "accountee_id",
      "destinationTable": "act_accountee_addresses",
      "sourceColumn": "accountee_id",
      "sourceTable": "act_accountees"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "accountee_id",
      "destinationTable": "act_accountee_bank_accounts",
      "sourceColumn": "accountee_id",
      "sourceTable": "act_accountees"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "accountee_id",
      "destinationTable": "act_accountee_email_addresses",
      "sourceColumn": "accountee_id",
      "sourceTable": "act_accountees"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "accountee_id",
      "destinationTable": "act_accountee_legal_documents",
      "sourceColumn": "accountee_id",
      "sourceTable": "act_accountees"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "accountee_id",
      "destinationTable": "act_accountee_medias",
      "sourceColumn": "accountee_id",
      "sourceTable": "act_accountees"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "accountee_id",
      "destinationTable": "act_accountee_phone_numbers",
      "sourceColumn": "accountee_id",
      "sourceTable": "act_accountees"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "accountee_id",
      "destinationTable": "act_accountee_settings",
      "sourceColumn": "accountee_id",
      "sourceTable": "act_accountees"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "accountee_id",
      "destinationTable": "act_accountee_social_medias",
      "sourceColumn": "accountee_id",
      "sourceTable": "act_accountees"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "social_media_id",
      "destinationTable": "act_accountee_social_medias",
      "sourceColumn": "social_media_id",
      "sourceTable": "act_social_medias"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "accountee_id",
      "destinationTable": "act_accountee_websites",
      "sourceColumn": "accountee_id",
      "sourceTable": "act_accountees"
    },
    {
      "cascadeDeleteDestination": false,
      "destinationColumn": "accountee_id",
      "destinationTable": "act_asset_depreciations",
      "sourceColumn": "accountee_id",
      "sourceTable": "act_accountees"
    },
    {
      "destinationColumn": "accountee_id",
      "destinationTable": "act_assets",
      "sourceColumn": "accountee_id",
      "sourceTable": "act_accountees"
    },
    {
      "destinationColumn": "accountee_id",
      "destinationTable": "act_ledger_account_types",
      "sourceColumn": "accountee_id",
      "sourceTable": "act_accountees"
    },
    {
      "destinationColumn": "accountee_id",
      "destinationTable": "act_ledger_accounts",
      "sourceColumn": "accountee_id",
      "sourceTable": "act_accountees"
    },
    {
      "destinationColumn": "accountee_id",
      "destinationTable": "act_payment_methods",
      "sourceColumn": "accountee_id",
      "sourceTable": "act_accountees"
    },
    {
      "destinationColumn": "accountee_id",
      "destinationTable": "act_transactions",
      "sourceColumn": "accountee_id",
      "sourceTable": "act_accountees"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "address_id",
      "destinationTable": "act_accountee_addresses",
      "sourceColumn": "address_id",
      "sourceTable": "act_addresses"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "address_id",
      "destinationTable": "act_party_addresses",
      "sourceColumn": "address_id",
      "sourceTable": "act_addresses"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "asset_id",
      "destinationTable": "act_asset_attributes",
      "sourceColumn": "asset_id",
      "sourceTable": "act_assets"
    },
    {
      "cascadeDeleteDestination": false,
      "destinationColumn": "asset_id",
      "destinationTable": "act_asset_depreciations",
      "sourceColumn": "asset_id",
      "sourceTable": "act_assets"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "asset_id",
      "destinationTable": "act_asset_legal_documents",
      "sourceColumn": "asset_id",
      "sourceTable": "act_assets"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "asset_id",
      "destinationTable": "act_asset_medias",
      "sourceColumn": "asset_id",
      "sourceTable": "act_assets"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "bank_account_id",
      "destinationTable": "act_accountee_bank_accounts",
      "sourceColumn": "bank_account_id",
      "sourceTable": "act_bank_accounts"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "bank_account_id",
      "destinationTable": "act_party_bank_accounts",
      "sourceColumn": "bank_account_id",
      "sourceTable": "act_bank_accounts"
    },
    {
      "destinationColumn": "currency_code",
      "destinationTable": "act_asset_depreciations",
      "sourceColumn": "currency_code",
      "sourceTable": "act_currencies"
    },
    {
      "destinationColumn": "currency_code",
      "destinationTable": "act_assets",
      "sourceColumn": "currency_code",
      "sourceTable": "act_currencies"
    },
    {
      "destinationColumn": "currency_code",
      "destinationTable": "act_bank_accounts",
      "sourceColumn": "currency_code",
      "sourceTable": "act_currencies"
    },
    {
      "destinationColumn": "currency_code",
      "destinationTable": "act_ledger_accounts",
      "sourceColumn": "currency_code",
      "sourceTable": "act_currencies"
    },
    {
      "destinationColumn": "currency_code",
      "destinationTable": "act_payment_methods",
      "sourceColumn": "currency_code",
      "sourceTable": "act_currencies"
    },
    {
      "destinationColumn": "currency_code",
      "destinationTable": "act_transaction_entries",
      "sourceColumn": "currency_code",
      "sourceTable": "act_currencies"
    },
    {
      "destinationColumn": "currency_code",
      "destinationTable": "act_transactions",
      "sourceColumn": "currency_code",
      "sourceTable": "act_currencies"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "email_address_id",
      "destinationTable": "act_accountee_email_addresses",
      "sourceColumn": "email_address_id",
      "sourceTable": "act_email_addresses"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "email_address_id",
      "destinationTable": "act_party_email_addresses",
      "sourceColumn": "email_address_id",
      "sourceTable": "act_email_addresses"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "fax_number_id",
      "destinationTable": "act_party_fax_numbers",
      "sourceColumn": "fax_number_id",
      "sourceTable": "act_fax_numbers"
    },
    {
      "destinationColumn": "ledger_account_type_id",
      "destinationTable": "act_ledger_accounts",
      "sourceColumn": "ledger_account_type_id",
      "sourceTable": "act_ledger_account_types"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "ledger_account_id",
      "destinationTable": "act_accountee_bank_accounts",
      "sourceColumn": "ledger_account_id",
      "sourceTable": "act_ledger_accounts"
    },
    {
      "destinationColumn": "ledger_account_id",
      "destinationTable": "act_assets",
      "sourceColumn": "ledger_account_id",
      "sourceTable": "act_ledger_accounts"
    },
    {
      "destinationColumn": "ledger_account_id",
      "destinationTable": "act_payment_methods",
      "sourceColumn": "ledger_account_id",
      "sourceTable": "act_ledger_accounts"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "legal_document_id",
      "destinationTable": "act_accountee_legal_documents",
      "sourceColumn": "legal_document_id",
      "sourceTable": "act_legal_documents"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "legal_document_id",
      "destinationTable": "act_asset_legal_documents",
      "sourceColumn": "legal_document_id",
      "sourceTable": "act_legal_documents"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "legal_document_id",
      "destinationTable": "act_legal_document_medias",
      "sourceColumn": "legal_document_id",
      "sourceTable": "act_legal_documents"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "legal_document_id",
      "destinationTable": "act_party_legal_documents",
      "sourceColumn": "legal_document_id",
      "sourceTable": "act_legal_documents"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "media_id",
      "destinationTable": "act_accountee_medias",
      "sourceColumn": "media_id",
      "sourceTable": "act_medias"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "media_id",
      "destinationTable": "act_accountee_settings",
      "sourceColumn": "media_id",
      "sourceTable": "act_medias"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "media_id",
      "destinationTable": "act_asset_medias",
      "sourceColumn": "media_id",
      "sourceTable": "act_medias"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "media_id",
      "destinationTable": "act_legal_document_medias",
      "sourceColumn": "media_id",
      "sourceTable": "act_medias"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "media_id",
      "destinationTable": "act_party_medias",
      "sourceColumn": "media_id",
      "sourceTable": "act_medias"
    },
    {
      "destinationColumn": "media_id",
      "destinationTable": "act_transaction_entry_medias",
      "sourceColumn": "media_id",
      "sourceTable": "act_medias"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "phone_number_id",
      "destinationTable": "act_accountee_phone_numbers",
      "sourceColumn": "phone_number_id",
      "sourceTable": "act_phone_numbers"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "phone_number_id",
      "destinationTable": "act_party_phone_numbers",
      "sourceColumn": "phone_number_id",
      "sourceTable": "act_phone_numbers"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "party_id",
      "destinationTable": "act_party_addresses",
      "sourceColumn": "party_id",
      "sourceTable": "act_parties"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "party_id",
      "destinationTable": "act_party_contact_persons",
      "sourceColumn": "party_id",
      "sourceTable": "act_parties"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "party_id",
      "destinationTable": "act_party_email_addresses",
      "sourceColumn": "party_id",
      "sourceTable": "act_parties"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "party_id",
      "destinationTable": "act_party_fax_numbers",
      "sourceColumn": "party_id",
      "sourceTable": "act_parties"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "party_id",
      "destinationTable": "act_party_legal_documents",
      "sourceColumn": "party_id",
      "sourceTable": "act_parties"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "party_id",
      "destinationTable": "act_party_medias",
      "sourceColumn": "party_id",
      "sourceTable": "act_parties"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "party_id",
      "destinationTable": "act_party_phone_numbers",
      "sourceColumn": "party_id",
      "sourceTable": "act_parties"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "party_id",
      "destinationTable": "act_party_websites",
      "sourceColumn": "party_id",
      "sourceTable": "act_parties"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "party_id",
      "destinationTable": "act_party_bank_accounts",
      "sourceColumn": "party_id",
      "sourceTable": "act_parties"
    },
    {
      "destinationColumn": "transaction_id",
      "destinationTable": "act_asset_depreciations",
      "sourceColumn": "transaction_id",
      "sourceTable": "act_transactions"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "transaction_entry_id",
      "destinationTable": "act_transaction_entry_medias",
      "sourceColumn": "transaction_entry_id",
      "sourceTable": "act_transaction_entries"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "transaction_id",
      "destinationTable": "act_transaction_entries",
      "sourceColumn": "transaction_id",
      "sourceTable": "act_transactions"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "website_id",
      "destinationTable": "act_accountee_websites",
      "sourceColumn": "website_id",
      "sourceTable": "act_websites"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "website_id",
      "destinationTable": "act_party_websites",
      "sourceColumn": "website_id",
      "sourceTable": "act_websites"
    },
    {
      "cascadeDeleteDestination": false,
      "destinationColumn": "accountee_image_media_id",
      "destinationTable": "act_accountees",
      "sourceColumn": "media_id",
      "sourceTable": "act_medias"
    },
    {
      "destinationColumn": "asset_image_media_id",
      "destinationTable": "act_assets",
      "sourceColumn": "media_id",
      "sourceTable": "act_medias"
    },
    {
      "destinationColumn": "device_image_media_id",
      "destinationTable": "act_devices",
      "sourceColumn": "media_id",
      "sourceTable": "act_medias"
    },
    {
      "destinationColumn": "parent_ledger_account_type_id",
      "destinationTable": "act_ledger_account_types",
      "sourceColumn": "ledger_account_type_id",
      "sourceTable": "act_ledger_account_types"
    },
    {
      "destinationColumn": "notification_icon_media_id",
      "destinationTable": "act_notifications",
      "sourceColumn": "media_id",
      "sourceTable": "act_medias"
    },
    {
      "destinationColumn": "payment_method_image_media_id",
      "destinationTable": "act_payment_methods",
      "sourceColumn": "media_id",
      "sourceTable": "act_medias"
    },
    {
      "destinationColumn": "asset_attribute_media_id",
      "destinationTable": "act_asset_attributes",
      "sourceColumn": "media_id",
      "sourceTable": "act_medias"
    },
    {
      "destinationColumn": "ledger_account_id",
      "destinationTable": "act_transaction_entries",
      "sourceColumn": "ledger_account_id",
      "sourceTable": "act_ledger_accounts"
    },
    {
      "destinationColumn": "accountee_id",
      "destinationTable": "act_parties",
      "sourceColumn": "accountee_id",
      "sourceTable": "act_accountees"
    },
    {
      "destinationColumn": "ledger_account_id",
      "destinationTable": "act_parties",
      "sourceColumn": "ledger_account_id",
      "sourceTable": "act_ledger_accounts"
    },
    {
      "destinationColumn": "currency_code",
      "destinationTable": "act_parties",
      "sourceColumn": "currency_code",
      "sourceTable": "act_currencies"
    },
    {
      "destinationColumn": "party_image_media_id",
      "destinationTable": "act_parties",
      "sourceColumn": "media_id",
      "sourceTable": "act_medias"
    },
    {
      "destinationColumn": "currency_code",
      "destinationTable": "act_accountees",
      "sourceColumn": "currency_code",
      "sourceTable": "act_currencies"
    },
    {
      "cascadeDeleteDestination": false,
      "destinationColumn": "ledger_account_id",
      "destinationTable": "act_ledger_account_mappings",
      "sourceColumn": "ledger_account_id",
      "sourceTable": "act_ledger_accounts"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "accountee_id",
      "destinationTable": "act_ledger_account_mappings",
      "sourceColumn": "accountee_id",
      "sourceTable": "act_accountees"
    },
    {
      "destinationColumn": "payment_method_id",
      "destinationTable": "act_transaction_entries",
      "sourceColumn": "payment_method_id",
      "sourceTable": "act_payment_methods"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "party_id",
      "destinationTable": "act_party_social_medias",
      "sourceColumn": "party_id",
      "sourceTable": "act_parties"
    },
    {
      "cascadeDeleteDestination": true,
      "destinationColumn": "social_media_id",
      "destinationTable": "act_party_social_medias",
      "sourceColumn": "social_media_id",
      "sourceTable": "act_social_medias"
    }
  ]
};
