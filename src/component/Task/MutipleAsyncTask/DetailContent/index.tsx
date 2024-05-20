import { SQLContent } from '@/component/SQLContent';
import {
  IMultipleAsyncPermisssionTaskParams,
  TaskDetail,
  TaskExecStrategy,
  type ITaskResult,
} from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Descriptions, Divider, Drawer, Space, Timeline } from 'antd';
import { SimpleTextItem } from '../../component/SimpleTextItem';
import { useState } from 'react';
import styles from './index.less';
import { getDataSourceModeConfig, getDataSourceStyleByConnectType } from '@/common/datasource';
import { ModalStore } from '@/store/modal';
import { inject, observer } from 'mobx-react';
import { TaskTypeMap } from '../../helper';
import Icon from '@ant-design/icons';
import RiskLevelLabel, { ODCRiskLevelLabel } from '@/component/RiskLevelLabel';
import { getFormatDateTime, milliSecondsToHour } from '@/util/utils';
import { getTaskExecStrategyMap } from '../..';
import { ErrorStrategy } from '../../AsyncTask/DetailContent';
interface IStructureComparisonTaskContentProps {
  modalStore?: ModalStore;
  visible?: boolean;
  task: any;
  result: ITaskResult;
  hasFlow: boolean;
  theme?: string;
}

