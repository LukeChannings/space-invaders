const path = require(`path`)
const ENV = process.env.NODE_ENV || `development`

Object.assign(module, {
  exports: {
    entry: path.resolve(`./src/main`),
    output: {
      path: path.resolve(`./dist`),
      publicPath: `/dist`,
      filename: `[name].js`,
      pathinfo: false,
      devtoolModuleFilenameTemplate: `[resource-path]`,
      devtoolFallbackModuleFilenameTemplate: `[resource-path]?[hash]`
    },
    devtool: ENV === `production` ? `source-map` : `#eval`,
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: `babel`,
          include: [
            path.resolve(`./index.js`),
            path.resolve(`./src`),
          ]
        },
        {
          test: /\.css$/,
          loader: `style!css?modules!postcss`
        },
      ]
    },
    postcss: function () {
      return [
        require(`postcss-cssnext`),
      ]
    }
  }
})
