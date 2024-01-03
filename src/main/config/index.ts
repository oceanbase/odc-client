/*
 * Copyright 2024 OceanBase
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

import { BrowserWindowConstructorOptions } from 'electron';
import path from 'path';

export const defaultMainWebWidth = 1250;

export const defaultMainWebHeight = 760;

export const minJDKVersion = '1.8.0';

export const maxJDKVersion = '1.8.0';

export const minJDKReleaseVersion = 200;

export const mainWebWindowConfig: BrowserWindowConstructorOptions = {
  height: defaultMainWebHeight,
  width: defaultMainWebWidth,
  center: true,
  show: false,
  webPreferences: {
    preload: path.join(
      process.env.NODE_ENV === 'development' ? process.cwd() : process.resourcesPath || '',
      'libraries/script',
      'preload.js',
    ),
  },
};
