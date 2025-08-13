import React, { useContext } from 'react';
import { Radio } from 'antd';
import { TaskTab } from '@/component/Task/interface';
import ParamsContext from '@/component/Task/context/ParamsContext';

const Tabs = () => {
  const context = useContext(ParamsContext);
  const { params, setParams } = context;

  const handleSelect = (e) => {
    setParams({ tab: e.target.value as TaskTab });
  };

  return (
    <Radio.Group
      onChange={handleSelect}
      value={params.tab}
      options={[
        {
          label: '全部',
          value: TaskTab.all,
        },
        {
          label: '待我审批',
          value: TaskTab.approveByCurrentUser,
        },
        {
          label: '待我执行',
          value: TaskTab.executionByCurrentUser,
        },
      ]}
      defaultValue={TaskTab.all}
      optionType="button"
    />
  );
};

export default Tabs;
