# .deployer JSON Schemas
*below are the available schemas for your .deployer configuration file.  The `version` key in your .deployer file tells DotDeployer which schema you are using.*

## Version 3.0.0
*this is the schema used by the lastest version of DotDeployer*

```json
{
  "type": "object",
  "properties": {
    "version": {
      "type": "string",
      "required": true
    },
    "processes": {
      "type": "array",
      "required": false,
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "required": true
          }
        },
        "additionalProperties": false
      }
    },
    "urls": {
      "type": "object",
      "required": false,
      "properties": {
        "documentation": {
          "type": "string",
          "required": false
        },
        "support": {
          "type": "string",
          "required": false
        },
        "feedback": {
          "type": "string",
          "required": false
        }
      },
      "additionalProperties": false
    },
    "install": {
      "type": "array",
      "required": true,
      "items": {
        "type": "object",
        "required": true,
        "properties": {
          "action": {
            "type": "string",
            "required": true,
            "enum": ["run", "copy"]
          },
          "destination": {
            "type": "string",
            "required": false
          },
          "source": {
            "required": true,
            "type": "string"
          }
        },
        "additionalProperties": false
      }
    },
    "uninstall": {
      "type": "array",
      "required": true,
      "items": {
        "type": "object",
        "required": true,
        "properties": {
          "action": {
            "type": "string",
            "required": true,
            "enum": ["run", "delete"]
          },
          "source": {
            "required": true,
            "type": "string"
          }
        },
        "additionalProperties": false
      }
    },
    "dependson": {
      "type": "array",
      "required": false,
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          }
        }
      }
    }
  },
  "additionalProperties": false
}
```

## Version 2.0.0
*this schema is not supported by the latest client but is used on previous clients*

```json
{
  "type": "object",
  "properties": {
    "version": {
      "type": "string",
      "required": true
    },
    "assets": {
      "type": "boolean",
      "required": false
    },
    "autoupdate": {
      "type": "boolean",
      "required": false
    },
    "processes": {
      "type": "array",
      "required": false,
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "required": true
          }
        },
        "additionalProperties": false
      }
    },
    "support": {
      "type": "object",
      "required": false,
      "properties": {
        "url": {
          "type": "string",
          "required": true
        }
      },
      "additionalProperties": false
    },
    "documentation": {
      "type": "object",
      "required": false,
      "properties": {
        "url": {
          "type": "string",
          "required": true
        }
      },
      "additionalProperties": false
    },
    "feedback": {
      "type": "object",
      "required": false,
      "properties": {
        "url": {
          "type": "string",
          "required": true
        }
      },
      "additionalProperties": false
    },
    "install": {
      "type": "array",
      "required": true,
      "items": {
        "type": "object",
        "required": true,
        "properties": {
          "action": {
            "type": "string",
            "required": true,
            "enum": ["run", "copy"]
          },
          "destination": {
            "type": "string",
            "required": false
          },
          "source": {
            "required": true,
            "type": "string"
          }
        },
        "additionalProperties": false
      }
    },
    "uninstall": {
      "type": "array",
      "required": true,
      "items": {
        "type": "object",
        "required": true,
        "properties": {
          "action": {
            "type": "string",
            "required": true,
            "enum": ["run", "delete"]
          },
          "source": {
            "required": true,
            "type": "string"
          }
        },
        "additionalProperties": false
      }
    },
    "dependson": {
      "type": "array",
      "required": false,
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          }
        }
      }
    }
  },
  "additionalProperties": false
}
```
