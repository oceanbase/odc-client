import React, { useContext, useEffect } from 'react';
import { Radio } from 'antd';
import { ScheduleTab } from '@/component/Schedule/interface';
import ParamsContext from '@/component/Schedule/context/ParamsContext';
import styles from './index.less';

const Tabs = () => {
  const context = useContext(ParamsContext);
  const { params, setParams } = context || {};

  const handleSelect = (e) => {
    setParams?.({ tab: e.target.value as ScheduleTab });
  };

  return (
    <Radio.Group
      onChange={handleSelect}
      value={params?.tab}
      options={[
        {
          label: '全部',
          value: ScheduleTab.all,
        },
        {
          label: '待我审批',
          value: ScheduleTab.approveByCurrentUser,
        },
      ]}
      defaultValue={ScheduleTab.all}
      className={styles.tab}
      optionType="button"
    />
  );
};
export default Tabs;
