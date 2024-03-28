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

import { formatMessage } from '@/util/intl';
import RadioItem from '../Item/RadioItem';
import { IODCSetting, ODCSettingGroup } from '../config';
import { EThemeConfigKey } from '@/store/setting';
import { localeList } from '@/constant';

const preferenceGroup: ODCSettingGroup = {
  label: formatMessage({ id: 'src.component.ODCSetting.config.774332B4' }), //'外观'
  key: 'preference',
};
const preferenceDefaultGroup: ODCSettingGroup = {
  label: '',
  key: 'preferenceDefault',
};

const perferenceSettings: IODCSetting[] = [
  {
    label: formatMessage({ id: 'src.component.ODCSetting.config.8D0B9878' }), //'主题'
    key: 'odc.appearance.scheme',
    group: preferenceGroup,
    secondGroup: preferenceDefaultGroup,
    storeType: 'server',
    span: 24,
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: (
                <img
                  style={{ width: 170, height: 100 }}
                  src={window.publicPath + `img/theme-white.png`}
                />
              ),

              value: EThemeConfigKey.ODC_WHITE,
            },
            {
              label: (
                <img
                  style={{ width: 170, height: 100 }}
                  src={window.publicPath + `img/theme-dark.png`}
                />
              ),

              value: EThemeConfigKey.ODC_DARK,
            },
          ]}
          value={value}
          onChange={onChange}
        />
      );
    },
  },
  {
    label: formatMessage({ id: 'src.component.ODCSetting.config.7E2B58B7' }), //'语言'
    key: 'odc.appearance.language',
    group: preferenceGroup,
    secondGroup: preferenceDefaultGroup,
    storeType: 'server',
    span: 24,
    hidden: true,
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: formatMessage({ id: 'src.component.ODCSetting.config.549CFCC5' }), //'当前系统语言'
              value: 'FollowSystem',
            },
          ].concat(localeList)}
          value={value}
          onChange={onChange}
        />
      );
    },
  },
];

export default perferenceSettings;
