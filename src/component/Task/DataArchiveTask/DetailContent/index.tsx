/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import RiskLevelLabel from '@/component/RiskLevelLabel';
import { getTaskExecStrategyMap } from '@/component/Task';
import { updateLimiterConfig } from '@/common/network/task';
import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import VariableConfigTable from '@/component/Task/component/VariableConfigTable';
import { isCycleTriggerStrategy } from '@/component/Task/helper';
import setting from '@/store/setting';
import type { CycleTaskDetail, IDataArchiveJobParameters, TaskOperationType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime, kbToMb, mbToKb } from '@/util/utils';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Collapse, Descriptions, Divider, Space, Typography, message } from 'antd';
import React from 'react';
import styles from '../../index.less';
import { InsertActionOptions } from '../CreateModal';
import ArchiveRange from './ArchiveRange';
import ThrottleEditableCell from '../../component/ThrottleEditableCell';

const { Text } = Typography;
const { Panel } = Collapse;
interface IProps {
  task: CycleTaskDetail<IDataArchiveJobParameters>;
  hasFlow: boolean;
  operationType?: TaskOperationType;
}
const DataArchiveTaskContent: React.FC<IProps> = (props) => {
  const { task, hasFlow } = props;
  const { triggerConfig, jobParameters, id } = task ?? {};
  const taskExecStrategyMap = getTaskExecStrategyMap(task?.type);
  const isCycleStrategy = isCycleTriggerStrategy(triggerConfig?.triggerStrategy);
  const insertActionLabel = InsertActionOptions?.find(
    (item) => item.value === jobParameters?.migrationInsertAction,
  )?.label;

  const handleRowLimit = async (rowLimit, handleClose) => {
    const res = updateLimiterConfig(id, {
      rowLimit,
    });
    if (res) {
      message.success('修改成功！');
      handleClose();
    }
  };

  const handleDataSizeLimit = async (dataSizeLimit, handleClose) => {
    const res = updateLimiterConfig(id, {
      dataSizeLimit: mbToKb(dataSizeLimit),
    });
    if (res) {
      message.success('修改成功！');
      handleClose();
    }
  };

  return (
    <>
      <Descriptions column={2}>
        <Descriptions.Item
          span={2}
          label={formatMessage({
            id: 'odc.DataArchiveTask.DetailContent.TaskNumber',
          })} /*任务编号*/
        >
          {task?.id}
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={formatMessage({
            id: 'odc.DataArchiveTask.DetailContent.TaskType',
          })} /*任务类型*/
        >
          {
            formatMessage({
              id: 'odc.DataArchiveTask.DetailContent.DataArchiving',
            }) /*数据归档*/
          }
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={formatMessage({
            id: 'odc.DataArchiveTask.DetailContent.SourceDatabase',
          })} /*源数据库*/
        >
          <Space size={2}>
            <span>{jobParameters?.sourceDatabaseName}</span>
            <Text type="secondary">{jobParameters?.sourceDataSourceName}</Text>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={formatMessage({
            id: 'odc.DataArchiveTask.DetailContent.TargetDatabase',
          })} /*目标数据库*/
        >
          <Space size={2}>
            <span>{jobParameters?.targetDatabaseName}</span>
            <Text type="secondary">{jobParameters?.targetDataSourceName}</Text>
          </Space>
        </Descriptions.Item>
        {hasFlow && (
          <Descriptions.Item
            label={formatMessage({
              id: 'odc.DataArchiveTask.DetailContent.RiskLevel',
            })} /*风险等级*/
          >
            <RiskLevelLabel level={task?.riskLevel?.level} color={task?.riskLevel?.style} />
          </Descriptions.Item>
        )}
      </Descriptions>

      <SimpleTextItem
        label={formatMessage({
          id: 'odc.DataArchiveTask.DetailContent.VariableConfiguration',
        })}
        /*变量配置*/ content={
          <div
            style={{
              margin: '8px 0 12px',
            }}
          >
            <VariableConfigTable variables={jobParameters?.variables} />
          </div>
        }
        direction="column"
      />

      <SimpleTextItem
        label={formatMessage({
          id: 'odc.DataArchiveTask.DetailContent.ArchiveScope',
        })}
        /*归档范围*/ content={
          <div
            style={{
              margin: '8px 0 12px',
            }}
          >
            <ArchiveRange tables={jobParameters?.tables} />
          </div>
        }
        direction="column"
      />

      <Descriptions column={2}>
        <Descriptions.Item
          span={2}
          label={formatMessage({
            id: 'odc.DataArchiveTask.DetailContent.CleanUpArchivedDataFrom',
          })} /*清理源端已归档的数据*/
        >
          {
            jobParameters?.deleteAfterMigration
              ? formatMessage({
                  id: 'odc.DataArchiveTask.DetailContent.Yes',
                }) //是
              : formatMessage({
                  id: 'odc.DataArchiveTask.DetailContent.No',
                }) //否
          }
        </Descriptions.Item>
      </Descriptions>
      <Descriptions column={2}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.DataArchiveTask.DetailContent.ExecutionMethod',
          })} /*执行方式*/
        >
          {taskExecStrategyMap[triggerConfig.triggerStrategy]}
        </Descriptions.Item>
        {isCycleStrategy && (
          <Descriptions.Item>
            <Collapse
              ghost
              bordered={false}
              className={styles['next-time']}
              expandIcon={({ isActive }) => (
                <SimpleTextItem
                  label={formatMessage({
                    id: 'odc.DataArchiveTask.DetailContent.NextExecutionTime',
                  })}
                  /*下一次执行时间*/ content={
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
          label={
            formatMessage({
              id: 'odc.src.component.Task.DataArchiveTask.DetailContent.InsertionStrategy',
            }) /* 插入策略 */
          }
          span={isCycleStrategy ? 2 : 1}
        >
          {insertActionLabel || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="行限流">
          <ThrottleEditableCell
            suffix="Rows/s"
            min={0}
            max={setting.maxSingleTaskRowLimit}
            defaultValue={jobParameters?.rateLimit?.rowLimit}
            onOk={handleRowLimit}
          />
        </Descriptions.Item>
        <Descriptions.Item label={'数据大小限流'}>
          <ThrottleEditableCell
            suffix="MB/s"
            min={1}
            max={setting.maxSingleTaskDataSizeLimit}
            defaultValue={kbToMb(jobParameters?.rateLimit?.dataSizeLimit)}
            onOk={handleDataSizeLimit}
          />
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.DataArchiveTask.DetailContent.Remarks',
          })}
          /*备注*/ span={2}
        >
          {task?.description || '-'}
        </Descriptions.Item>
      </Descriptions>

      <Divider
        style={{
          marginTop: 4,
        }}
      />
      <Descriptions column={2}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.DataArchiveTask.DetailContent.Founder',
          })} /*创建人*/
        >
          {task?.creator?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.DataArchiveTask.DetailContent.CreationTime',
          })} /*创建时间*/
        >
          {getFormatDateTime(task.createTime)}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};
export default DataArchiveTaskContent;
