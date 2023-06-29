import { TaskExecStrategy } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import Content from './Content';
import styles from './index.less';
import Sider from './Sider';

export const TaskExecStrategyMap = {
  [TaskExecStrategy.AUTO]: formatMessage({
    id: 'odc.components.TaskManagePage.ExecuteNow',
  }), //立即执行
  [TaskExecStrategy.MANUAL]: formatMessage({
    id: 'odc.components.TaskManagePage.ManualExecution',
  }), //手动执行
  [TaskExecStrategy.TIMER]: formatMessage({
    id: 'odc.components.TaskManagePage.ScheduledExecution',
  }), //定时执行
};

interface IProps {}

const TaskManaerPage = () => {
  return (
    <>
      <div className={styles.task}>
        <div className={styles.sider}>
          <Sider />
        </div>
        <Content />
      </div>
    </>
  );
};

export default TaskManaerPage;
