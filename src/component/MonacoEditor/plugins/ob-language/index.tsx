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

import Plugin from '@oceanbase-odc/monaco-plugin-ob';

let plugin = null;
const languages = [];

export function register(language: string): Plugin {
  //@ts-ignore
  window.obMonaco = {
    getWorkerUrl(type) {
      type = type === 'oracle' ? 'oboracle' : type;
      const url = new URL(window.publicPath || '/', location.origin);
      if (process.env.NODE_ENV === 'development') {
        const url = new URL(window.publicPath || '/', location.origin);
        const objectURL = URL.createObjectURL(
          new Blob(
            [
              `importScripts(${JSON.stringify(
                `${url.href}workers/${MONACO_VERSION}/${type}.js`.toString(),
              )});`,
            ],
            {
              type: 'application/javascript',
            },
          ),
        );
        return objectURL;
      }
      return `${url}workers/${MONACO_VERSION}/${type}.js`;
    },
  };
  language = language || 'obmysql';
  if (plugin) {
    if (language && !languages.includes(language)) {
      languages.push(language);
      plugin.setup([language]);
    }
    return plugin;
  }
  plugin = new Plugin();
  plugin.setup([language]);
  languages.push(language);
  return plugin;
}
