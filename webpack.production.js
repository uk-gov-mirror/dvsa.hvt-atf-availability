const fs = require('fs');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const archiver = require('archiver');
const branchName = require('current-git-branch');

const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MinifyBundledPlugin = require('minify-bundled-webpack-plugin');

const LAMBDA_NAME = 'HVT-ATF-AVAILABILITY';
const BUILD_VERSION = branchName().replace("/","-");

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new MinifyBundledPlugin({
      patterns: [`.aws-sam/**/*.js`],
    }),
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', async (compilation) => {
          if (!fs.existsSync('./dist')) {
            fs.mkdirSync('./dist')
          };
          const output = fs.createWriteStream(`./dist/${LAMBDA_NAME}-${BUILD_VERSION}.zip`);
          const archive = archiver('zip');

          output.on('close', function () {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
          });
          archive.on('error', function(err){
              throw err;
          });
             
          archive.pipe(output);
          archive.directory(`.aws-sam/build/${LAMBDA_NAME}`, false);
          archive.finalize();
        });
      }
    }
  ],
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(),
    ],
  },
});
