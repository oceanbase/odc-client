import Sider from '@/component/Task/Sider';
import { formatMessage } from '@/util/intl';
import React from 'react';
import SideTabs from '../components/SideTabs';
import styles from './index.less';

interface IProps {}

const Task: React.FC<IProps> = () => {
  return (
    <SideTabs
      tabs={[
        {
          title: formatMessage({ id: 'odc.SideBar.Task.Ticket' }), //工单
          key: 'task',
          actions: [],
          render() {
            return (
              <div>
                <Sider className={styles.taskSider} isPage={true} />
              </div>
            );
          },
        },
      ]}
    />
  );
};

export default Task;
