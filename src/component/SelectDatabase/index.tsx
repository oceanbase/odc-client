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

import ReactDom from 'react-dom';
import SelectModal from './component';
import { ConnectType } from '@/d.ts';

export default async function SelectDatabase(
  isSupport?: (v: ConnectType) => boolean,
): Promise<[number]> {
  return new Promise((resolve) => {
    const mountDom = document.createElement('div');
    document.body.appendChild(mountDom);
    function unmount() {
      ReactDom.unmountComponentAtNode(mountDom);
    }
    ReactDom.render(
      <SelectModal
        isSupport={isSupport}
        open={true}
        onClose={() => {
          resolve([null]);
          unmount();
        }}
        onOk={(v) => {
          resolve([v]);
          unmount();
        }}
      />,
      mountDom,
    );
  });
}
