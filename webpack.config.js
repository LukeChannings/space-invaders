const path = require('path')
const ENV = process.env.NODE_ENV || `development`

module.exports = {
	entry: path.resolve(`./src/space-invaders`),
	output: {
		path: path.resolve(`./dist`),
		publicPath: `/dist`,
		filename: `[name].js`,
		pathinfo: false,
		devtoolModuleFilenameTemplate: `[resource-path]`,
		devtoolFallbackModuleFilenameTemplate: `[resource-path]?[hash]`
	},
	devtool: ENV === `production` ? `source-map` : `cheap-module-eval-source-map`,
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: `babel`,
				include: path.resolve(`./src`)
			}
		]
	},
}
