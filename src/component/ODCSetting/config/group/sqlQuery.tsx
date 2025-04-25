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
import { getCurrentOrganizationId } from '@/store/setting';
import { IODCSetting, ODCSettingGroup } from '../../config';
import InputIntergerItem from '../../Item/InputIntegerItem';
import InputItem from '../../Item/InputItem';
import { validForqueryLimit, validForqueryQueryNumber } from '../../validators';

const databaseGroup: ODCSettingGroup = {
  label: 'SQL 查询',
  key: 'groupSqlQuery',
};

const sqlQuerySetting: IODCSetting[] = [
  {
    label: '查询条数上限',
    key: 'odc.sqlexecute.default.maxQueryLimit',
    locationKey: 'maxQueryLimit',
    group: databaseGroup,
    storeType: 'server',
    rules: [
      {
        validator(rule, value, callback) {
          return validForqueryLimit(value);
        },
      },
    ],
    render: (value, onChange) => {
      return (
        <InputIntergerItem
          value={value}
          onChange={async (value) => {
            sessionStorage.setItem(`maxQueryLimit-${getCurrentOrganizationId()}`, value || '');
            onChange(value);
          }}
          min={'1'}
        />
      );
    },
  },
  {
    label: '查询条数默认值',
    key: 'odc.sqlexecute.default.queryLimit',
    locationKey: 'queryLimit',
    group: databaseGroup,
    storeType: 'server',
    dependencies: ['odc.sqlexecute.default.maxQueryLimit'],
    rules: [
      {
        validator(rule, value, callback) {
          return validForqueryQueryNumber(value);
        },
      },
    ],
    render: (value, onChange) => {
      return <InputIntergerItem value={value} onChange={onChange} min={'1'} />;
    },
  },
];

export default sqlQuerySetting;
