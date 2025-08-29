import React, { useContext, useEffect } from 'react';
import { Radio } from 'antd';
import { ScheduleTab } from '@/component/Schedule/interface';
import ParamsContext from '@/component/Schedule/context/ParamsContext';
import { useSearchParams } from '@umijs/max';
import styles from './index.less';

const Tabs = () => {
  const context = useContext(ParamsContext);
  const { params, setParams } = context || {};
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') as ScheduleTab;

  useEffect(() => {
    setParams({ tab: tab || ScheduleTab.all });
  }, [tab]);

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
