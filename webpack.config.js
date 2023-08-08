const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        content: './src/content.js',
        options: './src/options.js',
        background: './src/background.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/
            },
        ],
    },
    plugins: [
        new CopyPlugin({
          patterns: [
            { from: "public", to: "" },
          ],
        }),
      ],
    optimization: {
        minimize: false,
    },
    devtool: 'source-map',
};