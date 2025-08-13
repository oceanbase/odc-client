import { IScheduleRecord, IDataClearParameters } from '@/d.ts/schedule';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import DatabaseLabel from '@/component/Task/component/DatabaseLabel';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime, milliSecondsToHour } from '@/util/utils';
import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import VariableConfigTable from '@/component/Task/component/VariableConfigTable';
import ArchiveRange from './ArchiveRange';
import { getScheduleExecStrategyMap } from '@/component/Schedule/helper';
import { kbToMb, mbToKb } from '@/util/utils';
import { Descriptions, Divider, message } from 'antd';
import ThrottleEditableCell from '@/component/Task/component/ThrottleEditableCell';
import {
  DirtyRowActionEnum,
  DirtyRowActionLabelMap,
} from '@/component/ExecuteSqlDetailModal/constant';
import setting from '@/store/setting';
import { shardingStrategyOptions } from '@/component/Task/component/ShardingStrategyItem';
import { updateLimiterConfig } from '@/common/network/schedule';
import { IScheduleTaskRecord, scheduleTask } from '@/d.ts/scheduleTask';
import { SubTypeTextMap } from '@/constant/scheduleTask';
import EllipsisText from '@/component/EllipsisText';

interface IProps {
  schedule: IScheduleRecord<IDataClearParameters>;
  subTask?: scheduleTask;
  onReload?: () => void;
}
const DataClearScheduleContent: React.FC<IProps> = (props) => {
  const { schedule, onReload, subTask } = props;
  const { parameters } = schedule || {};

  const handleRowLimit = async (rowLimit, handleClose) => {
    const res = await updateLimiterConfig(schedule?.scheduleId, {
      rowLimit,
    });
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.src.component.Task.DataArchiveTask.DetailContent.SuccessfullyModified',
          defaultMessage: '修改成功！',
        }), //'修改成功！'
      );
      handleClose();
      onReload?.();
    }
  };

  const handleDataSizeLimit = async (dataSizeLimit, handleClose) => {
    const res = await updateLimiterConfig(schedule?.scheduleId, {
      dataSizeLimit: mbToKb(dataSizeLimit),
    });
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.src.component.Task.DataArchiveTask.DetailContent.SuccessfullyModified.1',
          defaultMessage: '修改成功！',
        }), //'修改成功！'
      );
      handleClose();
      onReload();
    }
  };

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
            <Descriptions.Item label={'类型'}>数据清理</Descriptions.Item>
          </>
        )}

        <Descriptions.Item label={'源端数据库'}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <RiskLevelLabel
              color={parameters?.database?.dataSource?.environmentStyle}
              content={parameters?.database.dataSource.environmentName ?? '-'}
            />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <EllipsisText
                needTooltip={false}
                content={<DatabaseLabel database={parameters?.database} />}
              />
            </div>
          </div>
        </Descriptions.Item>
        <Descriptions.Item label={'源端数据源'}>
          <EllipsisText content={parameters?.database?.dataSource?.name} />
        </Descriptions.Item>
        <Descriptions.Item label={'清理前进行数据校验'}>
          {parameters?.needCheckBeforeDelete ? '是' : '否'}
        </Descriptions.Item>
        <Descriptions.Item>
          <em></em>
        </Descriptions.Item>
        {parameters?.targetDatabase && (
          <>
            <Descriptions.Item label={'目标数据库'}>
              <RiskLevelLabel
                color={parameters?.targetDatabase?.dataSource?.environmentStyle}
                content={parameters?.targetDatabase.dataSource.environmentName ?? '-'}
              />
              <DatabaseLabel database={parameters?.targetDatabase} />
            </Descriptions.Item>
            <Descriptions.Item label={'目标端数据源'}>
              {parameters?.targetDatabase?.dataSource?.name}
            </Descriptions.Item>
          </>
        )}
        <Descriptions.Item label={'项目'}>
          <EllipsisText content={schedule?.project?.name} />
        </Descriptions.Item>
      </Descriptions>
      <Divider style={{ marginTop: 4 }} />
      <SimpleTextItem
        label={formatMessage({
          id: 'odc.DataClearTask.DetailContent.VariableConfiguration',
          defaultMessage: '变量配置',
        })}
        /*变量配置*/ content={
          <div
            style={{
              margin: '8px 0 12px',
            }}
          >
            <VariableConfigTable variables={parameters?.variables} />
          </div>
        }
        direction="column"
      />
      <SimpleTextItem
        label={formatMessage({
          id: 'odc.DataClearTask.DetailContent.CleaningRange',
          defaultMessage: '清理范围',
        })}
        /*清理范围*/ content={
          <div
            style={{
              margin: '8px 0 12px',
            }}
          >
            <ArchiveRange
              tables={parameters?.tables}
              needCheckBeforeDelete={parameters?.needCheckBeforeDelete}
            />
          </div>
        }
        direction="column"
      />
      <Descriptions column={2}>
        {parameters?.needCheckBeforeDelete ? (
          <Descriptions.Item
            label={formatMessage({
              id: 'src.component.Task.DataClearTask.DetailContent.C6968CAA',
              defaultMessage: '源端目标端数据不一致处理',
            })}
          >
            {DirtyRowActionLabelMap[parameters?.dirtyRowAction]}
          </Descriptions.Item>
        ) : null}
        {parameters?.dirtyRowAction === DirtyRowActionEnum.SKIP ? (
          <Descriptions.Item
            label={formatMessage({
              id: 'src.component.Task.DataClearTask.DetailContent.D89667B8',
              defaultMessage: '跳过不清理数据',
            })}
          >
            {formatMessage(
              {
                id: 'src.component.Task.DataClearTask.DetailContent.66E3D51C',
                defaultMessage: '{LogicalExpression0} 行',
              },
              { LogicalExpression0: parameters?.maxAllowedDirtyRowCount || 0 },
            )}
          </Descriptions.Item>
        ) : null}
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.DataClearTask.DetailContent.E977DA21',
            defaultMessage: '搜索策略',
          })}
          span={1}
        >
          {shardingStrategyOptions.find((item) => item.value === parameters?.shardingStrategy)
            ?.label || '-'}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.src.component.Task.DataClearTask.DetailContent.RestrictedFlow',
              defaultMessage: '行限流',
            }) /* 行限流 */
          }
        >
          <ThrottleEditableCell
            suffix="Rows/s"
            min={0}
            max={setting.maxSingleTaskRowLimit}
            defaultValue={parameters?.rateLimit?.rowLimit}
            onOk={handleRowLimit}
          />
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.src.component.Task.DataClearTask.DetailContent.DataSizeLimit',
              defaultMessage: '数据大小限流',
            }) //'数据大小限流'
          }
        >
          <ThrottleEditableCell
            suffix="MB/s"
            min={1}
            max={setting.maxSingleTaskDataSizeLimit}
            defaultValue={kbToMb(parameters?.rateLimit?.dataSizeLimit)}
            onOk={handleDataSizeLimit}
          />
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.component.Task.DataClearTask.DetailContent.2D1A14AB',
              defaultMessage: '使用主键清理',
            }) /*"使用主键清理"*/
          }
        >
          {parameters?.deleteByUniqueKey
            ? formatMessage({
                id: 'src.component.Task.DataClearTask.DetailContent.D2882643',
                defaultMessage: '是',
              })
            : formatMessage({
                id: 'src.component.Task.DataClearTask.DetailContent.834E7D89',
                defaultMessage: '否',
              })}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.DataClearTask.DetailContent.D4D1227C',
            defaultMessage: '指定任务时长',
          })}
          span={1}
        >
          {parameters?.timeoutMillis ? milliSecondsToHour(parameters?.timeoutMillis) + 'h' : '-'}
        </Descriptions.Item>
      </Descriptions>
      <Divider style={{ marginTop: 4 }} />
      <Descriptions>
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

export default DataClearScheduleContent;
