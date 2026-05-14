/**
 * This file can be edited to customize webpack configuration.
 * To reset delete this file and rerun theia build again.
 */
// @ts-check
const path = require('path');
const configs = require('./gen-webpack.config.js');
const nodeConfig = require('./gen-webpack.node.config.js');

// Theia 1.71 expects an older @vscode/ripgrep package layout. Newer versions
// expose the binary via rgPath instead of a bin/rg.exe subpath.
if (nodeConfig.nativePlugin?.copyRipgrep) {
    nodeConfig.nativePlugin.copyRipgrep = async function (_issuer, compiler) {
        const arch = process.env.npm_config_arch || process.arch;
        const suffix = process.platform === 'win32' ? '.exe' : '';
        const platformPkg = `@vscode/ripgrep-${process.platform}-${arch}`;
        const sourceFile = require.resolve(`${platformPkg}/bin/rg${suffix}`);
        const targetFile = path.join(compiler.outputPath, this.options.out, `rg${suffix}`);
        await this.copyExecutable(sourceFile, targetFile);
    };
}

/**
 * Expose bundled modules on window.theia.moduleName namespace, e.g.
 * window['theia']['@theia/core/lib/common/uri'].
 * Such syntax can be used by external code, for instance, for testing.
configs[0].module.rules.push({
    test: /\.js$/,
    loader: require.resolve('@theia/application-manager/lib/expose-loader')
}); */

module.exports = [
    ...configs,
    nodeConfig.config
];
