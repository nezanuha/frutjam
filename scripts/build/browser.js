const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const pkg = require(path.resolve(process.cwd(), './package.json'));

const copyrightText = `${pkg.name} v${pkg.version} (c) ${(new Date()).getFullYear()} ${pkg.author} | Released under the ${pkg.license} License | ${pkg.homepage}`;

module.exports = (env, argv) => {
    return {
        mode: 'production',
        devtool: false,
        stats: 'minimal',
        entry: {
            frutjam: [
                './src/main.js',
                './src/main.build.css'
            ],
        },
        resolve: {
            extensions: ['.ts', '.js', '.css'],
        },
        output: {
            filename: '[name].min.js',
            path: path.resolve(process.cwd(), 'dist'),
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
            new RemoveEmptyScriptsPlugin(), // 👈 must come before MiniCssExtractPlugin
            new MiniCssExtractPlugin({
                filename: '[name].min.css',
            }),
            new webpack.BannerPlugin({
                banner: copyrightText,
                raw: false
            }),
        ],
        cache: {
            type: 'filesystem',
        },
        optimization: {
            minimize: true,
            splitChunks: false, 
              runtimeChunk: false,
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
