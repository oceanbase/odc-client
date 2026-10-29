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

import React, { useContext } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Select, DatePicker } from 'antd';
import FilterIcon from '@/component/Button/FIlterIcon';
import { formatMessage } from '@/util/intl';
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

interface DateSelectProps {
  timeRange: string | number;
  executeDate: [Dayjs, Dayjs];
  onChange: (value: string) => void;
  onDateChange: (value: [Dayjs, Dayjs]) => void;
  active: boolean;
}

const DateSelect = ({
  timeRange,
  executeDate,
  onChange,
  onDateChange,
  active,
}: DateSelectProps) => {
  const handleChange = (value) => {
    onChange(value);
  };

  const handleSelectDate = (value) => {
    onDateChange(value ?? [undefined, undefined]);
  };

  return (
    <FilterIcon border isActive={active} style={{ padding: '0px' }}>
      <div style={{ marginLeft: '6px', display: 'flex', height: '25px', alignItems: 'center' }}>
        <Select
          value={timeRange}
          style={timeRange === 'custom' ? { height: '20px' } : { height: '20px', width: '100%' }}
          popupMatchSelectWidth={265}
          className={styles.timeSelect}
          defaultValue={7}
          bordered={false}
          options={TimeOptions}
          onChange={handleChange}
          prefix={<ClockCircleOutlined />}
          size="small"
        />
        {timeRange === 'custom' && (
          <RangePicker
            defaultPickerValue={executeDate as [Dayjs, Dayjs]}
            style={{
              width: '250px',
            }}
            value={executeDate}
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
