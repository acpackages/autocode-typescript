export const dataDictionaryJson = {
  "name": "Ecommerce",
  "version": 1,
  "tables": {
    "coupon_issue": {
      "tableName": "coupon_issue",
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
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "coupon_issues"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "coupon_issue"
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
        "customer_name": {
          "columnName": "customer_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Customer Name"
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
        }
      }
    },
    "order_charges": {
      "tableName": "order_charges",
      "tableColumns": {
        "order_charger_id": {
          "columnName": "order_charger_id",
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
              "propertyValue": "Order Id"
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
              "propertyValue": "Order Prodcut"
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
          "propertyValue": "order_products"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "order_product"
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
        }
      }
    },
    "product_attributes": {
      "tableName": "product_attributes",
      "tableColumns": {
        "product_attribute_id": {
          "columnName": "product_attribute_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product Attribute Id"
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
        "is_active": {
          "columnName": "is_active",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Active?"
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
        }
      }
    },
    "product_configs": {
      "tableName": "product_configs",
      "tableColumns": {
        "product_config_id": {
          "columnName": "product_config_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product Config Id"
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
          "propertyValue": "product_configs"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "product_config"
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
              "propertyValue": "Description"
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
        "uom_name": {
          "columnName": "uom_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Unit"
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
            }
          }
        },
        "allow_return": {
          "columnName": "allow_return",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Allow Return"
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
            }
          }
        },
        "delivery_available": {
          "columnName": "delivery_available",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Delivery Available"
            }
          }
        },
        "pickup_available": {
          "columnName": "pickup_available",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Pickup Available"
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
            }
          }
        },
        "website_url": {
          "columnName": "website_url",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Website"
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
        }
      }
    },
    "product_comments": {
      "tableName": "product_comments",
      "tableColumns": {
        "comment_id": {
          "columnName": "comment_id",
          "columnType": "UUID",
          "columnProperties": {
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
          "propertyValue": "product_comments"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "product_comment"
        }
      }
    },
    "product_ratings": {
      "tableName": "product_ratings",
      "tableColumns": {
        "ratings_id": {
          "columnName": "ratings_id",
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
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "product_ratings"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "product_rating"
        }
      }
    },
    "product_variants": {
      "tableName": "product_variants",
      "tableColumns": {
        "product_variant_id": {
          "columnName": "product_variant_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product Variant Id"
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
          "propertyValue": "product_variants"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "product_variant"
        }
      }
    },
    "product_variant_groups": {
      "tableName": "product_variant_groups",
      "tableColumns": {
        "product_variant_group_id": {
          "columnName": "product_variant_group_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Product Variant Group Id"
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
          "propertyValue": "product_variant_groups"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "product_variant_group"
        }
      }
    }
  }
};
