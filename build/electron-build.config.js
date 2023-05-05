const distDir = 'dist';
const buildMode = process.env.ELECTRON_COMPRESSION_MODE

console.log('buildMode: ', buildMode)

const config = {
  productName: 'OceanBase Developer Center',
  compression: buildMode || 'normal',
  afterSign: "electron-builder-notarize",
  mac: {
    hardenedRuntime: true,
    category: 'public.app-category.developer-tools',
    entitlements: "./node_modules/electron-builder-notarize/entitlements.mac.inherit.plist",
    entitlementsInherit: "./node_modules/electron-builder-notarize/entitlements.mac.inherit.plist",
    gatekeeperAssess: false,
    target: 'dmg',
  },
  dmg: {
    artifactName: 'odc_${version}${env.ENV}.${ext}',
    writeUpdateInfo: false
  },
  win: {
    target: 'nsis',
    rfc3161TimeStampServer: "http://sha256timestamp.ws.symantec.com/sha256/timestamp",
    signingHashAlgorithms: ["sha256"]
  },
  nsis: {
    differentialPackage: false,
    artifactName: 'odc_Setup_${version}_${env.ARCH}${env.ENV}.${ext}',
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    runAfterFinish: false,
    perMachine: true,
    menuCategory: 'OceanBase Developer Center',
    warningsAsErrors: false,
  },
  directories: {
    output: 'release',
  },
  appId: 'com.antfin.odc',
  asar: true,
  extraMetadata: {
    main: 'main.js',
  },
  files: [
    {
      from: '.',
      filter: ['package.json'],
    },
    {
      from: `${distDir}/main`,
    },
    {
      from: `${distDir}/renderer-dll`,
    },
  ],
  extraResources: [
    'libraries',
    {
      from: `${distDir}/renderer`,
      to: 'renderer',
    },
  ],
};

module.exports = config;
