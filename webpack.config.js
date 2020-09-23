const path = require('path');
const AwsSamPlugin = require('aws-sam-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const awsSamPlugin = new AwsSamPlugin({ vscodeDebug: false });
const lambdaName = "LambdaFunction";

module.exports = {
  // Loads the entry object from the AWS::Serverless::Function resources in your SAM config.
  entry: () => awsSamPlugin.entry(),

  // Write the output to the .aws-sam/build folder
  output: {
    filename: `.aws-sam/build/${lambdaName}/app.js`,
    libraryTarget: 'commonjs2',
    path: path.resolve('.')
  },

  // Create source maps
  devtool: 'source-map',

  // Resolve .ts and .js extensions
  resolve: {
      extensions: ['.ts', '.js']
  },

  // Target node
  target: 'node',

  node: {
    __dirname: false,
    __filename: false,
  },

  // AWS recommends always including the aws-sdk in your Lambda package but excluding can significantly reduce
  // the size of your deployment package. If you want to always include it then comment out this line. It has
  // been included conditionally because the node10.x docker image used by SAM local doesn't include it.
  externals: process.env.NODE_ENV === 'development' ? [{ fsevents: "require('fsevents')" }] : [{ fsevents: "require('fsevents')" }, 'aws-sdk'],

  // Set the webpack mode
  mode: process.env.NODE_ENV || 'production',

  // Add the TypeScript loader
  module: {
      rules: [
        { 
          test: /\.tsx?$/, 
          loader: 'ts-loader' 
        }
    ]
  },

  // Add the AWS SAM Webpack plugin and copy supporting build files
  plugins: [
    awsSamPlugin, 
    new CopyPlugin({
      patterns: [
        { from: './simple-proxy-api.yml', to: '.aws-sam/build/simple-proxy-api.yml' },
        { from: './.env', to: `.aws-sam/build/${lambdaName}/` },
        { from: './src/views', to: `.aws-sam/build/${lambdaName}/views` },
        { from: './node_modules/govuk-frontend', to: `.aws-sam/build/${lambdaName}/govuk-frontend` },
        // TODO -  remove `./src/public` from repository and create step that does the following: 
        // transpile `govuk-frontend/govuk/*.scss` to css and minify
        // minify govuk-frontend/govuk/*.js
        // save outputs to `.aws-sam/build/${lambdaName}/public`
        // copy `govuk-frontend/govuk/assets` to `.aws-sam/build/${lambdaName}/public`
        { from: './src/public', to: `.aws-sam/build/${lambdaName}/public` }
      ],
    }),
  ]
};
