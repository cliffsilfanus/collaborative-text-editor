const webpack = require('webpack');

module.exports = {
	entry: './reactApp/app.js',
	output: {
		path: __dirname + '/build',
		filename: 'app.bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env', '@babel/preset-react'],
						plugins: ['transform-class-properties']
					}
				}
			},
			{
				test: /\.css$/,
				exclude: /node_modules/,
				use: ['style-loader', 'css-loader']
			}
		]
	},
	stats: {
		colors: true
	},
	devtool: 'source-map'
};
