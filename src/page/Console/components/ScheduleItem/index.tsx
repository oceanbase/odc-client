import { formatMessage } from '@/util/intl';
import { useNavigate } from '@umijs/max';
import { ConsoleTextConfig } from '../../const';
import CounterCard from '../CounterCard';
import LabelWithIcon from '../../../../component/LabelWithIcon';
import styles from './index.less';
import DonutChart from '../DonutChart';
import { IPageType } from '@/d.ts/_index';
import { TaskExecStrategy, TaskStatus, TaskType } from '@/d.ts';
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
                const baseRoute = `/${IPageType.Task}?task=${type}`;

                if (type === TaskType.PARTITION_PLAN) {
                  navigate(baseRoute + `&status=${TaskStatus.EXECUTION_SUCCEEDED}`);
                } else {
                  navigate(
                    baseRoute + `&status=${TaskStatus.ENABLED}&filtered=${TaskExecStrategy.CRON}`,
                  );
                }
              }}
            >
              {formatMessage({
                id: 'src.page.Console.components.ScheduleItem.4E8811DF',
                defaultMessage: '已启用',
              })}
              <span className={styles.count}>{successEnabledCount || 0}</span>
              {formatMessage({
                id: 'src.page.Console.components.ScheduleItem.728A17A0',
                defaultMessage: '个',
              })}
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
        <CounterCard
          title={formatMessage({
            id: 'src.page.Console.components.ScheduleItem.1ADBD842',
            defaultMessage: '共执行',
          })}
          counter={total}
        />
        <CounterCard
          title={formatMessage({
            id: 'src.page.Console.components.ScheduleItem.6F6BDC9E',
            defaultMessage: '执行失败',
          })}
          counter={parseInt(failedExecutionCount)}
          status="failed"
        />
      </div>
    </div>
  );
};

export default ScheduleItem;
