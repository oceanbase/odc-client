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

import databaseSettings from './config/user/database';
import editorSettings from './config/user/editor';
import perferenceSettings from './config/user/preference';
import performanceSettings from './config/user/performance';
import accountSettings from './config/user/account';
import type { FormRule } from 'antd';
import sqlQuerySetting from './config/group/sqlQuery';
import taskSetting from './config/group/task';
import securitySetting from './config/group/security';
import personalTaskSetting from './config/personal/personalTask';
import personalSqlQuerySetting from './config/personal/personalSqlQuery';

export interface ODCSettingGroup {
  label: string;
  key: string;
}

export interface IODCSetting<T = any> {
  label: string;
  key: string;
  locationKey?: string;
  tip?: string;
  group: ODCSettingGroup;
  secondGroup?: ODCSettingGroup;
  /**
   * 渲染宽度
   */
  span?: number;
  rules?: FormRule[];
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

const odcGroupSetting: IODCSetting[] = []
  .concat(sqlQuerySetting)
  .concat(taskSetting)
  .concat(securitySetting);

const odcPersonSetting: IODCSetting[] = []
  .concat(personalSqlQuerySetting)
  .concat(personalTaskSetting);

const odcSettingMap: Record<string, IODCSetting> = {};
odcSetting.forEach((setting) => {
  odcSettingMap[setting.key] = setting;
});
odcPersonSetting.forEach((setting) => {
  odcSettingMap[setting.key] = setting;
});
odcGroupSetting.forEach((setting) => {
  odcSettingMap[setting.key] = setting;
});
export { odcSettingMap, odcGroupSetting, odcPersonSetting };
export default odcSetting;
