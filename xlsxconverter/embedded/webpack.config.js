const path = require('path');

module.exports = {
    entry: {
        'converter': ['./convert.js']
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'out'),
        library: ['XLSXConverter'],
        devtoolModuleFilenameTemplate: '[namespace]/[resource-path]'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/
            }
        ]
    },
    devtool: 'source-map'
};
