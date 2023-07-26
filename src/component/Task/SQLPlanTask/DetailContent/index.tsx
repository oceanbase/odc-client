import { SQLContent } from '@/component/SQLContent';
import { operationTypeMap } from '@/component/Task/component/CommonDetailModal/TaskOperationRecord';
import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import type { CycleTaskDetail, ISqlPlayJobParameters, TaskOperationType } from '@/d.ts';
import { ConnectionMode, TaskType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Collapse, Descriptions, Divider, Space } from 'antd';
import React from 'react';
import { getCronCycle } from '../../component/TaskTable';
import styles from '../../index.less';

const { Panel } = Collapse;
const ErrorStrategy = {
  ABORT: formatMessage({ id: 'odc.component.DetailModal.sqlPlan.StopATask' }), //停止任务
  CONTINUE: formatMessage({
    id: 'odc.component.DetailModal.sqlPlan.IgnoreErrorsToContinueThe',
  }),
  //忽略错误继续任务
};

const CycleTaskLabel = {
  [TaskType.ALTER_SCHEDULE]: formatMessage({
    id: 'odc.component.DetailModal.sqlPlan.PlannedChange',
  }),
  //计划变更
  [TaskType.SQL_PLAN]: formatMessage({
    id: 'odc.component.DetailModal.sqlPlan.SqlPlan',
  }),
  //SQL 计划
};

interface IProps {
  task: CycleTaskDetail<ISqlPlayJobParameters>;
  hasFlow: boolean;
  operationType?: TaskOperationType;
}

const SqlPlanTaskContent: React.FC<IProps> = (props) => {
  const { task, hasFlow, operationType } = props;
  const isMySQL = task?.connection?.dbMode === ConnectionMode.OB_MYSQL;
  const { jobParameters, triggerConfig, allowConcurrent } = task ?? {};
  const executionTimeout = jobParameters?.timeoutMillis / 1000 / 60 / 60;

  return (
    <>
      <Descriptions column={2}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.TaskNumber',
          })}
          /*任务编号*/
        >
          {task?.id}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.TaskType',
          })}
          /*任务类型*/
        >
          {CycleTaskLabel[task?.type]}
        </Descriptions.Item>
        {hasFlow && (
          <Descriptions.Item
            label={formatMessage({
              id: 'odc.component.DetailModal.sqlPlan.RiskLevel',
            })}
            /*风险等级*/
          >
            {task?.riskLevel}
          </Descriptions.Item>
        )}

        {operationType && (
          <Descriptions.Item
            label={formatMessage({
              id: 'odc.component.DetailModal.sqlPlan.ChangeType',
            })}
            /*变更类型*/
          >
            {operationTypeMap[operationType]}
          </Descriptions.Item>
        )}
      </Descriptions>
      <SimpleTextItem
        label={formatMessage({
          id: 'odc.component.DetailModal.sqlPlan.SqlContent',
        })}
        /*SQL 内容*/
        content={
          <div style={{ margin: '8px 0' }}>
            <SQLContent
              type={task?.type}
              sqlContent={jobParameters?.sqlContent}
              sqlObjectIds={jobParameters?.sqlObjectIds}
              sqlObjectNames={jobParameters?.sqlObjectNames}
              taskId={task?.id}
              isMySQL={isMySQL}
            />
          </div>
        }
        direction="column"
      />

      <Descriptions column={2}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.TimingPeriod',
          })}
          /*定时周期*/
        >
          {triggerConfig ? getCronCycle(triggerConfig) : '-'}
        </Descriptions.Item>
        {task?.type === TaskType.SQL_PLAN && (
          <Descriptions.Item>
            <Collapse
              ghost
              bordered={false}
              className={styles['next-time']}
              expandIcon={({ isActive }) => (
                <SimpleTextItem
                  label={formatMessage({
                    id: 'odc.component.DetailModal.sqlPlan.NextExecutionTime',
                  })}
                  /*下一次执行时间*/
                  content={
                    <Space>
                      {getFormatDateTime(task.nextFireTimes?.[0])}
                      {isActive ? <UpOutlined /> : <DownOutlined />}
                    </Space>
                  }
                />
              )}
            >
              <Panel key="1" header={null}>
                <Space direction="vertical" size={0}>
                  {task?.nextFireTimes?.map((item, index) => {
                    return index > 0 && <div>{getFormatDateTime(item)}</div>;
                  })}
                </Space>
              </Panel>
            </Collapse>
          </Descriptions.Item>
        )}

        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.Separator',
          })}
          /*分隔符*/
        >
          {jobParameters?.delimiter}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.QueryResultLimits',
          })}
          /*查询结果限制*/
        >
          {jobParameters?.queryLimit}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.TaskErrorHandling',
          })}
          /*任务错误处理*/
        >
          {ErrorStrategy[jobParameters?.errorStrategy]}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.ExecutionTimeout',
          })}
          /*执行超时时间*/
        >
          {
            formatMessage(
              {
                id: 'odc.component.DetailModal.sqlPlan.ExecutiontimeoutHours',
              },

              { executionTimeout: executionTimeout },
            )
            //`${executionTimeout}小时`
          }
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.ExecutionDurationHypercycleProcessing',
          })} /*执行时长超周期处理*/
        >
          {
            allowConcurrent
              ? formatMessage({
                  id: 'odc.component.DetailModal.sqlPlan.IgnoreTheCurrentTaskStatus',
                }) //忽略当前任务状态，定期发起新任务
              : formatMessage({
                  id: 'odc.component.DetailModal.sqlPlan.AfterTheCurrentTaskIs',
                }) //待当前任务执行完毕在新周期发起任务
          }
        </Descriptions.Item>
        <Descriptions.Item label="描述" span={2}>
          {task?.description || '-'}
        </Descriptions.Item>
      </Descriptions>
      <Divider style={{ marginTop: 4 }} />
      <Descriptions column={2}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.Founder',
          })}
          /*创建人*/
        >
          {task?.creator?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.CreationTime',
          })}
          /*创建时间*/
        >
          {getFormatDateTime(task.createTime)}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};

export default SqlPlanTaskContent;
