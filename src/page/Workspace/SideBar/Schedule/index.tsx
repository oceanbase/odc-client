import { formatMessage } from '@/util/intl';
import Sider from '@/component/Schedule/layout/Sider';
import tracert from '@/util/tracert';
import React, { useEffect } from 'react';
import SideTabs from '../components/SideTabs';
import styles from './index.less';
import { SchedulePageMode } from '@/component/Schedule/interface';

interface IProps {}

const Schedule: React.FC<IProps> = () => {
  useEffect(() => {
    tracert.expo('a3112.b41896.c330990');
  }, []);
  return (
    <SideTabs
      key="Schedule"
      tabs={[
        {
          title: formatMessage({
            id: 'src.page.Workspace.SideBar.Schedule.45134F41',
            defaultMessage: '作业',
          }),
          key: 'Schedule',
          actions: [],
          render() {
            return <Sider className={styles.scheduleSider} mode={SchedulePageMode.MULTI_PAGE} />;
          },
        },
      ]}
    />
  );
};

export default Schedule;
