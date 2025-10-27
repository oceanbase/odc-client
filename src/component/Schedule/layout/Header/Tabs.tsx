import { formatMessage } from '@/util/intl';
import React, { useContext, useEffect } from 'react';
import { Radio } from 'antd';
import { ScheduleTab } from '@/component/Schedule/interface';
import ParamsContext from '@/component/Schedule/context/ParamsContext';
import styles from './index.less';

const Tabs = () => {
  const context = useContext(ParamsContext);
  const { params, setParams } = context || {};

  const handleSelect = (e) => {
    setParams?.({
      searchValue: undefined,
      searchType: undefined,
      tab: e.target.value as ScheduleTab,
    });
  };

  return (
    <Radio.Group
      onChange={handleSelect}
      value={params?.tab}
      options={[
        {
          label: formatMessage({
            id: 'src.component.Schedule.layout.Header.4060D379',
            defaultMessage: '全部',
          }),
          value: ScheduleTab.all,
        },
        {
          label: formatMessage({
            id: 'src.component.Schedule.layout.Header.D7D546CD',
            defaultMessage: '待我审批',
          }),
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
