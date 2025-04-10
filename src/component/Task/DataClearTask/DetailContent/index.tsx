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
import { TaskExecStrategy } from '@/d.ts';
import setting from '@/store/setting';
import { formatMessage } from '@/util/intl';
import {
  getFormatDateTime,
  getLocalFormatDateTime,
  kbToMb,
  mbToKb,
  milliSecondsToHour,
} from '@/util/utils';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Collapse, Descriptions, Divider, message, Space, Typography } from 'antd';
import React from 'react';
import ThrottleEditableCell from '../../component/ThrottleEditableCell';
import styles from '../../index.less';
import ArchiveRange from './ArchiveRange';
import { shardingStrategyOptions } from '../../component/ShardingStrategyItem';
import {
  DirtyRowActionEnum,
  DirtyRowActionLabelMap,
} from '@/component/ExecuteSqlDetailModal/constant';

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
          defaultMessage: '修改成功！',
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
        <Descriptions.Item
          span={2}
          label={formatMessage({
            id: 'odc.DataClearTask.DetailContent.TaskNumber',
            defaultMessage: '任务编号',
          })} /*任务编号*/
        >
          {task?.id}
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={formatMessage({
            id: 'odc.DataClearTask.DetailContent.TaskType',
            defaultMessage: '任务类型',
          })} /*任务类型*/
        >
          {
            formatMessage({
              id: 'odc.DataClearTask.DetailContent.DataCleansing',
              defaultMessage: '数据清理',
            }) /*数据清理*/
          }
        </Descriptions.Item>
        {jobParameters?.needCheckBeforeDelete ? (
          <Descriptions.Item
            span={2}
            label={formatMessage({
              id: 'odc.DataArchiveTask.DetailContent.SourceDatabase',
              defaultMessage: '源数据库',
            })} /*源数据库*/
          >
            <Space size={2}>
              <span>{jobParameters?.databaseName}</span>
              <Text type="secondary">{jobParameters?.sourceDataSourceName}</Text>
            </Space>
          </Descriptions.Item>
        ) : (
          <Descriptions.Item
            span={2}
            label={formatMessage({
              id: 'odc.DataClearTask.DetailContent.Database',
              defaultMessage: '数据库',
            })} /*数据库*/
          >
            <Space size={2}>
              <span>{jobParameters?.databaseName}</span>
              <Text type="secondary">{task?.database?.dataSource?.name}</Text>
            </Space>
          </Descriptions.Item>
        )}

        {jobParameters.needCheckBeforeDelete && (
          <Descriptions.Item
            span={2}
            label={formatMessage({
              id: 'odc.DataArchiveTask.DetailContent.TargetDatabase',
              defaultMessage: '目标数据库',
            })} /*目标数据库*/
          >
            <Space size={2}>
              <span>{jobParameters?.targetDatabaseName}</span>
              <Text type="secondary">{jobParameters?.targetDataSourceName}</Text>
            </Space>
          </Descriptions.Item>
        )}

        {hasFlow && (
          <Descriptions.Item
            label={formatMessage({
              id: 'odc.DataClearTask.DetailContent.RiskLevel',
              defaultMessage: '风险等级',
            })} /*风险等级*/
          >
            <RiskLevelLabel level={task?.riskLevel?.level} color={task?.riskLevel?.style} />
          </Descriptions.Item>
        )}
      </Descriptions>

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
            <VariableConfigTable variables={jobParameters?.variables} />
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
              tables={jobParameters?.tables}
              needCheckBeforeDelete={jobParameters?.needCheckBeforeDelete}
            />
          </div>
        }
        direction="column"
      />

      <Descriptions column={2}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.DataClearTask.DetailContent.ExecutionMethod',
            defaultMessage: '执行方式',
          })} /*执行方式*/
        >
          {taskExecStrategyMap[triggerConfig.triggerStrategy]}
        </Descriptions.Item>
        {triggerConfig.triggerStrategy === TaskExecStrategy.START_AT && (
          <Descriptions.Item
            label={
              formatMessage({
                id: 'src.component.Task.DataArchiveTask.DetailContent.074676BE',
                defaultMessage: '执行时间',
              }) /*"执行时间"*/
            }
          >
            {getLocalFormatDateTime(triggerConfig?.startAt)}
          </Descriptions.Item>
        )}

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
                    defaultMessage: '下一次执行时间',
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
        {jobParameters?.needCheckBeforeDelete ? (
          <Descriptions.Item label={'源端目标端数据不一致处理'}>
            {DirtyRowActionLabelMap[jobParameters?.dirtyRowAction]}
          </Descriptions.Item>
        ) : null}
        {jobParameters?.dirtyRowAction === DirtyRowActionEnum.SKIP ? (
          <Descriptions.Item label={'跳过不清理数据'}>
            {`${jobParameters?.maxAllowedDirtyRowCount || 0} 行`}
          </Descriptions.Item>
        ) : null}
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.DataClearTask.DetailContent.E977DA21',
            defaultMessage: '搜索策略',
          })}
          span={isCycleTriggerStrategy(triggerConfig?.triggerStrategy) ? 2 : 1}
        >
          {shardingStrategyOptions.find((item) => item.value === jobParameters?.shardingStrategy)
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
            defaultValue={jobParameters?.rateLimit?.rowLimit}
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
            defaultValue={kbToMb(jobParameters?.rateLimit?.dataSizeLimit)}
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
          {jobParameters?.deleteByUniqueKey
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
          {jobParameters.timeoutMillis
            ? milliSecondsToHour(jobParameters.timeoutMillis) + 'h'
            : '-'}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.DataClearTask.DetailContent.Description',
            defaultMessage: '描述',
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
            defaultMessage: '创建人',
          })} /*创建人*/
        >
          {task?.creator?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.DataClearTask.DetailContent.CreationTime',
            defaultMessage: '创建时间',
          })} /*创建时间*/
        >
          {getFormatDateTime(task.createTime)}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};
export default DataClearTaskContent;
