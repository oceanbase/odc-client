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
import { AutoCommitMode, TaskExecStrategy, TaskType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { IODCSetting, ODCSettingGroup } from '../../config';
import InputItem from '../../Item/InputItem';
import RadioItem from '../../Item/RadioItem';
import TextAreaItem from '../../Item/TextItem';
import SelectItem from '../../Item/SelectItem';
import { getTaskExecStrategyTextMap } from '@/component/Task';

const taskGroup: ODCSettingGroup = {
  label: '工单任务',
  key: 'groupTask',
};

const taskSetting: IODCSetting[] = [
  // {
  //   label: '工单任务执行方式',
  //   key: 'way',
  //   group: taskGroup,
  //   storeType: 'server',
  //   render: (value, onChange) => {
  //     return (
  //       <SelectItem
  //         options={[
  //           {
  //             label: getTaskExecStrategyTextMap[TaskExecStrategy.START_NOW],
  //             value: TaskExecStrategy.START_NOW,
  //           },
  //           {
  //             label: getTaskExecStrategyTextMap[TaskExecStrategy.MANUAL],
  //             value: TaskExecStrategy.MANUAL,
  //           },
  //           {
  //             label: getTaskExecStrategyTextMap[TaskExecStrategy.START_AT],
  //             value: TaskExecStrategy.START_AT,
  //           },
  //         ]}
  //         config={{ width: 480, mode: 'tags', showDefault: true }}
  //         value={value}
  //         onChange={onChange}
  //       />
  //     );
  //   },
  // },
  // {
  //   label: '定时任务执行方式',
  //   key: 'time',
  //   group: taskGroup,
  //   storeType: 'server',
  //   render: (value, onChange) => {
  //     return (
  //       <SelectItem
  //         options={[
  //           {
  //             label: getTaskExecStrategyTextMap[TaskExecStrategy.TIMER],
  //             value: TaskExecStrategy.TIMER,
  //           },
  //           {
  //             label: getTaskExecStrategyTextMap[TaskExecStrategy.START_NOW],
  //             value: TaskExecStrategy.START_NOW,
  //           },
  //           {
  //             label: getTaskExecStrategyTextMap[TaskExecStrategy.MANUAL],
  //             value: TaskExecStrategy.MANUAL,
  //           },
  //           {
  //             label: getTaskExecStrategyTextMap[TaskExecStrategy.START_AT],
  //             value: TaskExecStrategy.START_AT,
  //           },
  //         ]}
  //         config={{ width: 480, mode: 'tags', showDefault: true }}
  //         value={value}
  //         onChange={onChange}
  //       />
  //     );
  //   },
  // },
  {
    label: '导入工单允许结构替换',
    key: 'odc.task.default.importTaskStructureReplacementEnabled',
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
  {
    label: '任务描述提示文案',
    key: 'odc.task.default.taskDescriptionPrompt',
    group: taskGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <TextAreaItem
          value={value}
          onChange={onChange}
          config={{
            showCount: true,
            maxLength: 200,
          }}
        />
      );
    },
  },
];

export default taskSetting;
