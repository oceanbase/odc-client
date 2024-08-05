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

import { getFlowSQLLintResult } from '@/common/network/task';
import LintDrawer from '@/component/SQLLintResult/Drawer';
import DBPermissionTableDrawer from '@/page/Workspace/components/SQLResultSet/DBPermissionTableDrawer';
import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import { ITaskFlowNode } from '@/d.ts';
import { Descriptions, Tag } from 'antd';
import React, { useState } from 'react';
import NodeCompleteTime from './Items/NodeCompleteTime';
import NodeStatus from './Items/NodeStatus';
import { formatMessage } from '@/util/intl';
import styles from '../index.less';
interface IProps {
  node: Partial<ITaskFlowNode>;
  flowId: number;
}
const SQLCheckNode: React.FC<IProps> = function ({ node, flowId }) {
  const { status, nodeType, issueCount, unauthorizedDBResources, id, preCheckOverLimit } = node;
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [permissionResultVisible, setPermissionResultVisible] = useState(false);
  const [data, setData] = useState<ISQLLintReuslt[]>([]);
  // const [multipleData, setMultipleData] = useState
  const showCount = typeof issueCount === 'number';
  const showUnauthorized = unauthorizedDBResources?.length > 0;
  const showReslut = showCount || showUnauthorized || preCheckOverLimit;
  async function viewLintResult() {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      const result = await getFlowSQLLintResult(flowId, id);
      if (result?.sqlCheckResult?.results) {
        setData(result?.sqlCheckResult?.results);
        setVisible(true);
      }
    } finally {
      setIsLoading(false);
    }
  }

  function viewPermissionResult() {
    setPermissionResultVisible(true);
  }
  return (
    <>
      <Descriptions column={1} className={styles.block}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.CommonTaskDetailModal.TaskFlow.ProcessingStatus',
            defaultMessage: '处理状态',
          })}
        >
          <NodeStatus node={node} />
        </Descriptions.Item>
        {showReslut && (
          <Descriptions.Item>
            <Descriptions column={1}>
              {showCount || preCheckOverLimit ? (
                <Descriptions.Item
                  className={preCheckOverLimit ? styles.checkReslut : null}
                  label={
                    formatMessage({
                      id: 'odc.src.component.Task.component.CommonDetailModal.Nodes.SQLExaminationResults',
                      defaultMessage: 'SQL 检查结果',
                    }) /* SQL 检查结果 */
                  }
                >
                  {showCount && (
                    <>
                      {
                        formatMessage(
                          {
                            id: 'src.component.Task.component.CommonDetailModal.Nodes.67EAA454',
                            defaultMessage: '存在{issueCount}个问题',
                          },
                          { issueCount },
                        ) /*`存在${issueCount}个问题`*/
                      }

                      {issueCount > 0 && (
                        <a
                          style={{
                            marginLeft: 5,
                          }}
                          onClick={viewLintResult}
                        >
                          {
                            formatMessage({
                              id: 'odc.CommonTaskDetailModal.Nodes.SQLCheckNode.View',
                              defaultMessage: '查看',
                            }) /*查看*/
                          }
                        </a>
                      )}
                    </>
                  )}

                  {preCheckOverLimit && (
                    <span>
                      {
                        formatMessage({
                          id: 'odc.src.component.Task.component.CommonDetailModal.Nodes.TheNumberOf',
                          defaultMessage: '，预检查处理 SQL 条数超过最大限制，当前任务流程将按',
                        }) /* 
                ，预检查处理 SQL 条数超过最大限制，当前任务流程将按
                */
                      }

                      <Tag
                        style={{
                          marginLeft: '8px',
                        }}
                        color="error"
                      >
                        {
                          formatMessage({
                            id: 'odc.src.component.Task.component.CommonDetailModal.Nodes.HighRisk',
                            defaultMessage: '高风险',
                          }) /* 
                  高风险
                  */
                        }
                      </Tag>
                      {
                        formatMessage({
                          id: 'odc.src.component.Task.component.CommonDetailModal.Nodes.GradeContinuesToAdvance',
                          defaultMessage: '等级继续推进',
                        }) /* 
                等级继续推进
                */
                      }
                    </span>
                  )}
                </Descriptions.Item>
              ) : null}
              {showUnauthorized ? (
                <Descriptions.Item
                  label={
                    formatMessage({
                      id: 'odc.src.component.Task.component.CommonDetailModal.Nodes.PermissionsInspectionResults',
                      defaultMessage: '权限检查结果',
                    }) /* 权限检查结果 */
                  }
                >
                  {
                    formatMessage(
                      {
                        id: 'src.component.Task.component.CommonDetailModal.Nodes.90FF76EB',
                        defaultMessage: '存在{unauthorizedDatabasesLength}个问题',
                      },
                      { unauthorizedDatabasesLength: unauthorizedDBResources?.length },
                    ) /*`存在${unauthorizedDatabases?.length}个问题`*/
                  }

                  <a
                    style={{
                      marginLeft: 5,
                    }}
                    onClick={viewPermissionResult}
                  >
                    {
                      formatMessage({
                        id: 'src.component.Task.component.CommonDetailModal.Nodes.3D1ABD2F' /*查看*/,
                        defaultMessage: '查看',
                      }) /* 查看 */
                    }
                  </a>
                </Descriptions.Item>
              ) : null}
            </Descriptions>
          </Descriptions.Item>
        )}

        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.CommonTaskDetailModal.TaskFlow.ProcessingTime',
            defaultMessage: '处理时间',
          })}
        >
          <NodeCompleteTime node={node} />
        </Descriptions.Item>
      </Descriptions>
      <LintDrawer visible={visible} closePage={() => setVisible(false)} data={data} />
      <DBPermissionTableDrawer
        visible={permissionResultVisible}
        dataSource={unauthorizedDBResources}
        onClose={() => {
          setPermissionResultVisible(false);
        }}
      />
    </>
  );
};
export default SQLCheckNode;
