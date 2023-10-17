const path = require('path');

module.exports = {
  entry: './src/js/main.js',
  devtool: 'source-map',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname),
    publicPath: '/'
  },
  mode: 'development',
  devServer: {
    static: 'src',
    port: 3007,
    watchFiles: ['src/js/**/*.js', 'public/**/*.html']
  },
  watchOptions: {
    ignored: /node_modules/
  }
};