const path = require('path');

module.exports = (env, argv) => {
    return {
        mode: 'development',
        devtool: 'eval-cheap-module-source-map' ,
        stats: 'errors-warnings',
        entry: {
            frutjam: './src/main.js',
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
                        'style-loader',
                        'css-loader',
                        'postcss-loader',
                    ],
                },
            ],
        },
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
        }
    };
};
