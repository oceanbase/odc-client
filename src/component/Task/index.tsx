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
  [TaskExecStrategy.CRON]: formatMessage({
    id: 'odc.components.TaskManagePage.ScheduledExecution',
  }), //定时执行
  [TaskExecStrategy.DAY]: formatMessage({
    id: 'odc.components.TaskManagePage.ScheduledExecution',
  }), //定时执行
  [TaskExecStrategy.MONTH]: formatMessage({
    id: 'odc.components.TaskManagePage.ScheduledExecution',
  }), //定时执行
  [TaskExecStrategy.WEEK]: formatMessage({
    id: 'odc.components.TaskManagePage.ScheduledExecution',
  }), //定时执行
  [TaskExecStrategy.START_NOW]: '立即执行'
};

interface IProps {
  projectId?: number;
}

const TaskManaerPage = (props) => {
  const { projectId } = props;
  return (
    <>
      <div className={styles.task}>
        <div className={styles.sider}>
          <Sider />
        </div>
        <Content projectId={projectId} />
      </div>
    </>
  );
};

export default TaskManaerPage;
