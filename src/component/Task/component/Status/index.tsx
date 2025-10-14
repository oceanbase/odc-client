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
import { SchemaChangeRecordStatus } from '@/d.ts/logicalDatabase';
import { formatMessage } from '@/util/intl';
import Icon, {
  CheckCircleFilled,
  CloseCircleFilled,
  EllipsisOutlined,
  ExclamationCircleFilled,
  ExclamationCircleOutlined,
  LoadingOutlined,
  StopFilled,
} from '@ant-design/icons';
import { Space, Tooltip } from 'antd';
import { isNil } from 'lodash';
import React from 'react';
import { ReactComponent as WaitingYellowSvg } from '@/svgr/waiting_yellow.svg';
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
    [TaskNodeStatus.EXECUTING_ABNORMAL]: {
      text: formatMessage({
        id: 'src.component.Task.component.Status.F318D350',
        defaultMessage: '执行异常',
      }),
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

// 筛选展示的工单状态
export const flowStatusSelectOptions = [
  TaskStatus.CREATED,
  TaskStatus.PRE_CHECK_EXECUTING,
  TaskStatus.APPROVING,
  TaskStatus.REJECTED,
  TaskStatus.APPROVAL_EXPIRED,
  TaskStatus.WAIT_FOR_SCHEDULE_EXECUTION,
  TaskStatus.WAIT_FOR_EXECUTION,
  TaskStatus.WAIT_FOR_EXECUTION_EXPIRED,
  TaskStatus.EXECUTING,
  TaskStatus.EXECUTION_SUCCEEDED,
  TaskStatus.EXECUTION_SUCCEEDED_WITH_ERRORS,
  TaskStatus.EXECUTION_ABNORMAL,
  TaskStatus.EXECUTION_FAILED,
  TaskStatus.EXECUTION_EXPIRED,
  TaskStatus.CANCELLED,
  TaskStatus.PRE_CHECK_FAILED,
];
export const status: Partial<
  Record<TaskStatus, { icon: React.ReactNode; text: string; desc?: React.ReactNode }>
> = {
  [TaskStatus.CREATED]: {
    icon: (
      <LoadingOutlined
        style={{
          color: 'var(--icon-blue-color)',
        }}
      />
    ),
    text: '已创建',
  },
  [TaskStatus.PRE_CHECK_EXECUTING]: {
    icon: (
      <LoadingOutlined
        style={{
          color: 'var(--icon-blue-color)',
        }}
      />
    ),
    text: '预检查中',
  },
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

  [TaskStatus.WAIT_FOR_SCHEDULE_EXECUTION]: {
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

  [TaskStatus.EXECUTION_SUCCEEDED_WITH_ERRORS]: {
    icon: (
      <CheckCircleFilled
        style={{
          color: 'var(--icon-green-color)',
        }}
      />
    ),
    text: '执行成功',
    desc: (
      <Tooltip title="执行时存在错误，已跳过">
        <ExclamationCircleOutlined
          style={{
            color: 'rgb(250, 173, 20)',
            marginLeft: 4,
          }}
        />
      </Tooltip>
    ),
  },

  [TaskStatus.EXECUTION_ABNORMAL]: {
    icon: (
      <CloseCircleFilled
        style={{
          color: 'var(--text-color-error)',
        }}
      />
    ),

    text: formatMessage({
      id: 'src.component.Task.component.Status.F440C489',
      defaultMessage: '执行异常',
    }), //执行异常
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
};

// 周期任务状态
export const cycleStatus: Partial<
  Record<TaskStatus, { icon: React.ReactNode; text: string; desc?: React.ReactNode }>
> = {
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

  [TaskStatus.TERMINATED]: {
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

  [TaskStatus.CREATING]: {
    icon: (
      <LoadingOutlined
        style={{
          color: 'var(--icon-blue-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'src.component.Task.component.Status.3DCF46EC',
      defaultMessage: '创建中',
    }),
  },
};

// 子任务状态（仅周期任务 + 无锁结构变更）
export const subTaskStatus: Partial<
  Record<SubTaskStatus, { icon: React.ReactNode; text: string; desc?: React.ReactNode }>
> = {
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
  [SubTaskStatus.ABNORMAL]: {
    icon: (
      <CloseCircleFilled
        style={{
          color: 'var(--text-color-error)',
        }}
      />
    ),

    text: formatMessage({
      id: 'src.component.Task.component.Status.1707B1A0',
      defaultMessage: '执行异常',
    }),
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

    text: formatMessage({
      id: 'src.component.Task.component.Status.64D3C12B',
      defaultMessage: '执行失败',
    }),
  },
  [SchemaChangeRecordStatus.PENDING]: {
    icon: <Icon component={WaitingYellowSvg} style={{ fontSize: 14 }} />,

    text: formatMessage({
      id: 'src.component.Task.component.Status.1B9301A5',
      defaultMessage: '待执行',
    }),
  },
  [SchemaChangeRecordStatus.RUNNING]: {
    icon: (
      <LoadingOutlined
        style={{
          color: 'var(--icon-blue-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'src.component.Task.component.Status.2497FE39',
      defaultMessage: '执行中',
    }),
  },
  [SchemaChangeRecordStatus.SUCCESS]: {
    icon: (
      <CheckCircleFilled
        style={{
          color: 'var(--icon-green-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'src.component.Task.component.Status.8FA22B8A',
      defaultMessage: '执行成功',
    }),
  },
  [SchemaChangeRecordStatus.TERMINATED]: {
    icon: <StopFilled style={{ color: 'var(--profile-icon-unready-color)' }} />,
    text: formatMessage({
      id: 'src.component.Task.component.Status.F1235EE9',
      defaultMessage: '已终止',
    }),
  },
  [SchemaChangeRecordStatus.SKIPPING]: {
    icon: (
      <LoadingOutlined
        style={{
          color: 'var(--icon-blue-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'src.component.Task.component.Status.CA4AFAD3',
      defaultMessage: '跳过中',
    }),
  },
  [SchemaChangeRecordStatus.SKIPPED]: {
    icon: <StopFilled style={{ color: 'var(--profile-icon-unready-color)' }} />,
    text: formatMessage({
      id: 'src.component.Task.component.Status.D08E449C',
      defaultMessage: '已跳过',
    }),
  },
  [SchemaChangeRecordStatus.TERMINATING]: {
    icon: (
      <LoadingOutlined
        style={{
          color: 'var(--icon-blue-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'src.component.Task.component.Status.726F85D7',
      defaultMessage: '终止中',
    }),
  },
  [SchemaChangeRecordStatus.TERMINATE_FAILED]: {
    icon: (
      <CloseCircleFilled
        style={{
          color: 'var(--function-red6-color)',
        }}
      />
    ),

    text: formatMessage({
      id: 'src.component.Task.component.Status.BB5E3650',
      defaultMessage: '终止失败',
    }),
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
      text: string | React.ReactNode;
      desc?: React.ReactNode;
    }
  > = statusMap[StatusNodeType.FLOW_TASK];
  if (isSubTask) {
    statusInfo = statusMap[StatusNodeType.SUB_TASK];
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
        size={0}
      >
        {statusObj ? (
          <>
            {statusObj.icon}
            <span
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                maxWidth: '100%',
                marginLeft: 4,
                marginRight: 4,
              }}
            >
              {statusObj.text}
              {statusObj?.desc}
            </span>
            {!isNil(progress) && _status === TaskStatus.EXECUTING ? ` (${progress}%) ` : null}
          </>
        ) : null}
      </Space>
    </Tooltip>
  );
};
export default StatusLabel;
