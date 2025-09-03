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
      <div style={{ marginTop: '16px' }}>作业类型</div>
      <Select
        showSearch
        placeholder="请输入"
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
