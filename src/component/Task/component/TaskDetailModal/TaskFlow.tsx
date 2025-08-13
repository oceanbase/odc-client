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

import { getTaskDetail, getTaskList } from '@/common/network/task';
import MultiLineOverflowText from '@/component/MultiLineOverflowText';
import {
  nodeStatus as nodeStatusMap,
  status as statusMap,
} from '@/component/Task/component/Status';
import UserPopover from '@/component/UserPopover';
import {
  IFlowTaskType,
  IMultipleAsyncTaskParams,
  ITaskFlowNode,
  ITaskResult,
  TaskDetail,
  TaskFlowNodeType,
  TaskNodeStatus,
  TaskRecordParameters,
  TaskStatus,
  TaskType,
} from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { Descriptions, Space, Steps } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import { isLogicalDbChangeTask } from '@/component/Task/helper';
import styles from './index.less';
import { getStatusDisplayInfo } from './Nodes/helper';
import MultipleSQLCheckNode from './Nodes/MultipleSQLCheckNode';
import RollbackNode from './Nodes/RollbackNode';
import SQLCheckNode from './Nodes/SQLCheckNode';

const { Step } = Steps;
interface IProps {
  task: TaskDetail<TaskRecordParameters>;
  result?: ITaskResult;
}
interface ITaskRenderFlowNode extends ITaskFlowNode {
  title: string;
  comment: string;
  completeTime: number;
  statusContent: {
    text: string;
    status?: string;
  };
  status: TaskNodeStatus;
  deadlineTime: number;
  hasDescription: boolean;
  hasOperatorLabel: boolean;
  hasCandidatesLabel: boolean;
  hasCommentLabel: boolean;
  hasCompleteTimeLabel: boolean;
  hasDeadlineTimeLabel: boolean;
}
const TaskFlow: React.FC<IProps> = (props) => {
  const { task, result } = props;
  const isLogicDbChangeTask = isLogicalDbChangeTask(task?.type);
  const { creator, parameters } = task ?? {};
  let approvalCount = 0;
  let executeNodeCount = 0;
  let currrentRenderExecuteNodeCount = 0;
  let currentNodeIndex = 0;
  let completedNode: {
    visible: boolean;
    hasDescription: boolean;
  } = null;
  const [flowDetail, setFlowDetail] = useState<TaskDetail<TaskRecordParameters>>();

  useEffect(() => {
    if (isLogicDbChangeTask && task?.id) {
      getJobList();
    }
  }, [task]);

  const getJobList = async () => {
    const flowList = await getTaskList({
      createdByCurrentUser: false,
      approveByCurrentUser: false,
      parentInstanceId: task?.id,
      taskTypes: [TaskType.ALTER_SCHEDULE],
    });
    const flowId = flowList?.contents?.[0]?.id;
    if (flowId) {
      const flowDetail = await getTaskDetail(flowId);
      setFlowDetail(flowDetail);
    }
  };

  const nodeList = useMemo(() => {
    if (isLogicDbChangeTask && flowDetail) {
      return flowDetail?.nodeList;
    }
    return task?.nodeList;
  }, [flowDetail, task]);

  const handleApproval = (node: Partial<ITaskRenderFlowNode>) => {
    let _node = node;
    if (node.nodeType === TaskFlowNodeType.APPROVAL_TASK) {
      const { candidates, operator, completeTime, comment, autoApprove } = node;
      if (node.status !== TaskNodeStatus.WAIT_FOR_CONFIRM) {
        ++approvalCount;
      }
      let title =
        node.status === TaskNodeStatus.WAIT_FOR_CONFIRM
          ? formatMessage({
              id: 'odc.component.CommonTaskDetailModal.TaskFlow.ConfirmPolicy',
              defaultMessage: '确认策略',
            })
          : //确认策略
            formatMessage(
              {
                id: 'odc.component.CommonTaskDetailModal.TaskFlow.ApprovalNodeCurrentapprovalcount',
                defaultMessage: '审批节点{currentApprovalCount}',
              },
              {
                currentApprovalCount: approvalCount,
              },
            );

      //`审批节点${currentApprovalCount}`
      let status = node.status;
      let statusContent = nodeStatusMap[TaskFlowNodeType.APPROVAL_TASK][node.status];
      let deadlineTime = node.status === TaskNodeStatus.EXECUTING ? node.deadlineTime : null;
      switch (node.status) {
        case TaskNodeStatus.CREATED:
        case TaskNodeStatus.PENDING:
          _node = {
            title,
            candidates,
            status,
            statusContent,
            autoApprove,
            hasCandidatesLabel: true,
          };
          break;
        case TaskNodeStatus.WAIT_FOR_CONFIRM:
        case TaskNodeStatus.EXECUTING:
          _node = {
            title,
            candidates,
            status,
            statusContent,
            deadlineTime,
            autoApprove,
            hasDeadlineTimeLabel: true,
            hasCandidatesLabel: true,
          };
          break;
        case TaskNodeStatus.FAILED:
        case TaskNodeStatus.COMPLETED:
          _node = {
            title,
            operator,
            candidates,
            status,
            statusContent,
            comment,
            completeTime,
            autoApprove,
            hasCommentLabel: true,
            hasCandidatesLabel: true,
            hasCompleteTimeLabel: true,
            hasOperatorLabel: true,
          };
          break;
        case TaskNodeStatus.CANCELLED:
          _node = {
            title: formatMessage({
              id: 'odc.component.CommonTaskDetailModal.TaskFlow.Terminate',
              defaultMessage: '终止',
            }),
            //终止
            operator,
            status,
            statusContent,
            completeTime,
            autoApprove,
            hasCompleteTimeLabel: true,
            hasOperatorLabel: true,
          };
          break;
        case TaskNodeStatus.EXPIRED:
          _node = {
            title,
            candidates,
            status,
            statusContent,
            completeTime,
            autoApprove,
            hasCandidatesLabel: true,
            hasCompleteTimeLabel: true,
          };
          break;
      }
    }
    return {
      ..._node,
      externalFlowInstanceUrl: node?.externalFlowInstanceUrl,
      externalApprovalName: node?.externalApprovalName,
    };
  };
  const handleTask = (node: Partial<ITaskRenderFlowNode>, index: number) => {
    let _node = node;
    if ((node?.taskType as unknown) === TaskType.MULTIPLE_ASYNC) {
      executeNodeCount++;
    }
    if (
      node.nodeType === TaskFlowNodeType.SERVICE_TASK &&
      ![IFlowTaskType.PRE_CHECK, IFlowTaskType.GENERATE_ROLLBACK].includes(node.taskType)
    ) {
      const { deadlineTime, completeTime, operator, status, taskType } = node;
      let title =
        (node?.taskType as unknown) === TaskType.MULTIPLE_ASYNC
          ? formatMessage(
              {
                id: 'src.component.Task.component.CommonDetailModal.C66A3B3E',
                defaultMessage: '执行节点{executeNodeCount}',
              },
              { executeNodeCount },
            )
          : formatMessage({
              id: 'odc.component.CommonTaskDetailModal.TaskFlow.Run',
              defaultMessage: '执行',
            });

      //执行
      let statusContent = nodeStatusMap[TaskFlowNodeType.SERVICE_TASK][status];
      switch (status) {
        case TaskNodeStatus.CREATED: {
          _node = {
            title,
            operator,
            status,
            taskType,
            statusContent,
            hasOperatorLabel: true,
          };
          break;
        }
        case TaskNodeStatus.PENDING:
        case TaskNodeStatus.EXECUTING:
          _node = {
            title,
            operator,
            status,
            statusContent,
            deadlineTime,
            taskType,
            hasDeadlineTimeLabel: true,
            hasOperatorLabel: true,
          };
          break;
        case TaskNodeStatus.CANCELLED:
          _node = {
            title: formatMessage({
              id: 'odc.component.CommonTaskDetailModal.TaskFlow.Terminate',
              defaultMessage: '终止',
            }),
            //终止
            operator,
            status,
            statusContent,
            completeTime,
            hasCompleteTimeLabel: true,
            hasOperatorLabel: true,
          };
          break;
        case TaskNodeStatus.FAILED:
        case TaskNodeStatus.COMPLETED:
          _node = {
            title,
            operator,
            status,
            statusContent,
            completeTime,
            taskType,
            hasCompleteTimeLabel: true,
            hasOperatorLabel: true,
          };
          break;
        case TaskNodeStatus.EXPIRED:
          {
            _node = {
              title,
              operator,
              status,
              statusContent,
              deadlineTime,
              hasDeadlineTimeLabel: true,
              hasOperatorLabel: true,
            };
          }
          break;
      }

      // 最后一个节点特殊处理（仅任务执行成功后才进行）
      if (index === nodeList?.length - 1 && index >= 1) {
        // 回滚成功 | 回滚失败
        if ([TaskStatus.ROLLBACK_FAILED, TaskStatus.ROLLBACK_SUCCEEDED].includes(task.status)) {
          _node = {
            title: formatMessage({
              id: 'odc.component.CommonTaskDetailModal.TaskFlow.RollBack',
              defaultMessage: '回滚',
            }),
            //回滚
            operator,
            status,
            statusContent: statusMap[task.status],
            completeTime,
            hasCompleteTimeLabel: true,
            hasOperatorLabel: true,
          };
        } else {
          if (
            ![TaskNodeStatus.EXPIRED, TaskNodeStatus.FAILED, TaskNodeStatus.CANCELLED].includes(
              _node.status,
            )
          ) {
            completedNode = {
              visible: true,
              hasDescription:
                task?.type === TaskType.ASYNC && task?.rollbackable
                  ? task?.status === TaskStatus.COMPLETED
                  : _node?.status === TaskNodeStatus.COMPLETED,
            };
          }
        }
      }
    }
    return _node;
  };
  const taskFlow: Partial<ITaskRenderFlowNode>[] = (nodeList ?? [])
    .map(handleApproval)
    .map(handleTask);
  if (
    (task?.type === TaskType.ASYNC && task.status === TaskStatus.COMPLETED) ||
    (task?.type === TaskType.ASYNC && task.status === TaskStatus.EXECUTION_SUCCEEDED) ||
    (task?.type === TaskType.LOGICAL_DATABASE_CHANGE && task.status === TaskStatus.COMPLETED) ||
    (task?.type !== TaskType.ASYNC && task.status === TaskStatus.EXECUTION_SUCCEEDED)
  ) {
    currentNodeIndex = taskFlow.length + 1;
  } else {
    taskFlow.forEach((node, index) => {
      if (![TaskNodeStatus.CREATED].includes(node.status)) {
        currentNodeIndex = index + 1;
      }
    });
  }
  return (
    <Steps progressDot current={currentNodeIndex} direction="vertical" className={styles.TaskFlow}>
      <Step
        title={formatMessage({
          id: 'odc.component.CommonTaskDetailModal.TaskFlow.InitiateATask',
          defaultMessage: '发起任务',
        })}
        /*发起任务*/ description={
          <Space direction="vertical">
            <Descriptions column={1} className={styles.block}>
              <Descriptions.Item
                label={formatMessage({
                  id: 'odc.component.CommonTaskDetailModal.TaskFlow.Handler',
                  defaultMessage: '处理人',
                })}

                /*处理人*/
              >
                <UserPopover
                  name={creator?.name}
                  accountName={creator?.accountName}
                  roles={creator?.roleNames}
                />
              </Descriptions.Item>
              <Descriptions.Item
                label={formatMessage({
                  id: 'odc.component.CommonTaskDetailModal.TaskFlow.ProcessingStatus',
                  defaultMessage: '处理状态',
                })}

                /*处理状态*/
              >
                {
                  formatMessage({
                    id: 'odc.component.CommonTaskDetailModal.TaskFlow.Succeeded',
                    defaultMessage: '已成功',
                  })

                  /*已成功*/
                }
              </Descriptions.Item>
              <Descriptions.Item
                label={formatMessage({
                  id: 'odc.component.CommonTaskDetailModal.TaskFlow.ProcessingTime',
                  defaultMessage: '处理时间',
                })}

                /*处理时间*/
              >
                {getLocalFormatDateTime(task.createTime)}
              </Descriptions.Item>
            </Descriptions>
          </Space>
        }
      />

      {taskFlow.map((item, i) => {
        const {
          title,
          comment,
          completeTime,
          candidates,
          operator,
          statusContent,
          deadlineTime,
          hasDescription = true,
          hasOperatorLabel,
          hasCandidatesLabel,
          hasCommentLabel,
          hasCompleteTimeLabel,
          hasDeadlineTimeLabel,
          autoApprove,
          externalFlowInstanceUrl,
          externalApprovalName,
          nodeType,
          taskType,
        } = item;
        const isExternalFlow = !!externalFlowInstanceUrl;
        switch (taskType) {
          /**
           * 新版逻辑 Node 封装
           */
          case IFlowTaskType.PRE_CHECK: {
            const statusContent = getStatusDisplayInfo(nodeType, item.status);
            return (
              <Step
                status={statusContent?.status as any}
                title={
                  formatMessage({
                    id: 'odc.component.CommonTaskDetailModal.TaskFlow.PreCheck',
                    defaultMessage: '预检查',
                  }) //预检查
                }
                description={
                  task?.type === TaskType?.MULTIPLE_ASYNC ? (
                    <MultipleSQLCheckNode flowId={task?.id} node={item} />
                  ) : (
                    <SQLCheckNode flowId={task?.id} node={item} />
                  )
                }
              />
            );
          }
          case IFlowTaskType.GENERATE_ROLLBACK: {
            return (
              <Step
                status={statusContent?.status as any}
                title={formatMessage({
                  id: 'odc.component.CommonDetailModal.TaskFlow.GenerateABackupRollbackScheme',
                  defaultMessage: '生成备份回滚方案',
                })}
                /*生成备份回滚方案*/ description={
                  <RollbackNode taskId={task?.id} node={item} result={result} />
                }
              />
            );
          }
          /**
           * 旧版还是用老的模版
           */
          default: {
            if ((item?.taskType as unknown) === TaskType.MULTIPLE_ASYNC) {
              const parameters = (task as TaskDetail<IMultipleAsyncTaskParams>)?.parameters;
              const databaseMap = parameters?.databases?.reduce((pre, cur) => {
                pre[cur?.id] = cur;
                return pre;
              }, {});
              const databaseIdStr =
                parameters?.orderedDatabaseIds?.[currrentRenderExecuteNodeCount++]
                  ?.map((id) => {
                    return databaseMap?.[id]?.name;
                  })
                  ?.filter(Boolean)
                  ?.join(', ') || '-';
              return (
                <Step
                  key={i}
                  status={statusContent?.status as any}
                  title={title}
                  className={classNames({
                    // TODO: 执行状态影响
                    [styles.multipleErrorExecNode]: item?.status === TaskNodeStatus.FAILED,
                  })}
                  description={
                    hasDescription && (
                      <Space direction="vertical">
                        <Descriptions column={1} className={styles.block}>
                          {hasOperatorLabel && (
                            <Descriptions.Item
                              label={formatMessage({
                                id: 'src.component.Task.component.CommonDetailModal.6225C10E',
                                defaultMessage: '数据库',
                              })}

                              /*处理人*/
                            >
                              {databaseIdStr}
                            </Descriptions.Item>
                          )}

                          <Descriptions.Item
                            label={formatMessage({
                              id: 'odc.component.CommonTaskDetailModal.TaskFlow.ProcessingStatus',
                              defaultMessage: '处理状态',
                            })}

                            /*处理状态*/
                          >
                            <Space>
                              {statusContent?.text}
                              {isExternalFlow && (
                                <a href={externalFlowInstanceUrl} target="_blank" rel="noreferrer">
                                  {
                                    formatMessage({
                                      id: 'odc.component.CommonTaskDetailModal.TaskFlow.ViewApprovalDetails',
                                      defaultMessage: '查看审批详情',
                                    })
                                    /*查看审批详情*/
                                  }
                                </a>
                              )}
                            </Space>
                          </Descriptions.Item>

                          {hasCompleteTimeLabel && (
                            <Descriptions.Item
                              label={formatMessage({
                                id: 'odc.component.CommonTaskDetailModal.TaskFlow.ProcessingTime',
                                defaultMessage: '处理时间',
                              })}

                              /*处理时间*/
                            >
                              {getLocalFormatDateTime(completeTime)}
                            </Descriptions.Item>
                          )}
                        </Descriptions>
                      </Space>
                    )
                  }
                />
              );
            }
            return (
              <Step
                status={statusContent?.status as any}
                title={title}
                description={
                  hasDescription && (
                    <Space direction="vertical">
                      <Descriptions column={1} className={styles.block}>
                        {hasOperatorLabel && (
                          <Descriptions.Item
                            label={formatMessage({
                              id: 'odc.component.CommonTaskDetailModal.TaskFlow.Handler',
                              defaultMessage: '处理人',
                            })}

                            /*处理人*/
                          >
                            {isExternalFlow ? (
                              formatMessage({
                                id: 'odc.src.component.Task.component.CommonDetailModal.ExternalApproval',
                                defaultMessage: '外部审批',
                              }) //'外部审批'
                            ) : (
                              <Space>
                                <UserPopover
                                  name={operator?.name}
                                  accountName={operator?.accountName}
                                  roles={operator?.roleNames}
                                />

                                {autoApprove && (
                                  <span className={styles.description}>
                                    {
                                      formatMessage({
                                        id: 'odc.component.CommonTaskDetailModal.TaskFlow.AutomaticApproval',
                                        defaultMessage: '(自动审批)',
                                      })

                                      /*(自动审批)*/
                                    }
                                  </span>
                                )}
                              </Space>
                            )}
                          </Descriptions.Item>
                        )}

                        {hasCandidatesLabel && (
                          <Descriptions.Item
                            className={styles.userList}
                            label={formatMessage({
                              id: 'odc.component.CommonTaskDetailModal.TaskFlow.Handled',
                              defaultMessage: '可处理人',
                            })}

                            /*可处理人*/
                          >
                            {isExternalFlow ? (
                              externalApprovalName
                            ) : (
                              <MultiLineOverflowText
                                key={i}
                                className={styles.approverWrapper}
                                isShowMore
                                content={
                                  candidates?.map((item, index) => (
                                    <>
                                      <span>
                                        <UserPopover
                                          name={item?.name}
                                          accountName={item?.accountName}
                                          roles={item?.roleNames}
                                        />
                                      </span>
                                      {index < candidates.length - 1 && (
                                        <span className={styles.split}>|</span>
                                      )}
                                    </>
                                  )) ?? '-'
                                }
                              />
                            )}
                          </Descriptions.Item>
                        )}

                        <Descriptions.Item
                          label={formatMessage({
                            id: 'odc.component.CommonTaskDetailModal.TaskFlow.ProcessingStatus',
                            defaultMessage: '处理状态',
                          })}

                          /*处理状态*/
                        >
                          <Space>
                            {statusContent?.text}
                            {isExternalFlow && (
                              <a href={externalFlowInstanceUrl} target="_blank" rel="noreferrer">
                                {
                                  formatMessage({
                                    id: 'odc.component.CommonTaskDetailModal.TaskFlow.ViewApprovalDetails',
                                    defaultMessage: '查看审批详情',
                                  })
                                  /*查看审批详情*/
                                }
                              </a>
                            )}
                          </Space>
                        </Descriptions.Item>
                        {hasCommentLabel && (
                          <Descriptions.Item
                            label={formatMessage({
                              id: 'odc.component.CommonTaskDetailModal.TaskFlow.HandlingComments',
                              defaultMessage: '处理意见',
                            })}

                            /*处理意见*/
                          >
                            {comment}
                          </Descriptions.Item>
                        )}

                        {hasCompleteTimeLabel && (
                          <Descriptions.Item
                            label={formatMessage({
                              id: 'odc.component.CommonTaskDetailModal.TaskFlow.ProcessingTime',
                              defaultMessage: '处理时间',
                            })}

                            /*处理时间*/
                          >
                            {getLocalFormatDateTime(completeTime)}
                          </Descriptions.Item>
                        )}

                        {hasDeadlineTimeLabel && (
                          <Descriptions.Item
                            label={formatMessage({
                              id: 'odc.component.CommonTaskDetailModal.TaskFlow.Deadline',
                              defaultMessage: '截止时间',
                            })}

                            /*截至时间*/
                          >
                            {getLocalFormatDateTime(deadlineTime)}
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </Space>
                  )
                }
              />
            );
          }
        }
      })}
      {completedNode?.visible && (
        <Step
          title={formatMessage({
            id: 'odc.component.CommonTaskDetailModal.TaskFlow.Completed',
            defaultMessage: '完成',
          })}
          /*完成*/ description={
            completedNode?.hasDescription && (
              <Space direction="vertical">
                <Descriptions column={1} className={styles.block}>
                  <Descriptions.Item
                    label={formatMessage({
                      id: 'odc.component.CommonTaskDetailModal.TaskFlow.ProcessingStatus',
                      defaultMessage: '处理状态',
                    })}

                    /*处理状态*/
                  >
                    {
                      formatMessage({
                        id: 'odc.component.CommonTaskDetailModal.TaskFlow.TaskCompleted',
                        defaultMessage: '任务已完成',
                      })

                      /*任务已完成*/
                    }
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={formatMessage({
                      id: 'odc.component.CommonTaskDetailModal.TaskFlow.ProcessingTime',
                      defaultMessage: '处理时间',
                    })}

                    /*处理时间*/
                  >
                    {getLocalFormatDateTime(
                      isLogicDbChangeTask ? flowDetail?.completeTime : task?.completeTime,
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Space>
            )
          }
        />
      )}
    </Steps>
  );
};
export default TaskFlow;
