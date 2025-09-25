import { IScheduleRecord, IDataArchiveParameters } from '@/d.ts/schedule';
import { Descriptions, Collapse, Space, Divider, message } from 'antd';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import DatabaseLabel from '@/component/Task/component/DatabaseLabel';
import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import { formatMessage } from '@/util/intl';
import VariableConfigTable from '@/component/Task/component/VariableConfigTable';
import ArchiveRange from './ArchiveRange';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';
import {
  DirtyRowActionEnum,
  DirtyRowActionLabelMap,
} from '@/component/ExecuteSqlDetailModal/constant';
import { kbToMb, mbToKb } from '@/util/utils';
import { getFormatDateTime, milliSecondsToHour } from '@/util/utils';
import { InsertActionOptions } from '@/component/Schedule/modals/DataArchive/Create';
import { SyncTableStructureConfig } from '@/component/Task/const';
import ThrottleEditableCell from '@/component/Task/component/ThrottleEditableCell';
import setting from '@/store/setting';
import { updateLimiterConfig } from '@/common/network/schedule';
import {
  IDataArchiveParametersSubTaskParameters,
  IDataArchiveSubTaskExecutionDetails,
  scheduleTask,
} from '@/d.ts/scheduleTask';
import { SubTypeTextMap } from '@/constant/scheduleTask';
import EllipsisText from '@/component/EllipsisText';
import login from '@/store/login';
import { ShardingStrategy } from '@/d.ts';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import Icon from '@ant-design/icons';
import { executeTimeoutStrategyOptions } from '@/component/Schedule/components/ExecuteTimeoutSchedulingStrategy';
import { IArchiveRangeTextMap } from '../Create/ArchiveRange';
import { IArchiveRange } from '@/d.ts';

