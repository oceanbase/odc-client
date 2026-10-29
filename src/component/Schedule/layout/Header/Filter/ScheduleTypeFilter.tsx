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
import ParamsContext from '@/component/Schedule/context/ParamsContext';
import { useContext, useMemo } from 'react';
import { schedlueConfig } from '@/page/Schedule/const';
import { SchedulePageType } from '@/d.ts/schedule';
import { Select } from 'antd';

const ScheduleTypeFilter = ({ isScheduleView }: { isScheduleView: boolean }) => {
  const context = useContext(ParamsContext);
  const { params, setParams, subTaskParams, setsubTaskParams } = context || {};
  const { type } = params || {};
  const { type: subTaskType } = subTaskParams || {};

  const scheduleTypeOptions = useMemo(() => {
    return Object.values(schedlueConfig)
      .map((item) => {
        if (!item.enabled() || item.pageType === SchedulePageType.ALL) return;
        return {
          label: item.label,
          value: item.pageType,
        };
      })
      .filter(Boolean);
  }, []);

  const handleSelectType = (value) => {
    if (isScheduleView) {
      setParams?.({ type: value });
    } else {
      setsubTaskParams?.({ type: value });
    }
  };

  const selectValue = useMemo(() => {
    return isScheduleView ? type : subTaskType;
  }, [isScheduleView, type, subTaskType]);

  return (
    <>
      <div style={{ marginTop: '16px' }}>
        {formatMessage({
          id: 'src.component.Schedule.layout.Header.Filter.451D3719',
          defaultMessage: '作业类型',
        })}
      </div>
      <Select
        showSearch
        placeholder={formatMessage({
          id: 'src.component.Schedule.layout.Header.Filter.93897110',
          defaultMessage: '请输入',
        })}
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        options={scheduleTypeOptions || []}
        style={{ width: '100%' }}
        value={selectValue}
        mode="multiple"
        allowClear
        onChange={handleSelectType}
      />
    </>
  );
};

export default ScheduleTypeFilter;
