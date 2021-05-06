const path = require('path');
const { merge } = require('webpack-merge'); // Allows merging common config with target specific settings in a single file
const TARGET = process.env.npm_lifecycle_event;

//console.log('~~~',merge);;

var common = {
    entry: './src/app.js',
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'bin/js')
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader'
            }
          ],
        }
      ]
    }, 
    //resolve: {
    //  fallback: {
    //    "path": false
    //  }
    //} 
};


// Test 
 
if(TARGET === 'start:dev') {
  
  module.exports = merge(common, {
    devServer: {
      contentBase: path.resolve(__dirname, 'bin'),
      publicPath: '/js/',
      host: '0.0.0.0',
      port: '8080',
      open: true
    },
    devtool: 'inline-source-map',
    /*
    module: {
      rules: [
        { test: /\.json$/, loader: 'json' }
      ]
    }
    */
  });

} else if (TARGET === 'build') {

  module.exports = merge(common, {
  //  devtool: '' // 'source-map
  });
  
}



