import { useNavigate } from '@umijs/max';
import { ConsoleTextConfig } from '../../const';
import CounterCard from '../CounterCard';
import LabelWithIcon from '../LabelWithIcon';
import styles from './index.less';
import DonutChart from '../DonutChart';
import { IPageType } from '@/d.ts/_index';
import { TaskStatus, TaskType } from '@/d.ts';
const ScheduleItem = ({ title, progress, type }) => {
  const { statusType } = ConsoleTextConfig.schdules;
  const { successEnabledCount } = progress || {};
  const { failedExecutionCount } = progress?.taskStat || {};
  const navigate = useNavigate();

  const total = progress?.taskStat
    ? statusType.reduce((sum, key) => sum + (parseInt(progress?.taskStat?.[key]) || 0), 0)
    : undefined;

  return (
    <div className={styles.scheduleItem}>
      <div className={styles.progress}>
        <LabelWithIcon
          icon={<span className={styles.title}>{title}</span>}
          label={
            <span
              className={styles.label}
              onClick={() => {
                const target = `/${IPageType.Task}?task=${type}&status=${
                  type === TaskType.PARTITION_PLAN
                    ? TaskStatus.EXECUTION_SUCCEEDED
                    : TaskStatus.ENABLED
                }`;
                navigate(target);
              }}
            >
              已启用 <span className={styles.count}>{successEnabledCount || 0}</span> 个
            </span>
          }
          gap={4}
          align={['vertical', 'center']}
        />
        <div className={styles.ringChart}>
          <DonutChart progress={progress} />
        </div>
      </div>
      <div className={styles.counters}>
        <CounterCard title="共执行" counter={total} />
        <CounterCard title="执行失败" counter={parseInt(failedExecutionCount)} status="failed" />
      </div>
    </div>
  );
};

export default ScheduleItem;
