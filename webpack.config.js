const webpack = require('webpack')
const path = require('path')

module.exports = {
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				loader: 'babel-loader',
				options: {
					presets: ['react', 'es2015']
				}
			},
			{
				test: /\.styl?$/,
				loader: 'style-loader!css-loader!stylus-loader'
			}
		]
	}
}