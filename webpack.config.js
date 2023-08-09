const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

var config = {
    entry: {
        content: './src/content.js',
        options: './src/options.js',
        background: './src/background.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
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
    }
}

module.exports = (env, argv) => {
    if (argv.mode === 'development') {
        config.devtool = 'source-map';
        config.watch = true;
    }

    return config;
};