const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const pkg = require('./package.json');

const copyrightText = `${pkg.name} v${pkg.version} (c) ${(new Date()).getFullYear()} ${pkg.author} | Released under the ${pkg.license} License | ${pkg.homepage}`;

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development';
    const isProduction = argv.mode === 'production';

    return {
        mode: argv.mode || 'production',
        devtool: isDevelopment ? 'eval-cheap-module-source-map' : false,
        stats: isDevelopment ? 'errors-warnings' : 'minimal',
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
                        isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
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
            ...(isProduction ? [
                new webpack.BannerPlugin({
                    banner: copyrightText,
                    raw: false
                })
            ] : []),
        ],
        devServer: {
            static: [
                {
                    directory: path.resolve(__dirname, 'dist'),
                    publicPath: '/dist/',
                },
                {
                    directory: path.resolve(__dirname, 'demo'),
                    publicPath: '/',
                    watch: false, // Don't watch static HTML files
                },
            ],
            open: false,
            hot: false,
            liveReload: false,

            watchFiles: {
                paths: ['src/**/*'],
                options: {
                    ignored: ['**/demo/**/*', '**/node_modules/**/*'], // ignore watching demo folder
                },
            }
        },
        cache: {
            type: 'filesystem',
        },
        optimization: {
            minimize: isProduction,
            minimizer: [
                new TerserPlugin({
                    extractComments: true,
                    parallel: true,
                    terserOptions: {
                        format: {
                        comments: false,
                        },
                    },
                })
            ],
        },
    };
};
