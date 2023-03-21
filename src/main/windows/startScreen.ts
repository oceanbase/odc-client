import * as Splashscreen from '@trodi/electron-splashscreen';
import path from 'path';
import { mainWebWindowConfig } from '../config';

export default function () {
  // show splash screen
  // @see https://github.com/trodi/electron-splashscreen/
  const sessionKey = ~~(Math.random() * 100000) + '';
  const config: Splashscreen.Config = {
    windowOpts: {
      ...mainWebWindowConfig,
      webPreferences: {
        ...mainWebWindowConfig.webPreferences,
        // partition: sessionKey
      },
    },
    templateUrl:
      process.env.NODE_ENV === 'development'
        ? path.join(process.cwd(), 'libraries/splash-screen/index.html')
        : path.join(process.resourcesPath || '', 'libraries', 'splash-screen', 'index.html'),
    splashScreenOpts: {
      width: 600,
      height: 300,
      backgroundColor: 'white',
      resizable: false,
    },
  };
  return Splashscreen.initSplashScreen(config);
}
