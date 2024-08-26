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

import {
  StatusNodeType,
  SubTaskStatus,
  TaskFlowNodeType,
  TaskNodeStatus,
  TaskStatus,
  TaskType,
} from '@/d.ts';
import { formatMessage } from '@/util/intl';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  EllipsisOutlined,
  ExclamationCircleFilled,
  LoadingOutlined,
  StopFilled,
} from '@ant-design/icons';
import { Space, Tooltip } from 'antd';
import { isNil } from 'lodash';
import React from 'react';
import { isCycleTask } from '../../helper';
import { SchemaChangeRecordStatus } from '@/d.ts/logicalDatabase';
export const nodeStatus = {
  [TaskFlowNodeType.APPROVAL_TASK]: {
    [TaskNodeStatus.PENDING]: {
      text: formatMessage({
        id: 'odc.component.TaskStatus.PendingApproval',
        defaultMessage: '待审批',
      }), //待审批
    },

    [TaskNodeStatus.CREATED]: {
      text: formatMessage({
        id: 'odc.component.TaskStatus.PendingApproval',
        defaultMessage: '待审批',
      }), //待审批
    },

    [TaskNodeStatus.EXECUTING]: {
      text: formatMessage({
        id: 'odc.component.TaskStatus.Approving',
        defaultMessage: '审批中',
      }), //审批中
    },

    [TaskNodeStatus.WAIT_FOR_CONFIRM]: {
      text: formatMessage({
        id: 'odc.component.TaskStatus.Approving',
        defaultMessage: '审批中',
      }), //审批中
    },

    [TaskNodeStatus.COMPLETED]: {
      text: formatMessage({
        id: 'odc.component.TaskStatus.Passed',
        defaultMessage: '已通过',
      }), //已通过
    },

    [TaskNodeStatus.FAILED]: {
      text: formatMessage({
        id: 'odc.component.TaskStatus.Rejected',
        defaultMessage: '已拒绝',
      }),
      //已拒绝
      status: 'error',
    },
    [TaskNodeStatus.CANCELLED]: {
      text: formatMessage({
        id: 'odc.component.TaskStatus.Terminated',
        defaultMessage: '已终止',
      }),
      //已终止
      status: 'error',
    },
    [TaskNodeStatus.EXPIRED]: {
      text: formatMessage({
        id: 'odc.component.TaskStatus.ApprovalExpired',
        defaultMessage: '审批已过期',
      }),
      //审批已过期
      status: 'error',
    },
  },
  [TaskFlowNodeType.SERVICE_TASK]: {
    [TaskNodeStatus.CREATED]: {
      text: formatMessage({
        id: 'odc.component.TaskStatus.ToBeExecuted',
        defaultMessage: '待执行',
      }), //待执行
    },

    [TaskNodeStatus.PENDING]: {
      text: formatMessage({
        id: 'odc.component.TaskStatus.Waiting',
        defaultMessage: '执行等待中',
      }), //执行等待中
    },

    [TaskNodeStatus.EXECUTING]: {
      text: formatMessage({
        id: 'odc.component.TaskStatus.Executing',
        defaultMessage: '执行中',
      }), //执行中
    },

    [TaskNodeStatus.COMPLETED]: {
      text: formatMessage({
        id: 'odc.component.TaskStatus.ExecutionSucceeded',
        defaultMessage: '执行成功',
      }), //执行成功
    },

    [TaskNodeStatus.CANCELLED]: {
      text: formatMessage({
        id: 'odc.component.TaskStatus.Terminated',
        defaultMessage: '已终止',
      }),
      //已终止
      status: 'error',
    },
    [TaskNodeStatus.FAILED]: {
      text: formatMessage({
        id: 'odc.component.TaskStatus.Failed.2',
        defaultMessage: '执行失败',
      }),
      //执行失败
      status: 'error',
    },
    [TaskNodeStatus.EXPIRED]: {
      text: formatMessage({
        id: 'odc.component.TaskStatus.ExecutionExpired',
        defaultMessage: '执行已过期',
      }),
      //执行已过期
      status: 'error',
    },
  },
};
export const status = {
  [TaskStatus.APPROVING]: {
    icon: (
      <ExclamationCircleFilled
        style={{
          color: 'var(--icon-blue-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.TaskStatus.Approving',
      defaultMessage: '审批中',
    }), //审批中
  },

  [TaskStatus.WAIT_FOR_CONFIRM]: {
    icon: (
      <ExclamationCircleFilled
        style={{
          color: 'var(--icon-blue-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.TaskStatus.Approving',
      defaultMessage: '审批中',
    }), //审批中
  },

  [TaskStatus.WAIT_FOR_EXECUTION]: {
    icon: (
      <EllipsisOutlined
        style={{
          color: '#ffffff',
          background: 'rgb(250, 173, 20)',
          borderRadius: '14px',
          padding: 1,
          fontSize: 13,
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.TaskStatus.ToBeExecuted',
      defaultMessage: '待执行',
    }), //待执行
  },

  [TaskStatus.CREATED]: {
    icon: (
      <LoadingOutlined
        style={{
          color: 'var(--icon-blue-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.TaskStatus.Queuing',
      defaultMessage: '排队中',
    }), //排队中
  },

  [TaskStatus.EXECUTING]: {
    icon: (
      <LoadingOutlined
        style={{
          color: 'var(--icon-blue-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.TaskStatus.Executing',
      defaultMessage: '执行中',
    }), //执行中
  },

  [TaskStatus.EXECUTION_SUCCEEDED]: {
    icon: (
      <CheckCircleFilled
        style={{
          color: 'var(--icon-green-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.TaskStatus.ExecutionSucceeded',
      defaultMessage: '执行成功',
    }), //执行成功
  },

  [TaskStatus.REJECTED]: {
    icon: (
      <CloseCircleFilled
        style={{
          color: 'var(--function-red6-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.TaskStatus.ApprovalFailed',
      defaultMessage: '审批不通过',
    }), //审批不通过
  },

  [TaskStatus.EXECUTION_EXPIRED]: {
    icon: (
      <StopFilled
        style={{
          color: 'var(--icon-color-disable)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.TaskStatus.ExecutionExpiration',
      defaultMessage: '执行过期',
    }), //执行过期
  },

  [TaskStatus.APPROVAL_EXPIRED]: {
    icon: (
      <StopFilled
        style={{
          color: 'var(--icon-color-disable)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.TaskStatus.ApprovalExpired.1',
      defaultMessage: '审批过期',
    }), //审批过期
  },

  [TaskStatus.WAIT_FOR_EXECUTION_EXPIRED]: {
    icon: (
      <StopFilled
        style={{
          color: 'var(--icon-color-disable)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.TaskStatus.PendingExecutionExpiration',
      defaultMessage: '等待执行过期',
    }),

    //等待执行过期
  },

  [TaskStatus.EXECUTION_FAILED]: {
    icon: (
      <CloseCircleFilled
        style={{
          color: 'var(--function-red6-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.TaskStatus.Failed.2',
      defaultMessage: '执行失败',
    }), //执行失败
  },

  [TaskStatus.PRE_CHECK_FAILED]: {
    icon: (
      <CloseCircleFilled
        style={{
          color: 'var(--function-red6-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.src.component.Task.component.Status.PreExaminationFailure',
      defaultMessage: '预检查失败',
    }), //'预检查失败'
  },
  [TaskStatus.ROLLBACK_FAILED]: {
    icon: (
      <CloseCircleFilled
        style={{
          color: 'var(--function-red6-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.TaskStatus.RollbackFailed',
      defaultMessage: '回滚失败',
    }), //回滚失败
  },

  [TaskStatus.ROLLBACK_SUCCEEDED]: {
    icon: (
      <StopFilled
        style={{
          color: 'var(--icon-color-disable)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.TaskStatus.RolledBack',
      defaultMessage: '已回滚',
    }), //已回滚
  },

  [TaskStatus.CANCELLED]: {
    icon: (
      <StopFilled
        style={{
          color: 'var(--icon-color-disable)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.TaskStatus.Terminated',
      defaultMessage: '已终止',
    }), //已终止
  },

  [TaskStatus.COMPLETED]: {
    icon: (
      <CheckCircleFilled
        style={{
          color: 'var(--icon-green-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.TaskStatus.Completed',
      defaultMessage: '已完成',
    }), //已完成
  },
};

// 周期任务状态
export const cycleStatus = {
  [TaskStatus.APPROVING]: {
    icon: (
      <ExclamationCircleFilled
        style={{
          color: 'var(--icon-blue-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.TaskStatus.Approving',
      defaultMessage: '审批中',
    }), //审批中
  },

  [TaskStatus.REJECTED]: {
    icon: (
      <CloseCircleFilled
        style={{
          color: 'var(--function-red6-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.TaskStatus.ApprovalFailed',
      defaultMessage: '审批不通过',
    }), //审批不通过
  },

  [TaskStatus.APPROVAL_EXPIRED]: {
    icon: (
      <StopFilled
        style={{
          color: 'var(--icon-color-disable)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.TaskStatus.ApprovalExpired.1',
      defaultMessage: '审批过期',
    }), //审批过期
  },

  [TaskStatus.ENABLED]: {
    icon: (
      <CheckCircleFilled
        style={{
          color: 'var(--icon-green-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.TaskStatus.Enabled',
      defaultMessage: '已启用',
    }), //已启用
  },

  [TaskStatus.PAUSE]: {
    icon: (
      <StopFilled
        style={{
          color: 'var(--icon-color-disable)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.TaskStatus.Disabled',
      defaultMessage: '已禁用',
    }), //已禁用
  },

  [TaskStatus.TERMINATION]: {
    icon: (
      <StopFilled
        style={{
          color: 'var(--icon-color-disable)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.TaskStatus.Terminated',
      defaultMessage: '已终止',
    }), //已终止
  },

  [TaskStatus.COMPLETED]: {
    icon: (
      <CheckCircleFilled
        style={{
          color: 'var(--icon-green-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.Status.Completed',
      defaultMessage: '已完成',
    }), //已完成
  },

  [TaskStatus.EXECUTION_FAILED]: {
    icon: (
      <CloseCircleFilled
        style={{
          color: 'var(--function-red6-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.Status.ExecutionFailed',
      defaultMessage: '执行失败',
    }), //执行失败
  },
};

// 子任务状态（仅周期任务 + 无锁结构变更）
export const subTaskStatus = {
  [SubTaskStatus.DONE]: {
    icon: (
      <CheckCircleFilled
        style={{
          color: 'var(--icon-green-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.Status.Completed',
      defaultMessage: '已完成',
    }), //已完成
  },

  [SubTaskStatus.CANCELED]: {
    icon: (
      <StopFilled
        style={{
          color: 'var(--icon-color-disable)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.Status.Canceled',
      defaultMessage: '已取消',
    }), //已取消
  },

  [SubTaskStatus.FAILED]: {
    icon: (
      <CloseCircleFilled
        style={{
          color: 'var(--function-red6-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.Status.Failed',
      defaultMessage: '失败',
    }), //失败
  },

  [SubTaskStatus.PREPARING]: {
    icon: (
      <CheckCircleFilled
        style={{
          color: 'var(--icon-green-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.Status.Created',
      defaultMessage: '已创建',
    }), //已创建
  },

  [SubTaskStatus.RUNNING]: {
    icon: (
      <LoadingOutlined
        style={{
          color: 'var(--icon-blue-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'odc.component.Status.Running',
      defaultMessage: '执行中',
    }), //执行中
  },
};

// 逻辑库-任务状态
export const logicDBChangeTaskStatus = {
  [SchemaChangeRecordStatus.FAILED]: {
    icon: (
      <CloseCircleFilled
        style={{
          color: 'var(--function-red6-color)',
        }}
      />
    ),
    text: '执行失败',
  },
  [SchemaChangeRecordStatus.PENDING]: {
    icon: (
      <EllipsisOutlined
        style={{
          color: '#ffffff',
          background: 'rgb(250, 173, 20)',
          borderRadius: '14px',
          padding: 1,
          fontSize: 13,
        }}
      />
    ),
    text: '待执行',
  },
  [SchemaChangeRecordStatus.RUNNING]: {
    icon: (
      <LoadingOutlined
        style={{
          color: 'var(--icon-blue-color)',
        }}
      />
    ),
    text: '执行中',
  },
  [SchemaChangeRecordStatus.SUCCESS]: {
    icon: (
      <CheckCircleFilled
        style={{
          color: 'var(--icon-green-color)',
        }}
      />
    ),
    text: '执行成功',
  },
};

interface IProps {
  status: TaskStatus;
  progress?: number;
  type?: TaskType;
  isSubTask?: boolean;
}
const statusMap = {
  [StatusNodeType.FLOW_TASK]: status,
  [StatusNodeType.CYCLE_TASK]: cycleStatus,
  [StatusNodeType.SUB_TASK]: subTaskStatus,
};
const StatusLabel: React.FC<IProps> = (props) => {
  const { status: _status, progress, type, isSubTask } = props;
  // todo: 未来取消 TaskType.ASYNC, 因为task已统一，所有类型task的status均是一致的，不需要使用taskType进行区分；
  let statusInfo: Record<
    string,
    {
      icon: React.ReactNode;
      text: string;
    }
  > = statusMap[StatusNodeType.FLOW_TASK];
  if (isSubTask) {
    statusInfo = statusMap[StatusNodeType.SUB_TASK];
  } else if (isCycleTask(type)) {
    statusInfo = statusMap[StatusNodeType.CYCLE_TASK];
  }
  const statusObj = statusInfo[_status];
  return (
    <Tooltip
      title={
        type === TaskType.STRUCTURE_COMPARISON && _status === TaskStatus.EXECUTING
          ? formatMessage({
              id: 'src.component.Task.component.Status.050B579F',
              defaultMessage: '查询数据库对象元信息中',
            })
          : null
      }
    >
      <Space
        style={{
          overflow: 'hidden',
          maxWidth: '100%',
        }}
        size={5}
      >
        {statusObj ? (
          <>
            {statusObj.icon}
            <span
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                maxWidth: '100%',
              }}
            >
              {statusObj.text}
            </span>
            {!isNil(progress) && _status === TaskStatus.EXECUTING ? ` (${progress}%) ` : null}
          </>
        ) : null}
      </Space>
    </Tooltip>
  );
};
export default StatusLabel;
