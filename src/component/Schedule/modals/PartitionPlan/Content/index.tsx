import { IScheduleRecord, IPartitionPlan } from '@/d.ts/schedule';
import { Descriptions, Divider } from 'antd';
import { formatMessage } from '@/util/intl';
import PartitionPolicyTable from '@/component/Task/component/PartitionPolicyTable';
import { ErrorStrategyMap } from '@/component/Task/const';
import { getFormatDateTime, milliSecondsToHour } from '@/util/utils';
import DatabaseLabel from '@/component/Task/component/DatabaseLabel';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import {
  IPartitionPlanSubTaskExecutionDetails,
  IPartitionPlanSubTaskParameters,
  scheduleTask,
} from '@/d.ts/scheduleTask';
import { SubTypeTextMap } from '@/constant/scheduleTask';
import EllipsisText from '@/component/EllipsisText';
import login from '@/store/login';

interface IProps {
  schedule: IScheduleRecord<IPartitionPlan>;
  subTask?: scheduleTask<IPartitionPlanSubTaskParameters, IPartitionPlanSubTaskExecutionDetails>;
}
const PartitionScheduleContent: React.FC<IProps> = (props) => {
  const { schedule, subTask } = props;
  const { parameters } = schedule || {};

  const executionTimeout = milliSecondsToHour(parameters?.timeoutMillis);

  return (
    <>
      <Descriptions column={2}>
        {subTask && (
          <>
            <Descriptions.Item label={'ID'}>{subTask?.id}</Descriptions.Item>
            <Descriptions.Item label={'类型'}>{SubTypeTextMap[subTask?.type]}</Descriptions.Item>
          </>
        )}
        {!subTask && (
          <>
            <Descriptions.Item label={'ID'}>{schedule?.scheduleId}</Descriptions.Item>
            <Descriptions.Item label={'类型'}>
              {formatMessage({
                id: 'odc.src.component.Task.PartitionTask.DetailContent.Partition',
                defaultMessage: '分区计划',
              })}
            </Descriptions.Item>
          </>
        )}
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.PartitionTask.DetailContent.F74A95F4',
            defaultMessage: '数据库',
          })}
        >
          <EllipsisText
            needTooltip={false}
            content={<DatabaseLabel database={parameters?.databaseInfo} />}
          />
        </Descriptions.Item>
        <Descriptions.Item label={'数据源'}>
          <EllipsisText content={parameters?.databaseInfo?.dataSource?.name} />
        </Descriptions.Item>
        {!login.isPrivateSpace() && (
          <Descriptions.Item label={'项目'}>
            <EllipsisText content={schedule?.project?.name} />
          </Descriptions.Item>
        )}
      </Descriptions>

      <Divider style={{ marginTop: 16 }} />
      <PartitionPolicyTable schedule={schedule} />

      <Descriptions column={2}>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.component.Task.PartitionTask.DetailContent.63D30920',
              defaultMessage: '任务错误处理',
            }) /*"任务错误处理"*/
          }
        >
          {ErrorStrategyMap[parameters?.errorStrategy]}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.component.Task.PartitionTask.DetailContent.477F07A5',
              defaultMessage: '执行超时时间',
            }) /*"执行超时时间"*/
          }
        >
          {executionTimeout || '-'}
          {formatMessage({
            id: 'src.component.Task.PartitionTask.DetailContent.B08D0E80' /*小时*/,
            defaultMessage: '小时',
          })}
        </Descriptions.Item>
      </Descriptions>

      <Divider style={{ marginTop: 16 }} />
      <Descriptions column={2}>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.src.component.Task.PartitionTask.DetailContent.Founder',
              defaultMessage: '创建人',
            }) /* 创建人 */
          }
        >
          {schedule?.creator?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.src.component.Task.PartitionTask.DetailContent.CreationTime',
              defaultMessage: '创建时间',
            }) /* 创建时间 */
          }
        >
          {getFormatDateTime(schedule?.createTime)}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};

export default PartitionScheduleContent;
