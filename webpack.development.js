const path = require('path');
const AwsSamPlugin = require('aws-sam-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const sass = require('node-sass');

const awsSamPlugin = new AwsSamPlugin({ vscodeDebug: false });
const lambdaName = "LambdaFunction"; // must correspond to lambda name in template.yml

module.exports = {
  entry: () => awsSamPlugin.entry(),
  output: {
    filename: (chunkData) => awsSamPlugin.filename(chunkData),
    libraryTarget: 'commonjs2',
    path: path.resolve('.')
  },
  devtool: 'source-map',
  resolve: {
      extensions: ['.ts', '.js']
  },
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: [{ fsevents: "require('fsevents')" }],
  mode: 'development',
  module: {
      rules: [
        { 
          test: /\.tsx?$/, 
          loader: 'ts-loader' 
        },
    ]
  },
  plugins: [
    awsSamPlugin, 
    new CopyPlugin({
      patterns: [
        { from: './simple-proxy-api.yml', to: '.aws-sam/build/simple-proxy-api.yml' },
        { from: './.env', to: `.aws-sam/build/${lambdaName}/` },
        { from: './src/views', to: `.aws-sam/build/${lambdaName}/views` },
        { from: './node_modules/govuk-frontend', to: `.aws-sam/build/${lambdaName}/views/govuk-frontend` },
        { from: './node_modules/govuk-frontend/govuk/assets', to: `.aws-sam/build/${lambdaName}/public/assets` },
        { from: './node_modules/govuk-frontend/govuk/all.js', to: `.aws-sam/build/${lambdaName}/public/all.js` },
        { 
          from: './src/scss/index.scss',
          to: `.aws-sam/build/${lambdaName}/public/all.css`,
          transform: (content, path) => sass.renderSync({ file: path }).css.toString(),
        },
      ],
    }),
  ],
};
