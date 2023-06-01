import { TaskFlowNodeType, TaskNodeStatus, TaskStatus, TaskType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  EllipsisOutlined,
  ExclamationCircleFilled,
  LoadingOutlined,
  StopFilled,
} from '@ant-design/icons';
import { Space } from 'antd';
import { isNil } from 'lodash';
import React from 'react';

export const nodeStatus = {
  [TaskFlowNodeType.APPROVAL_TASK]: {
    [TaskNodeStatus.PENDING]: {
      text: formatMessage({ id: 'odc.component.TaskStatus.PendingApproval' }), //待审批
    },
    [TaskNodeStatus.CREATED]: {
      text: formatMessage({ id: 'odc.component.TaskStatus.PendingApproval' }), //待审批
    },
    [TaskNodeStatus.EXECUTING]: {
      text: formatMessage({ id: 'odc.component.TaskStatus.Approving' }), //审批中
    },
    [TaskNodeStatus.WAIT_FOR_CONFIRM]: {
      text: formatMessage({ id: 'odc.component.TaskStatus.Approving' }), //审批中
    },
    [TaskNodeStatus.COMPLETED]: {
      text: formatMessage({ id: 'odc.component.TaskStatus.Passed' }), //已通过
    },
    [TaskNodeStatus.FAILED]: {
      text: formatMessage({ id: 'odc.component.TaskStatus.Rejected' }), //已拒绝
      status: 'error',
    },

    [TaskNodeStatus.CANCELLED]: {
      text: formatMessage({ id: 'odc.component.TaskStatus.Terminated' }), //已终止
      status: 'error',
    },

    [TaskNodeStatus.EXPIRED]: {
      text: formatMessage({ id: 'odc.component.TaskStatus.ApprovalExpired' }), //审批已过期
      status: 'error',
    },
  },

  [TaskFlowNodeType.SERVICE_TASK]: {
    [TaskNodeStatus.CREATED]: {
      text: formatMessage({ id: 'odc.component.TaskStatus.ToBeExecuted' }), //待执行
    },
    [TaskNodeStatus.PENDING]: {
      text: formatMessage({ id: 'odc.component.TaskStatus.Waiting' }), //执行等待中
    },
    [TaskNodeStatus.EXECUTING]: {
      text: formatMessage({ id: 'odc.component.TaskStatus.Executing' }), //执行中
    },
    [TaskNodeStatus.COMPLETED]: {
      text: formatMessage({ id: 'odc.component.TaskStatus.ExecutionSucceeded' }), //执行成功
    },
    [TaskNodeStatus.CANCELLED]: {
      text: formatMessage({ id: 'odc.component.TaskStatus.Terminated' }), //已终止
      status: 'error',
    },

    [TaskNodeStatus.FAILED]: {
      text: formatMessage({ id: 'odc.component.TaskStatus.Failed.2' }), //执行失败
      status: 'error',
    },

    [TaskNodeStatus.EXPIRED]: {
      text: formatMessage({ id: 'odc.component.TaskStatus.ExecutionExpired' }), //执行已过期
      status: 'error',
    },
  },
};

