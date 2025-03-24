const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development';

    return {
        mode: isDevelopment ? 'development' : 'production',
        stats: 'minimal',
        entry: {
            "frutjam": './src/main.css',
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'postcss-loader',
                        {
                            loader: 'string-replace-loader',
                            options: {
                                search: '^',
                                replace: isDevelopment ? '@import "tailwindcss";\n' : '',
                                flags: 'g'
                            }
                        }
                    ],
                },
            ],
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: '[name].css',
            }),
            // Only add HtmlWebpackPlugin in development mode
            isDevelopment && new HtmlWebpackPlugin({
                template: 'index.html', // Path to your HTML file
                filename: 'index.html', // Output file name
            }),
        ].filter(Boolean), // Filter out false values in production mode
        devtool: isDevelopment ? 'eval-source-map' : false,
        
        // Updated devServer configuration
        devServer: {
            static: {
                directory: path.resolve(__dirname, 'dist'), // Serve content from 'dist' directory
            },
            compress: true, // Enable gzip compression
            open: false, // Automatically open the browser
            hot: true, // Enable hot module replacement
            historyApiFallback: true, // Support for single-page applications
        },
    };
};
