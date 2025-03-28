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
import { AutoCommitMode } from '@/d.ts';
import { IODCSetting, ODCSettingGroup } from '../../config';
import RadioItem from '../../Item/RadioItem';

const taskGroup: ODCSettingGroup = {
  label: '工单任务',
  key: 'personalTask',
};

const personalTaskSetting: IODCSetting[] = [
  {
    label: '数据库变更默认生成备份回滚方案',
    key: 'odc.task.default.rollbackPlanEnabled',
    group: taskGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: '是',
              value: 'true',
            },
            {
              label: '否',
              value: 'false',
            },
          ]}
          value={value}
          onChange={onChange}
        />
      );
    },
  },
];

export default personalTaskSetting;
