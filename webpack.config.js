const path = require('path');

module.exports = {
  entry: './src/source.js',
  output: {
    path: path.resolve(__dirname, 'js'),
    filename: 'main.js'
  }
};
