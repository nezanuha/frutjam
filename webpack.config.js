const path = require('path')
const TerserPlugin = require("terser-webpack-plugin");
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  stats:'minimal',
  entry: {
    index:'./src/index.ts',
    notification: './src/plugins/notification/index.ts',
    tabs: './src/plugins/tabs/index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: { 
      name: 'frutjam',
      type: 'umd'
    },
    clean: isProduction ? true : false,
  },
  cache: isProduction ? {
    type: 'filesystem',
    compression: 'brotli',
    hashAlgorithm: 'md4',
    buildDependencies: {
      config: [__filename],
    },
  } : false,
  devtool: isProduction ? false : 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader',],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.css'],
  },
  optimization: isProduction ? {
    minimize: true, // Minimize JavaScript output
    minimizer: [new TerserPlugin({
      extractComments:false,
    })], // Use TerserPlugin for JavaScript minification
    splitChunks: { chunks: 'all' }, // Split chunks for better caching
  }: {},
}