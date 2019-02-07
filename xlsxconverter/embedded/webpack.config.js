const path = require('path');

module.exports = {
    entry: {
        'converter': ['./convert.js']
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'out'),
        library: ['XLSXConverter', '[name]']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/
            }
        ]
    },
    devtool: "source-map"
};
