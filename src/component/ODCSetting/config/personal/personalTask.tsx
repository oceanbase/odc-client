import { formatMessage } from '@/util/intl';
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
import RadioItem from '../../Item/RadioItem';
import InputIntegerItem from '../../Item/InputIntegerItem';
import { getExecutionStrategyConfig, getDatabaseChangeResultSetsConfig } from '../common';

const taskGroup: ODCSettingGroup = {
  label: formatMessage({
    id: 'src.component.ODCSetting.config.personal.744D5453',
    defaultMessage: '工单任务',
  }),
  key: 'personalTask',
};

const personalTaskSetting: IODCSetting[] = [
  {
    label: formatMessage({
      id: 'src.component.ODCSetting.config.personal.460D1C94',
      defaultMessage: '数据库变更默认生成备份回滚方案',
    }),
    key: 'odc.task.default.rollbackPlanEnabled',
    locationKey: 'rollbackPlanEnabled',
    group: taskGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: formatMessage({
                id: 'src.component.ODCSetting.config.personal.DD02C044',
                defaultMessage: '是',
              }),
              value: 'true',
            },
            {
              label: formatMessage({
                id: 'src.component.ODCSetting.config.personal.B8C87030',
                defaultMessage: '否',
              }),
              value: 'false',
            },
          ]}
          value={value}
          onChange={onChange}
        />
      );
    },
  },
  ...getDatabaseChangeResultSetsConfig(taskGroup),
  ...getExecutionStrategyConfig(taskGroup),
  {
    label: '作业任务最小调度间隔',
    key: 'odc.schedule.minSchedulingIntervalMinutes',
    group: taskGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return <InputIntegerItem value={value} onChange={onChange} min="1" unit="分钟" />;
    },
  },
];

export default personalTaskSetting;
