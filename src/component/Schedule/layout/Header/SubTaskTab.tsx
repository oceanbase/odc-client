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
          label: '全部',
          value: ScheduleTaskTab.all,
        },
        {
          label: '待我执行',
          value: ScheduleTaskTab.approveByCurrentUser,
        },
      ]}
      defaultValue={ScheduleTaskTab.all}
      optionType="button"
    />
  );
};
export default SubTaskTab;
