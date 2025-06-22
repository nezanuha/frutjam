const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const glob = require('glob');
const pkg = require('./package.json');

const copyright_text = `frutjam v${pkg.version} (c) 2025 Nezanuha | Released under the MIT License`;

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
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist'),
            library: {
                name: 'frutjam',
                type: 'umd',
                export: 'default',
            },
            globalObject: 'typeof self !== "undefined" ? self : this',
            clean: true,
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
                filename: '[name].css',
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
                    banner: copyright_text.trim(),
                    raw: false,
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
                    extractComments: false,
                }),
                new CssMinimizerPlugin({
                minimizerOptions: {
                    preset: ['default', {
                    discardComments: {
                        remove: (comment) => !comment.includes('frutjam'),
                    },
                    }],
                },
                }),
            ],
        },
    };
};
