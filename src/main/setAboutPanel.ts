import { App } from 'electron';
import packageJson from '../../package.json';
// import path from 'path';

export default function setAboutPanelOptions(app: App) {
  app.setAboutPanelOptions({
    applicationName: packageJson.appName,
    applicationVersion: packageJson.version,
    copyright: packageJson.copyright,
    version: packageJson.version,
    credits: 'A SQL Client for OceanBase',
    // iconPath: path.join(process.resourcesPath || '', 'libraries', 'splash-screen', 'img', 'ob_logo.png'),
  });
}
