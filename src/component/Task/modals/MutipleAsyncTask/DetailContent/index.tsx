import { getDataSourceModeConfig, getDataSourceStyleByConnectType } from '@/common/datasource';
import RiskLevelLabel, { ODCRiskLevelLabel } from '@/component/RiskLevelLabel';
import { SQLContent } from '@/component/SQLContent';
import {
  IFlowTaskType,
  IMultipleAsyncTaskParams,
  TaskDetail,
  TaskExecStrategy,
  TaskNodeStatus,
  type ITaskResult,
} from '@/d.ts';
import { ModalStore } from '@/store/modal';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime, milliSecondsToHour } from '@/util/data/dateTime';
import Icon from '@ant-design/icons';
import { Descriptions, Divider, Drawer, Space, Steps } from 'antd';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import { useState } from 'react';
import { ErrorStrategy } from '@/component/Task/modals/AsyncTask/DetailContent';
import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import { TaskTypeMap } from '@/component/Task/helper';
import styles from './index.less';
import { getTaskExecStrategyMap } from '@/component/Task/const';
import EllipsisText from '@/component/EllipsisText';
import login from '@/store/login';
const { Step } = Steps;
interface IStructureComparisonTaskContentProps {
  modalStore?: ModalStore;
  visible?: boolean;
  task: any;
  result: ITaskResult;
  hasFlow: boolean;
  theme?: string;
}

