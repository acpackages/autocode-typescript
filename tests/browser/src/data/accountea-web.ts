export const dataDictionaryJson = {
  "name": "Accountea - Web",
  "version": 3,
  "tables": {
    "accountees": {
      "tableName": "accountees",
      "tableColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Accountee Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "accountee_name": {
          "columnName": "accountee_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Accountee Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "accountee_profile_image_media_id": {
          "columnName": "accountee_profile_image_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Accountee Profile Image"
            }
          }
        },
        "accountee_type": {
          "columnName": "accountee_type",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Accountee Type"
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
          "propertyValue": "accountees"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "accountee"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_accountees"
        }
      }
    },
    "applications": {
      "tableName": "applications",
      "tableColumns": {
        "application_id": {
          "columnName": "application_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Application Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "application_name": {
          "columnName": "application_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Application Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "application_identifier": {
          "columnName": "application_identifier",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Application Identifier"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            },
            "UNIQUE_KEY": {
              "propertyName": "UNIQUE_KEY",
              "propertyValue": true
            }
          }
        },
        "current_version_number": {
          "columnName": "current_version_number",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Current Version Number"
            }
          }
        },
        "current_version_label": {
          "columnName": "current_version_label",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Current Version Label"
            }
          }
        },
        "last_updated_on": {
          "columnName": "last_updated_on",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Last Updated On"
            }
          }
        },
        "application_image_media_id": {
          "columnName": "application_image_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Application Image"
            }
          }
        },
        "download_link": {
          "columnName": "download_link",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Download Link"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "applications"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "application"
        }
      }
    },
    "developers": {
      "tableName": "developers",
      "tableColumns": {
        "developer_id": {
          "columnName": "developer_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Developer Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
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
        },
        "developer_name": {
          "columnName": "developer_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Developer Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "developer_profile_image_media_id": {
          "columnName": "developer_profile_image_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Profile Image"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "developers"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "developer"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_developers"
        }
      }
    },
    "devices": {
      "tableName": "devices",
      "tableColumns": {
        "device_id": {
          "columnName": "device_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Device"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "device_unique_identifier": {
          "columnName": "device_unique_identifier",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Device Unique Identifier"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "application_id": {
          "columnName": "application_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Application"
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
          "propertyValue": "devices"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "device"
        }
      }
    },
    "extensions": {
      "tableName": "extensions",
      "tableColumns": {
        "extension_id": {
          "columnName": "extension_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Extension Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "extension_name": {
          "columnName": "extension_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Extension Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "extension_identifier": {
          "columnName": "extension_identifier",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Extension Identifier"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            },
            "UNIQUE_KEY": {
              "propertyName": "UNIQUE_KEY",
              "propertyValue": true
            }
          }
        },
        "extension_type": {
          "columnName": "extension_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Extension Type"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "developer_id": {
          "columnName": "developer_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Developer"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "current_version_number": {
          "columnName": "current_version_number",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Version Number"
            }
          }
        },
        "current_version_label": {
          "columnName": "current_version_label",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Version"
            }
          }
        },
        "extension_archive_url": {
          "columnName": "extension_archive_url",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Extension Url"
            }
          }
        },
        "last_updated_on": {
          "columnName": "last_updated_on",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Updated At"
            }
          }
        },
        "extension_image_media_id": {
          "columnName": "extension_image_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Extension Image"
            }
          }
        },
        "quick_description": {
          "columnName": "quick_description",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Quick Description"
            }
          }
        },
        "full_description": {
          "columnName": "full_description",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Full Description"
            }
          }
        },
        "is_android_supported": {
          "columnName": "is_android_supported",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is AndroidSupported?"
            }
          }
        },
        "is_ios_supported": {
          "columnName": "is_ios_supported",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is iOS Supported?"
            }
          }
        },
        "is_windows_supported": {
          "columnName": "is_windows_supported",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Windows Supported?"
            }
          }
        },
        "is_macos_supported": {
          "columnName": "is_macos_supported",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is MacOS Supported?"
            }
          }
        },
        "is_linux_supported": {
          "columnName": "is_linux_supported",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Linux Supported"
            }
          }
        },
        "extension_tags": {
          "columnName": "extension_tags",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Tags"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "extensions"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "extension"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_extensions"
        }
      }
    },
    "label_formats": {
      "tableName": "label_formats",
      "tableColumns": {
        "label_format_id": {
          "columnName": "label_format_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Label Format Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "label_format_identifier": {
          "columnName": "label_format_identifier",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Label Format Identifier"
            },
            "UNIQUE_KEY": {
              "propertyName": "UNIQUE_KEY",
              "propertyValue": true
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "label_format_name": {
          "columnName": "label_format_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Label Format Name"
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "current_version_label": {
          "columnName": "current_version_label",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Version"
            }
          }
        },
        "current_version_number": {
          "columnName": "current_version_number",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Version Number"
            }
          }
        },
        "last_updated_on": {
          "columnName": "last_updated_on",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Updated On"
            }
          }
        },
        "label_format_json": {
          "columnName": "label_format_json",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Label Format Json"
            }
          }
        },
        "developer_id": {
          "columnName": "developer_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Developer"
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "label_format_type": {
          "columnName": "label_format_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Label Format Type"
            }
          }
        },
        "full_description": {
          "columnName": "full_description",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Full Description"
            }
          }
        },
        "quick_description": {
          "columnName": "quick_description",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Quick Description"
            }
          }
        },
        "label_format_tags": {
          "columnName": "label_format_tags",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Tags"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "label_formats"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "label_format"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_label_formats"
        }
      }
    },
    "medias": {
      "tableName": "medias",
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
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "medias"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "media"
        }
      }
    },
    "otps": {
      "tableName": "otps",
      "tableColumns": {
        "otp_id": {
          "columnName": "otp_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "OTP Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "otp_value": {
          "columnName": "otp_value",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "OTP Value"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "otp_for": {
          "columnName": "otp_for",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "OTP For"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "otp_data": {
          "columnName": "otp_data",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "OTP Data"
            }
          }
        },
        "sms_message_id": {
          "columnName": "sms_message_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "SMS"
            }
          }
        },
        "otp_timestamp": {
          "columnName": "otp_timestamp",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Timestamp"
            }
          }
        },
        "mobile_number": {
          "columnName": "mobile_number",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Mobile Number"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "otps"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "otp"
        }
      }
    },
    "print_formats": {
      "tableName": "print_formats",
      "tableColumns": {
        "print_format_id": {
          "columnName": "print_format_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Print Format Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "print_format_identifier": {
          "columnName": "print_format_identifier",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Print Format Identifier"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            },
            "UNIQUE_KEY": {
              "propertyName": "UNIQUE_KEY",
              "propertyValue": true
            }
          }
        },
        "print_format_name": {
          "columnName": "print_format_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Print Format Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "current_version_label": {
          "columnName": "current_version_label",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Version"
            }
          }
        },
        "current_version_number": {
          "columnName": "current_version_number",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Version Number"
            }
          }
        },
        "last_updated_on": {
          "columnName": "last_updated_on",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Updated On"
            }
          }
        },
        "print_format_json": {
          "columnName": "print_format_json",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Print Format Json"
            }
          }
        },
        "developer_id": {
          "columnName": "developer_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Developer"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "print_format_type": {
          "columnName": "print_format_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "PrintFormat Type"
            }
          }
        },
        "full_description": {
          "columnName": "full_description",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Full Description"
            }
          }
        },
        "quick_description": {
          "columnName": "quick_description",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Quick Description"
            }
          }
        },
        "print_format_tags": {
          "columnName": "print_format_tags",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Tags"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "print_formats"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "print_format"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_print_formats"
        }
      }
    },
    "reports": {
      "tableName": "reports",
      "tableColumns": {
        "report_id": {
          "columnName": "report_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Report Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "report_name": {
          "columnName": "report_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Report Name"
            }
          }
        },
        "report_label": {
          "columnName": "report_label",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Report Label"
            }
          }
        },
        "report_script": {
          "columnName": "report_script",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Report Script"
            }
          }
        },
        "last_updated_on": {
          "columnName": "last_updated_on",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Last Updated On"
            }
          }
        },
        "current_version_number": {
          "columnName": "current_version_number",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Current Version Number"
            }
          }
        },
        "current_version_label": {
          "columnName": "current_version_label",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Current Version Label"
            }
          }
        },
        "developer_id": {
          "columnName": "developer_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Developer"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "reports"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "report"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_reports"
        }
      }
    },
    "sms_messages": {
      "tableName": "sms_messages",
      "tableColumns": {
        "sms_message_id": {
          "columnName": "sms_message_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "SMS Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "sms_mobile_number": {
          "columnName": "sms_mobile_number",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Mobile Number"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "sms_timestamp": {
          "columnName": "sms_timestamp",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "DATETIME"
            }
          }
        },
        "sms_message": {
          "columnName": "sms_message",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "SMS Mesage"
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
        },
        "sms_api_details": {
          "columnName": "sms_api_details",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "SMS API Details"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "sms_messages"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "sms_message"
        }
      }
    },
    "user_accountees": {
      "tableName": "user_accountees",
      "tableColumns": {
        "user_accountee_id": {
          "columnName": "user_accountee_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "User Accountee iD"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
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
        },
        "device_id": {
          "columnName": "device_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Device"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
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
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "user_accountees"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "user_accountee"
        }
      }
    },
    "user_devices": {
      "tableName": "user_devices",
      "tableColumns": {
        "user_device_id": {
          "columnName": "user_device_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "User Device ID"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
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
        },
        "device_id": {
          "columnName": "device_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Device"
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
          "propertyValue": "user_devices"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "user_device"
        }
      }
    },
    "users": {
      "tableName": "users",
      "tableColumns": {
        "user_id": {
          "columnName": "user_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "User Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "name": {
          "columnName": "name",
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
        "mobile_number": {
          "columnName": "mobile_number",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Mobile"
            },
            "UNIQUE_KEY": {
              "propertyName": "UNIQUE_KEY",
              "propertyValue": true
            }
          }
        },
        "password": {
          "columnName": "password",
          "columnType": "PASSWORD",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Password"
            }
          }
        },
        "email_address": {
          "columnName": "email_address",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Email Address"
            }
          }
        },
        "user_profile_image_media_id": {
          "columnName": "user_profile_image_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Profile Image"
            }
          }
        },
        "mobile_verified_on": {
          "columnName": "mobile_verified_on",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Mobile Verified On"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "users"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "user"
        }
      }
    }
  },
  "views": {
    "vw_accountees": {
      "viewName": "vw_accountees",
      "viewColumns": {
        "accountee_id": {
          "columnName": "accountee_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "accountees",
          "columnSourceOriginalColumn": "accountee_id"
        },
        "accountee_name": {
          "columnName": "accountee_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "accountees",
          "columnSourceOriginalColumn": "accountee_name"
        },
        "accountee_profile_image_media_id": {
          "columnName": "accountee_profile_image_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "accountees",
          "columnSourceOriginalColumn": "accountee_profile_image_media_id"
        },
        "accountee_type": {
          "columnName": "accountee_type",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "accountees",
          "columnSourceOriginalColumn": "accountee_type"
        }
      },
      "viewQuery": "SELECT * FROM accountees"
    },
    "vw_developers": {
      "viewName": "vw_developers",
      "viewColumns": {
        "developer_profile_image_media_details": {
          "columnName": "developer_profile_image_media_details",
          "columnType": "JSON",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "medias",
          "columnSourceOriginalColumn": "media_details"
        },
        "developer_profile_image_media_path": {
          "columnName": "developer_profile_image_media_path",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "medias",
          "columnSourceOriginalColumn": "media_path"
        },
        "developer_id": {
          "columnName": "developer_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "developers",
          "columnSourceOriginalColumn": "developer_id"
        },
        "user_id": {
          "columnName": "user_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "developers",
          "columnSourceOriginalColumn": "user_id"
        },
        "developer_name": {
          "columnName": "developer_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "developers",
          "columnSourceOriginalColumn": "developer_name"
        },
        "developer_profile_image_media_id": {
          "columnName": "developer_profile_image_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "developers",
          "columnSourceOriginalColumn": "developer_profile_image_media_id"
        }
      },
      "viewQuery": "SELECT medias.media_details AS developer_profile_image_media_details, medias.media_path AS developer_profile_image_media_path ,developers.* FROM developers LEFT JOIN medias ON developers.developer_profile_image_media_id = medias.media_id"
    },
    "vw_extensions": {
      "viewName": "vw_extensions",
      "viewColumns": {
        "extension_id": {
          "columnName": "extension_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "extensions",
          "columnSourceOriginalColumn": "extension_id"
        },
        "extension_name": {
          "columnName": "extension_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "extensions",
          "columnSourceOriginalColumn": "extension_name"
        },
        "extension_identifier": {
          "columnName": "extension_identifier",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "extensions",
          "columnSourceOriginalColumn": "extension_identifier"
        },
        "extension_type": {
          "columnName": "extension_type",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "extensions",
          "columnSourceOriginalColumn": "extension_type"
        },
        "developer_id": {
          "columnName": "developer_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "extensions",
          "columnSourceOriginalColumn": "developer_id"
        },
        "current_version_number": {
          "columnName": "current_version_number",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "extensions",
          "columnSourceOriginalColumn": "current_version_number"
        },
        "current_version_label": {
          "columnName": "current_version_label",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "extensions",
          "columnSourceOriginalColumn": "current_version_label"
        },
        "extension_archive_url": {
          "columnName": "extension_archive_url",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "extensions",
          "columnSourceOriginalColumn": "extension_archive_url"
        },
        "last_updated_on": {
          "columnName": "last_updated_on",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "extensions",
          "columnSourceOriginalColumn": "last_updated_on"
        },
        "extension_image_media_id": {
          "columnName": "extension_image_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "extensions",
          "columnSourceOriginalColumn": "extension_image_media_id"
        },
        "quick_description": {
          "columnName": "quick_description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "extensions",
          "columnSourceOriginalColumn": "quick_description"
        },
        "full_description": {
          "columnName": "full_description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "extensions",
          "columnSourceOriginalColumn": "full_description"
        },
        "is_android_supported": {
          "columnName": "is_android_supported",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "extensions",
          "columnSourceOriginalColumn": "is_android_supported"
        },
        "is_ios_supported": {
          "columnName": "is_ios_supported",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "extensions",
          "columnSourceOriginalColumn": "is_ios_supported"
        },
        "is_windows_supported": {
          "columnName": "is_windows_supported",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "extensions",
          "columnSourceOriginalColumn": "is_windows_supported"
        },
        "is_macos_supported": {
          "columnName": "is_macos_supported",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "extensions",
          "columnSourceOriginalColumn": "is_macos_supported"
        },
        "is_linux_supported": {
          "columnName": "is_linux_supported",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "extensions",
          "columnSourceOriginalColumn": "is_linux_supported"
        },
        "developer_name": {
          "columnName": "developer_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "view",
          "columnSourceName": "vw_developers",
          "columnSourceOriginalColumn": "developer_name"
        },
        "developer_profile_image_media_path": {
          "columnName": "developer_profile_image_media_path",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "view",
          "columnSourceName": "vw_developers",
          "columnSourceOriginalColumn": "developer_profile_image_media_path"
        }
      },
      "viewQuery": "SELECT extensions.*,vw_developers.developer_name,vw_developers.developer_profile_image_media_path FROM extensions \nLEFT JOIN vw_developers ON extensions.developer_id = vw_developers.developer_id"
    },
    "vw_label_formats": {
      "viewName": "vw_label_formats",
      "viewColumns": {
        "label_format_id": {
          "columnName": "label_format_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "label_formats",
          "columnSourceOriginalColumn": "label_format_id"
        },
        "label_format_identifier": {
          "columnName": "label_format_identifier",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "label_formats",
          "columnSourceOriginalColumn": "label_format_identifier"
        },
        "label_format_name": {
          "columnName": "label_format_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "label_formats",
          "columnSourceOriginalColumn": "label_format_name"
        },
        "current_version_label": {
          "columnName": "current_version_label",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "label_formats",
          "columnSourceOriginalColumn": "current_version_label"
        },
        "current_version_number": {
          "columnName": "current_version_number",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "label_formats",
          "columnSourceOriginalColumn": "current_version_number"
        },
        "last_updated_on": {
          "columnName": "last_updated_on",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "label_formats",
          "columnSourceOriginalColumn": "last_updated_on"
        },
        "label_format_json": {
          "columnName": "label_format_json",
          "columnType": "JSON",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "label_formats",
          "columnSourceOriginalColumn": "label_format_json"
        },
        "developer_id": {
          "columnName": "developer_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "label_formats",
          "columnSourceOriginalColumn": "developer_id"
        },
        "label_format_type": {
          "columnName": "label_format_type",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "label_formats",
          "columnSourceOriginalColumn": "label_format_type"
        },
        "full_description": {
          "columnName": "full_description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "label_formats",
          "columnSourceOriginalColumn": "full_description"
        },
        "quick_description": {
          "columnName": "quick_description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "label_formats",
          "columnSourceOriginalColumn": "quick_description"
        },
        "label_format_tags": {
          "columnName": "label_format_tags",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "label_formats",
          "columnSourceOriginalColumn": "label_format_tags"
        },
        "developer_name": {
          "columnName": "developer_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "view",
          "columnSourceName": "vw_developers",
          "columnSourceOriginalColumn": "developer_name"
        },
        "developer_profile_image_media_path": {
          "columnName": "developer_profile_image_media_path",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "view",
          "columnSourceName": "vw_developers",
          "columnSourceOriginalColumn": "developer_profile_image_media_path"
        }
      },
      "viewQuery": "SELECT label_formats.*,vw_developers.developer_name,vw_developers.developer_profile_image_media_path FROM label_formats \nLEFT JOIN vw_developers ON label_formats.developer_id = vw_developers.developer_id"
    },
    "vw_print_formats": {
      "viewName": "vw_print_formats",
      "viewColumns": {
        "print_format_id": {
          "columnName": "print_format_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "print_formats",
          "columnSourceOriginalColumn": "print_format_id"
        },
        "print_format_identifier": {
          "columnName": "print_format_identifier",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "print_formats",
          "columnSourceOriginalColumn": "print_format_identifier"
        },
        "print_format_name": {
          "columnName": "print_format_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "print_formats",
          "columnSourceOriginalColumn": "print_format_name"
        },
        "current_version_label": {
          "columnName": "current_version_label",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "print_formats",
          "columnSourceOriginalColumn": "current_version_label"
        },
        "current_version_number": {
          "columnName": "current_version_number",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "print_formats",
          "columnSourceOriginalColumn": "current_version_number"
        },
        "last_updated_on": {
          "columnName": "last_updated_on",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "print_formats",
          "columnSourceOriginalColumn": "last_updated_on"
        },
        "print_format_json": {
          "columnName": "print_format_json",
          "columnType": "JSON",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "print_formats",
          "columnSourceOriginalColumn": "print_format_json"
        },
        "developer_id": {
          "columnName": "developer_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "print_formats",
          "columnSourceOriginalColumn": "developer_id"
        },
        "print_format_type": {
          "columnName": "print_format_type",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "print_formats",
          "columnSourceOriginalColumn": "print_format_type"
        },
        "full_description": {
          "columnName": "full_description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "print_formats",
          "columnSourceOriginalColumn": "full_description"
        },
        "quick_description": {
          "columnName": "quick_description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "print_formats",
          "columnSourceOriginalColumn": "quick_description"
        },
        "print_format_tags": {
          "columnName": "print_format_tags",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "print_formats",
          "columnSourceOriginalColumn": "print_format_tags"
        },
        "developer_name": {
          "columnName": "developer_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "view",
          "columnSourceName": "vw_developers",
          "columnSourceOriginalColumn": "developer_name"
        },
        "developer_profile_image_media_path": {
          "columnName": "developer_profile_image_media_path",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "view",
          "columnSourceName": "vw_developers",
          "columnSourceOriginalColumn": "developer_profile_image_media_path"
        }
      },
      "viewQuery": "SELECT print_formats.*,vw_developers.developer_name,vw_developers.developer_profile_image_media_path FROM print_formats \nLEFT JOIN vw_developers ON print_formats.developer_id = vw_developers.developer_id"
    },
    "vw_reports": {
      "viewName": "vw_reports",
      "viewColumns": {
        "report_id": {
          "columnName": "report_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "reports",
          "columnSourceOriginalColumn": "report_id"
        },
        "report_name": {
          "columnName": "report_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "reports",
          "columnSourceOriginalColumn": "report_name"
        },
        "report_label": {
          "columnName": "report_label",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "reports",
          "columnSourceOriginalColumn": "report_label"
        },
        "report_script": {
          "columnName": "report_script",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "reports",
          "columnSourceOriginalColumn": "report_script"
        },
        "last_updated_on": {
          "columnName": "last_updated_on",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "reports",
          "columnSourceOriginalColumn": "last_updated_on"
        },
        "current_version_number": {
          "columnName": "current_version_number",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "reports",
          "columnSourceOriginalColumn": "current_version_number"
        },
        "current_version_label": {
          "columnName": "current_version_label",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "reports",
          "columnSourceOriginalColumn": "current_version_label"
        },
        "developer_id": {
          "columnName": "developer_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "reports",
          "columnSourceOriginalColumn": "developer_id"
        },
        "developer_name": {
          "columnName": "developer_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "view",
          "columnSourceName": "vw_developers",
          "columnSourceOriginalColumn": "developer_name"
        },
        "developer_profile_image_media_path": {
          "columnName": "developer_profile_image_media_path",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "view",
          "columnSourceName": "vw_developers",
          "columnSourceOriginalColumn": "developer_profile_image_media_path"
        }
      },
      "viewQuery": "SELECT reports.*,vw_developers.developer_name,vw_developers.developer_profile_image_media_path FROM reports \nLEFT JOIN vw_developers ON reports.developer_id = vw_developers.developer_id"
    }
  },
  "relationships": [
    {
      "destinationColumn": "developer_id",
      "destinationTable": "extensions",
      "sourceColumn": "developer_id",
      "sourceTable": "developers"
    },
    {
      "destinationColumn": "extension_image_media_id",
      "destinationTable": "extensions",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "user_profile_image_media_id",
      "destinationTable": "users",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "accountee_profile_image_media_id",
      "destinationTable": "accountees",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "application_image_media_id",
      "destinationTable": "applications",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "user_id",
      "destinationTable": "user_accountees",
      "sourceColumn": "user_id",
      "sourceTable": "users"
    },
    {
      "cascadeDeleteSource": false,
      "destinationColumn": "device_id",
      "destinationTable": "user_accountees",
      "sourceColumn": "device_id",
      "sourceTable": "devices"
    },
    {
      "destinationColumn": "accountee_id",
      "destinationTable": "user_accountees",
      "sourceColumn": "accountee_id",
      "sourceTable": "accountees"
    },
    {
      "destinationColumn": "user_id",
      "destinationTable": "user_devices",
      "sourceColumn": "user_id",
      "sourceTable": "users"
    },
    {
      "destinationColumn": "device_id",
      "destinationTable": "user_devices",
      "sourceColumn": "device_id",
      "sourceTable": "devices"
    },
    {
      "destinationColumn": "user_id",
      "destinationTable": "developers",
      "sourceColumn": "user_id",
      "sourceTable": "users"
    },
    {
      "destinationColumn": "developer_id",
      "destinationTable": "print_formats",
      "sourceColumn": "developer_id",
      "sourceTable": "developers"
    },
    {
      "destinationColumn": "developer_id",
      "destinationTable": "developers",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "user_id",
      "destinationTable": "sms_messages",
      "sourceColumn": "user_id",
      "sourceTable": "users"
    },
    {
      "destinationColumn": "application_id",
      "destinationTable": "devices",
      "sourceColumn": "application_id",
      "sourceTable": "applications"
    },
    {
      "destinationColumn": "developer_id",
      "destinationTable": "reports",
      "sourceColumn": "developer_id",
      "sourceTable": "developers"
    },
    {
      "destinationColumn": "developer_id",
      "destinationTable": "label_formats",
      "sourceColumn": "developer_id",
      "sourceTable": "developers"
    }
  ]
};
