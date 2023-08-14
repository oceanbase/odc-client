/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
