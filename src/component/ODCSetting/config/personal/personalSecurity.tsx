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
import { IODCSetting, ODCSettingGroup } from '../../config';
import SecretKeyItem from '../../Item/SecretKeyItem';

const securityGroup: ODCSettingGroup = {
  label: '安全设置',
  key: 'groupSecurity',
};

const personalSecuritySetting: IODCSetting[] = [
  {
    label: '数据源密钥',
    key: 'odc.security.default.customDataSourceEncryptionKey',
    locationKey: 'secretKey',
    group: securityGroup,
    rules: [
      {
        validator(rule, value, callback) {
          if (/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{32}$/.test(value) || !value) {
            return Promise.resolve();
          }
          return Promise.reject();
        },
      },
    ],
    storeType: 'server',
    render: (value, onChange) => {
      return <SecretKeyItem value={value || ''} onChange={onChange} />;
    },
  },
];

export default personalSecuritySetting;
