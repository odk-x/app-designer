const path = require('path');

module.exports = {
    entry: {
        'converter': ['./lib/devenv-util', './convert.js']
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
    devtool: "source-map",
    node: {
        fs: "empty" // XLSX compatibility problem, fixed in newer version
    },
    externals: [
        { "./cptable": "var cptable" } // XLSX library compatibility problem, fixed in newer version
    ]
};
