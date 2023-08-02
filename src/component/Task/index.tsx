import { TaskExecStrategy, TaskType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import Content from './Content';
import styles from './index.less';
import Sider from './Sider';

export const getTaskExecStrategyMap = (type: TaskType) => {
  switch (type) {
    case TaskType.DATA_ARCHIVE:
    case TaskType.DATA_DELETE:
      return {
        [TaskExecStrategy.TIMER]: '周期执行',
        [TaskExecStrategy.CRON]: '周期执行',
        [TaskExecStrategy.DAY]: '周期执行',
        [TaskExecStrategy.MONTH]: '周期执行',
        [TaskExecStrategy.WEEK]: '周期执行',
        [TaskExecStrategy.START_NOW]: '立即执行',
        [TaskExecStrategy.START_AT]: '定时执行',
      };
      break;
    default:
      return {
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
  }
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
