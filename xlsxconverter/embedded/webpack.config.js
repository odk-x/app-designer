var path = require('path');

var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

module.exports = {
    entry: ['babel-polyfill', 'whatwg-fetch', './convert.js'],
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'out')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                "env",
                                {
                                    "targets": {"browsers": ["Chrome >= 50", "Firefox >= 50"]}
                                }
                            ],
                            "es2015"
                        ],
                        plugins: ['lodash']
                    }
                }
            }
        ]
    },
    'plugins': [
        new LodashModuleReplacementPlugin({
            'collections': true,
            'paths': true,
            'cloning': true,
            'shorthands': true
        })
    ],
    devtool: "source-map",
    node: {
        fs: "empty" // XLSX compatibility problem, fixed in newer version
    },
    externals: [
        { "./cptable": "var cptable" } // XLSX compatibility problem, fixed in newer version
    ]
};
