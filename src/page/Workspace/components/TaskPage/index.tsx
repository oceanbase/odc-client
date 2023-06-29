import Content from '@/component/Task/Content';
import styles from './index.less';

interface IProps {}

const TaskPage: React.FC<IProps> = () => {
  return (
    <div className={styles.task}>
      <Content />
    </div>
  );
};

export default TaskPage;
