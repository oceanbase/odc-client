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

import React, { useContext, useMemo } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Select, DatePicker } from 'antd';
import FilterIcon from '@/component/Button/FIlterIcon';
import { formatMessage } from '@/util/intl';
import ParamsContext from '@/component/Schedule/context/ParamsContext';
import styles from './index.less';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

export const TimeOptions = [
  {
    label: formatMessage({ id: 'odc.component.TimeSelect.LastDays', defaultMessage: '最近 7 天' }), //最近 7 天
    value: 7,
  },

  {
    label: formatMessage({
      id: 'odc.component.TimeSelect.LastDays.1',
      defaultMessage: '最近 15 天',
    }), //最近 15 天
    value: 15,
  },

  {
    label: formatMessage({
      id: 'odc.component.TimeSelect.LastDays.2',
      defaultMessage: '最近 30 天',
    }), //最近 30 天
    value: 30,
  },
  {
    label: formatMessage({
      id: 'odc.component.TimeSelect.LastSixMonths',
      defaultMessage: '最近半年',
    }), //最近半年
    value: 183,
  },
  {
    label: formatMessage({ id: 'src.component.TimeSelect.9E6CA23B', defaultMessage: '全部' }),
    value: 'ALL',
  },
  {
    label: formatMessage({ id: 'odc.component.TimeSelect.Custom', defaultMessage: '自定义' }), //自定义
    value: 'custom',
  },
];

const DateSelect = ({ isScheduleView }: { isScheduleView: boolean }) => {
  const context = useContext(ParamsContext);
  const { params, setParams, subTaskParams, setsubTaskParams } = context || {};
  const { timeRange, executeDate } = params || {};
  const { timeRange: subTaskTimeRange, executeDate: subTaskExecuteDate } = subTaskParams || {};

  const handleChange = (value) => {
    if (isScheduleView) {
      setParams?.({ timeRange: value });
    } else {
      setsubTaskParams?.({ timeRange: value });
    }
  };

  const handleSelectDate = (value) => {
    if (isScheduleView) {
      setParams?.({ executeDate: value ?? [undefined, undefined] });
    } else {
      setsubTaskParams?.({ executeDate: value ?? [undefined, undefined] });
    }
  };

  const getStyle = () => {
    if (!isScheduleView) {
      if (subTaskTimeRange === 'custom') {
        return { height: '20px' };
      } else {
      }
      return { height: '20px', width: '100%' };
    }
    if (timeRange === 'custom') {
      return { height: '20px' };
    }
    return { height: '20px', width: '100%' };
  };

  const showRangePicker = useMemo(() => {
    if (isScheduleView) {
      return timeRange === 'custom';
    } else {
      return subTaskTimeRange === 'custom';
    }
  }, [isScheduleView, timeRange, subTaskTimeRange]);

  return (
    <FilterIcon border isActive={false} style={{ padding: '0px' }}>
      <div style={{ marginLeft: '6px', display: 'flex', height: '25px', alignItems: 'center' }}>
        <Select
          value={isScheduleView ? timeRange : subTaskTimeRange}
          style={getStyle()}
          popupMatchSelectWidth={265}
          className={styles.timeSelect}
          defaultValue={7}
          bordered={false}
          options={TimeOptions}
          onChange={handleChange}
          prefix={<ClockCircleOutlined />}
          size="small"
        />
        {showRangePicker && (
          <RangePicker
            defaultPickerValue={executeDate as [Dayjs, Dayjs]}
            style={{
              width: '250px',
            }}
            value={isScheduleView ? executeDate : subTaskExecuteDate}
            size="small"
            suffixIcon={null}
            bordered={false}
            // showTime={{ format: 'HH:mm:ss' }}
            format="YYYY-MM-DD"
            disabledDate={(current) => {
              return current > dayjs();
            }}
            onChange={handleSelectDate}
          />
        )}
      </div>
    </FilterIcon>
  );
};

export default DateSelect;
