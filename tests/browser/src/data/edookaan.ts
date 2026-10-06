export const dataDictionaryJson = {
  "name": "Edookaan",
  "version": 1,
  "tables": {
    "abandoned_carts": {
      "tableName": "abandoned_carts",
      "tableColumns": {
        "abandoned_cart_id": {
          "columnName": "abandoned_cart_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Abandoned Cart Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "cart_id": {
          "columnName": "cart_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Cart"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "customer_id": {
          "columnName": "customer_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Customer"
            }
          }
        },
        "reminder_count": {
          "columnName": "reminder_count",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Reminders Sent"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "last_reminded_at": {
          "columnName": "last_reminded_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Last Reminded At"
            }
          }
        },
        "is_recovered": {
          "columnName": "is_recovered",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Recovered?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "abandoned_carts"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "abandoned_cart"
        }
      }
    },
    "brands": {
      "tableName": "brands",
      "tableColumns": {
        "brand_id": {
          "columnName": "brand_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Brand Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "brand_name": {
          "columnName": "brand_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Brand Name"
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
        "brand_slug": {
          "columnName": "brand_slug",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Brand Slug"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "logo_media_id": {
          "columnName": "logo_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Logo Media"
            }
          }
        },
        "website_url": {
          "columnName": "website_url",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Website URL"
            }
          }
        },
        "description": {
          "columnName": "description",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Description"
            }
          }
        },
        "is_featured": {
          "columnName": "is_featured",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Featured?"
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
        "master_brand_id": {
          "columnName": "master_brand_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master Brand"
            }
          }
        },
        "is_master_linked": {
          "columnName": "is_master_linked",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Master Linked?"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "brands"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "brand"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_brands"
        }
      }
    },
    "cart_items": {
      "tableName": "cart_items",
      "tableColumns": {
        "cart_item_id": {
          "columnName": "cart_item_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Cart Item Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "cart_id": {
          "columnName": "cart_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Cart"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "product_id": {
          "columnName": "product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "quantity": {
          "columnName": "quantity",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Quantity"
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
        "unit_price": {
          "columnName": "unit_price",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Unit Price"
            }
          }
        },
        "total_price": {
          "columnName": "total_price",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Total Price"
            }
          }
        },
        "selected_attributes_json": {
          "columnName": "selected_attributes_json",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Selected Attributes"
            }
          }
        },
        "added_at": {
          "columnName": "added_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Added At"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "cart_items"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "cart_item"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_cart_items"
        }
      }
    },
    "carts": {
      "tableName": "carts",
      "tableColumns": {
        "cart_id": {
          "columnName": "cart_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Cart Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "customer_id": {
          "columnName": "customer_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Customer"
            }
          }
        },
        "session_token": {
          "columnName": "session_token",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Session Token"
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
              "propertyValue": "USD"
            }
          }
        },
        "subtotal": {
          "columnName": "subtotal",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Subtotal"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0.0"
            }
          }
        },
        "discount_amount": {
          "columnName": "discount_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Discount Amount"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0.0"
            }
          }
        },
        "shipping_amount": {
          "columnName": "shipping_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Shipping Amount"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0.0"
            }
          }
        },
        "tax_amount": {
          "columnName": "tax_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Tax Amount"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0.0"
            }
          }
        },
        "grand_total": {
          "columnName": "grand_total",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Grand Total"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0.0"
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
        "expires_at": {
          "columnName": "expires_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Expires At"
            }
          }
        },
        "created_at": {
          "columnName": "created_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Created At"
            }
          }
        },
        "updated_at": {
          "columnName": "updated_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Updated At"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "carts"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "cart"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_carts"
        }
      }
    },
    "contact_inquiries": {
      "tableName": "contact_inquiries",
      "tableColumns": {
        "inquiry_id": {
          "columnName": "inquiry_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Inquiry Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "customer_id": {
          "columnName": "customer_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Customer"
            }
          }
        },
        "name": {
          "columnName": "name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Sender Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "email": {
          "columnName": "email",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Email"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "phone": {
          "columnName": "phone",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Phone"
            }
          }
        },
        "subject": {
          "columnName": "subject",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Subject"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "message": {
          "columnName": "message",
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
        "status": {
          "columnName": "status",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Status"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "NEW"
            }
          }
        },
        "created_at": {
          "columnName": "created_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Received At"
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
          "propertyValue": "contact_inquiries"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "contact_inquiry"
        }
      }
    },
    "coupon_issues": {
      "tableName": "coupon_issues",
      "tableColumns": {
        "coupon_issue_id": {
          "columnName": "coupon_issue_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Coupon Issue Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "coupon_id": {
          "columnName": "coupon_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Coupon"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "customer_id": {
          "columnName": "customer_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Customer"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "coupon_unique_code": {
          "columnName": "coupon_unique_code",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Unique Coupon Code"
            }
          }
        },
        "is_used": {
          "columnName": "is_used",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Used?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "issued_at": {
          "columnName": "issued_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Issued At"
            }
          }
        },
        "expires_at": {
          "columnName": "expires_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Expires At"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "coupon_issues"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "coupon_issues"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_coupon_issues"
        }
      }
    },
    "coupon_uses": {
      "tableName": "coupon_uses",
      "tableColumns": {
        "coupon_use_id": {
          "columnName": "coupon_use_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Coupon Use Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "coupon_id": {
          "columnName": "coupon_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Coupon"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "coupon_issue_id": {
          "columnName": "coupon_issue_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Coupon Issue"
            }
          }
        },
        "order_id": {
          "columnName": "order_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Order"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "customer_id": {
          "columnName": "customer_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Customer"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "discount_applied_amount": {
          "columnName": "discount_applied_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Discount Applied"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "used_at": {
          "columnName": "used_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Used At"
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
          "propertyValue": "coupon_uses"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "coupon_use"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_coupon_uses"
        }
      }
    },
    "coupons": {
      "tableName": "coupons",
      "tableColumns": {
        "coupon_id": {
          "columnName": "coupon_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Coupon Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "coupon_code": {
          "columnName": "coupon_code",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Coupon Code"
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
        "coupon_title": {
          "columnName": "coupon_title",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Coupon Title"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "discount_type": {
          "columnName": "discount_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Discount Type"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "PERCENTAGE"
            }
          }
        },
        "discount_value": {
          "columnName": "discount_value",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Discount Value"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "minimum_order_amount": {
          "columnName": "minimum_order_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Minimum Order Amount"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0.0"
            }
          }
        },
        "maximum_discount_amount": {
          "columnName": "maximum_discount_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Maximum Discount Amount"
            }
          }
        },
        "usage_limit_total": {
          "columnName": "usage_limit_total",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Total Usage Limit"
            }
          }
        },
        "usage_limit_per_customer": {
          "columnName": "usage_limit_per_customer",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Usage Limit Per Customer"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        },
        "used_count": {
          "columnName": "used_count",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Total Times Used"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "start_datetime": {
          "columnName": "start_datetime",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Start Datetime"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "end_datetime": {
          "columnName": "end_datetime",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "End Datetime"
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
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "coupons"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "coupon"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_coupons"
        }
      }
    },
    "customer_addresses": {
      "tableName": "customer_addresses",
      "tableColumns": {
        "customer_address_id": {
          "columnName": "customer_address_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Address Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "customer_id": {
          "columnName": "customer_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Customer"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "address_type": {
          "columnName": "address_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Address Type"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "BOTH"
            }
          }
        },
        "recipient_name": {
          "columnName": "recipient_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Recipient Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "phone_number": {
          "columnName": "phone_number",
          "columnType": "STRING",
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
        "company_name": {
          "columnName": "company_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Company Name"
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
            "REQUIRED": {
              "propertyName": "REQUIRED",
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
        "city_name": {
          "columnName": "city_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "City"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
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
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
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
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
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
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
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
              "propertyValue": "Address Label (e.g. Home, Office)"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "Home"
            }
          }
        },
        "is_default_shipping": {
          "columnName": "is_default_shipping",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Default Shipping?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "is_default_billing": {
          "columnName": "is_default_billing",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Default Billing?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "customer_addresses"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "customer_address"
        }
      }
    },
    "customer_auth_tokens": {
      "tableName": "customer_auth_tokens",
      "tableColumns": {
        "token_id": {
          "columnName": "token_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Token Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "customer_id": {
          "columnName": "customer_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Customer"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "auth_token": {
          "columnName": "auth_token",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Auth Token"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "refresh_token": {
          "columnName": "refresh_token",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Refresh Token"
            }
          }
        },
        "device_type": {
          "columnName": "device_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Device Type"
            }
          }
        },
        "ip_address": {
          "columnName": "ip_address",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "IP Address"
            }
          }
        },
        "expires_at": {
          "columnName": "expires_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Expires At"
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
          "propertyValue": "customer_auth_tokens"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "customer_auth_token"
        }
      }
    },
    "customer_wishlist_items": {
      "tableName": "customer_wishlist_items",
      "tableColumns": {
        "wishlist_item_id": {
          "columnName": "wishlist_item_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Wishlist Item Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "wishlist_id": {
          "columnName": "wishlist_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Wishlist"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "product_id": {
          "columnName": "product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "added_at": {
          "columnName": "added_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Added At"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "customer_wishlist_items"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "customer_wishlist_item"
        }
      }
    },
    "customer_wishlists": {
      "tableName": "customer_wishlists",
      "tableColumns": {
        "wishlist_id": {
          "columnName": "wishlist_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Wishlist Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "customer_id": {
          "columnName": "customer_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Customer"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "wishlist_name": {
          "columnName": "wishlist_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Wishlist Name"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "My Wishlist"
            }
          }
        },
        "is_public": {
          "columnName": "is_public",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Public?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "share_token": {
          "columnName": "share_token",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Share Token"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "customer_wishlists"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "customer_wishlist"
        }
      }
    },
    "customers": {
      "tableName": "customers",
      "tableColumns": {
        "customer_id": {
          "columnName": "customer_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Customer Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "customer_name": {
          "columnName": "customer_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Customer Name"
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
        "first_name": {
          "columnName": "first_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "First Name"
            }
          }
        },
        "last_name": {
          "columnName": "last_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Last Name"
            }
          }
        },
        "email": {
          "columnName": "email",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Email"
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
        "phone_number": {
          "columnName": "phone_number",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Phone Number"
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "password_hash": {
          "columnName": "password_hash",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Password Hash"
            }
          }
        },
        "is_email_verified": {
          "columnName": "is_email_verified",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Email Verified?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "is_phone_verified": {
          "columnName": "is_phone_verified",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Phone Verified?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "registered_at": {
          "columnName": "registered_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Registered At"
            }
          }
        },
        "last_login_at": {
          "columnName": "last_login_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Last Login At"
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
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "customers"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "customer"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_customers"
        }
      }
    },
    "master_attribute_groups": {
      "tableName": "master_attribute_groups",
      "tableColumns": {
        "master_attribute_group_id": {
          "columnName": "master_attribute_group_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Group Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "group_name": {
          "columnName": "group_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Group Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "group_code": {
          "columnName": "group_code",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Group Code"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "display_order": {
          "columnName": "display_order",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Display Order"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 0
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 1
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "master_attribute_groups"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "master_attribute_group"
        }
      }
    },
    "master_attribute_options": {
      "tableName": "master_attribute_options",
      "tableColumns": {
        "master_attribute_option_id": {
          "columnName": "master_attribute_option_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Option Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "master_attribute_id": {
          "columnName": "master_attribute_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Attribute Id"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "option_label": {
          "columnName": "option_label",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Option Label"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "option_value": {
          "columnName": "option_value",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Option Value"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "swatch_value": {
          "columnName": "swatch_value",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Swatch Value"
            }
          }
        },
        "display_order": {
          "columnName": "display_order",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Display Order"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 0
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 1
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "master_attribute_options"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "master_attribute_option"
        }
      }
    },
    "master_attributes": {
      "tableName": "master_attributes",
      "tableColumns": {
        "master_attribute_id": {
          "columnName": "master_attribute_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Attribute Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "master_attribute_group_id": {
          "columnName": "master_attribute_group_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Attribute Group"
            }
          }
        },
        "attribute_code": {
          "columnName": "attribute_code",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Attribute Code"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "attribute_label": {
          "columnName": "attribute_label",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Attribute Label"
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
        "input_type": {
          "columnName": "input_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Input Type"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "TEXT"
            }
          }
        },
        "unit_of_measure": {
          "columnName": "unit_of_measure",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Unit of Measure"
            }
          }
        },
        "is_filterable": {
          "columnName": "is_filterable",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Filterable"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 1
            }
          }
        },
        "is_variant_defining": {
          "columnName": "is_variant_defining",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Variant Defining"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 0
            }
          }
        },
        "is_comparable": {
          "columnName": "is_comparable",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Comparable"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 1
            }
          }
        },
        "display_order": {
          "columnName": "display_order",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Display Order"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 0
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 1
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "master_attributes"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "master_attribute"
        }
      }
    },
    "master_brands": {
      "tableName": "master_brands",
      "tableColumns": {
        "master_brand_id": {
          "columnName": "master_brand_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master Brand Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "brand_name": {
          "columnName": "brand_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Brand Name"
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
        "brand_slug": {
          "columnName": "brand_slug",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Brand Slug"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "logo_media_id": {
          "columnName": "logo_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Logo Media"
            }
          }
        },
        "banner_media_id": {
          "columnName": "banner_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Banner Media"
            }
          }
        },
        "description": {
          "columnName": "description",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Description"
            }
          }
        },
        "website_url": {
          "columnName": "website_url",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Website URL"
            }
          }
        },
        "country_of_origin": {
          "columnName": "country_of_origin",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Country of Origin"
            }
          }
        },
        "is_verified": {
          "columnName": "is_verified",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Verified"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 1
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 1
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "master_brands"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "master_brand"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_master_brands"
        }
      }
    },
    "master_categories": {
      "tableName": "master_categories",
      "tableColumns": {
        "master_category_id": {
          "columnName": "master_category_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master Category Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "parent_master_category_id": {
          "columnName": "parent_master_category_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Parent Category"
            }
          }
        },
        "category_name": {
          "columnName": "category_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Category Name"
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
        "category_slug": {
          "columnName": "category_slug",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Category Slug"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "category_path": {
          "columnName": "category_path",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Category Path"
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
        "image_media_id": {
          "columnName": "image_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Image Media"
            }
          }
        },
        "icon_code": {
          "columnName": "icon_code",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Icon Code"
            }
          }
        },
        "display_order": {
          "columnName": "display_order",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Display Order"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 0
            }
          }
        },
        "meta_title": {
          "columnName": "meta_title",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Meta Title"
            }
          }
        },
        "meta_description": {
          "columnName": "meta_description",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Meta Description"
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 1
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "master_categories"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "master_category"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_master_categories"
        }
      }
    },
    "master_category_attributes": {
      "tableName": "master_category_attributes",
      "tableColumns": {
        "category_attribute_id": {
          "columnName": "category_attribute_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Category Attribute Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "master_category_id": {
          "columnName": "master_category_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master Category Id"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "master_attribute_id": {
          "columnName": "master_attribute_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master Attribute Id"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "is_required": {
          "columnName": "is_required",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Required"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 0
            }
          }
        },
        "display_order": {
          "columnName": "display_order",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Display Order"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 0
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "master_category_attributes"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "master_category_attribute"
        }
      }
    },
    "master_filters": {
      "tableName": "master_filters",
      "tableColumns": {
        "master_filter_id": {
          "columnName": "master_filter_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Filter Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "master_category_id": {
          "columnName": "master_category_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master Category Id"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "master_attribute_id": {
          "columnName": "master_attribute_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master Attribute Id"
            }
          }
        },
        "filter_type": {
          "columnName": "filter_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Filter Type"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "ATTRIBUTE"
            }
          }
        },
        "filter_label": {
          "columnName": "filter_label",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Filter Label"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "widget_type": {
          "columnName": "widget_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Widget Type"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "CHECKBOX_LIST"
            }
          }
        },
        "display_order": {
          "columnName": "display_order",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Display Order"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 0
            }
          }
        },
        "is_collapsed_by_default": {
          "columnName": "is_collapsed_by_default",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Collapsed"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 0
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 1
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "master_filters"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "master_filter"
        }
      }
    },
    "master_product_attributes": {
      "tableName": "master_product_attributes",
      "tableColumns": {
        "master_product_attribute_id": {
          "columnName": "master_product_attribute_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product Attribute Id"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "master_product_id": {
          "columnName": "master_product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master Product Id"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "master_attribute_id": {
          "columnName": "master_attribute_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master Attribute Id"
            }
          }
        },
        "attribute_name": {
          "columnName": "attribute_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Attribute Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "attribute_value": {
          "columnName": "attribute_value",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Attribute Value"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "display_order": {
          "columnName": "display_order",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Display Order"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 0
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "master_product_attributes"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "master_product_attribute"
        }
      }
    },
    "master_product_faqs": {
      "tableName": "master_product_faqs",
      "tableColumns": {
        "master_faq_id": {
          "columnName": "master_faq_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master FAQ Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "master_product_id": {
          "columnName": "master_product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master Product Id"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "question_text": {
          "columnName": "question_text",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Question"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "answer_text": {
          "columnName": "answer_text",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Answer"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "display_order": {
          "columnName": "display_order",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Display Order"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 0
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 1
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "master_product_faqs"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "master_product_faq"
        }
      }
    },
    "master_product_medias": {
      "tableName": "master_product_medias",
      "tableColumns": {
        "master_product_media_id": {
          "columnName": "master_product_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product Media Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "master_product_id": {
          "columnName": "master_product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master Product Id"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
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
              "propertyValue": "Media Id"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "is_thumbnail": {
          "columnName": "is_thumbnail",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Thumbnail"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 0
            }
          }
        },
        "is_featured": {
          "columnName": "is_featured",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Featured"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 0
            }
          }
        },
        "display_order": {
          "columnName": "display_order",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Display Order"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 0
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "master_product_medias"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "master_product_media"
        }
      }
    },
    "master_products": {
      "tableName": "master_products",
      "tableColumns": {
        "master_product_id": {
          "columnName": "master_product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master Product Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "master_brand_id": {
          "columnName": "master_brand_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master Brand Id"
            }
          }
        },
        "master_category_id": {
          "columnName": "master_category_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master Category Id"
            }
          }
        },
        "product_name": {
          "columnName": "product_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product Name"
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
        "product_slug": {
          "columnName": "product_slug",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product Slug"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "master_sku": {
          "columnName": "master_sku",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master SKU"
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
        "barcode": {
          "columnName": "barcode",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Barcode / UPC"
            }
          }
        },
        "short_description": {
          "columnName": "short_description",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Short Description"
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
        "uom_name": {
          "columnName": "uom_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Unit of Measure"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "Unit"
            }
          }
        },
        "weight_grams": {
          "columnName": "weight_grams",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Weight (g)"
            },
            "DECIMAL_PLACES": {
              "propertyName": "DECIMAL_PLACES",
              "propertyValue": 2
            }
          }
        },
        "length_cm": {
          "columnName": "length_cm",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Length (cm)"
            },
            "DECIMAL_PLACES": {
              "propertyName": "DECIMAL_PLACES",
              "propertyValue": 2
            }
          }
        },
        "width_cm": {
          "columnName": "width_cm",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Width (cm)"
            },
            "DECIMAL_PLACES": {
              "propertyName": "DECIMAL_PLACES",
              "propertyValue": 2
            }
          }
        },
        "height_cm": {
          "columnName": "height_cm",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Height (cm)"
            },
            "DECIMAL_PLACES": {
              "propertyName": "DECIMAL_PLACES",
              "propertyValue": 2
            }
          }
        },
        "meta_title": {
          "columnName": "meta_title",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Meta Title"
            }
          }
        },
        "meta_description": {
          "columnName": "meta_description",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Meta Description"
            }
          }
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": 1
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "master_products"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "master_product"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_master_products"
        }
      }
    },
    "master_variant_groups": {
      "tableName": "master_variant_groups",
      "tableColumns": {
        "master_variant_group_id": {
          "columnName": "master_variant_group_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master Variant Group"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "master_variant_group_name": {
          "columnName": "master_variant_group_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master Variant Group"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "master_variant_groups"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "master_variant_group"
        }
      }
    },
    "master_variant_products": {
      "tableName": "master_variant_products",
      "tableColumns": {
        "master_variant_product_id": {
          "columnName": "master_variant_product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master Variant Product"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "master_variant_group_id": {
          "columnName": "master_variant_group_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master Variant Group"
            }
          }
        },
        "master_product_id": {
          "columnName": "master_product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master Product"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "master_variant_products"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "master_variant_product"
        }
      }
    },
    "medias": {
      "tableName": "medias",
      "tableColumns": {
        "media_id": {
          "columnName": "media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Media Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "media_url": {
          "columnName": "media_url",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Media URL"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "media_type": {
          "columnName": "media_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Media Type"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "IMAGE"
            }
          }
        },
        "mime_type": {
          "columnName": "mime_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "MIME Type"
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
        "file_size_bytes": {
          "columnName": "file_size_bytes",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "File Size (Bytes)"
            }
          }
        },
        "alt_text": {
          "columnName": "alt_text",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Alt Text"
            }
          }
        },
        "created_at": {
          "columnName": "created_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Created At"
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
    "newsletter_subscribers": {
      "tableName": "newsletter_subscribers",
      "tableColumns": {
        "subscriber_id": {
          "columnName": "subscriber_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Subscriber Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "email": {
          "columnName": "email",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Subscriber Email"
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
        "is_subscribed": {
          "columnName": "is_subscribed",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Subscribed?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        },
        "subscribed_at": {
          "columnName": "subscribed_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Subscribed At"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "newsletter_subscribers"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "newsletter_subscriber"
        }
      }
    },
    "offer_products": {
      "tableName": "offer_products",
      "tableColumns": {
        "offer_product_id": {
          "columnName": "offer_product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Offer Product Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "offer_id": {
          "columnName": "offer_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Offer"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "product_id": {
          "columnName": "product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "discount_percentage": {
          "columnName": "discount_percentage",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Discount (%)"
            }
          }
        },
        "discount_amount": {
          "columnName": "discount_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Discount Amount"
            }
          }
        },
        "special_price": {
          "columnName": "special_price",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Special Deal Price"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "offer_products"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "offer_product"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_offer_products"
        }
      }
    },
    "offers": {
      "tableName": "offers",
      "tableColumns": {
        "offer_id": {
          "columnName": "offer_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Offer Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "offer_name": {
          "columnName": "offer_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Offer Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "offer_type": {
          "columnName": "offer_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Offer Type"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "PERCENTAGE"
            }
          }
        },
        "banner_media_id": {
          "columnName": "banner_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Banner Media"
            }
          }
        },
        "start_datetime": {
          "columnName": "start_datetime",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Start Datetime"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "end_datetime": {
          "columnName": "end_datetime",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "End Datetime"
            }
          }
        },
        "terms_conditions": {
          "columnName": "terms_conditions",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Terms & Conditions"
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
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "offers"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "offer"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_offers"
        }
      }
    },
    "order_activity_logs": {
      "tableName": "order_activity_logs",
      "tableColumns": {
        "order_activity_log_id": {
          "columnName": "order_activity_log_id",
          "columnType": "UUID",
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
        "order_id": {
          "columnName": "order_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Order"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "previous_status": {
          "columnName": "previous_status",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Previous Status"
            }
          }
        },
        "new_status": {
          "columnName": "new_status",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "New Status"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "status_notes": {
          "columnName": "status_notes",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Notes"
            }
          }
        },
        "notified_customer": {
          "columnName": "notified_customer",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Notified Customer?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "created_by": {
          "columnName": "created_by",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Created By"
            }
          }
        },
        "created_at": {
          "columnName": "created_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Created At"
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
          "propertyValue": "order_activity_logs"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "order_activity_log"
        }
      }
    },
    "order_charges": {
      "tableName": "order_charges",
      "tableColumns": {
        "order_charge_id": {
          "columnName": "order_charge_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Order Charge Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "order_id": {
          "columnName": "order_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Order"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "charge_name": {
          "columnName": "charge_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Charge Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "charge_type": {
          "columnName": "charge_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Charge Type"
            }
          }
        },
        "charge_amount": {
          "columnName": "charge_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Amount"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "tax_rate_id": {
          "columnName": "tax_rate_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Tax Rate"
            }
          }
        },
        "tax_amount": {
          "columnName": "tax_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Tax Amount"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0.0"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "order_charges"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "order_charge"
        }
      }
    },
    "order_discounts": {
      "tableName": "order_discounts",
      "tableColumns": {
        "order_discount_id": {
          "columnName": "order_discount_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Order Discount Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "order_id": {
          "columnName": "order_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Order"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "coupon_id": {
          "columnName": "coupon_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Coupon"
            }
          }
        },
        "offer_id": {
          "columnName": "offer_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Offer"
            }
          }
        },
        "discount_title": {
          "columnName": "discount_title",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Discount Title"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "discount_amount": {
          "columnName": "discount_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Discount Amount"
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
          "propertyValue": "order_discounts"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "order_discount"
        }
      }
    },
    "order_fulfillments": {
      "tableName": "order_fulfillments",
      "tableColumns": {
        "fulfillment_id": {
          "columnName": "fulfillment_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Fulfillment Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "order_id": {
          "columnName": "order_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Order"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "fulfillment_number": {
          "columnName": "fulfillment_number",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Shipment Number"
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
        "courier_name": {
          "columnName": "courier_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Courier / Carrier"
            }
          }
        },
        "tracking_number": {
          "columnName": "tracking_number",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Tracking Number"
            }
          }
        },
        "tracking_url": {
          "columnName": "tracking_url",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Tracking URL"
            }
          }
        },
        "shipping_label_url": {
          "columnName": "shipping_label_url",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Shipping Label URL"
            }
          }
        },
        "fulfillment_status": {
          "columnName": "fulfillment_status",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Status"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "PENDING"
            }
          }
        },
        "shipped_at": {
          "columnName": "shipped_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Shipped At"
            }
          }
        },
        "delivered_at": {
          "columnName": "delivered_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Delivered At"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "order_fulfillments"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "order_fulfillment"
        }
      }
    },
    "order_payments": {
      "tableName": "order_payments",
      "tableColumns": {
        "order_payment_id": {
          "columnName": "order_payment_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Order Payment Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "order_id": {
          "columnName": "order_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Order"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "payment_gateway": {
          "columnName": "payment_gateway",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Payment Gateway"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "payment_amount": {
          "columnName": "payment_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Amount"
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
        "payment_status": {
          "columnName": "payment_status",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Status"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "PENDING"
            }
          }
        },
        "gateway_response_json": {
          "columnName": "gateway_response_json",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Gateway Response"
            }
          }
        },
        "payment_datetime": {
          "columnName": "payment_datetime",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Payment Datetime"
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
              "propertyValue": "Payment Method"
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
          "propertyValue": "order_payments"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "order_payment"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_order_payments"
        }
      }
    },
    "order_products": {
      "tableName": "order_products",
      "tableColumns": {
        "order_product_id": {
          "columnName": "order_product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Order Product Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "order_id": {
          "columnName": "order_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Order"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "product_id": {
          "columnName": "product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "unit_price": {
          "columnName": "unit_price",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Unit Price"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "cost_price": {
          "columnName": "cost_price",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Cost Price"
            }
          }
        },
        "quantity": {
          "columnName": "quantity",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Quantity"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "tax_rate_id": {
          "columnName": "tax_rate_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Tax Rate"
            }
          }
        },
        "tax_amount": {
          "columnName": "tax_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Tax Amount"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0.0"
            }
          }
        },
        "discount_amount": {
          "columnName": "discount_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Discount Amount"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0.0"
            }
          }
        },
        "total_amount": {
          "columnName": "total_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Total Amount"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "fulfillment_status": {
          "columnName": "fulfillment_status",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Fulfillment Status"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "UNFULFILLED"
            }
          }
        },
        "return_status": {
          "columnName": "return_status",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Return Status"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "NONE"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "order_products"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "order_product"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_order_products"
        }
      }
    },
    "order_refunds": {
      "tableName": "order_refunds",
      "tableColumns": {
        "refund_id": {
          "columnName": "refund_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Refund Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "order_id": {
          "columnName": "order_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Order"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "return_id": {
          "columnName": "return_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Return Request"
            }
          }
        },
        "order_payment_id": {
          "columnName": "order_payment_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Order Payment"
            }
          }
        },
        "refund_amount": {
          "columnName": "refund_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Refund Amount"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "refund_method": {
          "columnName": "refund_method",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Refund Method"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "GATEWAY"
            }
          }
        },
        "refund_status": {
          "columnName": "refund_status",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Refund Status"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "PENDING"
            }
          }
        },
        "refunded_at": {
          "columnName": "refunded_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Refunded At"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "order_refunds"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "order_refund"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_order_refunds"
        }
      }
    },
    "order_return_items": {
      "tableName": "order_return_items",
      "tableColumns": {
        "return_item_id": {
          "columnName": "return_item_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Return Item Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "return_id": {
          "columnName": "return_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Return Request"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "order_product_id": {
          "columnName": "order_product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Order Product"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "return_quantity": {
          "columnName": "return_quantity",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Quantity"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "return_reason": {
          "columnName": "return_reason",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Reason"
            }
          }
        },
        "item_condition": {
          "columnName": "item_condition",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Item Condition"
            }
          }
        },
        "refund_amount": {
          "columnName": "refund_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Refund Amount"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "order_return_items"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "order_return_item"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_order_return_items"
        }
      }
    },
    "order_returns": {
      "tableName": "order_returns",
      "tableColumns": {
        "return_id": {
          "columnName": "return_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Return Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "order_id": {
          "columnName": "order_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Order"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "customer_id": {
          "columnName": "customer_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Customer"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "return_number": {
          "columnName": "return_number",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "RMA Number"
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
        "return_status": {
          "columnName": "return_status",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Return Status"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "REQUESTED"
            }
          }
        },
        "return_reason": {
          "columnName": "return_reason",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Return Reason"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "refund_mode": {
          "columnName": "refund_mode",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Refund Mode"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "ORIGINAL_PAYMENT"
            }
          }
        },
        "requested_at": {
          "columnName": "requested_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Requested At"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "resolved_at": {
          "columnName": "resolved_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Resolved At"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "order_returns"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "order_return"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_order_returns"
        }
      }
    },
    "orders": {
      "tableName": "orders",
      "tableColumns": {
        "order_id": {
          "columnName": "order_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Order Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "customer_id": {
          "columnName": "customer_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Customer"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "order_number": {
          "columnName": "order_number",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Order Number"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
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
        "order_status": {
          "columnName": "order_status",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Order Status"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "PENDING"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "payment_status": {
          "columnName": "payment_status",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Payment Status"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "UNPAID"
            }
          }
        },
        "fulfillment_status": {
          "columnName": "fulfillment_status",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Fulfillment Status"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "UNFULFILLED"
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
              "propertyValue": "USD"
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
              "propertyValue": "1.0"
            }
          }
        },
        "subtotal_amount": {
          "columnName": "subtotal_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Subtotal"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "discount_amount": {
          "columnName": "discount_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Discount Amount"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0.0"
            }
          }
        },
        "tax_amount": {
          "columnName": "tax_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Tax Amount"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0.0"
            }
          }
        },
        "shipping_amount": {
          "columnName": "shipping_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Shipping Amount"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0.0"
            }
          }
        },
        "charges_amount": {
          "columnName": "charges_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Additional Charges"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0.0"
            }
          }
        },
        "grand_total_amount": {
          "columnName": "grand_total_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Grand Total"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "total_paid_amount": {
          "columnName": "total_paid_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Total Paid"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0.0"
            }
          }
        },
        "total_refunded_amount": {
          "columnName": "total_refunded_amount",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Total Refunded"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0.0"
            }
          }
        },
        "customer_notes": {
          "columnName": "customer_notes",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Customer Notes"
            }
          }
        },
        "admin_notes": {
          "columnName": "admin_notes",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Admin Notes"
            }
          }
        },
        "placed_at": {
          "columnName": "placed_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Placed At"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "cancelled_at": {
          "columnName": "cancelled_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Cancelled At"
            }
          }
        },
        "recipient_name": {
          "columnName": "recipient_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Recipient"
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
        "postal_code": {
          "columnName": "postal_code",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Postal Code"
            }
          }
        },
        "landmark": {
          "columnName": "landmark",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Landmark"
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
        "phone_number": {
          "columnName": "phone_number",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Phone"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "orders"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "order"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_orders"
        }
      }
    },
    "payment_methods": {
      "tableName": "payment_methods",
      "tableColumns": {
        "payment_method_id": {
          "columnName": "payment_method_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Payment Method Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "payment_method_name": {
          "columnName": "payment_method_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Payment Method Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "payment_method_code": {
          "columnName": "payment_method_code",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Method Code"
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
        "description": {
          "columnName": "description",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Description"
            }
          }
        },
        "image_media_id": {
          "columnName": "image_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Image Media"
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
          "propertyValue": "vw_payment_methods"
        }
      }
    },
    "product_attributes": {
      "tableName": "product_attributes",
      "tableColumns": {
        "attribute_id": {
          "columnName": "attribute_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Attribute Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "product_id": {
          "columnName": "product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "attribute_name": {
          "columnName": "attribute_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Attribute Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "attribute_value": {
          "columnName": "attribute_value",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Attribute Value"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "display_order": {
          "columnName": "display_order",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Display Order"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "product_attributes"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "product_attribute"
        }
      }
    },
    "product_categories": {
      "tableName": "product_categories",
      "tableColumns": {
        "category_id": {
          "columnName": "category_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Category Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "parent_category_id": {
          "columnName": "parent_category_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Parent Category"
            }
          }
        },
        "category_name": {
          "columnName": "category_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Category Name"
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
        "category_slug": {
          "columnName": "category_slug",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Category Slug"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
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
        "category_tree": {
          "columnName": "category_tree",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Category Tree"
            }
          }
        },
        "image_media_id": {
          "columnName": "image_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Image Media"
            }
          }
        },
        "display_order": {
          "columnName": "display_order",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Display Order"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "meta_title": {
          "columnName": "meta_title",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Meta Title"
            }
          }
        },
        "meta_description": {
          "columnName": "meta_description",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Meta Description"
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
        "master_category_id": {
          "columnName": "master_category_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master Category"
            }
          }
        },
        "is_master_linked": {
          "columnName": "is_master_linked",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Master Linked"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "product_categories"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "product_category"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_product_categories"
        }
      }
    },
    "product_faqs": {
      "tableName": "product_faqs",
      "tableColumns": {
        "faq_id": {
          "columnName": "faq_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "FAQ Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "product_id": {
          "columnName": "product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "question": {
          "columnName": "question",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Question"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "answer": {
          "columnName": "answer",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Answer"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "display_order": {
          "columnName": "display_order",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Display Order"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "is_published": {
          "columnName": "is_published",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Published?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "product_faqs"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "product_faq"
        }
      }
    },
    "product_inquiries": {
      "tableName": "product_inquiries",
      "tableColumns": {
        "inquiry_id": {
          "columnName": "inquiry_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Inquiry Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "product_id": {
          "columnName": "product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "customer_id": {
          "columnName": "customer_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Customer"
            }
          }
        },
        "customer_name": {
          "columnName": "customer_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Customer Name"
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
        "customer_phone": {
          "columnName": "customer_phone",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Phone Number"
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
        "customer_email": {
          "columnName": "customer_email",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Email"
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": true
            }
          }
        },
        "company_name": {
          "columnName": "company_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Company Name"
            }
          }
        },
        "quantity_requested": {
          "columnName": "quantity_requested",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Quantity Required"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        },
        "preferred_callback_time": {
          "columnName": "preferred_callback_time",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Preferred Callback Time"
            }
          }
        },
        "inquiry_message": {
          "columnName": "inquiry_message",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Inquiry Message / Requirement"
            }
          }
        },
        "status": {
          "columnName": "status",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Status"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "NEW"
            }
          }
        },
        "follow_up_date": {
          "columnName": "follow_up_date",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Follow Up Date"
            }
          }
        },
        "resolution_notes": {
          "columnName": "resolution_notes",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Resolution Notes"
            }
          }
        },
        "created_at": {
          "columnName": "created_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Submitted At"
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
          "propertyValue": "product_inquiries"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "product_inquiry"
        }
      }
    },
    "product_medias": {
      "tableName": "product_medias",
      "tableColumns": {
        "product_media_id": {
          "columnName": "product_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product Media Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "product_id": {
          "columnName": "product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
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
        },
        "is_thumbnail": {
          "columnName": "is_thumbnail",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Primary Thumbnail?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "is_featured": {
          "columnName": "is_featured",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Featured?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "display_order": {
          "columnName": "display_order",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Display Order"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "product_medias"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "product_media"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_product_medias"
        }
      }
    },
    "product_reviews": {
      "tableName": "product_reviews",
      "tableColumns": {
        "review_id": {
          "columnName": "review_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Rating Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "product_id": {
          "columnName": "product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "customer_id": {
          "columnName": "customer_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Customer"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "order_id": {
          "columnName": "order_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Order"
            }
          }
        },
        "rating_value": {
          "columnName": "rating_value",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Rating (1-5)"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "review_title": {
          "columnName": "review_title",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Review Title"
            }
          }
        },
        "review_text": {
          "columnName": "review_text",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Review Text"
            }
          }
        },
        "is_verified_purchase": {
          "columnName": "is_verified_purchase",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Verified Purchase?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "is_approved": {
          "columnName": "is_approved",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Approved?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "likes_count": {
          "columnName": "likes_count",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Helpful Likes"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "created_at": {
          "columnName": "created_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Created At"
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
          "propertyValue": "product_reviews"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "product_review"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_product_reviews"
        }
      }
    },
    "product_stocks": {
      "tableName": "product_stocks",
      "tableColumns": {
        "stock_id": {
          "columnName": "stock_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Stock Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "store_location_id": {
          "columnName": "store_location_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Warehouse / Location"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "product_id": {
          "columnName": "product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "quantity_on_hand": {
          "columnName": "quantity_on_hand",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Quantity On Hand"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "quantity_reserved": {
          "columnName": "quantity_reserved",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Quantity Reserved"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "low_stock_threshold": {
          "columnName": "low_stock_threshold",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Low Stock Threshold"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "5"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "product_stocks"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "product_stock"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_product_stocks"
        }
      }
    },
    "products": {
      "tableName": "products",
      "tableColumns": {
        "product_id": {
          "columnName": "product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "brand_id": {
          "columnName": "brand_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Brand"
            }
          }
        },
        "category_id": {
          "columnName": "category_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Category"
            }
          }
        },
        "product_sku": {
          "columnName": "product_sku",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "SKU"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
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
        "product_barcode": {
          "columnName": "product_barcode",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Barcode / UPC"
            }
          }
        },
        "product_name": {
          "columnName": "product_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product Name"
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
        "product_slug": {
          "columnName": "product_slug",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product Slug"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "product_type": {
          "columnName": "product_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product Type"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "SIMPLE"
            }
          }
        },
        "short_description": {
          "columnName": "short_description",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Short Description"
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
        "price_sale": {
          "columnName": "price_sale",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Selling Price"
            }
          }
        },
        "price_mrp": {
          "columnName": "price_mrp",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "MRP"
            }
          }
        },
        "cost_price": {
          "columnName": "cost_price",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Cost Price"
            }
          }
        },
        "uom_name": {
          "columnName": "uom_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Unit"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "PCS"
            }
          }
        },
        "is_inquiry_only": {
          "columnName": "is_inquiry_only",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Listing / Callback Only (No Direct Checkout)?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "hide_price": {
          "columnName": "hide_price",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Hide Price on Storefront?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "call_for_price_label": {
          "columnName": "call_for_price_label",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Call for Price Text"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "Price on Request"
            }
          }
        },
        "custom_cta_label": {
          "columnName": "custom_cta_label",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Custom CTA Button Text"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "Request Callback"
            }
          }
        },
        "weight_grams": {
          "columnName": "weight_grams",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Weight (g)"
            }
          }
        },
        "length_cm": {
          "columnName": "length_cm",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Length (cm)"
            }
          }
        },
        "width_cm": {
          "columnName": "width_cm",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Width (cm)"
            }
          }
        },
        "height_cm": {
          "columnName": "height_cm",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Height (cm)"
            }
          }
        },
        "track_inventory": {
          "columnName": "track_inventory",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Track Inventory?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        },
        "stock_quantity": {
          "columnName": "stock_quantity",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Stock Quantity"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "low_stock_threshold": {
          "columnName": "low_stock_threshold",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Low Stock Threshold"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "5"
            }
          }
        },
        "allow_backorders": {
          "columnName": "allow_backorders",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Allow Backorders?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "is_featured": {
          "columnName": "is_featured",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Featured?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "is_taxable": {
          "columnName": "is_taxable",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Taxable?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        },
        "tax_rate_id": {
          "columnName": "tax_rate_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Tax Rate"
            }
          }
        },
        "meta_title": {
          "columnName": "meta_title",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Meta Title"
            }
          }
        },
        "meta_description": {
          "columnName": "meta_description",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Meta Description"
            }
          }
        },
        "meta_keywords": {
          "columnName": "meta_keywords",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Meta Keywords"
            }
          }
        },
        "allow_return": {
          "columnName": "allow_return",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Allow Return?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        },
        "return_days": {
          "columnName": "return_days",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Return Days"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "7"
            }
          }
        },
        "delivery_available": {
          "columnName": "delivery_available",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Delivery Available?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        },
        "pickup_available": {
          "columnName": "pickup_available",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Pickup Available?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "published_at": {
          "columnName": "published_at",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Published At"
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
        "master_product_id": {
          "columnName": "master_product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Master Product"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "products"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "product"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_products"
        }
      }
    },
    "shipping_methods": {
      "tableName": "shipping_methods",
      "tableColumns": {
        "shipping_method_id": {
          "columnName": "shipping_method_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Shipping Method Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "method_name": {
          "columnName": "method_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Method Name (e.g. Standard, Express)"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "calculation_type": {
          "columnName": "calculation_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Calculation Type"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "FLAT"
            }
          }
        },
        "base_cost": {
          "columnName": "base_cost",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Base Cost"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "min_order_free_shipping": {
          "columnName": "min_order_free_shipping",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Free Shipping Min Order"
            }
          }
        },
        "per_kg_cost": {
          "columnName": "per_kg_cost",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Per Kg Cost"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0.0"
            }
          }
        },
        "estimated_days": {
          "columnName": "estimated_days",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Estimated Days"
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
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "shipping_methods"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "shipping_method"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_shipping_methods"
        }
      }
    },
    "store_locations": {
      "tableName": "store_locations",
      "tableColumns": {
        "store_location_id": {
          "columnName": "store_location_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store Location Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "is_primary_fulfillment": {
          "columnName": "is_primary_fulfillment",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Primary Fulfillment?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        },
        "allow_pickup": {
          "columnName": "allow_pickup",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Allow Store Pickup?"
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
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "store_locations"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "store_location"
        }
      }
    },
    "store_pages": {
      "tableName": "store_pages",
      "tableColumns": {
        "page_id": {
          "columnName": "page_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Page Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "page_title": {
          "columnName": "page_title",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Page Title"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "page_slug": {
          "columnName": "page_slug",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "URL Slug (e.g. about-us)"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "content_html": {
          "columnName": "content_html",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Page Content HTML"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "meta_title": {
          "columnName": "meta_title",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Meta Title"
            }
          }
        },
        "meta_description": {
          "columnName": "meta_description",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Meta Description"
            }
          }
        },
        "is_published": {
          "columnName": "is_published",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Published?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "1"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "store_pages"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "store_page"
        }
      }
    },
    "store_settings": {
      "tableName": "store_settings",
      "tableColumns": {
        "store_setting_id": {
          "columnName": "store_setting_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Setting Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "setting_group": {
          "columnName": "setting_group",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Group"
            }
          }
        },
        "setting_key": {
          "columnName": "setting_key",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Key"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "setting_text_value": {
          "columnName": "setting_text_value",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "String Value"
            }
          }
        },
        "setting_value_type": {
          "columnName": "setting_value_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Type"
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
          "propertyValue": "store_settings"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "store_setting"
        }
      }
    },
    "stores": {
      "tableName": "stores",
      "tableColumns": {
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "store_name": {
          "columnName": "store_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store Name"
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
        "store_code": {
          "columnName": "store_code",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store Code"
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
        "store_slug": {
          "columnName": "store_slug",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store Slug"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "website_url": {
          "columnName": "website_url",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Website URL"
            }
          }
        },
        "store_email": {
          "columnName": "store_email",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store Email"
            }
          }
        },
        "store_phone": {
          "columnName": "store_phone",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store Phone"
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
              "propertyValue": "USD"
            }
          }
        },
        "timezone": {
          "columnName": "timezone",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Timezone"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "UTC"
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
        "city": {
          "columnName": "city",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "City"
            }
          }
        },
        "state": {
          "columnName": "state",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "State"
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
            }
          }
        },
        "country": {
          "columnName": "country",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Country"
            }
          }
        },
        "tax_identifier": {
          "columnName": "tax_identifier",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Tax Identifier / GSTIN / VAT"
            }
          }
        },
        "order_number_prefix": {
          "columnName": "order_number_prefix",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Order Prefix"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "ORD-"
            }
          }
        },
        "logo_media_id": {
          "columnName": "logo_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Logo Media Id"
            }
          }
        },
        "favicon_media_id": {
          "columnName": "favicon_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Favicon Media Id"
            }
          }
        },
        "is_catalog_only": {
          "columnName": "is_catalog_only",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store Catalog Mode Only (Inquiry/Callback)?"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "0"
            }
          }
        },
        "default_inquiry_cta": {
          "columnName": "default_inquiry_cta",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Default Inquiry CTA"
            },
            "DEFAULT_VALUE": {
              "propertyName": "DEFAULT_VALUE",
              "propertyValue": "Request Callback"
            }
          }
        },
        "is_maintenance_mode": {
          "columnName": "is_maintenance_mode",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Maintenance Mode?"
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
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "stores"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "store"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_stores"
        }
      }
    },
    "tax_rates": {
      "tableName": "tax_rates",
      "tableColumns": {
        "tax_rate_id": {
          "columnName": "tax_rate_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Tax Rate Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "tax_rate_name": {
          "columnName": "tax_rate_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Rate Name"
            }
          }
        },
        "tax_rate_percentage": {
          "columnName": "tax_rate_percentage",
          "columnType": "DOUBLE",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Rate Percentage"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "tax_rates"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "tax_rate"
        }
      }
    },
    "variant_groups": {
      "tableName": "variant_groups",
      "tableColumns": {
        "variant_group_id": {
          "columnName": "variant_group_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Variant Group Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "variant_group_name": {
          "columnName": "variant_group_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Group Name"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Store"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "variant_groups"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "variant_group"
        }
      }
    },
    "variant_products": {
      "tableName": "variant_products",
      "tableColumns": {
        "variant_product_id": {
          "columnName": "variant_product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Variant Product Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "product_id": {
          "columnName": "product_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product"
            },
            "REQUIRED": {
              "propertyName": "REQUIRED",
              "propertyValue": true
            }
          }
        },
        "variant_group_id": {
          "columnName": "variant_group_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Variant Group"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "variant_products"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "variant_product"
        },
        "SQL_VIEW_NAME": {
          "propertyName": "SQL_VIEW_NAME",
          "propertyValue": "vw_products"
        }
      }
    }
  },
  "views": {
    "vw_brands": {
      "viewName": "vw_brands",
      "viewColumns": {
        "brand_id": {
          "columnName": "brand_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "brands",
          "columnSourceOriginalColumn": "brand_id"
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "brands",
          "columnSourceOriginalColumn": "store_id"
        },
        "brand_name": {
          "columnName": "brand_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "brands",
          "columnSourceOriginalColumn": "brand_name"
        },
        "brand_slug": {
          "columnName": "brand_slug",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "brands",
          "columnSourceOriginalColumn": "brand_slug"
        },
        "logo_media_id": {
          "columnName": "logo_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "brands",
          "columnSourceOriginalColumn": "logo_media_id"
        },
        "website_url": {
          "columnName": "website_url",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "brands",
          "columnSourceOriginalColumn": "website_url"
        },
        "description": {
          "columnName": "description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "brands",
          "columnSourceOriginalColumn": "description"
        },
        "is_featured": {
          "columnName": "is_featured",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "brands",
          "columnSourceOriginalColumn": "is_featured"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "brands",
          "columnSourceOriginalColumn": "is_active"
        },
        "master_brand_id": {
          "columnName": "master_brand_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "brands",
          "columnSourceOriginalColumn": "master_brand_id"
        },
        "is_master_linked": {
          "columnName": "is_master_linked",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "brands",
          "columnSourceOriginalColumn": "is_master_linked"
        }
      },
      "viewQuery": "SELECT * FROM brands"
    },
    "vw_cart_items": {
      "viewName": "vw_cart_items",
      "viewColumns": {
        "cart_item_id": {
          "columnName": "cart_item_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "cart_items",
          "columnSourceOriginalColumn": "cart_item_id"
        },
        "cart_id": {
          "columnName": "cart_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "cart_items",
          "columnSourceOriginalColumn": "cart_id"
        },
        "product_id": {
          "columnName": "product_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "cart_items",
          "columnSourceOriginalColumn": "product_id"
        },
        "quantity": {
          "columnName": "quantity",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "cart_items",
          "columnSourceOriginalColumn": "quantity"
        },
        "unit_price": {
          "columnName": "unit_price",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "cart_items",
          "columnSourceOriginalColumn": "unit_price"
        },
        "total_price": {
          "columnName": "total_price",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "cart_items",
          "columnSourceOriginalColumn": "total_price"
        },
        "selected_attributes_json": {
          "columnName": "selected_attributes_json",
          "columnType": "JSON",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "cart_items",
          "columnSourceOriginalColumn": "selected_attributes_json"
        },
        "added_at": {
          "columnName": "added_at",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "cart_items",
          "columnSourceOriginalColumn": "added_at"
        }
      },
      "viewQuery": "SELECT * FROM cart_items"
    },
    "vw_carts": {
      "viewName": "vw_carts",
      "viewColumns": {
        "cart_id": {
          "columnName": "cart_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "carts",
          "columnSourceOriginalColumn": "cart_id"
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "carts",
          "columnSourceOriginalColumn": "store_id"
        },
        "customer_id": {
          "columnName": "customer_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "carts",
          "columnSourceOriginalColumn": "customer_id"
        },
        "session_token": {
          "columnName": "session_token",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "carts",
          "columnSourceOriginalColumn": "session_token"
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "carts",
          "columnSourceOriginalColumn": "currency_code"
        },
        "subtotal": {
          "columnName": "subtotal",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "carts",
          "columnSourceOriginalColumn": "subtotal"
        },
        "discount_amount": {
          "columnName": "discount_amount",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "carts",
          "columnSourceOriginalColumn": "discount_amount"
        },
        "shipping_amount": {
          "columnName": "shipping_amount",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "carts",
          "columnSourceOriginalColumn": "shipping_amount"
        },
        "tax_amount": {
          "columnName": "tax_amount",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "carts",
          "columnSourceOriginalColumn": "tax_amount"
        },
        "grand_total": {
          "columnName": "grand_total",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "carts",
          "columnSourceOriginalColumn": "grand_total"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "carts",
          "columnSourceOriginalColumn": "is_active"
        },
        "expires_at": {
          "columnName": "expires_at",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "carts",
          "columnSourceOriginalColumn": "expires_at"
        },
        "created_at": {
          "columnName": "created_at",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "carts",
          "columnSourceOriginalColumn": "created_at"
        },
        "updated_at": {
          "columnName": "updated_at",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "carts",
          "columnSourceOriginalColumn": "updated_at"
        }
      },
      "viewQuery": "SELECT * FROM carts"
    },
    "vw_coupon_issues": {
      "viewName": "vw_coupon_issues",
      "viewColumns": {
        "coupon_issue_id": {
          "columnName": "coupon_issue_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupon_issues",
          "columnSourceOriginalColumn": "coupon_issue_id"
        },
        "coupon_id": {
          "columnName": "coupon_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupon_issues",
          "columnSourceOriginalColumn": "coupon_id"
        },
        "customer_id": {
          "columnName": "customer_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupon_issues",
          "columnSourceOriginalColumn": "customer_id"
        },
        "coupon_unique_code": {
          "columnName": "coupon_unique_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupon_issues",
          "columnSourceOriginalColumn": "coupon_unique_code"
        },
        "is_used": {
          "columnName": "is_used",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupon_issues",
          "columnSourceOriginalColumn": "is_used"
        },
        "issued_at": {
          "columnName": "issued_at",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupon_issues",
          "columnSourceOriginalColumn": "issued_at"
        },
        "expires_at": {
          "columnName": "expires_at",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupon_issues",
          "columnSourceOriginalColumn": "expires_at"
        }
      },
      "viewQuery": "SELECT * FROM coupon_issues"
    },
    "vw_coupon_uses": {
      "viewName": "vw_coupon_uses",
      "viewColumns": {
        "coupon_use_id": {
          "columnName": "coupon_use_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupon_uses",
          "columnSourceOriginalColumn": "coupon_use_id"
        },
        "coupon_id": {
          "columnName": "coupon_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupon_uses",
          "columnSourceOriginalColumn": "coupon_id"
        },
        "coupon_issue_id": {
          "columnName": "coupon_issue_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupon_uses",
          "columnSourceOriginalColumn": "coupon_issue_id"
        },
        "order_id": {
          "columnName": "order_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupon_uses",
          "columnSourceOriginalColumn": "order_id"
        },
        "customer_id": {
          "columnName": "customer_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupon_uses",
          "columnSourceOriginalColumn": "customer_id"
        },
        "discount_applied_amount": {
          "columnName": "discount_applied_amount",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupon_uses",
          "columnSourceOriginalColumn": "discount_applied_amount"
        },
        "used_at": {
          "columnName": "used_at",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupon_uses",
          "columnSourceOriginalColumn": "used_at"
        }
      },
      "viewQuery": "SELECT * FROM coupon_uses"
    },
    "vw_coupons": {
      "viewName": "vw_coupons",
      "viewColumns": {
        "coupon_id": {
          "columnName": "coupon_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupons",
          "columnSourceOriginalColumn": "coupon_id"
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupons",
          "columnSourceOriginalColumn": "store_id"
        },
        "coupon_code": {
          "columnName": "coupon_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupons",
          "columnSourceOriginalColumn": "coupon_code"
        },
        "coupon_title": {
          "columnName": "coupon_title",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupons",
          "columnSourceOriginalColumn": "coupon_title"
        },
        "discount_type": {
          "columnName": "discount_type",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupons",
          "columnSourceOriginalColumn": "discount_type"
        },
        "discount_value": {
          "columnName": "discount_value",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupons",
          "columnSourceOriginalColumn": "discount_value"
        },
        "minimum_order_amount": {
          "columnName": "minimum_order_amount",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupons",
          "columnSourceOriginalColumn": "minimum_order_amount"
        },
        "maximum_discount_amount": {
          "columnName": "maximum_discount_amount",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupons",
          "columnSourceOriginalColumn": "maximum_discount_amount"
        },
        "usage_limit_total": {
          "columnName": "usage_limit_total",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupons",
          "columnSourceOriginalColumn": "usage_limit_total"
        },
        "usage_limit_per_customer": {
          "columnName": "usage_limit_per_customer",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupons",
          "columnSourceOriginalColumn": "usage_limit_per_customer"
        },
        "used_count": {
          "columnName": "used_count",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupons",
          "columnSourceOriginalColumn": "used_count"
        },
        "start_datetime": {
          "columnName": "start_datetime",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupons",
          "columnSourceOriginalColumn": "start_datetime"
        },
        "end_datetime": {
          "columnName": "end_datetime",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupons",
          "columnSourceOriginalColumn": "end_datetime"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "coupons",
          "columnSourceOriginalColumn": "is_active"
        }
      },
      "viewQuery": "SELECT * FROM coupons"
    },
    "vw_customers": {
      "viewName": "vw_customers",
      "viewColumns": {
        "customer_id": {
          "columnName": "customer_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "customers",
          "columnSourceOriginalColumn": "customer_id"
        },
        "customer_name": {
          "columnName": "customer_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "customers",
          "columnSourceOriginalColumn": "customer_name"
        },
        "first_name": {
          "columnName": "first_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "customers",
          "columnSourceOriginalColumn": "first_name"
        },
        "last_name": {
          "columnName": "last_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "customers",
          "columnSourceOriginalColumn": "last_name"
        },
        "email": {
          "columnName": "email",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "customers",
          "columnSourceOriginalColumn": "email"
        },
        "phone_number": {
          "columnName": "phone_number",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "customers",
          "columnSourceOriginalColumn": "phone_number"
        },
        "password_hash": {
          "columnName": "password_hash",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "customers",
          "columnSourceOriginalColumn": "password_hash"
        },
        "is_email_verified": {
          "columnName": "is_email_verified",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "customers",
          "columnSourceOriginalColumn": "is_email_verified"
        },
        "is_phone_verified": {
          "columnName": "is_phone_verified",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "customers",
          "columnSourceOriginalColumn": "is_phone_verified"
        },
        "registered_at": {
          "columnName": "registered_at",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "customers",
          "columnSourceOriginalColumn": "registered_at"
        },
        "last_login_at": {
          "columnName": "last_login_at",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "customers",
          "columnSourceOriginalColumn": "last_login_at"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "customers",
          "columnSourceOriginalColumn": "is_active"
        }
      },
      "viewQuery": "SELECT * FROM customers"
    },
    "vw_master_brands": {
      "viewName": "vw_master_brands",
      "viewColumns": {
        "master_brand_id": {
          "columnName": "master_brand_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_brands",
          "columnSourceOriginalColumn": "master_brand_id"
        },
        "brand_name": {
          "columnName": "brand_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_brands",
          "columnSourceOriginalColumn": "brand_name"
        },
        "brand_slug": {
          "columnName": "brand_slug",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_brands",
          "columnSourceOriginalColumn": "brand_slug"
        },
        "logo_media_id": {
          "columnName": "logo_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_brands",
          "columnSourceOriginalColumn": "logo_media_id"
        },
        "banner_media_id": {
          "columnName": "banner_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_brands",
          "columnSourceOriginalColumn": "banner_media_id"
        },
        "description": {
          "columnName": "description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_brands",
          "columnSourceOriginalColumn": "description"
        },
        "website_url": {
          "columnName": "website_url",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_brands",
          "columnSourceOriginalColumn": "website_url"
        },
        "country_of_origin": {
          "columnName": "country_of_origin",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_brands",
          "columnSourceOriginalColumn": "country_of_origin"
        },
        "is_verified": {
          "columnName": "is_verified",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_brands",
          "columnSourceOriginalColumn": "is_verified"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_brands",
          "columnSourceOriginalColumn": "is_active"
        }
      },
      "viewQuery": "SELECT * FROM master_brands"
    },
    "vw_master_categories": {
      "viewName": "vw_master_categories",
      "viewColumns": {
        "master_category_id": {
          "columnName": "master_category_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_categories",
          "columnSourceOriginalColumn": "master_category_id"
        },
        "parent_master_category_id": {
          "columnName": "parent_master_category_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_categories",
          "columnSourceOriginalColumn": "parent_master_category_id"
        },
        "category_name": {
          "columnName": "category_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_categories",
          "columnSourceOriginalColumn": "category_name"
        },
        "category_slug": {
          "columnName": "category_slug",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_categories",
          "columnSourceOriginalColumn": "category_slug"
        },
        "category_path": {
          "columnName": "category_path",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_categories",
          "columnSourceOriginalColumn": "category_path"
        },
        "quick_description": {
          "columnName": "quick_description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_categories",
          "columnSourceOriginalColumn": "quick_description"
        },
        "full_description": {
          "columnName": "full_description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_categories",
          "columnSourceOriginalColumn": "full_description"
        },
        "image_media_id": {
          "columnName": "image_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_categories",
          "columnSourceOriginalColumn": "image_media_id"
        },
        "icon_code": {
          "columnName": "icon_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_categories",
          "columnSourceOriginalColumn": "icon_code"
        },
        "display_order": {
          "columnName": "display_order",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_categories",
          "columnSourceOriginalColumn": "display_order"
        },
        "meta_title": {
          "columnName": "meta_title",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_categories",
          "columnSourceOriginalColumn": "meta_title"
        },
        "meta_description": {
          "columnName": "meta_description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_categories",
          "columnSourceOriginalColumn": "meta_description"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_categories",
          "columnSourceOriginalColumn": "is_active"
        }
      },
      "viewQuery": "SELECT * FROM master_categories"
    },
    "vw_master_products": {
      "viewName": "vw_master_products",
      "viewColumns": {
        "master_product_id": {
          "columnName": "master_product_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_products",
          "columnSourceOriginalColumn": "master_product_id"
        },
        "master_brand_id": {
          "columnName": "master_brand_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_products",
          "columnSourceOriginalColumn": "master_brand_id"
        },
        "master_category_id": {
          "columnName": "master_category_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_products",
          "columnSourceOriginalColumn": "master_category_id"
        },
        "product_name": {
          "columnName": "product_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_products",
          "columnSourceOriginalColumn": "product_name"
        },
        "product_slug": {
          "columnName": "product_slug",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_products",
          "columnSourceOriginalColumn": "product_slug"
        },
        "master_sku": {
          "columnName": "master_sku",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_products",
          "columnSourceOriginalColumn": "master_sku"
        },
        "barcode": {
          "columnName": "barcode",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_products",
          "columnSourceOriginalColumn": "barcode"
        },
        "short_description": {
          "columnName": "short_description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_products",
          "columnSourceOriginalColumn": "short_description"
        },
        "full_description": {
          "columnName": "full_description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_products",
          "columnSourceOriginalColumn": "full_description"
        },
        "uom_name": {
          "columnName": "uom_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_products",
          "columnSourceOriginalColumn": "uom_name"
        },
        "weight_grams": {
          "columnName": "weight_grams",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_products",
          "columnSourceOriginalColumn": "weight_grams"
        },
        "length_cm": {
          "columnName": "length_cm",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_products",
          "columnSourceOriginalColumn": "length_cm"
        },
        "width_cm": {
          "columnName": "width_cm",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_products",
          "columnSourceOriginalColumn": "width_cm"
        },
        "height_cm": {
          "columnName": "height_cm",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_products",
          "columnSourceOriginalColumn": "height_cm"
        },
        "meta_title": {
          "columnName": "meta_title",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_products",
          "columnSourceOriginalColumn": "meta_title"
        },
        "meta_description": {
          "columnName": "meta_description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_products",
          "columnSourceOriginalColumn": "meta_description"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "master_products",
          "columnSourceOriginalColumn": "is_active"
        }
      },
      "viewQuery": "SELECT * FROM master_products"
    },
    "vw_offer_products": {
      "viewName": "vw_offer_products",
      "viewColumns": {
        "offer_product_id": {
          "columnName": "offer_product_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "offer_products",
          "columnSourceOriginalColumn": "offer_product_id"
        },
        "offer_id": {
          "columnName": "offer_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "offer_products",
          "columnSourceOriginalColumn": "offer_id"
        },
        "product_id": {
          "columnName": "product_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "offer_products",
          "columnSourceOriginalColumn": "product_id"
        },
        "discount_percentage": {
          "columnName": "discount_percentage",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "offer_products",
          "columnSourceOriginalColumn": "discount_percentage"
        },
        "discount_amount": {
          "columnName": "discount_amount",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "offer_products",
          "columnSourceOriginalColumn": "discount_amount"
        },
        "special_price": {
          "columnName": "special_price",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "offer_products",
          "columnSourceOriginalColumn": "special_price"
        }
      },
      "viewQuery": "SELECT * FROM offer_products"
    },
    "vw_offers": {
      "viewName": "vw_offers",
      "viewColumns": {
        "offer_id": {
          "columnName": "offer_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "offers",
          "columnSourceOriginalColumn": "offer_id"
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "offers",
          "columnSourceOriginalColumn": "store_id"
        },
        "offer_name": {
          "columnName": "offer_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "offers",
          "columnSourceOriginalColumn": "offer_name"
        },
        "offer_type": {
          "columnName": "offer_type",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "offers",
          "columnSourceOriginalColumn": "offer_type"
        },
        "banner_media_id": {
          "columnName": "banner_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "offers",
          "columnSourceOriginalColumn": "banner_media_id"
        },
        "start_datetime": {
          "columnName": "start_datetime",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "offers",
          "columnSourceOriginalColumn": "start_datetime"
        },
        "end_datetime": {
          "columnName": "end_datetime",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "offers",
          "columnSourceOriginalColumn": "end_datetime"
        },
        "terms_conditions": {
          "columnName": "terms_conditions",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "offers",
          "columnSourceOriginalColumn": "terms_conditions"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "offers",
          "columnSourceOriginalColumn": "is_active"
        }
      },
      "viewQuery": "SELECT * FROM offers"
    },
    "vw_order_payments": {
      "viewName": "vw_order_payments",
      "viewColumns": {
        "order_payment_id": {
          "columnName": "order_payment_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_payments",
          "columnSourceOriginalColumn": "order_payment_id"
        },
        "order_id": {
          "columnName": "order_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_payments",
          "columnSourceOriginalColumn": "order_id"
        },
        "payment_gateway": {
          "columnName": "payment_gateway",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_payments",
          "columnSourceOriginalColumn": "payment_gateway"
        },
        "payment_amount": {
          "columnName": "payment_amount",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_payments",
          "columnSourceOriginalColumn": "payment_amount"
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_payments",
          "columnSourceOriginalColumn": "currency_code"
        },
        "payment_status": {
          "columnName": "payment_status",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_payments",
          "columnSourceOriginalColumn": "payment_status"
        },
        "gateway_response_json": {
          "columnName": "gateway_response_json",
          "columnType": "JSON",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_payments",
          "columnSourceOriginalColumn": "gateway_response_json"
        },
        "payment_datetime": {
          "columnName": "payment_datetime",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_payments",
          "columnSourceOriginalColumn": "payment_datetime"
        },
        "payment_method_id": {
          "columnName": "payment_method_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_payments",
          "columnSourceOriginalColumn": "payment_method_id"
        }
      },
      "viewQuery": "SELECT * FROM order_payments"
    },
    "vw_order_products": {
      "viewName": "vw_order_products",
      "viewColumns": {
        "order_payment_id": {
          "columnName": "order_payment_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_payments",
          "columnSourceOriginalColumn": "order_payment_id"
        },
        "order_id": {
          "columnName": "order_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_payments",
          "columnSourceOriginalColumn": "order_id"
        },
        "payment_gateway": {
          "columnName": "payment_gateway",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_payments",
          "columnSourceOriginalColumn": "payment_gateway"
        },
        "payment_amount": {
          "columnName": "payment_amount",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_payments",
          "columnSourceOriginalColumn": "payment_amount"
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_payments",
          "columnSourceOriginalColumn": "currency_code"
        },
        "payment_status": {
          "columnName": "payment_status",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_payments",
          "columnSourceOriginalColumn": "payment_status"
        },
        "gateway_response_json": {
          "columnName": "gateway_response_json",
          "columnType": "JSON",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_payments",
          "columnSourceOriginalColumn": "gateway_response_json"
        },
        "payment_datetime": {
          "columnName": "payment_datetime",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_payments",
          "columnSourceOriginalColumn": "payment_datetime"
        },
        "payment_method_id": {
          "columnName": "payment_method_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_payments",
          "columnSourceOriginalColumn": "payment_method_id"
        }
      },
      "viewQuery": "SELECT * FROM order_payments"
    },
    "vw_order_refunds": {
      "viewName": "vw_order_refunds",
      "viewColumns": {
        "refund_id": {
          "columnName": "refund_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_refunds",
          "columnSourceOriginalColumn": "refund_id"
        },
        "order_id": {
          "columnName": "order_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_refunds",
          "columnSourceOriginalColumn": "order_id"
        },
        "return_id": {
          "columnName": "return_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_refunds",
          "columnSourceOriginalColumn": "return_id"
        },
        "order_payment_id": {
          "columnName": "order_payment_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_refunds",
          "columnSourceOriginalColumn": "order_payment_id"
        },
        "refund_amount": {
          "columnName": "refund_amount",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_refunds",
          "columnSourceOriginalColumn": "refund_amount"
        },
        "refund_method": {
          "columnName": "refund_method",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_refunds",
          "columnSourceOriginalColumn": "refund_method"
        },
        "refund_status": {
          "columnName": "refund_status",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_refunds",
          "columnSourceOriginalColumn": "refund_status"
        },
        "refunded_at": {
          "columnName": "refunded_at",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_refunds",
          "columnSourceOriginalColumn": "refunded_at"
        }
      },
      "viewQuery": "SELECT * FROM order_refunds"
    },
    "vw_order_return_items": {
      "viewName": "vw_order_return_items",
      "viewColumns": {
        "return_item_id": {
          "columnName": "return_item_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_return_items",
          "columnSourceOriginalColumn": "return_item_id"
        },
        "return_id": {
          "columnName": "return_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_return_items",
          "columnSourceOriginalColumn": "return_id"
        },
        "order_product_id": {
          "columnName": "order_product_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_return_items",
          "columnSourceOriginalColumn": "order_product_id"
        },
        "return_quantity": {
          "columnName": "return_quantity",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_return_items",
          "columnSourceOriginalColumn": "return_quantity"
        },
        "return_reason": {
          "columnName": "return_reason",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_return_items",
          "columnSourceOriginalColumn": "return_reason"
        },
        "item_condition": {
          "columnName": "item_condition",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_return_items",
          "columnSourceOriginalColumn": "item_condition"
        },
        "refund_amount": {
          "columnName": "refund_amount",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_return_items",
          "columnSourceOriginalColumn": "refund_amount"
        }
      },
      "viewQuery": "SELECT * FROM order_return_items"
    },
    "vw_order_returns": {
      "viewName": "vw_order_returns",
      "viewColumns": {
        "return_id": {
          "columnName": "return_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_returns",
          "columnSourceOriginalColumn": "return_id"
        },
        "order_id": {
          "columnName": "order_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_returns",
          "columnSourceOriginalColumn": "order_id"
        },
        "customer_id": {
          "columnName": "customer_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_returns",
          "columnSourceOriginalColumn": "customer_id"
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_returns",
          "columnSourceOriginalColumn": "store_id"
        },
        "return_number": {
          "columnName": "return_number",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_returns",
          "columnSourceOriginalColumn": "return_number"
        },
        "return_status": {
          "columnName": "return_status",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_returns",
          "columnSourceOriginalColumn": "return_status"
        },
        "return_reason": {
          "columnName": "return_reason",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_returns",
          "columnSourceOriginalColumn": "return_reason"
        },
        "refund_mode": {
          "columnName": "refund_mode",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_returns",
          "columnSourceOriginalColumn": "refund_mode"
        },
        "requested_at": {
          "columnName": "requested_at",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_returns",
          "columnSourceOriginalColumn": "requested_at"
        },
        "resolved_at": {
          "columnName": "resolved_at",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "order_returns",
          "columnSourceOriginalColumn": "resolved_at"
        }
      },
      "viewQuery": "SELECT * FROM order_returns"
    },
    "vw_orders": {
      "viewName": "vw_orders",
      "viewColumns": {
        "order_id": {
          "columnName": "order_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "order_id"
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "store_id"
        },
        "customer_id": {
          "columnName": "customer_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "customer_id"
        },
        "order_number": {
          "columnName": "order_number",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "order_number"
        },
        "order_status": {
          "columnName": "order_status",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "order_status"
        },
        "payment_status": {
          "columnName": "payment_status",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "payment_status"
        },
        "fulfillment_status": {
          "columnName": "fulfillment_status",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "fulfillment_status"
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "currency_code"
        },
        "exchange_rate": {
          "columnName": "exchange_rate",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "exchange_rate"
        },
        "subtotal_amount": {
          "columnName": "subtotal_amount",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "subtotal_amount"
        },
        "discount_amount": {
          "columnName": "discount_amount",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "discount_amount"
        },
        "tax_amount": {
          "columnName": "tax_amount",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "tax_amount"
        },
        "shipping_amount": {
          "columnName": "shipping_amount",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "shipping_amount"
        },
        "charges_amount": {
          "columnName": "charges_amount",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "charges_amount"
        },
        "grand_total_amount": {
          "columnName": "grand_total_amount",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "grand_total_amount"
        },
        "total_paid_amount": {
          "columnName": "total_paid_amount",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "total_paid_amount"
        },
        "total_refunded_amount": {
          "columnName": "total_refunded_amount",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "total_refunded_amount"
        },
        "customer_notes": {
          "columnName": "customer_notes",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "customer_notes"
        },
        "admin_notes": {
          "columnName": "admin_notes",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "admin_notes"
        },
        "placed_at": {
          "columnName": "placed_at",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "placed_at"
        },
        "cancelled_at": {
          "columnName": "cancelled_at",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "cancelled_at"
        },
        "recipient_name": {
          "columnName": "recipient_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "recipient_name"
        },
        "address_line_1": {
          "columnName": "address_line_1",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "address_line_1"
        },
        "address_line_2": {
          "columnName": "address_line_2",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "address_line_2"
        },
        "state_name": {
          "columnName": "state_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "state_name"
        },
        "city_name": {
          "columnName": "city_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "city_name"
        },
        "postal_code": {
          "columnName": "postal_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "postal_code"
        },
        "landmark": {
          "columnName": "landmark",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "landmark"
        },
        "country_name": {
          "columnName": "country_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "country_name"
        },
        "phone_number": {
          "columnName": "phone_number",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "orders",
          "columnSourceOriginalColumn": "phone_number"
        }
      },
      "viewQuery": "SELECT * FROM orders"
    },
    "vw_payment_methods": {
      "viewName": "vw_payment_methods",
      "viewColumns": {
        "payment_method_id": {
          "columnName": "payment_method_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "payment_methods",
          "columnSourceOriginalColumn": "payment_method_id"
        },
        "payment_method_name": {
          "columnName": "payment_method_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "payment_methods",
          "columnSourceOriginalColumn": "payment_method_name"
        },
        "payment_method_code": {
          "columnName": "payment_method_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "payment_methods",
          "columnSourceOriginalColumn": "payment_method_code"
        },
        "description": {
          "columnName": "description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "payment_methods",
          "columnSourceOriginalColumn": "description"
        },
        "image_media_id": {
          "columnName": "image_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "payment_methods",
          "columnSourceOriginalColumn": "image_media_id"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "payment_methods",
          "columnSourceOriginalColumn": "is_active"
        }
      },
      "viewQuery": "SELECT * FROM payment_methods"
    },
    "vw_product_categories": {
      "viewName": "vw_product_categories",
      "viewColumns": {
        "category_id": {
          "columnName": "category_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_categories",
          "columnSourceOriginalColumn": "category_id"
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_categories",
          "columnSourceOriginalColumn": "store_id"
        },
        "parent_category_id": {
          "columnName": "parent_category_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_categories",
          "columnSourceOriginalColumn": "parent_category_id"
        },
        "category_name": {
          "columnName": "category_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_categories",
          "columnSourceOriginalColumn": "category_name"
        },
        "category_slug": {
          "columnName": "category_slug",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_categories",
          "columnSourceOriginalColumn": "category_slug"
        },
        "quick_description": {
          "columnName": "quick_description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_categories",
          "columnSourceOriginalColumn": "quick_description"
        },
        "full_description": {
          "columnName": "full_description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_categories",
          "columnSourceOriginalColumn": "full_description"
        },
        "category_tree": {
          "columnName": "category_tree",
          "columnType": "JSON",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_categories",
          "columnSourceOriginalColumn": "category_tree"
        },
        "image_media_id": {
          "columnName": "image_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_categories",
          "columnSourceOriginalColumn": "image_media_id"
        },
        "display_order": {
          "columnName": "display_order",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_categories",
          "columnSourceOriginalColumn": "display_order"
        },
        "meta_title": {
          "columnName": "meta_title",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_categories",
          "columnSourceOriginalColumn": "meta_title"
        },
        "meta_description": {
          "columnName": "meta_description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_categories",
          "columnSourceOriginalColumn": "meta_description"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_categories",
          "columnSourceOriginalColumn": "is_active"
        },
        "master_category_id": {
          "columnName": "master_category_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_categories",
          "columnSourceOriginalColumn": "master_category_id"
        },
        "is_master_linked": {
          "columnName": "is_master_linked",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_categories",
          "columnSourceOriginalColumn": "is_master_linked"
        }
      },
      "viewQuery": "SELECT * FROM product_categories"
    },
    "vw_product_medias": {
      "viewName": "vw_product_medias",
      "viewColumns": {
        "product_media_id": {
          "columnName": "product_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_medias",
          "columnSourceOriginalColumn": "product_media_id"
        },
        "product_id": {
          "columnName": "product_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_medias",
          "columnSourceOriginalColumn": "product_id"
        },
        "media_id": {
          "columnName": "media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_medias",
          "columnSourceOriginalColumn": "media_id"
        },
        "is_thumbnail": {
          "columnName": "is_thumbnail",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_medias",
          "columnSourceOriginalColumn": "is_thumbnail"
        },
        "is_featured": {
          "columnName": "is_featured",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_medias",
          "columnSourceOriginalColumn": "is_featured"
        },
        "display_order": {
          "columnName": "display_order",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_medias",
          "columnSourceOriginalColumn": "display_order"
        }
      },
      "viewQuery": "SELECT * FROM product_medias"
    },
    "vw_product_reviews": {
      "viewName": "vw_product_reviews",
      "viewColumns": {
        "review_id": {
          "columnName": "review_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_reviews",
          "columnSourceOriginalColumn": "review_id"
        },
        "product_id": {
          "columnName": "product_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_reviews",
          "columnSourceOriginalColumn": "product_id"
        },
        "customer_id": {
          "columnName": "customer_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_reviews",
          "columnSourceOriginalColumn": "customer_id"
        },
        "order_id": {
          "columnName": "order_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_reviews",
          "columnSourceOriginalColumn": "order_id"
        },
        "rating_value": {
          "columnName": "rating_value",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_reviews",
          "columnSourceOriginalColumn": "rating_value"
        },
        "review_title": {
          "columnName": "review_title",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_reviews",
          "columnSourceOriginalColumn": "review_title"
        },
        "review_text": {
          "columnName": "review_text",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_reviews",
          "columnSourceOriginalColumn": "review_text"
        },
        "is_verified_purchase": {
          "columnName": "is_verified_purchase",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_reviews",
          "columnSourceOriginalColumn": "is_verified_purchase"
        },
        "is_approved": {
          "columnName": "is_approved",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_reviews",
          "columnSourceOriginalColumn": "is_approved"
        },
        "likes_count": {
          "columnName": "likes_count",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_reviews",
          "columnSourceOriginalColumn": "likes_count"
        },
        "created_at": {
          "columnName": "created_at",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_reviews",
          "columnSourceOriginalColumn": "created_at"
        }
      },
      "viewQuery": "SELECT * FROM product_reviews"
    },
    "vw_product_stocks": {
      "viewName": "vw_product_stocks",
      "viewColumns": {
        "stock_id": {
          "columnName": "stock_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_stocks",
          "columnSourceOriginalColumn": "stock_id"
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_stocks",
          "columnSourceOriginalColumn": "store_id"
        },
        "store_location_id": {
          "columnName": "store_location_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_stocks",
          "columnSourceOriginalColumn": "store_location_id"
        },
        "product_id": {
          "columnName": "product_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_stocks",
          "columnSourceOriginalColumn": "product_id"
        },
        "quantity_on_hand": {
          "columnName": "quantity_on_hand",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_stocks",
          "columnSourceOriginalColumn": "quantity_on_hand"
        },
        "quantity_reserved": {
          "columnName": "quantity_reserved",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_stocks",
          "columnSourceOriginalColumn": "quantity_reserved"
        },
        "low_stock_threshold": {
          "columnName": "low_stock_threshold",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "product_stocks",
          "columnSourceOriginalColumn": "low_stock_threshold"
        }
      },
      "viewQuery": "SELECT * FROM product_stocks"
    },
    "vw_products": {
      "viewName": "vw_products",
      "viewColumns": {
        "product_id": {
          "columnName": "product_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "product_id"
        },
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "store_id"
        },
        "brand_id": {
          "columnName": "brand_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "brand_id"
        },
        "category_id": {
          "columnName": "category_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "category_id"
        },
        "product_sku": {
          "columnName": "product_sku",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "product_sku"
        },
        "product_barcode": {
          "columnName": "product_barcode",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "product_barcode"
        },
        "product_name": {
          "columnName": "product_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "product_name"
        },
        "product_slug": {
          "columnName": "product_slug",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "product_slug"
        },
        "product_type": {
          "columnName": "product_type",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "product_type"
        },
        "short_description": {
          "columnName": "short_description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "short_description"
        },
        "full_description": {
          "columnName": "full_description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "full_description"
        },
        "price_sale": {
          "columnName": "price_sale",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "price_sale"
        },
        "price_mrp": {
          "columnName": "price_mrp",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "price_mrp"
        },
        "cost_price": {
          "columnName": "cost_price",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "cost_price"
        },
        "uom_name": {
          "columnName": "uom_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "uom_name"
        },
        "is_inquiry_only": {
          "columnName": "is_inquiry_only",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "is_inquiry_only"
        },
        "hide_price": {
          "columnName": "hide_price",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "hide_price"
        },
        "call_for_price_label": {
          "columnName": "call_for_price_label",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "call_for_price_label"
        },
        "custom_cta_label": {
          "columnName": "custom_cta_label",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "custom_cta_label"
        },
        "weight_grams": {
          "columnName": "weight_grams",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "weight_grams"
        },
        "length_cm": {
          "columnName": "length_cm",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "length_cm"
        },
        "width_cm": {
          "columnName": "width_cm",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "width_cm"
        },
        "height_cm": {
          "columnName": "height_cm",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "height_cm"
        },
        "track_inventory": {
          "columnName": "track_inventory",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "track_inventory"
        },
        "stock_quantity": {
          "columnName": "stock_quantity",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "stock_quantity"
        },
        "low_stock_threshold": {
          "columnName": "low_stock_threshold",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "low_stock_threshold"
        },
        "allow_backorders": {
          "columnName": "allow_backorders",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "allow_backorders"
        },
        "is_featured": {
          "columnName": "is_featured",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "is_featured"
        },
        "is_taxable": {
          "columnName": "is_taxable",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "is_taxable"
        },
        "tax_rate_id": {
          "columnName": "tax_rate_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "tax_rate_id"
        },
        "meta_title": {
          "columnName": "meta_title",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "meta_title"
        },
        "meta_description": {
          "columnName": "meta_description",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "meta_description"
        },
        "meta_keywords": {
          "columnName": "meta_keywords",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "meta_keywords"
        },
        "allow_return": {
          "columnName": "allow_return",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "allow_return"
        },
        "return_days": {
          "columnName": "return_days",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "return_days"
        },
        "delivery_available": {
          "columnName": "delivery_available",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "delivery_available"
        },
        "pickup_available": {
          "columnName": "pickup_available",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "pickup_available"
        },
        "published_at": {
          "columnName": "published_at",
          "columnType": "DATETIME",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "published_at"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "is_active"
        },
        "master_product_id": {
          "columnName": "master_product_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "products",
          "columnSourceOriginalColumn": "master_product_id"
        }
      },
      "viewQuery": "SELECT * FROM products"
    },
    "vw_shipping_methods": {
      "viewName": "vw_shipping_methods",
      "viewColumns": {
        "shipping_method_id": {
          "columnName": "shipping_method_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "shipping_methods",
          "columnSourceOriginalColumn": "shipping_method_id"
        },
        "method_name": {
          "columnName": "method_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "shipping_methods",
          "columnSourceOriginalColumn": "method_name"
        },
        "calculation_type": {
          "columnName": "calculation_type",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "shipping_methods",
          "columnSourceOriginalColumn": "calculation_type"
        },
        "base_cost": {
          "columnName": "base_cost",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "shipping_methods",
          "columnSourceOriginalColumn": "base_cost"
        },
        "min_order_free_shipping": {
          "columnName": "min_order_free_shipping",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "shipping_methods",
          "columnSourceOriginalColumn": "min_order_free_shipping"
        },
        "per_kg_cost": {
          "columnName": "per_kg_cost",
          "columnType": "DOUBLE",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "shipping_methods",
          "columnSourceOriginalColumn": "per_kg_cost"
        },
        "estimated_days": {
          "columnName": "estimated_days",
          "columnType": "INTEGER",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "shipping_methods",
          "columnSourceOriginalColumn": "estimated_days"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "shipping_methods",
          "columnSourceOriginalColumn": "is_active"
        }
      },
      "viewQuery": "SELECT * FROM shipping_methods"
    },
    "vw_stores": {
      "viewName": "vw_stores",
      "viewColumns": {
        "store_id": {
          "columnName": "store_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "store_id"
        },
        "store_name": {
          "columnName": "store_name",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "store_name"
        },
        "store_code": {
          "columnName": "store_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "store_code"
        },
        "store_slug": {
          "columnName": "store_slug",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "store_slug"
        },
        "website_url": {
          "columnName": "website_url",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "website_url"
        },
        "store_email": {
          "columnName": "store_email",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "store_email"
        },
        "store_phone": {
          "columnName": "store_phone",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "store_phone"
        },
        "currency_code": {
          "columnName": "currency_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "currency_code"
        },
        "timezone": {
          "columnName": "timezone",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "timezone"
        },
        "address_line_1": {
          "columnName": "address_line_1",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "address_line_1"
        },
        "address_line_2": {
          "columnName": "address_line_2",
          "columnType": "TEXT",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "address_line_2"
        },
        "city": {
          "columnName": "city",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "city"
        },
        "state": {
          "columnName": "state",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "state"
        },
        "postal_code": {
          "columnName": "postal_code",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "postal_code"
        },
        "country": {
          "columnName": "country",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "country"
        },
        "tax_identifier": {
          "columnName": "tax_identifier",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "tax_identifier"
        },
        "order_number_prefix": {
          "columnName": "order_number_prefix",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "order_number_prefix"
        },
        "logo_media_id": {
          "columnName": "logo_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "logo_media_id"
        },
        "favicon_media_id": {
          "columnName": "favicon_media_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "favicon_media_id"
        },
        "is_catalog_only": {
          "columnName": "is_catalog_only",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "is_catalog_only"
        },
        "default_inquiry_cta": {
          "columnName": "default_inquiry_cta",
          "columnType": "STRING",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "default_inquiry_cta"
        },
        "is_maintenance_mode": {
          "columnName": "is_maintenance_mode",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "is_maintenance_mode"
        },
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "stores",
          "columnSourceOriginalColumn": "is_active"
        }
      },
      "viewQuery": "SELECT * FROM stores"
    },
    "vw_variant_products": {
      "viewName": "vw_variant_products",
      "viewColumns": {
        "variant_product_id": {
          "columnName": "variant_product_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "variant_products",
          "columnSourceOriginalColumn": "variant_product_id"
        },
        "product_id": {
          "columnName": "product_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "variant_products",
          "columnSourceOriginalColumn": "product_id"
        },
        "variant_group_id": {
          "columnName": "variant_group_id",
          "columnType": "UUID",
          "columnProperties": {},
          "columnSource": "table",
          "columnSourceName": "variant_products",
          "columnSourceOriginalColumn": "variant_group_id"
        }
      },
      "viewQuery": "SELECT * FROM variant_products"
    }
  },
  "relationships": [
    {
      "destinationColumn": "cart_id",
      "destinationTable": "abandoned_carts",
      "sourceColumn": "cart_id",
      "sourceTable": "carts"
    },
    {
      "destinationColumn": "customer_id",
      "destinationTable": "abandoned_carts",
      "sourceColumn": "customer_id",
      "sourceTable": "customers"
    },
    {
      "destinationColumn": "store_id",
      "destinationTable": "brands",
      "sourceColumn": "store_id",
      "sourceTable": "stores"
    },
    {
      "destinationColumn": "logo_media_id",
      "destinationTable": "brands",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "master_brand_id",
      "destinationTable": "brands",
      "sourceColumn": "master_brand_id",
      "sourceTable": "master_brands"
    },
    {
      "destinationColumn": "cart_id",
      "destinationTable": "cart_items",
      "sourceColumn": "cart_id",
      "sourceTable": "carts"
    },
    {
      "destinationColumn": "product_id",
      "destinationTable": "cart_items",
      "sourceColumn": "product_id",
      "sourceTable": "products"
    },
    {
      "destinationColumn": "store_id",
      "destinationTable": "carts",
      "sourceColumn": "store_id",
      "sourceTable": "stores"
    },
    {
      "destinationColumn": "customer_id",
      "destinationTable": "carts",
      "sourceColumn": "customer_id",
      "sourceTable": "customers"
    },
    {
      "destinationColumn": "customer_id",
      "destinationTable": "contact_inquiries",
      "sourceColumn": "customer_id",
      "sourceTable": "customers"
    },
    {
      "destinationColumn": "store_id",
      "destinationTable": "contact_inquiries",
      "sourceColumn": "store_id",
      "sourceTable": "stores"
    },
    {
      "destinationColumn": "coupon_id",
      "destinationTable": "coupon_issues",
      "sourceColumn": "coupon_id",
      "sourceTable": "coupons"
    },
    {
      "destinationColumn": "customer_id",
      "destinationTable": "coupon_issues",
      "sourceColumn": "customer_id",
      "sourceTable": "customers"
    },
    {
      "destinationColumn": "coupon_id",
      "destinationTable": "coupon_uses",
      "sourceColumn": "coupon_id",
      "sourceTable": "coupons"
    },
    {
      "destinationColumn": "coupon_issue_id",
      "destinationTable": "coupon_uses",
      "sourceColumn": "coupon_issue_id",
      "sourceTable": "coupon_issues"
    },
    {
      "destinationColumn": "order_id",
      "destinationTable": "coupon_uses",
      "sourceColumn": "order_id",
      "sourceTable": "orders"
    },
    {
      "destinationColumn": "customer_id",
      "destinationTable": "coupon_uses",
      "sourceColumn": "customer_id",
      "sourceTable": "customers"
    },
    {
      "destinationColumn": "store_id",
      "destinationTable": "coupons",
      "sourceColumn": "store_id",
      "sourceTable": "stores"
    },
    {
      "destinationColumn": "customer_id",
      "destinationTable": "customer_addresses",
      "sourceColumn": "customer_id",
      "sourceTable": "customers"
    },
    {
      "destinationColumn": "customer_id",
      "destinationTable": "customer_auth_tokens",
      "sourceColumn": "customer_id",
      "sourceTable": "customers"
    },
    {
      "destinationColumn": "wishlist_id",
      "destinationTable": "customer_wishlist_items",
      "sourceColumn": "wishlist_id",
      "sourceTable": "customer_wishlists"
    },
    {
      "destinationColumn": "product_id",
      "destinationTable": "customer_wishlist_items",
      "sourceColumn": "product_id",
      "sourceTable": "products"
    },
    {
      "destinationColumn": "customer_id",
      "destinationTable": "customer_wishlists",
      "sourceColumn": "customer_id",
      "sourceTable": "customers"
    },
    {
      "destinationColumn": "store_id",
      "destinationTable": "customer_wishlists",
      "sourceColumn": "store_id",
      "sourceTable": "stores"
    },
    {
      "destinationColumn": "master_attribute_group_id",
      "destinationTable": "master_attributes",
      "sourceColumn": "master_attribute_group_id",
      "sourceTable": "master_attribute_groups"
    },
    {
      "destinationColumn": "logo_media_id",
      "destinationTable": "master_brands",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "banner_media_id",
      "destinationTable": "master_brands",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "parent_master_category_id",
      "destinationTable": "master_categories",
      "sourceColumn": "master_category_id",
      "sourceTable": "master_categories"
    },
    {
      "destinationColumn": "image_media_id",
      "destinationTable": "master_categories",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "master_category_id",
      "destinationTable": "master_category_attributes",
      "sourceColumn": "master_category_id",
      "sourceTable": "master_categories"
    },
    {
      "destinationColumn": "master_attribute_id",
      "destinationTable": "master_category_attributes",
      "sourceColumn": "master_attribute_id",
      "sourceTable": "master_attributes"
    },
    {
      "destinationColumn": "master_category_id",
      "destinationTable": "master_filters",
      "sourceColumn": "master_category_id",
      "sourceTable": "master_categories"
    },
    {
      "destinationColumn": "master_attribute_id",
      "destinationTable": "master_filters",
      "sourceColumn": "master_attribute_id",
      "sourceTable": "master_filters"
    },
    {
      "destinationColumn": "master_product_id",
      "destinationTable": "master_product_attributes",
      "sourceColumn": "master_product_id",
      "sourceTable": "master_products"
    },
    {
      "destinationColumn": "master_attribute_id",
      "destinationTable": "master_product_attributes",
      "sourceColumn": "master_attribute_id",
      "sourceTable": "master_attributes"
    },
    {
      "destinationColumn": "master_product_id",
      "destinationTable": "master_product_faqs",
      "sourceColumn": "master_product_id",
      "sourceTable": "master_products"
    },
    {
      "destinationColumn": "master_product_id",
      "destinationTable": "master_product_medias",
      "sourceColumn": "master_product_id",
      "sourceTable": "master_products"
    },
    {
      "destinationColumn": "media_id",
      "destinationTable": "master_product_medias",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "master_brand_id",
      "destinationTable": "master_products",
      "sourceColumn": "master_brand_id",
      "sourceTable": "master_brands"
    },
    {
      "destinationColumn": "master_category_id",
      "destinationTable": "master_products",
      "sourceColumn": "master_category_id",
      "sourceTable": "master_categories"
    },
    {
      "destinationColumn": "store_id",
      "destinationTable": "medias",
      "sourceColumn": "store_id",
      "sourceTable": "stores"
    },
    {
      "destinationColumn": "store_id",
      "destinationTable": "newsletter_subscribers",
      "sourceColumn": "store_id",
      "sourceTable": "stores"
    },
    {
      "destinationColumn": "offer_id",
      "destinationTable": "offer_products",
      "sourceColumn": "offer_id",
      "sourceTable": "offers"
    },
    {
      "destinationColumn": "product_id",
      "destinationTable": "offer_products",
      "sourceColumn": "product_id",
      "sourceTable": "products"
    },
    {
      "destinationColumn": "store_id",
      "destinationTable": "offers",
      "sourceColumn": "store_id",
      "sourceTable": "stores"
    },
    {
      "destinationColumn": "banner_media_id",
      "destinationTable": "offers",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "store_id",
      "destinationTable": "orders",
      "sourceColumn": "store_id",
      "sourceTable": "stores"
    },
    {
      "destinationColumn": "customer_id",
      "destinationTable": "orders",
      "sourceColumn": "customer_id",
      "sourceTable": "customers"
    },
    {
      "destinationColumn": "order_id",
      "destinationTable": "order_charges",
      "sourceColumn": "order_id",
      "sourceTable": "orders"
    },
    {
      "destinationColumn": "order_id",
      "destinationTable": "order_discounts",
      "sourceColumn": "order_id",
      "sourceTable": "orders"
    },
    {
      "destinationColumn": "coupon_id",
      "destinationTable": "order_discounts",
      "sourceColumn": "coupon_id",
      "sourceTable": "coupons"
    },
    {
      "destinationColumn": "offer_id",
      "destinationTable": "order_discounts",
      "sourceColumn": "offer_id",
      "sourceTable": "offers"
    },
    {
      "destinationColumn": "order_id",
      "destinationTable": "order_fulfillments",
      "sourceColumn": "order_id",
      "sourceTable": "orders"
    },
    {
      "destinationColumn": "store_id",
      "destinationTable": "order_fulfillments",
      "sourceColumn": "store_id",
      "sourceTable": "stores"
    },
    {
      "destinationColumn": "order_id",
      "destinationTable": "order_payments",
      "sourceColumn": "order_id",
      "sourceTable": "orders"
    },
    {
      "destinationColumn": "order_id",
      "destinationTable": "order_products",
      "sourceColumn": "order_id",
      "sourceTable": "orders"
    },
    {
      "destinationColumn": "product_id",
      "destinationTable": "order_products",
      "sourceColumn": "product_id",
      "sourceTable": "products"
    },
    {
      "destinationColumn": "return_id",
      "destinationTable": "order_refunds",
      "sourceColumn": "return_id",
      "sourceTable": "order_returns"
    },
    {
      "destinationColumn": "order_id",
      "destinationTable": "order_refunds",
      "sourceColumn": "order_id",
      "sourceTable": "orders"
    },
    {
      "destinationColumn": "order_payment_id",
      "destinationTable": "order_refunds",
      "sourceColumn": "order_payment_id",
      "sourceTable": "order_payments"
    },
    {
      "destinationColumn": "return_id",
      "destinationTable": "order_return_items",
      "sourceColumn": "return_id",
      "sourceTable": "order_returns"
    },
    {
      "destinationColumn": "order_product_id",
      "destinationTable": "order_return_items",
      "sourceColumn": "order_product_id",
      "sourceTable": "order_products"
    },
    {
      "destinationColumn": "order_id",
      "destinationTable": "order_returns",
      "sourceColumn": "order_id",
      "sourceTable": "orders"
    },
    {
      "destinationColumn": "customer_id",
      "destinationTable": "order_returns",
      "sourceColumn": "customer_id",
      "sourceTable": "customers"
    },
    {
      "destinationColumn": "store_id",
      "destinationTable": "order_returns",
      "sourceColumn": "store_id",
      "sourceTable": "stores"
    },
    {
      "destinationColumn": "order_id",
      "destinationTable": "order_activity_logs",
      "sourceColumn": "order_id",
      "sourceTable": "orders"
    },
    {
      "destinationColumn": "payment_method_id",
      "destinationTable": "order_payments",
      "sourceColumn": "payment_method_id",
      "sourceTable": "payment_methods"
    },
    {
      "destinationColumn": "image_media_id",
      "destinationTable": "payment_methods",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "product_id",
      "destinationTable": "product_attributes",
      "sourceColumn": "product_id",
      "sourceTable": "products"
    },
    {
      "destinationColumn": "store_id",
      "destinationTable": "product_categories",
      "sourceColumn": "store_id",
      "sourceTable": "stores"
    },
    {
      "destinationColumn": "parent_category_id",
      "destinationTable": "product_categories",
      "sourceColumn": "category_id",
      "sourceTable": "product_categories"
    },
    {
      "destinationColumn": "image_media_id",
      "destinationTable": "product_categories",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "master_category_id",
      "destinationTable": "product_categories",
      "sourceColumn": "master_category_id",
      "sourceTable": "master_categories"
    },
    {
      "destinationColumn": "product_id",
      "destinationTable": "product_faqs",
      "sourceColumn": "product_id",
      "sourceTable": "products"
    },
    {
      "destinationColumn": "store_id",
      "destinationTable": "product_inquiries",
      "sourceColumn": "store_id",
      "sourceTable": "stores"
    },
    {
      "destinationColumn": "product_id",
      "destinationTable": "product_inquiries",
      "sourceColumn": "product_id",
      "sourceTable": "products"
    },
    {
      "destinationColumn": "customer_id",
      "destinationTable": "product_inquiries",
      "sourceColumn": "customer_id",
      "sourceTable": "customers"
    },
    {
      "destinationColumn": "product_id",
      "destinationTable": "product_medias",
      "sourceColumn": "product_id",
      "sourceTable": "products"
    },
    {
      "destinationColumn": "media_id",
      "destinationTable": "product_medias",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "product_id",
      "destinationTable": "product_reviews",
      "sourceColumn": "product_id",
      "sourceTable": "products"
    },
    {
      "destinationColumn": "customer_id",
      "destinationTable": "product_reviews",
      "sourceColumn": "customer_id",
      "sourceTable": "customers"
    },
    {
      "destinationColumn": "order_id",
      "destinationTable": "product_reviews",
      "sourceColumn": "order_id",
      "sourceTable": "orders"
    },
    {
      "destinationColumn": "store_id",
      "destinationTable": "product_stocks",
      "sourceColumn": "store_id",
      "sourceTable": "stores"
    },
    {
      "destinationColumn": "store_location_id",
      "destinationTable": "product_stocks",
      "sourceColumn": "store_location_id",
      "sourceTable": "store_locations"
    },
    {
      "destinationColumn": "product_id",
      "destinationTable": "product_stocks",
      "sourceColumn": "product_id",
      "sourceTable": "products"
    },
    {
      "destinationColumn": "store_id",
      "destinationTable": "variant_groups",
      "sourceColumn": "store_id",
      "sourceTable": "stores"
    },
    {
      "destinationColumn": "product_id",
      "destinationTable": "variant_products",
      "sourceColumn": "product_id",
      "sourceTable": "products"
    },
    {
      "destinationColumn": "variant_group_id",
      "destinationTable": "variant_products",
      "sourceColumn": "variant_group_id",
      "sourceTable": "variant_groups"
    },
    {
      "destinationColumn": "store_id",
      "destinationTable": "products",
      "sourceColumn": "store_id",
      "sourceTable": "stores"
    },
    {
      "destinationColumn": "brand_id",
      "destinationTable": "products",
      "sourceColumn": "brand_id",
      "sourceTable": "brands"
    },
    {
      "destinationColumn": "category_id",
      "destinationTable": "products",
      "sourceColumn": "category_id",
      "sourceTable": "product_categories"
    },
    {
      "destinationColumn": "master_product_id",
      "destinationTable": "products",
      "sourceColumn": "master_product_id",
      "sourceTable": "master_products"
    },
    {
      "destinationColumn": "store_id",
      "destinationTable": "store_settings",
      "sourceColumn": "store_id",
      "sourceTable": "stores"
    },
    {
      "destinationColumn": "store_id",
      "destinationTable": "store_pages",
      "sourceColumn": "store_id",
      "sourceTable": "stores"
    },
    {
      "destinationColumn": "master_variant_group_id",
      "destinationTable": "master_variant_products",
      "sourceColumn": "master_variant_group_id",
      "sourceTable": "master_variant_groups"
    },
    {
      "destinationColumn": "master_product_id",
      "destinationTable": "master_variant_products",
      "sourceColumn": "master_product_id",
      "sourceTable": "master_products"
    }
  ]
};
