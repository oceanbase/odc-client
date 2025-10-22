import { formatMessage } from '@/util/intl';
import { getDataSourceModeConfigByConnectionMode } from '@/common/datasource';
import { SQLContent } from '@/component/SQLContent';
import type { ILogicalDatabaseAsyncTaskParams, ITaskResult, TaskDetail } from '@/d.ts';
import { getFormatDateTime, milliSecondsToHour } from '@/util/utils';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Descriptions, Divider, Space, Tooltip } from 'antd';
import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import { getTaskExecStrategyMap } from '@/component/Task//const';
import DatabaseLabel from '@/component/Task/component/DatabaseLabel';
import { ODCRiskLevelLabel } from '@/component/RiskLevelLabel';

import EllipsisText from '@/component/EllipsisText';
import login from '@/store/login';
export const ErrorStrategy = {
  ABORT: formatMessage({
    id: 'src.component.Task.LogicDatabaseAsyncTask.DetailContent.11ED2337',
    defaultMessage: '停止任务',
  }),
  CONTINUE: formatMessage({
    id: 'src.component.Task.LogicDatabaseAsyncTask.DetailContent.00302B92',
    defaultMessage: '忽略错误继续任务',
  }),
};

interface IProps {
  task: TaskDetail<ILogicalDatabaseAsyncTaskParams>;
  result: ITaskResult;
  hasFlow: boolean;
}
const LogicDatabaseAsyncTaskContent: React.FC<IProps> = (props) => {
  const { task, hasFlow, result } = props;
  const parameters = task?.parameters;
  const executionTimeout = milliSecondsToHour(parameters?.timeoutMillis);
  const taskExecStrategyMap = getTaskExecStrategyMap(task?.type);

  return (
    <>
      <Descriptions column={2} style={{ marginBottom: '16px' }}>
        <Descriptions.Item label={'ID'}>{task?.id}</Descriptions.Item>
        <Descriptions.Item label={'类型'}>
          {formatMessage({
            id: 'src.component.Task.LogicDatabaseAsyncTask.DetailContent.E8885A6E',
            defaultMessage: '逻辑库变更',
          })}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.LogicDatabaseAsyncTask.DetailContent.85BCF723',
            defaultMessage: '数据库',
          })}
        >
          <EllipsisText content={<DatabaseLabel database={task?.database} />} needTooltip={false} />
        </Descriptions.Item>
        {!login.isPrivateSpace() && (
          <Descriptions.Item label={'项目'}>
            <EllipsisText content={task?.project?.name} />
          </Descriptions.Item>
        )}
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.DataArchiveTask.DetailContent.RiskLevel',
            defaultMessage: '风险等级',
          })} /*风险等级*/
        >
          <ODCRiskLevelLabel iconMode levelMap level={task?.riskLevel?.level} />
        </Descriptions.Item>
        <Descriptions.Item label={'描述'}>{task?.description}</Descriptions.Item>
      </Descriptions>
      <Divider
        style={{
          marginTop: 4,
        }}
      />
      <SimpleTextItem
        label={formatMessage({
          id: 'src.component.Task.LogicDatabaseAsyncTask.DetailContent.97C2BA42',
          defaultMessage: 'SQL 内容',
        })}
        content={
          <div
            style={{
              marginTop: '8px',
            }}
          >
            <SQLContent
              sqlContent={parameters?.sqlContent}
              sqlObjectIds={null}
              sqlObjectNames={null}
              taskId={task?.id}
              language={
                getDataSourceModeConfigByConnectionMode(task?.database?.dataSource?.dialectType)
                  ?.sql?.language
              }
            />
          </div>
        }
        direction="column"
      />

      <Descriptions
        column={4}
        style={{
          marginTop: '8px',
        }}
      >
        <Descriptions.Item
          span={2}
          label={formatMessage({
            id: 'src.component.Task.LogicDatabaseAsyncTask.DetailContent.28DBAD35',
            defaultMessage: '分隔符',
          })}
        >
          {parameters?.delimiter}
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={formatMessage({
            id: 'src.component.Task.LogicDatabaseAsyncTask.DetailContent.E2799F2E',
            defaultMessage: '执行方式',
          })}
        >
          {taskExecStrategyMap[task?.executionStrategy]}
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={formatMessage({
            id: 'src.component.Task.LogicDatabaseAsyncTask.DetailContent.3D1C66A3',
            defaultMessage: '执行超时时间',
          })}
        >
          <Space align="center" size={6}>
            <div>
              {formatMessage(
                {
                  id: 'src.component.Task.LogicDatabaseAsyncTask.DetailContent.07E065FF',
                  defaultMessage: '{executionTimeout} 小时',
                },
                { executionTimeout },
              )}
            </div>
            {result?.autoModifyTimeout && (
              <Tooltip
                title={formatMessage(
                  {
                    id: 'src.component.Task.LogicDatabaseAsyncTask.DetailContent.C374AE18',
                    defaultMessage:
                      '变更语句中包含索引变更，可能耗时较久，已将您的变更工单超时时间调整为 {executionTimeout} 小时',
                  },
                  { executionTimeout },
                )}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <InfoCircleOutlined style={{ cursor: 'pointer' }} />
                </div>
              </Tooltip>
            )}
          </Space>
        </Descriptions.Item>
      </Descriptions>
      <Divider
        style={{
          marginTop: 16,
        }}
      />

      <Descriptions column={4}>
        <Descriptions.Item
          span={2}
          label={formatMessage({
            id: 'src.component.Task.LogicDatabaseAsyncTask.DetailContent.1B53EE1C',
            defaultMessage: '创建人',
          })}
        >
          {task?.creator?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={formatMessage({
            id: 'src.component.Task.LogicDatabaseAsyncTask.DetailContent.2FD70DFE',
            defaultMessage: '创建时间',
          })}
        >
          {getFormatDateTime(task?.createTime)}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};
export default LogicDatabaseAsyncTaskContent;
