import RiskLevelLabel, { ODCRiskLevelLabel } from '@/component/RiskLevelLabel';
import { SQLContent } from '@/component/SQLContent';
import { getTaskExecStrategyMap } from '@/component/Task';
import type {
  IAsyncTaskParams,
  ILogicalDatabaseAsyncTaskParams,
  ITaskResult,
  TaskDetail,
} from '@/d.ts';
import { TaskExecStrategy } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime, milliSecondsToHour } from '@/util/utils';
import { Descriptions, Divider, Space, Tooltip } from 'antd';
import { DownloadFileAction } from '../../component/DownloadFileAction';
import { SimpleTextItem } from '../../component/SimpleTextItem';
import { getDataSourceModeConfigByConnectionMode } from '@/common/datasource';
import { InfoCircleOutlined } from '@ant-design/icons';
export const ErrorStrategy = {
  ABORT: '停止任务',
  CONTINUE: '忽略错误继续任务',
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
  const riskLevel = task?.riskLevel;
  const taskExecStrategyMap = getTaskExecStrategyMap(task?.type);
  return (
    <>
      <Descriptions column={4}>
        <Descriptions.Item span={2} label="任务编号">
          {task?.id}
        </Descriptions.Item>
        <Descriptions.Item span={2} label="任务类型">
          逻辑库变更
        </Descriptions.Item>
        <Descriptions.Item span={2} label="数据库">
          {task?.database?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item span={2} label="所属项目">
          {
            // TODO:
            //@ts-ignore
            task?.parameters?.project?.name || '-'
          }
        </Descriptions.Item>
        {hasFlow && (
          <Descriptions.Item label="风险等级">
            <ODCRiskLevelLabel
              iconMode
              level={task?.riskLevel?.level}
              content={task?.riskLevel?.name}
            />
          </Descriptions.Item>
        )}
      </Descriptions>
      <SimpleTextItem
        label="SQL 内容"
        content={
          <div
            style={{
              marginTop: '8px',
            }}
          >
            <SQLContent
              sqlContent={task?.parameters?.sqlContent}
              sqlObjectIds={task?.parameters?.sqlObjectIds}
              sqlObjectNames={task?.parameters?.sqlObjectNames}
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
        <Descriptions.Item span={2} label="分隔符">
          {parameters?.delimiter}
        </Descriptions.Item>
        <Descriptions.Item span={2} label="查询结果限制">
          {parameters?.queryLimit}
        </Descriptions.Item>
        <Descriptions.Item span={2} label="执行方式">
          {taskExecStrategyMap[task?.executionStrategy]}
        </Descriptions.Item>
        <Descriptions.Item span={2} label="任务错误处理">
          {ErrorStrategy[parameters?.errorStrategy]}
        </Descriptions.Item>
        <Descriptions.Item span={4} label="执行超时时间">
          <Space align="center" size={6}>
            <div>{`${executionTimeout} 小时`}</div>
            {result?.autoModifyTimeout && (
              <Tooltip
                title={`变更语句中包含索引变更，可能耗时较久，已将您的变更工单超时时间调整为 ${executionTimeout} 小时`}
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

        <Descriptions.Item span={4} label="任务描述">
          {task?.description}
        </Descriptions.Item>
      </Descriptions>
      <Divider
        style={{
          marginTop: 4,
        }}
      />

      <Descriptions column={4}>
        <Descriptions.Item span={2} label="创建人">
          {task?.creator?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item span={2} label="创建时间">
          {getFormatDateTime(task?.createTime)}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};
export default LogicDatabaseAsyncTaskContent;
