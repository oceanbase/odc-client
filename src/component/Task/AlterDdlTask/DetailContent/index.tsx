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
import { getDataSourceModeConfigByConnectionMode } from '@/common/datasource';
import { updateThrottleConfig } from '@/common/network/task';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { SQLContent } from '@/component/SQLContent';
import { getTaskExecStrategyMap } from '@/component/Task';
import type { ITaskResult, TaskDetail } from '@/d.ts';
import { TaskExecStrategy, TaskStatus } from '@/d.ts';
import setting from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { bToMb, getFormatDateTime, mbToB } from '@/util/utils';
import { message, Typography } from 'antd';
import React, { useMemo } from 'react';
import { SimpleTextItem } from '../../component/SimpleTextItem';
import ThrottleEditableCell from '../../component/ThrottleEditableCell';
import { OscMaxDataSizeLimit, OscMaxRowLimit } from '../../const';
import { ClearStrategy, SwapTableType } from '../CreateModal';
import { ProjectRole } from '@/d.ts/project';

const { Text } = Typography;
interface IDDLAlterParamters {
  errorStrategy: TaskExecStrategy;
  connectionId: string;
  schemaName: string;
  comparingTaskId: string;
  description: string;
  sqlContent?: string;
  lockUsers: {
    name: string;
  }[];
  // 单位：秒
  lockTableTimeOutSeconds: number;
  swapTableNameRetryTimes: number;
  originTableCleanStrategy: ClearStrategy;
  swapTableType: SwapTableType;
  rateLimitConfig?: {
    rowLimit?: number;
    dataSizeLimit?: number;
  };
}
const ErrorStrategyText = {
  ABORT: formatMessage({
    id: 'odc.AlterDdlTask.DetailContent.StopATask',
    defaultMessage: '停止任务',
  }),
  //停止任务
  CONTINUE: formatMessage({
    id: 'odc.AlterDdlTask.DetailContent.IgnoreErrorsToContinueThe',
    defaultMessage: '忽略错误继续任务',
  }), //忽略错误继续任务
};

const ClearStrategyMap = {
  [ClearStrategy.ORIGIN_TABLE_DROP]: formatMessage({
    id: 'odc.AlterDdlTask.DetailContent.DeleteNow',
    defaultMessage: '立即删除',
  }),
  //立即删除
  [ClearStrategy.ORIGIN_TABLE_RENAME_AND_RESERVED]: formatMessage({
    id: 'odc.AlterDdlTask.DetailContent.RenameNotProcessed',
    defaultMessage: '重命名不处理',
  }), //重命名不处理
};

