import { formatMessage } from '@/util/intl';
import { useNavigate } from '@umijs/max';
import { ConsoleTextConfig } from '../../const';
import CounterCard from '../CounterCard';
import LabelWithIcon from '../../../../component/LabelWithIcon';
import styles from './index.less';
import DonutChart from '../DonutChart';
import { IPageType } from '@/d.ts/_index';
import { TaskExecStrategy, TaskStatus, TaskType } from '@/d.ts';
import { Divider } from 'antd';
import { IStat } from '@/d.ts';
import { ScheduleStatus, ScheduleType } from '@/d.ts/schedule';

const ScheduleItem = ({
  title,
  progress,
  type,
}: {
  title: string;
  progress: IStat;
  type: ScheduleType;
}) => {
  const { count } = progress || {};
  const { PENDING, EXECUTING, EXECUTION_FAILURE, EXECUTION_SUCCESS, OTHER, ENABLED } = count || {};
  const totalCount =
    (PENDING || 0) +
    (EXECUTING || 0) +
    (EXECUTION_FAILURE || 0) +
    (EXECUTION_SUCCESS || 0) +
    (OTHER || 0);
  const navigate = useNavigate();

  return (
    <div className={styles.scheduleItem}>
      <div className={styles.title}>{title}</div>
      <div className={styles.progress}>
        <div className={styles.ringChart}>
          <DonutChart progress={count} />
        </div>
      </div>
      <div className={styles.counters}>
        <CounterCard
          onClick={() => {
            // 跳转到调度管理页面，设置特定类型和已启用状态过滤
            navigate(`/schedule?scheduleStatus=${ScheduleStatus.ENABLED}&scheduleType=${type}`);
          }}
          title={formatMessage({
            id: 'src.page.Console.components.ScheduleItem.4E8811DF',
            defaultMessage: '已启用',
          })}
          counter={ENABLED || 0}
        />
        <Divider className={styles.countersDivider} />
        <CounterCard
          onClick={() => {
            // 跳转到调度管理页面的执行视角
            navigate(`/schedule?scheduleType=${type}&perspective=execution`);
          }}
          title={formatMessage({
            id: 'src.page.Console.components.ScheduleItem.1ADBD842',
            defaultMessage: '共执行',
          })}
          counter={totalCount}
        />
        <CounterCard
          onClick={() => {
            // 跳转到调度管理页面的执行视角，并过滤执行失败的任务
            navigate(`/schedule?scheduleType=${type}&perspective=execution&subTaskStatus=FAILED`);
          }}
          title={formatMessage({
            id: 'src.page.Console.components.ScheduleItem.6F6BDC9E',
            defaultMessage: '执行失败',
          })}
          counter={EXECUTION_FAILURE || 0}
          status="failed"
        />
      </div>
    </div>
  );
};

export default ScheduleItem;
