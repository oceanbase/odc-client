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
import React, { useContext } from 'react';
import { Radio } from 'antd';
import { ScheduleTaskTab } from '@/component/Schedule/interface';
import ParamsContext from '@/component/Schedule/context/ParamsContext';

const SubTaskTab = () => {
  const context = useContext(ParamsContext);
  const { subTaskParams, setsubTaskParams } = context || {};

  const handleSelect = (e) => {
    setsubTaskParams?.({ tab: e.target.value as ScheduleTaskTab });
  };

  return (
    <Radio.Group
      onChange={handleSelect}
      value={subTaskParams?.tab}
      options={[
        {
          label: formatMessage({
            id: 'src.component.Schedule.layout.Header.D90B833F',
            defaultMessage: '全部',
          }),
          value: ScheduleTaskTab.all,
        },
        {
          label: formatMessage({
            id: 'src.component.Schedule.layout.Header.D0082435',
            defaultMessage: '待我执行',
          }),
          value: ScheduleTaskTab.approveByCurrentUser,
        },
      ]}
      defaultValue={ScheduleTaskTab.all}
      optionType="button"
    />
  );
};
export default SubTaskTab;