const SwapTableTypeMap = {
  [SwapTableType.AUTO]: formatMessage({
    id: 'odc.src.component.Task.AlterDdlTask.DetailContent.AutomaticSwitch',
    defaultMessage: '自动切换',
  }), //'自动切换'
  [SwapTableType.MANUAL]: formatMessage({
    id: 'odc.src.component.Task.AlterDdlTask.DetailContent.ManualSwitch',
    defaultMessage: '手工切换',
  }), //'手工切换'
};
const SQLContentSection: React.FC<{
  task: TaskDetail<IDDLAlterParamters>;
  theme?: string;
}> = ({ task, theme }) => {
  return (
    <SimpleTextItem
      label={formatMessage({
        id: 'odc.AlterDdlTask.DetailContent.SqlContent',
        defaultMessage: 'SQL 内容',
      })}
      /*SQL 内容*/ content={
        <div
          style={{
            marginTop: '8px',
          }}
        >
          <SQLContent
            theme={theme}
            sqlContent={task?.parameters?.sqlContent}
            sqlObjectIds={null}
            sqlObjectNames={null}
            taskId={task?.id}
            language={
              getDataSourceModeConfigByConnectionMode(task?.database?.dataSource?.dialectType)?.sql
                ?.language
            }
          />
        </div>
      }
      direction="column"
    />
  );
};
export function getItems(
  task: TaskDetail<IDDLAlterParamters>,
  result: ITaskResult,
  hasFlow: boolean,
  theme?: string,
  handleReloadData?: () => void,
): {
  sectionName?: string;
  textItems: [React.ReactNode, React.ReactNode, number?][];
  sectionRender?: (task: TaskDetail<IDDLAlterParamters>) => void;
}[] {
  const { parameters, id, status, project } = task;
  const isProjectDBAorOwner = useMemo(() => {
    return project.currentUserResourceRoles?.some((item) =>
      [ProjectRole.DBA, ProjectRole.OWNER].includes(item),
    );
  }, [project]);

  const cantBeModified =
    [TaskStatus.EXECUTION_SUCCEEDED, TaskStatus.EXECUTION_FAILED, TaskStatus.CANCELLED]?.includes(
      status,
    ) && isProjectDBAorOwner;
  if (!task) {
    return [];
  }
  const riskLevel = task?.riskLevel;
  const isTimerExecution = task?.executionStrategy === TaskExecStrategy.TIMER;
  const taskExecStrategyMap = getTaskExecStrategyMap(task?.type);
  const riskItem = [
    formatMessage({
      id: 'odc.AlterDdlTask.DetailContent.RiskLevel',
      defaultMessage: '风险等级',
    }),
    //风险等级
    <RiskLevelLabel level={riskLevel?.level} color={riskLevel?.style} />,
  ];

  const timerExecutionItem: [string, string] = [
    formatMessage({
      id: 'odc.AlterDdlTask.DetailContent.ExecutionTime',
      defaultMessage: '执行时间',
    }),
    //执行时间
    getFormatDateTime(task?.executionTime),
  ];

  const lockUsers = parameters?.lockUsers?.join(', ');

  const handleDataSizeLimit = async (dataSizeLimit, handleClose) => {
    const res = await updateThrottleConfig(id, {
      dataSizeLimit: mbToB(dataSizeLimit),
      rowLimit: parameters?.rateLimitConfig?.rowLimit,
    });
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.src.component.Task.DataClearTask.DetailContent.SuccessfullyModified.1',
          defaultMessage: '修改成功！',
        }), //'修改成功！'
      );
      handleClose();
      handleReloadData();
    }
  };
  const handleRowLimit = async (rowLimit, handleClose) => {
    const res = await updateThrottleConfig(id, {
      rowLimit,
      dataSizeLimit: parameters?.rateLimitConfig?.dataSizeLimit,
    });
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.src.component.Task.DataClearTask.DetailContent.SuccessfullyModified.1',
          defaultMessage: '修改成功！',
        }), //'修改成功！'
      );
      handleClose();
      handleReloadData();
    }
  };
  return [
    {
      // @ts-ignore
      textItems: [
        [
          formatMessage({
            id: 'odc.AlterDdlTask.DetailContent.TaskNumber',
            defaultMessage: '任务编号',
          }),
          //任务编号
          task.id,
        ],

        [
          formatMessage({
            id: 'odc.AlterDdlTask.DetailContent.TaskType',
            defaultMessage: '任务类型',
          }),
          //任务类型
          formatMessage({
            id: 'odc.AlterDdlTask.DetailContent.LockFreeStructureChange',
            defaultMessage: '无锁结构变更',
          }), //无锁结构变更
        ],
        [
          formatMessage({
            id: 'odc.AlterDdlTask.DetailContent.Library',
            defaultMessage: '所属库',
          }),
          //所属库
          task?.database?.name || '-',
        ],

        [
          formatMessage({
            id: 'odc.src.component.Task.AlterDdlTask.DetailContent.DataSource',
            defaultMessage: '所属数据源',
          }),
          //'所属数据源'
          task?.database?.dataSource?.name || '-',
        ],

        hasFlow ? riskItem : null,
        lockUsers
          ? [
              formatMessage({
                id: 'odc.src.component.Task.AlterDdlTask.DetailContent.LockUsers',
                defaultMessage: '锁定用户',
              }), //'锁定用户'
              <Text
                ellipsis={true}
                title={lockUsers}
                style={{
                  width: '240px',
                }}
              >
                {lockUsers}
              </Text>,
            ]
          : null,
        [
          formatMessage({
            id: 'odc.AlterDdlTask.DetailContent.ChangeDefinition',
            defaultMessage: '变更定义',
          }),
          //变更定义
          taskExecStrategyMap[task?.executionStrategy],
          hasFlow ? 2 : 1,
        ],

        [null, <SQLContentSection task={task} key={task.id} theme={theme} />, 2],
        [
          formatMessage({
            id: 'odc.AlterDdlTask.DetailContent.LockTableTimeout',
            defaultMessage: '锁表超时时间',
          }),
          //锁表超时时间
          `${parameters?.lockTableTimeOutSeconds}s`,
        ],

        [
          formatMessage({
            id: 'odc.AlterDdlTask.DetailContent.NumberOfFailedRetries',
            defaultMessage: '失败重试次数',
          }),
          //失败重试次数
          parameters?.swapTableNameRetryTimes,
        ],

        [
          formatMessage({
            id: 'odc.AlterDdlTask.DetailContent.SourceTableCleanupPolicyAfter',
            defaultMessage: '完成后源表清理策略',
          }),
          //完成后源表清理策略
          ClearStrategyMap[parameters?.originTableCleanStrategy],
        ],

        [
          formatMessage({
            id: 'odc.AlterDdlTask.DetailContent.ExecutionMethod',
            defaultMessage: '执行方式',
          }),
          //执行方式
          taskExecStrategyMap[task?.executionStrategy],
        ],

        [
          formatMessage({
            id: 'odc.src.component.Task.AlterDdlTask.DetailContent.TableNameSwitchingMethod',
            defaultMessage: '表名切换方式',
          }), //'表名切换方式'
          SwapTableTypeMap[task?.parameters?.swapTableType] ?? '-',
        ],

        isTimerExecution ? timerExecutionItem : null,
        [
          formatMessage({
            id: 'odc.AlterDdlTask.DetailContent.TaskErrorHandling',
            defaultMessage: '任务错误处理',
          }),
          //任务错误处理
          ErrorStrategyText[parameters.errorStrategy],
          2,
        ],

        setting.enableOSCLimiting
          ? [
              formatMessage({
                id: 'src.component.Task.AlterDdlTask.DetailContent.FE4166B2',
                defaultMessage: '行限流',
              }),

              <ThrottleEditableCell
                suffix="Rows/s"
                min={0}
                max={OscMaxRowLimit}
                defaultValue={parameters?.rateLimitConfig?.rowLimit}
                onOk={handleRowLimit}
                readlOnly={!cantBeModified}
              />,
              1,
            ]
          : null,
        [
          formatMessage({
            id: 'odc.AlterDdlTask.DetailContent.Description',
            defaultMessage: '描述',
          }),
          //描述
          task?.description,
          2,
        ],
      ].filter(Boolean),
    },
    {
      textItems: [
        [
          formatMessage({
            id: 'odc.AlterDdlTask.DetailContent.Founder',
            defaultMessage: '创建人',
          }),
          //创建人
          task?.creator?.name || '-',
          2,
        ],

        [
          formatMessage({
            id: 'odc.AlterDdlTask.DetailContent.CreationTime',
            defaultMessage: '创建时间',
          }),
          //创建时间
          getFormatDateTime(task.createTime),
          2,
        ],
      ],
    },
  ];
}