export const AutoErrorStrategy = {
  ABORT: formatMessage({
    id: 'src.component.Task.MutipleAsyncTask.DetailContent.CE76FD47',
    defaultMessage: '停止执行',
  }),
  CONTINUE: formatMessage({
    id: 'src.component.Task.MutipleAsyncTask.DetailContent.B29F6A70',
    defaultMessage: '忽略错误继续执行',
  }),
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
        <Descriptions column={2} style={{ marginBottom: 16 }}>
          <Descriptions.Item label={'ID'}>{task?.id}</Descriptions.Item>
          <Descriptions.Item
            label={formatMessage({
              id: 'src.component.Task.modals.MutipleAsyncTask.DetailContent.089C6237',
              defaultMessage: '类型',
            })}
          >
            {TaskTypeMap?.[task?.type]}
          </Descriptions.Item>
          <Descriptions.Item
            span={2}
            label={formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.DetailContent.628C9DB4',
              defaultMessage: '数据库',
            })}
          >
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
              {formatMessage({
                id: 'src.component.Task.MutipleAsyncTask.DetailContent.69E1BA99',
                defaultMessage: '查看详情',
              })}
            </a>
          </Descriptions.Item>

          {!login.isPrivateSpace() && (
            <Descriptions.Item
              span={1}
              label={formatMessage({
                id: 'src.component.Task.modals.MutipleAsyncTask.DetailContent.C3969824',
                defaultMessage: '项目',
              })}
            >
              <EllipsisText content={task?.parameters?.databases?.[0]?.project?.name} />
            </Descriptions.Item>
          )}
          <Descriptions.Item
            span={2}
            label={formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.DetailContent.7A621BB2',
              defaultMessage: '风险等级',
            })}
          >
            <ODCRiskLevelLabel iconMode levelMap level={task?.riskLevel?.level} />
          </Descriptions.Item>
          <Descriptions.Item
            span={2}
            label={formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.DetailContent.2ACDBED8',
              defaultMessage: '描述',
            })}
          >
            {task?.description || '-'}
          </Descriptions.Item>
        </Descriptions>
        <Divider />
        <SimpleTextItem
          label={formatMessage({
            id: 'src.component.Task.MutipleAsyncTask.DetailContent.10038C15',
            defaultMessage: 'SQL 内容',
          })}
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
          label={formatMessage({
            id: 'src.component.Task.MutipleAsyncTask.DetailContent.ACB391BE',
            defaultMessage: '回滚内容',
          })}
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
          <Descriptions.Item
            span={2}
            label={formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.DetailContent.75C1D302',
              defaultMessage: '分隔符',
            })}
          >
            {task?.parameters?.delimiter}
          </Descriptions.Item>
          <Descriptions.Item
            span={2}
            label={formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.DetailContent.5FA1154F',
              defaultMessage: '查询结果限制',
            })}
          >
            {task?.parameters?.queryLimit}
          </Descriptions.Item>
          <Descriptions.Item
            span={2}
            label={formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.DetailContent.439EBA2B',
              defaultMessage: '执行超时时间',
            })}
          >
            {milliSecondsToHour(task?.parameters?.timeoutMillis)}
            {formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.DetailContent.CBD57C8D',
              defaultMessage: '小时',
            })}
          </Descriptions.Item>
          <Descriptions.Item
            span={2}
            label={formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.DetailContent.DAFF4C62',
              defaultMessage: 'SQL 执行错误处理',
            })}
          >
            {AutoErrorStrategy?.[task?.parameters?.errorStrategy]}
          </Descriptions.Item>
          <Descriptions.Item
            span={2}
            label={formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.DetailContent.9E276D6A',
              defaultMessage: '执行方式',
            })}
          >
            {taskExecStrategyMap?.[task?.executionStrategy]}
          </Descriptions.Item>
          {task?.executionStrategy === TaskExecStrategy.TIMER && (
            <Descriptions.Item
              span={2}
              label={
                formatMessage({
                  id: 'odc.src.component.Task.AsyncTask.DetailContent.ExecutionTime',
                  defaultMessage: '执行时间',
                }) /* 执行时间 */
              }
            >
              {getFormatDateTime(task?.executionTime)}
            </Descriptions.Item>
          )}
          {task?.executionStrategy === TaskExecStrategy.AUTO && (
            <Descriptions.Item
              span={2}
              label={formatMessage({
                id: 'src.component.Task.MutipleAsyncTask.DetailContent.3BD1E2AF',
                defaultMessage: '任务错误处理',
              })}
            >
              {ErrorStrategy?.[task?.parameters?.autoErrorStrategy]}
            </Descriptions.Item>
          )}
          {task?.executionStrategy === TaskExecStrategy.MANUAL && (
            <Descriptions.Item
              span={4}
              label={formatMessage({
                id: 'src.component.Task.MutipleAsyncTask.DetailContent.E2E22162',
                defaultMessage: '手动确认超时时间',
              })}
            >
              {milliSecondsToHour(task?.parameters?.manualTimeoutMillis)}
              {formatMessage({
                id: 'src.component.Task.MutipleAsyncTask.DetailContent.BB4C24CE',
                defaultMessage: '小时',
              })}
            </Descriptions.Item>
          )}
        </Descriptions>
        <Divider style={{ marginTop: 16 }} />
        <Descriptions column={4}>
          <Descriptions.Item
            span={2}
            label={formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.DetailContent.E2A7B335',
              defaultMessage: '创建人',
            })}
          >
            {task?.creator?.name}
          </Descriptions.Item>
          <Descriptions.Item
            span={2}
            label={formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.DetailContent.762C9629',
              defaultMessage: '创建时间',
            })}
          >
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
  task: TaskDetail<IMultipleAsyncTaskParams>;
  detailDrawerOpen: boolean;
  setDetailDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ task, detailDrawerOpen, setDetailDrawerOpen }) => {
  const multipleAsyncNodes = task?.nodeList?.filter(
    (item) => item.taskType === IFlowTaskType.MULTIPLE_ASYNC,
  );

  const databaseIdsMap = task?.parameters?.databases?.reduce((pre, cur) => {
    pre[cur?.id] = cur;
    return pre;
  }, {});
  const parseTaskStatus = (status: TaskNodeStatus) => {
    switch (status) {
      case TaskNodeStatus.FAILED:
      case TaskNodeStatus.CANCELLED:
      case TaskNodeStatus.EXPIRED:
      case TaskNodeStatus.PRE_CHECK_FAILED: {
        return 'error';
      }
      case TaskNodeStatus.EXECUTING: {
        return 'process';
      }
      case TaskNodeStatus.WAIT_FOR_CONFIRM: {
        return 'wait';
      }
      case TaskNodeStatus.COMPLETED: {
        return 'finish';
      }
      case TaskNodeStatus.CREATED:
      case TaskNodeStatus.PENDING: {
        return null;
      }
      default: {
        return null;
      }
    }
  };
  return (
    <Drawer
      open={detailDrawerOpen}
      title={formatMessage({
        id: 'src.component.Task.MutipleAsyncTask.DetailContent.A6BC0EA9',
        defaultMessage: '数据库详情',
      })}
      width={520}
      closable
      destroyOnClose
      onClose={() => {
        setDetailDrawerOpen(false);
      }}
    >
      <Steps progressDot direction="vertical" className={styles.TaskFlow}>
        {task?.parameters?.orderedDatabaseIds?.map((dbs, index) => {
          const status = parseTaskStatus(multipleAsyncNodes?.[index]?.status);
          return (
            <Step
              status={status}
              key={index}
              title={
                <div>
                  {formatMessage(
                    {
                      id: 'src.component.Task.MutipleAsyncTask.DetailContent.6F7DA268',
                      defaultMessage: '执行节点{ BinaryExpression0 }',
                    },
                    { BinaryExpression0: index + 1 },
                  )}
                </div>
              }
              className={classNames({
                // TODO: 执行状态影响
                [styles.multipleErrorExecNode]:
                  multipleAsyncNodes?.[index]?.status === TaskNodeStatus.FAILED,
              })}
              description={
                <div
                  style={{
                    backgroundColor: 'var(--background-tertraiy-color)',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
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
                          <div style={{ color: 'var(--text-color-hint)' }}>
                            {databaseIdsMap?.[db]?.dataSource?.name}
                          </div>
                        </Space>
                      </Space>
                    );
                  })}
                </div>
              }
            />
          );
        })}
      </Steps>
    </Drawer>
  );
};
export default MutipleAsyncTaskContent;
