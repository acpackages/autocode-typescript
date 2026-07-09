export const dataDictionaryJson = {
  "name": "Autocode Talk",
  "version": 0,
  "tables": {
    "ac_talk_messages": {
      "tableName": "ac_talk_messages",
      "tableColumns": {
        "message_id": {
          "columnName": "message_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Message Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "conversation_id": {
          "columnName": "conversation_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Conversation"
            }
          }
        },
        "sender_entity_id": {
          "columnName": "sender_entity_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Sender"
            }
          }
        },
        "message_time": {
          "columnName": "message_time",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Message Time"
            }
          }
        },
        "message_type": {
          "columnName": "message_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Message Type"
            }
          }
        },
        "message_body": {
          "columnName": "message_body",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Message Body"
            }
          }
        },
        "message_caption": {
          "columnName": "message_caption",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Message Caption"
            }
          }
        },
        "quoted_message_id": {
          "columnName": "quoted_message_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Quoted Message"
            }
          }
        },
        "forward_count": {
          "columnName": "forward_count",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Foward Count"
            }
          }
        },
        "is_starred": {
          "columnName": "is_starred",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Starred?"
            }
          }
        },
        "is_pinned": {
          "columnName": "is_pinned",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Pinned?"
            }
          }
        },
        "mentioned_entities": {
          "columnName": "mentioned_entities",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Mentions"
            }
          }
        },
        "message_reactions": {
          "columnName": "message_reactions",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Reactions"
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
        "message_metadata": {
          "columnName": "message_metadata",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Metadata"
            }
          }
        },
        "delivery_flag": {
          "columnName": "delivery_flag",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Delivery Flag"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "talk_messages"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "talk_message"
        }
      }
    },
    "ac_talk_conversations": {
      "tableName": "ac_talk_conversations",
      "tableColumns": {
        "conversation_id": {
          "columnName": "conversation_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Conversation Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "conversation_type": {
          "columnName": "conversation_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Conversation Type"
            }
          }
        },
        "display_name": {
          "columnName": "display_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Display Name"
            }
          }
        },
        "profile_photo_media_id": {
          "columnName": "profile_photo_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Profile Photo"
            }
          }
        },
        "unread_messages_count": {
          "columnName": "unread_messages_count",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Unread Messages"
            }
          }
        },
        "is_archived": {
          "columnName": "is_archived",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Archived?"
            }
          }
        },
        "is_pinned": {
          "columnName": "is_pinned",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Pinned?"
            }
          }
        },
        "background_image_media_id": {
          "columnName": "background_image_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Background Image"
            }
          }
        },
        "last_message_id": {
          "columnName": "last_message_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Last Message"
            }
          }
        },
        "last_activity_time": {
          "columnName": "last_activity_time",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Last Activity Time"
            }
          }
        },
        "draft_message": {
          "columnName": "draft_message",
          "columnType": "JSON",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Draft Message"
            }
          }
        },
        "contra_entity_id": {
          "columnName": "contra_entity_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Contra Entity"
            }
          }
        },
        "creator_entity_id": {
          "columnName": "creator_entity_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Created By"
            }
          }
        },
        "conversation_started_on": {
          "columnName": "conversation_started_on",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Started On"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "talk_conversations"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "talk_conversation"
        }
      }
    },
    "ac_talk_conversation_entities": {
      "tableName": "ac_talk_conversation_entities",
      "tableColumns": {
        "conversation_entity_id": {
          "columnName": "conversation_entity_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Conversation Entity Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "conversation_id": {
          "columnName": "conversation_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Conversation"
            }
          }
        },
        "entity_id": {
          "columnName": "entity_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Entity"
            }
          }
        },
        "is_admin": {
          "columnName": "is_admin",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Is Admin"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "talk_conversation_entities"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "talk_conversation_entiry"
        }
      }
    },
    "ac_talk_entities": {
      "tableName": "ac_talk_entities",
      "tableColumns": {
        "entity_id": {
          "columnName": "entity_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Entity Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
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
            }
          }
        },
        "jid": {
          "columnName": "jid",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "JID"
            }
          }
        },
        "display_name": {
          "columnName": "display_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Display Name"
            }
          }
        },
        "profile_photo_media_id": {
          "columnName": "profile_photo_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Profile Photo"
            }
          }
        },
        "last_seen": {
          "columnName": "last_seen",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Last Seen"
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
            }
          }
        },
        "entity_type": {
          "columnName": "entity_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Entity Type"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "talk_entities"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "talk_entity"
        }
      }
    },
    "ac_talk_message_histories": {
      "tableName": "ac_talk_message_histories",
      "tableColumns": {
        "message_history_id": {
          "columnName": "message_history_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Message History Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "entity_id": {
          "columnName": "entity_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Entity"
            }
          }
        },
        "message_id": {
          "columnName": "message_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Message"
            }
          }
        },
        "history_action_type": {
          "columnName": "history_action_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "History Action"
            }
          }
        },
        "history_action_time": {
          "columnName": "history_action_time",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "History Time"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "talk_message_history"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "talk_message_history"
        }
      }
    },
    "ac_talk_medias": {
      "tableName": "ac_talk_medias",
      "tableColumns": {
        "media_id": {
          "columnName": "media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "UUID"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
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
            }
          }
        },
        "file_name": {
          "columnName": "file_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Filename"
            }
          }
        },
        "mime_type": {
          "columnName": "mime_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Mime Type"
            }
          }
        },
        "file_size": {
          "columnName": "file_size",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "File Size"
            }
          }
        },
        "media_height": {
          "columnName": "media_height",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Height"
            }
          }
        },
        "media_width": {
          "columnName": "media_width",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Width"
            }
          }
        },
        "media_duration": {
          "columnName": "media_duration",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Duration"
            }
          }
        },
        "thumbnail_url": {
          "columnName": "thumbnail_url",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Thumbnail"
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
          "propertyValue": "talk_medias"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "talk_media"
        }
      }
    },
    "ac_talk_devices": {
      "tableName": "ac_talk_devices",
      "tableColumns": {},
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "talk_devices"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "talk_device"
        }
      }
    }
  }
};
