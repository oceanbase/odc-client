import Content from './layout/Content';
import styles from './index.less';
import Sider from './layout/Sider';
import { SchedulePageMode } from './interface';

interface IProps {
  projectId?: number;
  mode?: SchedulePageMode;
}

const ScheduleManage: React.FC<IProps> = (props) => {
  const { projectId, mode = SchedulePageMode.COMMON } = props;

  return (
    <div className={styles.schedule}>
      <div className={styles.sider}>
        <Sider mode={mode} />
      </div>
      <Content mode={mode} projectId={projectId} />
    </div>
  );
};

export default ScheduleManage;
