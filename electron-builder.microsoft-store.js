function requiredEnvironmentVariable(name, fallback) {
  const value = process.env[name];
  if (!value) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

module.exports = {
  appId: 'com.dcreations.ncedit7',
  productName: 'NC-Edit7',
  npmRebuild: false,
  directories: {
    output: 'dist2/microsoft-store',
  },
  win: {
    icon: 'node_modules/ncedit7lab/dist/branding/windows-store/app.ico',
    signingHashAlgorithms: ['sha256'],
    target: [
      {
        target: 'appx',
        arch: ['x64'],
      },
    ],
  },
  appx: {
    identityName: requiredEnvironmentVariable('MS_STORE_IDENTITY_NAME', 'com.test.ncedit7'),
    publisher: requiredEnvironmentVariable('MS_STORE_PUBLISHER', 'CN=TestPublisher'),
    publisherDisplayName: requiredEnvironmentVariable('MS_STORE_PUBLISHER_DISPLAY_NAME', 'Test Publisher'),
    displayName: 'NC-Edit7',
    applicationId: 'NCEdit7',
    electronUpdaterAware: false,
    languages: ['en-US', 'de-DE'],
  },
  artifactName: '${productName}-Store-${version}.${ext}',
};