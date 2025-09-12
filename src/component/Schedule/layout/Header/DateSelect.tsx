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
      setParams?.({ executeDate: value });
    } else {
      setsubTaskParams?.({ executeDate: value });
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
            showTime={{ format: 'HH:mm:ss' }}
            format="YYYY-MM-DD HH:mm:ss"
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
