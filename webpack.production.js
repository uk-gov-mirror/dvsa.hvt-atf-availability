const fs = require('fs');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const archiver = require('archiver');
const branchName = require('current-git-branch');

const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MinifyBundledPlugin = require('minify-bundled-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const LAMBDA_NAME = 'ATFAVAILABILITY';
const OUTPUT_FOLDER = './dist'
const BUILD_VERSION = branchName().replace("/","-");

class ZipPlugin {
  constructor(params) {
    this.inputPath = params.inputPath;
    this.outputPath = params.outputPath;
    this.outputName = params.outputName;
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap('zip-pack-plugin', async (compilation) => {
      if (!fs.existsSync(this.outputPath)) {
        fs.mkdirSync(this.outputPath)
      };
      const output = fs.createWriteStream(`${this.outputPath}/${this.outputName}.zip`);
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
      await archive.finalize();
    });
  }
};

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new MinifyBundledPlugin({
      patterns: [`.aws-sam/**/*.js`],
    }),
    new ZipPlugin({
      inputPath: `./.aws-sam/build/${LAMBDA_NAME}`,
      outputPath: `${OUTPUT_FOLDER}`,
      outputName: `HVT-${LAMBDA_NAME}-${BUILD_VERSION}`
    }),
  ],
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(),
    ],
  },
});
