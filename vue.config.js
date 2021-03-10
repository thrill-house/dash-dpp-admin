require("dotenv").config();

module.exports = {
  pages: {
    index: "src/main.js",
  },
  configureWebpack: {
    devtool: "source-map",
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
    },
  },
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: false,
    },
  },
  transpileDependencies: ["vuetify"],
};
