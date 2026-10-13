const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const config = getDefaultConfig(__dirname);
// Browser alias in noble-hashes 1.8 points to a file absent from the export map.
const browserCrypto = path.join(path.dirname(require.resolve('@noble/hashes/crypto')), 'crypto.js');
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    (moduleName === '@noble/hashes/crypto' || moduleName === './crypto.js') &&
    context.originModulePath.replace(/\\/g, '/').includes('/@noble/hashes/')
  ) {
    return { type: 'sourceFile', filePath: browserCrypto };
  }
  return context.resolveRequest(context, moduleName, platform);
};
module.exports = config;
