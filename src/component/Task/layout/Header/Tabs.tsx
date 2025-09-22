import React, { useContext, useEffect } from 'react';
import { Radio } from 'antd';
import { TaskTab } from '@/component/Task/interface';
import ParamsContext from '@/component/Task/context/ParamsContext';
import styles from './index.less';
import login from '@/store/login';

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
      ]?.filter((item) => {
        if (login.isPrivateSpace() && item.value === TaskTab.approveByCurrentUser) {
          return false;
        }
        return true;
      })}
      defaultValue={TaskTab.all}
      className={styles.tab}
      optionType="button"
    />
  );
};

export default Tabs;
