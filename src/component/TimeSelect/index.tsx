import { formatMessage } from '@/util/intl';
import { DatePicker, Select, Space } from 'antd';
import type { Moment } from 'moment';
import React, { useState } from 'react';

const { RangePicker } = DatePicker;

export const TimeOptions = [
  {
    label: formatMessage({ id: 'odc.component.TimeSelect.LastDays' }), //最近 7 天
    value: 7,
  },

  {
    label: formatMessage({ id: 'odc.component.TimeSelect.LastDays.1' }), //最近 15 天
    value: 15,
  },

  {
    label: formatMessage({ id: 'odc.component.TimeSelect.LastDays.2' }), //最近 30 天
    value: 30,
  },

  {
    label: formatMessage({ id: 'odc.component.TimeSelect.LastSixMonths' }), //最近半年
    value: 183,
  },

  {
    label: formatMessage({ id: 'odc.component.TimeSelect.Custom' }), //自定义
    value: 'custom',
  },
];

export const TimeSelect: React.FC<{
  handleChangeFilter: (args: Record<string, any>) => void;
}> = (props) => {
  const [timeValue, setTimeValue] = useState('');
  const [dateValue, setDateValue] = useState<[Moment, Moment]>(null);

  const handleTimeChange = (value) => {
    setTimeValue(value);
    if (value !== 'custom') {
      props.handleChangeFilter({
        execTime: value,
      });
    }
  };

  const handleRangeChange = (value: [Moment, Moment]) => {
    setDateValue(value);
    props.handleChangeFilter({
      execTime: value?.map((item) => item.format('YYYY-MM-DD HH:mm:ss')).join(','),
    });
  };

  return (
    <Space>
      <span>
        {
          formatMessage({
            id: 'odc.component.TimeSelect.ExecutionTime',
          }) /*执行时间：*/
        }
      </span>
      <Select defaultValue={7} bordered={false} options={TimeOptions} onChange={handleTimeChange} />
      {timeValue === 'custom' && (
        <RangePicker
          defaultPickerValue={dateValue}
          bordered={false}
          showTime={{ format: 'HH:mm:ss' }}
          format="YYYY-MM-DD HH:mm:ss"
          onChange={handleRangeChange}
        />
      )}
    </Space>
  );
};
