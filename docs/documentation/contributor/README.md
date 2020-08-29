
# Contributor Documentation
#### the development environment requires:
- [Git](https://git-scm.com/downloads) *- download source code, version management*
- [Yarn](https://yarnpkg.com/lang/en/docs/install/#windows-stable) *- download and manage required packages*

**#1** - Clone Repository

```shell
git clone git@github.com:WeConnect/dot-deployer-client.git
```

**#2** - Install Required Packages

```shell
yarn install
```

**#3** - Setup Environment Variables

*place a `.env` file in your root directory with the following keys:*
```shell
VUE_APP_APIKEY=<firebase api key>
VUE_APP_AUTHDOMAIN=<firebase authorization domain>
VUE_APP_DATABASEURL=<firebase database url>
VUE_APP_PROJECTID=<firebase project id>
VUE_APP_STORAGEBUCKET=<firebase storage bucket>
VUE_APP_MESSAGINGSENDERID=<firebase messenger sender id>
VUE_APP_APIURL=<firebase cloud function endpoint>
VUE_APP_CLIENTID=<firebase google cloud client id>
VUE_APP_CLIENTSECRET=<firebase google cloud client secret>
VUE_APP_INSTALLATIONID=<github installation id>
VUE_APP_APPLICATIONID=<github application id>
VUE_APP_APPLICATIONKEY=<github application key (base64 encoded)>
GH_TOKEN=<github access token used for continuous integration>
```

**#4** - Serve Application Locally

```shell
yarn electron:serve
```

**#5** - Release an Update

*any merge commit to the Master branch will automatically release an update to users using Circle CI.  To edit these settings, edit the `owner` and `repo` keys in `vue.config.js` in the root directory.  Circle CI will need to be setup with environment variables that match those of the `.env` file.*
