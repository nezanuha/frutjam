const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
    return {
        mode: 'development',
        stats: 'minimal',
        entry: {
            "frutjam": './src/main.css',
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        'postcss-loader',
                        {
                            loader: 'string-replace-loader',
                            options: {
                                search: '^',
                                replace: '@import "tailwindcss";\n',
                                flags: 'g'
                            }
                        }
                    ],
                },
            ],
        },
        plugins: [
            // Only add HtmlWebpackPlugin in development mode
            new HtmlWebpackPlugin({
                template: 'index.html', // Path to your HTML file
                filename: 'index.html', // Output file name
            })
        ], // Filter out false values in production mode
        devtool: 'eval',
        
        // Updated devServer configuration
        devServer: {
            static: {
                directory: path.resolve(__dirname, 'dist'), // Serve content from 'dist' directory
            },
            open: false, // Automatically open the browser
            hot: true, // Enable hot module replacement
            liveReload: true,
            watchFiles: ['src/**/*']
        },
    };
};
