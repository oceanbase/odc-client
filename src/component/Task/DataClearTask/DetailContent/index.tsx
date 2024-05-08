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

import { updateLimiterConfig } from '@/common/network/task';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { getTaskExecStrategyMap } from '@/component/Task';
import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import VariableConfigTable from '@/component/Task/component/VariableConfigTable';
import { isCycleTriggerStrategy } from '@/component/Task/helper';
import type { CycleTaskDetail, IDataClearJobParameters, TaskOperationType } from '@/d.ts';
import setting from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime, kbToMb, mbToKb } from '@/util/utils';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Collapse, Descriptions, Divider, message, Space, Typography } from 'antd';
import React from 'react';
import ThrottleEditableCell from '../../component/ThrottleEditableCell';
import styles from '../../index.less';
import ArchiveRange from './ArchiveRange';
const { Panel } = Collapse;
const { Text } = Typography;
interface IProps {
  task: CycleTaskDetail<IDataClearJobParameters>;
  hasFlow: boolean;
  operationType?: TaskOperationType;
  onReload?: () => void;
}
const DataClearTaskContent: React.FC<IProps> = (props) => {
  const { task, hasFlow, onReload } = props;
  const { triggerConfig, jobParameters, id } = task ?? {};
  const taskExecStrategyMap = getTaskExecStrategyMap(task?.type);
  const handleRowLimit = async (rowLimit, handleClose) => {
    const res = await updateLimiterConfig(id, {
      rowLimit,
    });
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.src.component.Task.DataClearTask.DetailContent.SuccessfullyModified',
        }), //'修改成功！'
      );
      handleClose();
      onReload();
    }
  };
  const handleDataSizeLimit = async (dataSizeLimit, handleClose) => {
    const res = await updateLimiterConfig(id, {
      dataSizeLimit: mbToKb(dataSizeLimit),
    });
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.src.component.Task.DataClearTask.DetailContent.SuccessfullyModified.1',
        }), //'修改成功！'
      );
      handleClose();
      onReload();
    }
  };
  return (
    <>
      <Descriptions column={2}>
        <Descriptions.Item
          span={2}
          label={formatMessage({
            id: 'odc.DataClearTask.DetailContent.TaskNumber',
          })} /*任务编号*/
        >
          {task?.id}
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={formatMessage({
            id: 'odc.DataClearTask.DetailContent.TaskType',
          })} /*任务类型*/
        >
          {
            formatMessage({
              id: 'odc.DataClearTask.DetailContent.DataCleansing',
            }) /*数据清理*/
          }
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={formatMessage({
            id: 'odc.DataClearTask.DetailContent.Database',
          })} /*数据库*/
        >
          <Space size={2}>
            <span>{task?.database?.name || '-'}</span>
            <Text type="secondary">{task?.database?.dataSource?.name}</Text>
          </Space>
        </Descriptions.Item>
        {hasFlow && (
          <Descriptions.Item
            label={formatMessage({
              id: 'odc.DataClearTask.DetailContent.RiskLevel',
            })} /*风险等级*/
          >
            <RiskLevelLabel level={task?.riskLevel?.level} color={task?.riskLevel?.style} />
          </Descriptions.Item>
        )}
      </Descriptions>

      <SimpleTextItem
        label={formatMessage({
          id: 'odc.DataClearTask.DetailContent.VariableConfiguration',
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
          id: 'odc.DataClearTask.DetailContent.CleaningRange',
        })}
        /*清理范围*/ content={
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
          label={formatMessage({
            id: 'odc.DataClearTask.DetailContent.ExecutionMethod',
          })} /*执行方式*/
        >
          {taskExecStrategyMap[triggerConfig.triggerStrategy]}
        </Descriptions.Item>
        {isCycleTriggerStrategy(triggerConfig?.triggerStrategy) && (
          <Descriptions.Item>
            <Collapse
              ghost
              bordered={false}
              className={styles['next-time']}
              expandIcon={({ isActive }) => (
                <SimpleTextItem
                  label={formatMessage({
                    id: 'odc.DataClearTask.DetailContent.NextExecutionTime',
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
              id: 'odc.src.component.Task.DataClearTask.DetailContent.RestrictedFlow',
            }) /* 行限流 */
          }
        >
          <ThrottleEditableCell
            suffix="Rows/s"
            min={0}
            max={setting.maxSingleTaskRowLimit}
            defaultValue={jobParameters?.rateLimit?.rowLimit}
            onOk={handleRowLimit}
          />
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.src.component.Task.DataClearTask.DetailContent.DataSizeLimit',
            }) //'数据大小限流'
          }
        >
          <ThrottleEditableCell
            suffix="MB/s"
            min={1}
            max={setting.maxSingleTaskDataSizeLimit}
            defaultValue={kbToMb(jobParameters?.rateLimit?.dataSizeLimit)}
            onOk={handleDataSizeLimit}
          />
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.component.Task.DataClearTask.DetailContent.2D1A14AB',
            }) /*"使用主键清理"*/
          }
        >
          {jobParameters?.deleteByUniqueKey
            ? formatMessage({ id: 'src.component.Task.DataClearTask.DetailContent.D2882643' })
            : formatMessage({ id: 'src.component.Task.DataClearTask.DetailContent.834E7D89' })}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.DataClearTask.DetailContent.Description',
          })}
          /*描述*/ span={2}
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
            id: 'odc.DataClearTask.DetailContent.Founder',
          })} /*创建人*/
        >
          {task?.creator?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.DataClearTask.DetailContent.CreationTime',
          })} /*创建时间*/
        >
          {getFormatDateTime(task.createTime)}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};
export default DataClearTaskContent;
