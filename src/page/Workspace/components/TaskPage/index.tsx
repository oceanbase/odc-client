import { TaskTypeMap } from '@/component/Task/component/TaskTable';
import Content from '@/component/Task/Content';
import { TaskPageType } from '@/d.ts';
import styles from './index.less';

export const getTitleByParams = (params: { type: TaskPageType }) => {
  const { type } = params;
  let title = '';
  if (type === TaskPageType.CREATED_BY_CURRENT_USER) {
    title = '工单-我发起的';
  } else if (type === TaskPageType.APPROVE_BY_CURRENT_USER) {
    title = '工单-待我审批的';
  } else {
    title = `工单-${TaskTypeMap[type]}`;
  }
  return title;
};

interface IProps {
  pageKey: TaskPageType;
}

const TaskPage: React.FC<IProps> = (props) => {
  return (
    <div className={styles.task}>
      <Content pageKey={props?.pageKey} isMultiPage />
    </div>
  );
};

export default TaskPage;
