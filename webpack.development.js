const path = require('path');
const AwsSamPlugin = require('aws-sam-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const awsSamPlugin = new AwsSamPlugin({ vscodeDebug: false });
const lambdaName = "LambdaFunction"; // must correspond to lambda name in template.yml

module.exports = {
  entry: Object.assign(awsSamPlugin.entry(), { css: ['./node_modules/govuk-frontend/govuk/all.scss'] }),
  output: {
    filename: ({ chunk: { name } }) => {
      return name === lambdaName ? `.aws-sam/build/${lambdaName}/app.js`: '.aws-sam/build/.artefacts/[name].js';
    },
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
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader'
          ],
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
        { from: './node_modules/govuk-frontend', to: `.aws-sam/build/${lambdaName}/govuk-frontend` },
        { from: './node_modules/govuk-frontend/govuk/assets', to: `.aws-sam/build/${lambdaName}/public/assets` },
        { from: './node_modules/govuk-frontend/govuk/all.js', to: `.aws-sam/build/${lambdaName}/public/all.js` },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: `.aws-sam/build/${lambdaName}/public/all.css`,
      chunkFilename: `.aws-sam/build/${lambdaName}/public/[id].css`,
    }),
  ],
};
