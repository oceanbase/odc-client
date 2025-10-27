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
import { Perspective, ScheduleTab, ScheduleTaskTab } from '@/component/Schedule/interface';
import { ScheduleTaskStatus } from '@/d.ts/scheduleTask';
import dayjs, { Dayjs } from 'dayjs';

const ScheduleItem = ({
  title,
  progress,
  type,
  timeValue,
  dateValue,
  selectedProjectId,
}: {
  title: string;
  progress: IStat;
  type: ScheduleType;
  timeValue: number | string;
  dateValue: [Dayjs, Dayjs] | null;
  selectedProjectId: number | undefined;
}) => {
  const { count } = progress || {};
  const { EXECUTION_TIMEOUT, EXECUTING, EXECUTION_FAILURE, EXECUTION_SUCCESS, OTHER, ENABLED } =
    count || {};
  const totalCount =
    (EXECUTION_TIMEOUT || 0) +
    (EXECUTING || 0) +
    (EXECUTION_FAILURE || 0) +
    (EXECUTION_SUCCESS || 0) +
    (OTHER || 0);
  const navigate = useNavigate();

  const buildNavigateUrlWithFilters = (baseUrl: string) => {
    const params = new URLSearchParams(baseUrl.split('?')[1] || '');

    // Add time filter (only if not already set in URL)
    if (!params.has('timeValue') && timeValue) {
      params.set('timeValue', String(timeValue));
    }

    // Add custom date range if applicable (only if timeValue not already in URL)
    if (
      !params.has('timeValue') &&
      String(timeValue) === 'custom' &&
      dateValue?.[0] &&
      dateValue?.[1]
    ) {
      params.set('startTime', String(dateValue[0].valueOf()));
      params.set('endTime', String(dateValue[1].valueOf()));
    }

    // Add project filter
    if (selectedProjectId) {
      params.set('projectId', String(selectedProjectId));
    } else {
      params.set('projectId', 'clear');
    }

    const basePath = baseUrl.split('?')[0];
    return `${basePath}?${params.toString()}`;
  };

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
            // 跳转到调度管理页面，设置特定类型和已启用状态过滤，定位到全局tab，时间选全部，清空审批状态
            navigate(
              buildNavigateUrlWithFilters(
                `/schedule?scheduleStatus=${ScheduleStatus.ENABLED}&scheduleType=${type}&tab=${ScheduleTab.all}&timeValue=ALL&approveStatus=`,
              ),
            );
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
            // 跳转到调度管理页面的执行视角，清空状态筛选以显示所有执行记录
            navigate(
              buildNavigateUrlWithFilters(
                `/schedule?scheduleType=${type}&perspective=${Perspective.executionView}&subTaskStatus=`,
              ),
            );
          }}
          title={formatMessage({
            id: 'src.page.Console.components.ScheduleItem.1ADBD842',
            defaultMessage: '共执行',
          })}
          counter={totalCount}
        />

        <CounterCard
          onClick={() => {
            // 跳转到调度管理页面的执行视角，并过滤执行失败的任务（包括FAILED、ABNORMAL、EXEC_TIMEOUT）
            const failedStatuses = [ScheduleTaskStatus.FAILED, ScheduleTaskStatus.ABNORMAL].join(
              ',',
            );
            navigate(
              buildNavigateUrlWithFilters(
                `/schedule?scheduleType=${type}&perspective=${Perspective.executionView}&subTaskStatus=${failedStatuses}&subTaskTab=${ScheduleTaskTab.all}`,
              ),
            );
          }}
          title={formatMessage({
            id: 'src.page.Console.components.ScheduleItem.45AAE8DB',
            defaultMessage: '执行中断',
          })}
          counter={EXECUTION_FAILURE || 0}
          status="failed"
        />
      </div>
    </div>
  );
};

export default ScheduleItem;
