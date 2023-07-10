const path = require('path');
const AwsSamPlugin = require('aws-sam-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const sass = require('sass');

const awsSamPlugin = new AwsSamPlugin({ vscodeDebug: false });
const LAMBDA_NAME = 'AtfAvailabilityFunction';

module.exports = {
  entry: () => awsSamPlugin.entry(),
  output: {
    filename: (chunkData) => awsSamPlugin.filename(chunkData),
    libraryTarget: 'commonjs2',
    path: path.resolve('.')
  },
  resolve: {
      extensions: ['.ts', '.js']
  },
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: [{ fsevents: "require('fsevents')" }],
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
        { from: './src/views', to: `.aws-sam/build/${LAMBDA_NAME}/views` },
        { from: './node_modules/govuk-frontend', to: `.aws-sam/build/${LAMBDA_NAME}/views/govuk-frontend` },
        { from: './node_modules/govuk-frontend/govuk/assets', to: `.aws-sam/build/${LAMBDA_NAME}/public/assets` },
        { from: './node_modules/govuk-frontend/govuk/all.js', to: `.aws-sam/build/${LAMBDA_NAME}/public/all.js` },
        {
          from: './src/public/scss/index.scss',
          to: `.aws-sam/build/${LAMBDA_NAME}/public/all.css`,
          transform: (content, path) => sass.renderSync({ file: path }).css.toString(),
        },
      ],
    }),
  ],
};
