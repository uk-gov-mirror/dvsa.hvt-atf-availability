const fs = require('fs');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const archiver = require('archiver');
const branchName = require('current-git-branch');

const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MinifyBundledPlugin = require('minify-bundled-webpack-plugin');

const LAMBDA_NAME = 'HVT-ATF-AVAILABILITY';
const BUILD_VERSION = branchName().replace("/","-");

class ZipPlugin {
  constructor(inputPath, outputPath, outputName) {
    this.inputPath = inputPath;
    this.outputPath = outputPath;
    this.outputName = outputName;
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap('zip-pack-plugin', async (compilation) => {
      if (!fs.existsSync(this.outputPath)) {
        fs.mkdirSync(this.outputPath)
      };
      const output = fs.createWriteStream(`${this.outputPath}/${LAMBDA_NAME}-${BUILD_VERSION}.zip`);
      const archive = archiver('zip');

      output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
      });
      archive.on('error', function(err){
          throw err;
      });
         
      archive.pipe(output);
      archive.directory(`${this.inputPath}`, false);
      archive.finalize();
    });
  }
};

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new MinifyBundledPlugin({
      patterns: [`.aws-sam/**/*.js`],
    }),
    new ZipPlugin(
      `.aws-sam/build/${LAMBDA_NAME}`,
      './dist', 
      `${LAMBDA_NAME}-${BUILD_VERSION}.zip`)
  ],
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(),
    ],
  },
});
