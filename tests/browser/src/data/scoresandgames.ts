export const dataDictionaryJson = {
  "name": "Scores&Games",
  "version": 0,
  "tables": {
    "addresses": {
      "tableName": "addresses",
      "tableColumns": {
        "address_id": {
          "columnName": "address_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Address"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
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
              "propertyValue": "Line 1"
            }
          }
        },
        "address_line_2": {
          "columnName": "address_line_2",
          "columnType": "TEXT",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Line 2"
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
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "addresses"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "address"
        }
      }
    },
    "cricket_ball_trackings": {
      "tableName": "cricket_ball_trackings",
      "tableColumns": {
        "ball_tracking_id": {
          "columnName": "ball_tracking_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Ball Tracking Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "match_id": {
          "columnName": "match_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Match"
            }
          }
        },
        "over_number": {
          "columnName": "over_number",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Over"
            }
          }
        },
        "ball_number": {
          "columnName": "ball_number",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Ball"
            }
          }
        },
        "striker_player_id": {
          "columnName": "striker_player_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Striker"
            }
          }
        },
        "bowler_player_id": {
          "columnName": "bowler_player_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Bowler"
            }
          }
        },
        "ball_outcome": {
          "columnName": "ball_outcome",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Outcome"
            }
          }
        },
        "ball_runs": {
          "columnName": "ball_runs",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Runs"
            }
          }
        },
        "extra_type": {
          "columnName": "extra_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Extra Type"
            }
          }
        },
        "wicket_type": {
          "columnName": "wicket_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Wicket Type"
            }
          }
        },
        "ball_timestamp": {
          "columnName": "ball_timestamp",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Ball Timestamp"
            }
          }
        },
        "non_striker_player_id": {
          "columnName": "non_striker_player_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Non Striker"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "ball_trackings"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "ball_tracking"
        }
      }
    },
    "cricket_matches": {
      "tableName": "cricket_matches",
      "tableColumns": {
        "cricket_match_id": {
          "columnName": "cricket_match_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Cricket Match Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "match_id": {
          "columnName": "match_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Match"
            }
          }
        },
        "toss_winner_team_id": {
          "columnName": "toss_winner_team_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Toss Winner"
            }
          }
        },
        "toss_winner_decision": {
          "columnName": "toss_winner_decision",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Toss Decision"
            }
          }
        },
        "winner_team_id": {
          "columnName": "winner_team_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Winner Team"
            }
          }
        },
        "team_a_id": {
          "columnName": "team_a_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Team A"
            }
          }
        },
        "team_b_id": {
          "columnName": "team_b_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Team B"
            }
          }
        },
        "match_type": {
          "columnName": "match_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Match Type"
            }
          }
        },
        "match_overs": {
          "columnName": "match_overs",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Match Overs"
            }
          }
        },
        "overs_per_bowler": {
          "columnName": "overs_per_bowler",
          "columnType": "INTEGER",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Overs Per Bowler"
            }
          }
        },
        "ball_type": {
          "columnName": "ball_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Ball Type"
            }
          }
        },
        "show_wagon_wheel": {
          "columnName": "show_wagon_wheel",
          "columnType": "YES_NO",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Show Wagon Wheel"
            }
          }
        },
        "pitch_type": {
          "columnName": "pitch_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Pitch Type"
            }
          }
        },
        "team_a_captain_id": {
          "columnName": "team_a_captain_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Team A Captain"
            },
            "USE_FOR_ROW_LIKE_FILTER": {
              "propertyName": "USE_FOR_ROW_LIKE_FILTER",
              "propertyValue": false
            }
          }
        },
        "team_b_captain_id": {
          "columnName": "team_b_captain_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Team B Captain"
            }
          }
        },
        "team_a_vice_captain_id": {
          "columnName": "team_a_vice_captain_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Team A Vice Captain"
            }
          }
        },
        "team_b_vice_captain_id": {
          "columnName": "team_b_vice_captain_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Team B Vice Captain"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "cricket_matches"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "cricket_match"
        }
      }
    },
    "cricket_tournament_details": {
      "tableName": "cricket_tournament_details",
      "tableColumns": {
        "cricket_tournament_detail_id": {
          "columnName": "cricket_tournament_detail_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Cricket Tournament Detail id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "pitch_type": {
          "columnName": "pitch_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Pitch Type"
            }
          }
        },
        "match_type": {
          "columnName": "match_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Match Type"
            }
          }
        },
        "tournament_id": {
          "columnName": "tournament_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Tournament"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "cricket_tournament_details"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "cricket_tournament_detail"
        }
      }
    },
    "match_medias": {
      "tableName": "match_medias",
      "tableColumns": {
        "match_media_id": {
          "columnName": "match_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Match Media Id"
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
              "propertyValue": "Media Id"
            }
          }
        },
        "match_id": {
          "columnName": "match_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Match Id"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "match_medias"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "match_media"
        }
      }
    },
    "match_officials": {
      "tableName": "match_officials",
      "tableColumns": {
        "match_official_id": {
          "columnName": "match_official_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Match Official Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "match_id": {
          "columnName": "match_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Match"
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
        "match_official_type": {
          "columnName": "match_official_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Official Type"
            }
          }
        },
        "match_official_name": {
          "columnName": "match_official_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Official Name"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "match_officials"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "match_official"
        }
      }
    },
    "matches": {
      "tableName": "matches",
      "tableColumns": {
        "match_id": {
          "columnName": "match_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Match Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "sport_id": {
          "columnName": "sport_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Sport"
            }
          }
        },
        "match_status": {
          "columnName": "match_status",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Match Status"
            }
          }
        },
        "tournament_id": {
          "columnName": "tournament_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Tournament"
            }
          }
        },
        "match_time": {
          "columnName": "match_time",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Match Time"
            }
          }
        },
        "match_start_time": {
          "columnName": "match_start_time",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Match Start Time"
            }
          }
        },
        "match_end_time": {
          "columnName": "match_end_time",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Match End Time"
            }
          }
        },
        "sport_venue_id": {
          "columnName": "sport_venue_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Sport Venue"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "matches"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "match"
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
              "propertyValue": "media_id"
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
    "players": {
      "tableName": "players",
      "tableColumns": {
        "player_id": {
          "columnName": "player_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Player Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "player_name": {
          "columnName": "player_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Name"
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
        "player_profile_media_id": {
          "columnName": "player_profile_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Player Profile"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "players"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "player"
        }
      }
    },
    "sport_venues": {
      "tableName": "sport_venues",
      "tableColumns": {
        "sport_venue_id": {
          "columnName": "sport_venue_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Sport Venue Id"
            }
          }
        },
        "sport_venue_name": {
          "columnName": "sport_venue_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Sport Venue Name"
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
            }
          }
        },
        "sport_venue_profile_media_id": {
          "columnName": "sport_venue_profile_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Profile Media"
            }
          }
        },
        "sport_venue_banner_media_id": {
          "columnName": "sport_venue_banner_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Banner Media"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "sport_venues"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "sport_venue"
        }
      }
    },
    "sports": {
      "tableName": "sports",
      "tableColumns": {
        "sport_id": {
          "columnName": "sport_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Sport Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "sport_name": {
          "columnName": "sport_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Sport"
            }
          }
        },
        "sport_profile_media_id": {
          "columnName": "sport_profile_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Profile Media"
            }
          }
        },
        "sport_banner_media_id": {
          "columnName": "sport_banner_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Banner Media"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "sports"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "sport"
        }
      }
    },
    "team_players": {
      "tableName": "team_players",
      "tableColumns": {
        "team_player_id": {
          "columnName": "team_player_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Team Player Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "team_id": {
          "columnName": "team_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Team"
            }
          }
        },
        "player_id": {
          "columnName": "player_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Player"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "match_players"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "match_player"
        }
      }
    },
    "teams": {
      "tableName": "teams",
      "tableColumns": {
        "team_id": {
          "columnName": "team_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Team Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "team_name": {
          "columnName": "team_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Team Name"
            }
          }
        },
        "team_profile_media_id": {
          "columnName": "team_profile_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Profile Media"
            }
          }
        },
        "team_banner_media_id": {
          "columnName": "team_banner_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Banner Media"
            }
          }
        },
        "team_captain_id": {
          "columnName": "team_captain_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Team Captain"
            }
          }
        },
        "team_vice_captain_id": {
          "columnName": "team_vice_captain_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Team Vice Captain"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "teams"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "team"
        }
      }
    },
    "tournament_medias": {
      "tableName": "tournament_medias",
      "tableColumns": {
        "tournament_media_id": {
          "columnName": "tournament_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Tournament Media Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "tournament_id": {
          "columnName": "tournament_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Tournament"
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
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "tournament_medias"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "tournament_media"
        }
      }
    },
    "tournaments": {
      "tableName": "tournaments",
      "tableColumns": {
        "tournament_id": {
          "columnName": "tournament_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Tournament Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "tournament_name": {
          "columnName": "tournament_name",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Tournament Name"
            }
          }
        },
        "sport_venue_id": {
          "columnName": "sport_venue_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Sport Venue"
            }
          }
        },
        "organizer_user_id": {
          "columnName": "organizer_user_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Organizer"
            }
          }
        },
        "tournament_start_time": {
          "columnName": "tournament_start_time",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Start Time"
            }
          }
        },
        "tournament_end_time": {
          "columnName": "tournament_end_time",
          "columnType": "DATETIME",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "End Time"
            }
          }
        },
        "tournament_type": {
          "columnName": "tournament_type",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Tournament Type"
            }
          }
        },
        "tournament_profile_media_id": {
          "columnName": "tournament_profile_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Profile Media"
            }
          }
        },
        "tournament_banner_media_id": {
          "columnName": "tournament_banner_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Banner Media"
            }
          }
        },
        "tournament_description": {
          "columnName": "tournament_description",
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
          "propertyValue": "tournaments"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "tournament"
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
        "mobile_number": {
          "columnName": "mobile_number",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Mobile Number"
            },
            "UNIQUE_KEY": {
              "propertyName": "UNIQUE_KEY",
              "propertyValue": true
            }
          }
        },
        "user_profile_media_id": {
          "columnName": "user_profile_media_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Profile Media"
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
    },
    "player_cricket_details": {
      "tableName": "player_cricket_details",
      "tableColumns": {
        "player_cricket_detail_id": {
          "columnName": "player_cricket_detail_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Player Cricket Detail Id"
            },
            "PRIMARY_KEY": {
              "propertyName": "PRIMARY_KEY",
              "propertyValue": true
            }
          }
        },
        "player_id": {
          "columnName": "player_id",
          "columnType": "UUID",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Player"
            }
          }
        },
        "batting_style": {
          "columnName": "batting_style",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Batting style"
            }
          }
        },
        "bowling_style": {
          "columnName": "bowling_style",
          "columnType": "STRING",
          "columnProperties": {
            "COLUMN_TITLE": {
              "propertyName": "COLUMN_TITLE",
              "propertyValue": "Bowling Style"
            }
          }
        }
      },
      "tableProperties": {
        "PLURAL_NAME": {
          "propertyName": "PLURAL_NAME",
          "propertyValue": "player_cricket_details"
        },
        "SINGULAR_NAME": {
          "propertyName": "SINGULAR_NAME",
          "propertyValue": "player_cricket_detail"
        }
      }
    }
  },
  "relationships": [
    {
      "destinationColumn": "sport_id",
      "destinationTable": "matches",
      "sourceColumn": "sport_id",
      "sourceTable": "sports"
    },
    {
      "destinationColumn": "tournament_id",
      "destinationTable": "matches",
      "sourceColumn": "tournament_id",
      "sourceTable": "tournaments"
    },
    {
      "destinationColumn": "user_id",
      "destinationTable": "players",
      "sourceColumn": "user_id",
      "sourceTable": "users"
    },
    {
      "destinationColumn": "team_profile_media_id",
      "destinationTable": "teams",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "team_banner_media_id",
      "destinationTable": "teams",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "team_id",
      "destinationTable": "team_players",
      "sourceColumn": "team_id",
      "sourceTable": "teams"
    },
    {
      "destinationColumn": "player_id",
      "destinationTable": "player_cricket_details",
      "sourceColumn": "player_id",
      "sourceTable": "players"
    },
    {
      "destinationColumn": "match_id",
      "destinationTable": "cricket_ball_trackings",
      "sourceColumn": "match_id",
      "sourceTable": "matches"
    },
    {
      "destinationColumn": "striker_player_id",
      "destinationTable": "cricket_ball_trackings",
      "sourceColumn": "player_id",
      "sourceTable": "players"
    },
    {
      "destinationColumn": "bowler_player_id",
      "destinationTable": "cricket_ball_trackings",
      "sourceColumn": "player_id",
      "sourceTable": "players"
    },
    {
      "destinationColumn": "non_striker_player_id",
      "destinationTable": "cricket_ball_trackings",
      "sourceColumn": "player_id",
      "sourceTable": "players"
    },
    {
      "cascadeDeleteSource": false,
      "destinationColumn": "match_id",
      "destinationTable": "cricket_matches",
      "sourceColumn": "match_id",
      "sourceTable": "matches"
    },
    {
      "destinationColumn": "toss_winner_team_id",
      "destinationTable": "cricket_matches",
      "sourceColumn": "team_id",
      "sourceTable": "teams"
    },
    {
      "destinationColumn": "winner_team_id",
      "destinationTable": "cricket_matches",
      "sourceColumn": "team_id",
      "sourceTable": "teams"
    },
    {
      "destinationColumn": "team_a_id",
      "destinationTable": "cricket_matches",
      "sourceColumn": "team_id",
      "sourceTable": "teams"
    },
    {
      "destinationColumn": "team_b_id",
      "destinationTable": "cricket_matches",
      "sourceColumn": "team_id",
      "sourceTable": "teams"
    },
    {
      "destinationColumn": "team_a_captain_id",
      "destinationTable": "cricket_matches",
      "sourceColumn": "player_id",
      "sourceTable": "players"
    },
    {
      "destinationColumn": "team_b_captain_id",
      "destinationTable": "cricket_matches",
      "sourceColumn": "player_id",
      "sourceTable": "players"
    },
    {
      "destinationColumn": "team_a_vice_captain_id",
      "destinationTable": "cricket_matches",
      "sourceColumn": "player_id",
      "sourceTable": "players"
    },
    {
      "destinationColumn": "team_b_vice_captain_id",
      "destinationTable": "cricket_matches",
      "sourceColumn": "player_id",
      "sourceTable": "players"
    },
    {
      "destinationColumn": "tournament_id",
      "destinationTable": "cricket_tournament_details",
      "sourceColumn": "tournament_id",
      "sourceTable": "tournaments"
    },
    {
      "destinationColumn": "media_id",
      "destinationTable": "match_medias",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "match_id",
      "destinationTable": "match_medias",
      "sourceColumn": "match_id",
      "sourceTable": "matches"
    },
    {
      "destinationColumn": "match_id",
      "destinationTable": "match_officials",
      "sourceColumn": "match_id",
      "sourceTable": "matches"
    },
    {
      "destinationColumn": "user_id",
      "destinationTable": "match_officials",
      "sourceColumn": "user_id",
      "sourceTable": "users"
    },
    {
      "destinationColumn": "sport_venue_id",
      "destinationTable": "matches",
      "sourceColumn": "sport_venue_id",
      "sourceTable": "sport_venues"
    },
    {
      "destinationColumn": "address_id",
      "destinationTable": "sport_venues",
      "sourceColumn": "address_id",
      "sourceTable": "addresses"
    },
    {
      "cascadeDeleteSource": false,
      "destinationColumn": "sport_venue_profile_media_id",
      "destinationTable": "sport_venues",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "sport_venue_banner_media_id",
      "destinationTable": "sport_venues",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "cascadeDeleteSource": false,
      "destinationColumn": "sport_profile_media_id",
      "destinationTable": "sports",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "sport_banner_media_id",
      "destinationTable": "sports",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "player_id",
      "destinationTable": "team_players",
      "sourceColumn": "player_id",
      "sourceTable": "players"
    },
    {
      "destinationColumn": "team_captain_id",
      "destinationTable": "teams",
      "sourceColumn": "player_id",
      "sourceTable": "players"
    },
    {
      "destinationColumn": "team_vice_captain_id",
      "destinationTable": "teams",
      "sourceColumn": "player_id",
      "sourceTable": "players"
    },
    {
      "cascadeDeleteSource": false,
      "destinationColumn": "tournament_id",
      "destinationTable": "tournament_medias",
      "sourceColumn": "tournament_id",
      "sourceTable": "tournaments"
    },
    {
      "destinationColumn": "media_id",
      "destinationTable": "tournament_medias",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "sport_venue_id",
      "destinationTable": "tournaments",
      "sourceColumn": "sport_venue_id",
      "sourceTable": "sport_venues"
    },
    {
      "cascadeDeleteSource": false,
      "destinationColumn": "organizer_user_id",
      "destinationTable": "tournaments",
      "sourceColumn": "user_id",
      "sourceTable": "users"
    },
    {
      "cascadeDeleteSource": false,
      "destinationColumn": "tournament_profile_media_id",
      "destinationTable": "tournaments",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "tournament_banner_media_id",
      "destinationTable": "tournaments",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    },
    {
      "destinationColumn": "user_profile_media_id",
      "destinationTable": "users",
      "sourceColumn": "media_id",
      "sourceTable": "medias"
    }
  ]
};
