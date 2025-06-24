const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const glob = require('glob');
const pkg = require('./package.json');

const copyrightText = `${pkg.name} v${pkg.version} (c) ${(new Date()).getFullYear()} ${pkg.author} | Released under the ${pkg.license} License | ${pkg.homepage}`;

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development';
    const isProduction = argv.mode === 'production';

    return {
        mode: argv.mode || 'production',
        devtool: isDevelopment ? 'source-map' : false,
        stats: 'minimal',
        entry: {
            frutjam: './src/frutjam.js',
        },
        resolve: {
            extensions: ['.ts', '.js', '.css'],
        },
        output: {
            filename: '[name].min.js',
            path: path.resolve(__dirname, 'dist'),
            library: {
                name: 'frutjam',
                type: 'umd',
                export: 'default',
            },
            globalObject: 'typeof self !== "undefined" ? self : this',
            clean: false,
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'postcss-loader',
                    ],
                },
            ],
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: '[name].min.css',
            }),
            ...(isDevelopment
                ? glob.sync('./demo/**/*.html').map(file => new HtmlWebpackPlugin({
                    template: file,
                    filename: path.basename(file),
                    minify: false,
                }))
                : []),
            ...(isProduction ? [
                new webpack.BannerPlugin({
                    banner: copyrightText,
                    raw: false
                })
            ] : []),
        ],
        devServer: {
            static: {
                directory: path.resolve(__dirname, 'dist'),
            },
            open: false,
            hot: true,
            liveReload: true,
            watchFiles: ['src/**/*'],
        },
        optimization: {
            minimize: isProduction,
            minimizer: [
                new TerserPlugin({
                    extractComments: true,
                })
            ],
        },
    };
};