export const AutoErrorStrategy = {
  ABORT: '停止执行',
  CONTINUE: '忽略错误继续执行',
};
const MutipleAsyncTaskContent: React.FC<IStructureComparisonTaskContentProps> = inject(
  'modalStore',
)(
  observer((props) => {
    const { task, result, modalStore, theme, visible } = props;
    const [detailDrawerOpen, setDetailDrawerOpen] = useState<boolean>(false);

    const taskExecStrategyMap = getTaskExecStrategyMap(task?.type);
    return (
      <>
        <Descriptions column={4}>
          <Descriptions.Item
            span={2}
            label={
              formatMessage({
                id: 'src.component.Task.StructureComparisonTask.DetailContent.152888BE',
              }) /*"任务编号"*/
            }
          >
            {task?.id}
          </Descriptions.Item>
          <Descriptions.Item
            span={2}
            label={
              formatMessage({
                id: 'src.component.Task.StructureComparisonTask.DetailContent.5E3A8702',
              }) /*"任务类型"*/
            }
          >
            {TaskTypeMap?.[task?.type]}
          </Descriptions.Item>
          <Descriptions.Item span={4} label="数据库">
            {task?.parameters?.databases
              ?.map((item) => item?.name)
              ?.filter(Boolean)
              ?.join(', ') || '-'}
            <a
              style={{
                marginLeft: '4px',
                flexShrink: 0,
                display: 'inline-block',
              }}
              onClick={() => {
                setDetailDrawerOpen(true);
              }}
            >
              查看详情
            </a>
          </Descriptions.Item>

          <Descriptions.Item span={2} label="所属项目">
            {task?.parameters?.databases?.[0]?.project?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item span={2} label="风险等级">
            <ODCRiskLevelLabel
              iconMode
              level={task?.riskLevel?.level}
              content={task?.riskLevel?.name}
            />
          </Descriptions.Item>
        </Descriptions>
        <SimpleTextItem
          label="SQL 内容"
          content={
            <div>
              <SQLContent
                theme={theme}
                sqlContent={task?.parameters?.sqlContent || ''}
                sqlObjectIds={task?.parameters?.sqlObjectIds}
                sqlObjectNames={task?.parameters?.sqlObjectNames}
                taskId={task?.id}
                showLineNumbers={false}
                language={getDataSourceModeConfig(task?.database?.dataSource?.type)?.sql?.language}
              />
            </div>
          }
          direction="column"
        />
        <SimpleTextItem
          label="回滚内容"
          content={
            <div>
              <SQLContent
                theme={theme}
                sqlContent={task?.parameters?.rollbackSqlContent || ''}
                sqlObjectIds={task?.parameters?.rollbackSqlObjectIds}
                sqlObjectNames={task?.parameters?.rollbackSqlObjectNames}
                taskId={task?.id}
                showLineNumbers={false}
                language={getDataSourceModeConfig(task?.database?.dataSource?.type)?.sql?.language}
              />
            </div>
          }
          direction="column"
        />

        <Descriptions column={4}>
          <Descriptions.Item span={2} label="分隔符">
            {task?.parameters?.delimiter}
          </Descriptions.Item>
          <Descriptions.Item span={2} label="查询结果限制">
            {task?.parameters?.queryLimit}
          </Descriptions.Item>
          <Descriptions.Item span={2} label="执行超时时间">
            {milliSecondsToHour(task?.parameters?.timeoutMillis)}小时
          </Descriptions.Item>
          <Descriptions.Item span={2} label="SQL 执行处理">
            {AutoErrorStrategy?.[task?.parameters?.errorStrategy]}
          </Descriptions.Item>
          <Descriptions.Item span={2} label="执行方式">
            {taskExecStrategyMap?.[task?.executionStrategy]}
          </Descriptions.Item>
          {task?.executionStrategy === TaskExecStrategy.AUTO ? (
            <Descriptions.Item span={2} label="任务错误处理">
              {ErrorStrategy?.[task?.parameters?.autoErrorStrategy]}
            </Descriptions.Item>
          ) : (
            <Descriptions.Item span={4} label="手动执行超时时间">
              {milliSecondsToHour(task?.parameters?.manualTimeoutMillis)}小时
            </Descriptions.Item>
          )}
          <Descriptions.Item span={4} label="描述">
            {task?.description || '-'}
          </Descriptions.Item>
        </Descriptions>
        <Divider />
        <Descriptions column={4}>
          <Descriptions.Item span={2} label="创建人">
            {task?.creator?.name}
          </Descriptions.Item>
          <Descriptions.Item span={2} label="创建时间">
            {getFormatDateTime(task?.createTime)}
          </Descriptions.Item>
        </Descriptions>
        <DetailDrawer
          task={task}
          detailDrawerOpen={detailDrawerOpen}
          setDetailDrawerOpen={setDetailDrawerOpen}
        />
      </>
    );
  }),
);
const DetailDrawer: React.FC<{
  task: TaskDetail<IMultipleAsyncPermisssionTaskParams>;
  detailDrawerOpen: boolean;
  setDetailDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ task, detailDrawerOpen, setDetailDrawerOpen }) => {
  const flatArray = (array: any[]) => {
    return array?.reduce?.(
      (pre, cur) => pre?.concat(Array.isArray(cur) ? flatArray(cur) : cur),
      [],
    );
  };
  const databaseIdsMap = task?.parameters?.databases?.reduce((pre, cur) => {
    pre[cur?.id] = cur;
    return pre;
  }, {});
  return (
    <Drawer
      open={detailDrawerOpen}
      title="数据库详情"
      width={520}
      closable
      destroyOnClose
      onClose={() => {
        setDetailDrawerOpen(false);
      }}
    >
      <Timeline mode="left">
        {task?.parameters?.orderedDatabaseIds?.map((dbs, index) => {
          return (
            <Timeline.Item className={styles.timelineItem} key={index}>
              <div>{`执行节点${index + 1}`}</div>
              <div
                style={{
                  backgroundColor: '#F7F9FB',
                  padding: '12px 16px',
                  marginTop: '8px',
                }}
              >
                {dbs?.map((db, _index) => {
                  const icon = getDataSourceStyleByConnectType(
                    databaseIdsMap?.[db]?.dataSource?.type,
                  );
                  return (
                    <Space key={_index} size={0}>
                      <RiskLevelLabel
                        content={databaseIdsMap?.[db]?.environment?.name}
                        color={databaseIdsMap?.[db]?.environment?.style}
                      />
                      <Space size={4}>
                        <Icon
                          component={icon?.icon?.component}
                          style={{
                            color: icon?.icon?.color,
                            fontSize: 16,
                            marginRight: 4,
                          }}
                        />
                        <div>{databaseIdsMap?.[db]?.name}</div>
                        <div style={{ color: 'var(--neutral-black45-color)' }}>
                          {databaseIdsMap?.[db]?.dataSource?.name}
                        </div>
                      </Space>
                    </Space>
                  );
                })}
              </div>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </Drawer>
  );
};
export default MutipleAsyncTaskContent;
