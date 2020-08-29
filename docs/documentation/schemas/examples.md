# .deployer Examples

- ***Environment variables** are defined in .deployer files as **$VARNAME**.  For example, you can use environment variables to define paths to install / uninstall files*

- *the desktop client will **validate your .deployer file** when you attempt to **install** or **uninstall** the tool, and will **identify any errors** as necessary*

**#1** - *Example 1*

*this .deployer configuration tells DotDeployer to **copy** a file named `README.md` and **copy** a file named `.deployer` to a folder on the desktop named `Testing` when the tool is installed.  When the tool is uninstalled, the `Testing` folder on the Desktop will be **deleted**.*
```json
{
  "version": "3.0.0",
  "install": [{
      "action": "copy",
      "source": "README.md",
      "destination": "$USERPROFILE\\Desktop\\Testing"
    },
    {
      "action": "copy",
      "source": ".deployer",
      "destination": "$USERPROFILE\\Desktop\\Testing"
    }
  ],
  "uninstall": [{
    "action": "delete",
    "source": "$USERPROFILE\\Desktop\\Testing"
  }],
  "urls": {
    "documentation": "https://www.google.com",
    "support": "https://www.google.com"
  }
}
```

**#2** - *Example 2*

*this .deployer configuration tells DotDeployer to **run** a file named `install.bat` when the tool is installed, and **run** a file named `uninstall.bat` when the tool is uninstalled*
```json
{
  "version": "3.0.0",
  "install": [{
    "action": "run",
    "source": "install.bat"
  }],
  "uninstall": [{
    "action": "run",
    "source": "uninstall.bat"
  }]
}
```
