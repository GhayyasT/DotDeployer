process.env.VUE_APP_VERSION = require('./package.json').version

module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        publish: [{
          provider: "github",
          owner: "WeConnect",
          repo: "dot-deployer-client"
        }],
        productName: "Dot Deployer",
        nsis: {
          artifactName: "dot-deployer-setup.${ext}",
          uninstallDisplayName: "Dot Deployer"
        }
      }
    }
  },
  runtimeCompiler: true,
  css: {
    loaderOptions: {
      sass: {
        data: `@import "@/styles/main.sass";`
      }
    }
  }
}
