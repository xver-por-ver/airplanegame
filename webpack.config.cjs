const path = require('node:path');
const fs = require('node:fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const releaseApp = process.env.RELEASE_APP ?? 'DEV';

const config = {
  entry: './src/App.ts',
  module: {
    rules: [
      {
        test: /src\/.*\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ],
  },
  resolve: {
    extensions: ['.ts'],
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'js/app.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'templates/default.html',
      title: 'Airplanegame',
      inject: 'body',
      scriptLoading: 'module',
      RELEASE_APP: releaseApp,
      bodyContent: fs.readFileSync(path.resolve(__dirname, './templates/pages/game.html'), {encoding: 'utf8'}),
      minify: true,
    }),
    new HtmlWebpackPlugin({
      filename: 'error.html',
      template: 'templates/default.html',
      title: 'Airplanegame',
      inject: 'body',
      scriptLoading: 'module',
      RELEASE_APP: releaseApp,
      bodyContent: fs.readFileSync(path.resolve(__dirname, './templates/pages/error.html'), {encoding: 'utf8'}),
      minify: true,
    })
  ]
};

const webpackConfig = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'eval-source-map';
  }

  // if (argv.mode === 'production') {}

  return config;
};

module.exports = webpackConfig;