interface IProps {
  schedule: IScheduleRecord<IDataArchiveParameters>;
  subTask?: scheduleTask<
    IDataArchiveParametersSubTaskParameters,
    IDataArchiveSubTaskExecutionDetails
  >;
  onReload?: () => void;
}
const DataArchiveScheduleContent: React.FC<IProps> = (props) => {
  const { schedule, onReload, subTask } = props;
  const { parameters } = schedule || {};
  const insertActionLabel = InsertActionOptions?.find(
    (item) => item.value === parameters?.migrationInsertAction,
  )?.label;
  const sourceDataSourceStyle = getDataSourceStyleByConnectType(
    parameters?.sourceDatabase?.dataSource?.type,
  );
  const targetDataSourceStyle = getDataSourceStyleByConnectType(
    parameters?.targetDatabase?.dataSource?.type,
  );
  const archiveRange =
    IArchiveRangeTextMap[parameters?.fullDatabase ? IArchiveRange.ALL : IArchiveRange.PORTION];

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
            <Descriptions.Item label={'类型'}>数据归档</Descriptions.Item>
          </>
        )}

        <Descriptions.Item label={'源端数据库'}>
          <EllipsisText
            needTooltip={false}
            content={<DatabaseLabel database={parameters?.sourceDatabase} />}
          />
        </Descriptions.Item>
        <Descriptions.Item label={'源端数据源'}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Icon
              component={sourceDataSourceStyle?.icon?.component}
              style={{
                color: sourceDataSourceStyle?.icon?.color,
                fontSize: 16,
                marginRight: 4,
              }}
            />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <EllipsisText content={parameters?.sourceDatabase?.dataSource?.name} />
            </div>
          </div>
        </Descriptions.Item>
        <Descriptions.Item label={'目标数据库'}>
          <EllipsisText
            needTooltip={false}
            content={<DatabaseLabel database={parameters?.targetDatabase} />}
          />
        </Descriptions.Item>
        <Descriptions.Item label={'目标端数据源'}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Icon
              component={targetDataSourceStyle?.icon?.component}
              style={{
                color: targetDataSourceStyle?.icon?.color,
                fontSize: 16,
                marginRight: 4,
              }}
            />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <EllipsisText content={parameters?.targetDatabase?.dataSource?.name} />
            </div>
          </div>
        </Descriptions.Item>
        {!login.isPrivateSpace() && (
          <Descriptions.Item label={'项目'}>
            <EllipsisText content={schedule?.project?.name} />
          </Descriptions.Item>
        )}
      </Descriptions>
      <Divider style={{ marginTop: 16 }} />
      <SimpleTextItem
        showSplit={false}
        label={
          <>
            <span>归档范围：</span>
            <span style={{ color: 'var(--text-color-primary)' }}>{archiveRange}</span>
          </>
        }
        content={
          <div
            style={{
              margin: '8px 0 12px',
            }}
          >
            <ArchiveRange tables={parameters?.tables} />
          </div>
        }
        direction="column"
      />
      <SimpleTextItem
        label={formatMessage({
          id: 'odc.DataArchiveTask.DetailContent.VariableConfiguration',
          defaultMessage: '变量配置',
        })}
        content={
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

      <Descriptions column={2} style={{ paddingBottom: 12 }}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.DataArchiveTask.DetailContent.CleanUpArchivedDataFrom',
            defaultMessage: '清理源端已归档的数据',
          })} /*清理源端已归档的数据*/
        >
          {
            parameters?.deleteAfterMigration
              ? formatMessage({
                  id: 'odc.DataArchiveTask.DetailContent.Yes',
                  defaultMessage: '是',
                }) //是
              : formatMessage({
                  id: 'odc.DataArchiveTask.DetailContent.No',
                  defaultMessage: '否',
                }) //否
          }
        </Descriptions.Item>
        {isConnectTypeBeFileSystemGroup(parameters?.targetDatabase?.connectType) && (
          <Descriptions.Item
            label={formatMessage({
              id: 'src.component.Task.DataArchiveTask.DetailContent.F3FBB17A',
              defaultMessage: '任务完成后删除归档过程中产生的临时表',
            })}
          >
            {
              parameters?.deleteTemporaryTable
                ? formatMessage({
                    id: 'odc.DataArchiveTask.DetailContent.Yes',
                    defaultMessage: '是',
                  }) //是
                : formatMessage({
                    id: 'odc.DataArchiveTask.DetailContent.No',
                    defaultMessage: '否',
                  }) //否
            }
          </Descriptions.Item>
        )}
        <Descriptions.Item label={'通过全表扫描进行数据搜索'} span={1}>
          {parameters?.shardingStrategy === ShardingStrategy.FIXED_LENGTH ? '是' : '否'}
        </Descriptions.Item>
        {/* <Descriptions.Item label={'目标表结构不存在时自动创建'} span={1}>
          {parameters?.syncTableStructure?.length
            ? formatMessage({
                id: 'src.component.Task.DataArchiveTask.DetailContent.FFC5907D',
                defaultMessage: '是',
              })
            : formatMessage({
                id: 'src.component.Task.DataArchiveTask.DetailContent.855EA40A',
                defaultMessage: '否',
              })}
        </Descriptions.Item> */}
        {parameters?.deleteAfterMigration ? (
          <Descriptions.Item
            label={formatMessage({
              id: 'src.component.Task.DataArchiveTask.DetailContent.3DA547C9',
              defaultMessage: '源端目标端数据不一致处理',
            })}
          >
            {DirtyRowActionLabelMap[parameters?.dirtyRowAction]}
          </Descriptions.Item>
        ) : null}
        {parameters?.dirtyRowAction === DirtyRowActionEnum.SKIP ? (
          <Descriptions.Item
            label={formatMessage({
              id: 'src.component.Task.DataArchiveTask.DetailContent.A7A520D7',
              defaultMessage: '跳过不清理数据',
            })}
          >
            {formatMessage(
              {
                id: 'src.component.Task.DataArchiveTask.DetailContent.A96E9271',
                defaultMessage: '{LogicalExpression0} 行',
              },
              { LogicalExpression0: parameters?.maxAllowedDirtyRowCount || 0 },
            )}
          </Descriptions.Item>
        ) : null}

        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.DataArchiveTask.DetailContent.4443BB83',
            defaultMessage: '指定任务时长',
          })}
          span={1}
        >
          {parameters?.timeoutMillis ? milliSecondsToHour(parameters?.timeoutMillis) + 'h' : '-'}
        </Descriptions.Item>

        <Descriptions.Item label={'执行超时调度策略'} span={1}>
          {
            executeTimeoutStrategyOptions?.find(
              (item) => item.value === parameters?.scheduleIgnoreTimeoutTask,
            )?.label
          }
        </Descriptions.Item>
        <Descriptions.Item label={'数据插入策略'} span={1}>
          {insertActionLabel || '-'}
        </Descriptions.Item>
        {parameters?.rateLimit?.rowLimit && (
          <Descriptions.Item
            label={
              formatMessage({
                id: 'odc.src.component.Task.DataArchiveTask.DetailContent.RestrictedFlow',
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
        )}
        {parameters?.rateLimit?.dataSizeLimit && (
          <Descriptions.Item
            label={
              formatMessage({
                id: 'odc.src.component.Task.DataArchiveTask.DetailContent.DataSizeLimit',
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
        )}
      </Descriptions>

      <Divider
        style={{
          marginTop: 16,
        }}
      />
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

export default DataArchiveScheduleContent;
