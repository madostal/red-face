let path = require('path')
let webpack = require('webpack')
let HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
	entry: {
		vendor: ['jquery', 'async', 'react', 'react-dom', 'react-router'],
		app: './src/main.jsx',
	},
	output: {
		publicPath: '/',
		path: path.join(__dirname, 'dist'),
		filename: '[name].[hash].js',
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'src/index.html',
			minify: false,
			favicon: 'src/images/fav.ico',
		}),
		new webpack.ProvidePlugin({
			'$': 'jquery',
			'jQuery': 'jquery',
			'window.jQuery': 'jquery',
		}),
	],
	resolve: {
		extensions: ['.js', '.jsx'],
		modules: [path.join(__dirname, 'src', 'components'), path.join(__dirname, 'src'), 'node_modules'],
	},
	module: {
		loaders: [

			// JS/JSX React/ES6
			{
				test: /\.js[x]?$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel-loader',
				query: {
					presets: ['es2015', 'react'],
					plugins: [
						'add-module-exports',
						"transform-class-properties"
					],
				},
			},

			// CSS
			{
				include: /\.css$/,
				loaders: ['style-loader', 'css-loader'],
			},

			// Fonts
			{
				test: /\.woff/,
				loader: 'url-loader?limit=10000&minetype=application/font-woff',
			},

			// SVG
			{
				test: /\.(eot|png|ttf|svg|ico)/,
				loader: 'file-loader',
			},
		],
	},
}