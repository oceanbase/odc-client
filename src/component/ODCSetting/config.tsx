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

import databaseSettings from './config/database';
import editorSettings from './config/editor';
import perferenceSettings from './config/preference';
import performanceSettings from './config/performance';
import accountSettings from './config/account';

export interface ODCSettingGroup {
  label: string;
  key: string;
}

export interface IODCSetting<T = any> {
  label: string;
  key: string;
  tip?: string;
  group: ODCSettingGroup;
  secondGroup: ODCSettingGroup;
  /**
   * 渲染宽度
   */
  span?: number;
  storeType: 'server' | 'local';
  disabledInClient?: boolean;
  hidden?: boolean;
  render: (value: T, onChange: (value: T) => Promise<void>) => React.ReactNode;
}

/**
 * setting
 */
const odcSetting: IODCSetting[] = []
  .concat(databaseSettings)
  .concat(editorSettings)
  .concat(perferenceSettings)
  .concat(performanceSettings)
  .concat(accountSettings);

const odcSettingMap: Record<string, IODCSetting> = {};
odcSetting.forEach((setting) => {
  odcSettingMap[setting.key] = setting;
});
export { odcSettingMap };
export default odcSetting;