export const status = {
  [TaskStatus.APPROVING]: {
    icon: <ExclamationCircleFilled style={{ color: '#1890ff' }} />,
    text: formatMessage({ id: 'odc.component.TaskStatus.Approving' }), //审批中
  },
  [TaskStatus.WAIT_FOR_CONFIRM]: {
    icon: <ExclamationCircleFilled style={{ color: '#1890ff' }} />,
    text: formatMessage({ id: 'odc.component.TaskStatus.Approving' }), //审批中
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

    text: formatMessage({ id: 'odc.component.TaskStatus.ToBeExecuted' }), //待执行
  },
  [TaskStatus.CREATED]: {
    icon: <LoadingOutlined style={{ color: '#1890ff' }} />,
    text: formatMessage({ id: 'odc.component.TaskStatus.Queuing' }), //排队中
  },
  [TaskStatus.EXECUTING]: {
    icon: <LoadingOutlined style={{ color: '#1890ff' }} />,
    text: formatMessage({ id: 'odc.component.TaskStatus.Executing' }), //执行中
  },
  [TaskStatus.ROLLBACKING]: {
    icon: <LoadingOutlined style={{ color: '#1890ff' }} />,
    text: formatMessage({ id: 'odc.component.TaskStatus.RollingBack' }), //回滚中
  },
  [TaskStatus.EXECUTION_SUCCEEDED]: {
    icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
    text: formatMessage({ id: 'odc.component.TaskStatus.ExecutionSucceeded' }), //执行成功
  },
  [TaskStatus.REJECTED]: {
    icon: <CloseCircleFilled style={{ color: '#f5222d' }} />,
    text: formatMessage({ id: 'odc.component.TaskStatus.ApprovalFailed' }), //审批不通过
  },
  [TaskStatus.EXECUTION_EXPIRED]: {
    icon: <StopFilled style={{ color: 'rgba(0,0,0,0.45)' }} />,
    text: formatMessage({ id: 'odc.component.TaskStatus.ExecutionExpiration' }), //执行过期
  },
  [TaskStatus.APPROVAL_EXPIRED]: {
    icon: <StopFilled style={{ color: 'rgba(0,0,0,0.45)' }} />,
    text: formatMessage({ id: 'odc.component.TaskStatus.ApprovalExpired.1' }), //审批过期
  },
  [TaskStatus.WAIT_FOR_EXECUTION_EXPIRED]: {
    icon: <StopFilled style={{ color: 'rgba(0,0,0,0.45)' }} />,
    text: formatMessage({
      id: 'odc.component.TaskStatus.PendingExecutionExpiration',
    }),

    //等待执行过期
  },
  [TaskStatus.EXECUTION_FAILED]: {
    icon: <CloseCircleFilled style={{ color: '#f5222d' }} />,
    text: formatMessage({ id: 'odc.component.TaskStatus.Failed.2' }), //执行失败
  },
  [TaskStatus.ROLLBACK_FAILED]: {
    icon: <CloseCircleFilled style={{ color: '#f5222d' }} />,
    text: formatMessage({ id: 'odc.component.TaskStatus.RollbackFailed' }), //回滚失败
  },
  [TaskStatus.ROLLBACK_SUCCEEDED]: {
    icon: <StopFilled style={{ color: 'rgba(0,0,0,0.45)' }} />,
    text: formatMessage({ id: 'odc.component.TaskStatus.RolledBack' }), //已回滚
  },
  [TaskStatus.CANCELLED]: {
    icon: <StopFilled style={{ color: 'rgba(0,0,0,0.45)' }} />,
    text: formatMessage({ id: 'odc.component.TaskStatus.Terminated' }), //已终止
  },
  [TaskStatus.COMPLETED]: {
    icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
    text: formatMessage({ id: 'odc.component.TaskStatus.Completed' }), //已完成
  },
};

// 周期任务状态
export const cycleStatus = {
  [TaskStatus.APPROVING]: {
    icon: <ExclamationCircleFilled style={{ color: '#1890ff' }} />,
    text: formatMessage({ id: 'odc.component.TaskStatus.Approving' }), //审批中
  },
  [TaskStatus.REJECTED]: {
    icon: <CloseCircleFilled style={{ color: '#f5222d' }} />,
    text: formatMessage({ id: 'odc.component.TaskStatus.ApprovalFailed' }), //审批不通过
  },
  [TaskStatus.APPROVAL_EXPIRED]: {
    icon: <StopFilled style={{ color: 'rgba(0,0,0,0.45)' }} />,
    text: formatMessage({ id: 'odc.component.TaskStatus.ApprovalExpired.1' }), //审批过期
  },
  [TaskStatus.ENABLED]: {
    icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
    text: formatMessage({ id: 'odc.component.TaskStatus.Enabled' }), //已启用
  },
  [TaskStatus.PAUSE]: {
    icon: <StopFilled style={{ color: 'rgba(0,0,0,0.45)' }} />,
    text: formatMessage({ id: 'odc.component.TaskStatus.Disabled' }), //已禁用
  },
  [TaskStatus.TERMINATION]: {
    icon: <StopFilled style={{ color: 'rgba(0,0,0,0.45)' }} />,
    text: formatMessage({ id: 'odc.component.TaskStatus.Terminated' }), //已终止
  },
};

interface IProps {
  status: TaskStatus;
  progress: number;
  type?: TaskType;
}

const StatusLabel: React.FC<IProps> = (props) => {
  const { status: _status, progress, type = '' } = props;
  // todo: 未来取消 TaskType.ASYNC, 因为task已统一，所有类型task的status均是一致的，不需要使用taskType进行区分；
  const statusObj = type === TaskType.SQL_PLAN ? cycleStatus[_status] : status?.[_status];
  return (
    <Space style={{ overflow: 'hidden', maxWidth: '100%' }} size={5}>
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
  );
};

export default StatusLabel;
