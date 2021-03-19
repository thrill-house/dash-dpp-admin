require("dotenv").config();

const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  pages: {
    index: "src/main.js",
  },
  configureWebpack: {
    plugins: [new NodePolyfillPlugin()],
    resolve: {
      /*
       ** Emptying aliasFields is required so that the "browser" definition in the bn.js package is ignored.
       ** Normally it's default value is `aliasFields: ["browser"]`, however we remove that here.
       ** This allows Buffer related methods in the Dash packages to work correctly in the browser.
       ** More info:
       ** https://webpack.js.org/configuration/resolve/#resolvealiasfields
       ** https://github.com/indutny/bn.js/blob/master/package.json
       */
      aliasFields: [],
      fallback: {
        fs: false,
      },
    },
  },
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: false,
    },
    quasar: {
      importStrategy: "kebab",
      rtlSupport: false,
    },
  },
  transpileDependencies: ["quasar"],
};
