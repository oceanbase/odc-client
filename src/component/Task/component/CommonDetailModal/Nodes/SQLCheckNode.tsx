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
import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import { ITaskFlowNode } from '@/d.ts';
import { Descriptions, Steps } from 'antd';
import React, { useState } from 'react';
import NodeCompleteTime from './Items/NodeCompleteTime';
import NodeStatus from './Items/NodeStatus';
import { formatMessage } from '@/util/intl';
import styles from '../index.less';
const Step = Steps.Step;
interface IProps {
  node: Partial<ITaskFlowNode>;
  flowId: number;
}
const SQLCheckNode: React.FC<IProps> = function ({ node, flowId }) {
  const { status, nodeType, issueCount, unauthorizedDatabaseNames, id } = node;
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<ISQLLintReuslt[]>([]);
  const showCount = typeof issueCount === 'number';
  const showUnauthorized = unauthorizedDatabaseNames?.length > 0;
  const showReslut = showCount || showUnauthorized;
  async function viewLintResult() {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      const result = await getFlowSQLLintResult(flowId, id);
      if (result) {
        setData(result);
        setVisible(true);
      }
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <>
      <Descriptions column={1} className={styles.block}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.CommonTaskDetailModal.TaskFlow.ProcessingStatus',
          })}
        >
          <NodeStatus node={node} />
        </Descriptions.Item>
        {showReslut && (
          <Descriptions.Item>
            <Descriptions
              column={1}
              title={
                formatMessage({
                  id: 'odc.src.component.Task.component.CommonDetailModal.Nodes.ProcessResult',
                }) /* 处理结果: */
              }
              className={styles['result-desc']}
            >
              {showCount ? (
                <Descriptions.Item
                  label={
                    formatMessage({
                      id:
                        'odc.src.component.Task.component.CommonDetailModal.Nodes.SQLExaminationResults',
                    }) /* SQL 检查结果 */
                  }
                >
                  {
                    formatMessage({
                      id: 'odc.CommonTaskDetailModal.Nodes.SQLCheckNode.Existence',
                    }) /*存在*/
                  }
                  {issueCount}
                  {
                    formatMessage({
                      id: 'odc.CommonTaskDetailModal.Nodes.SQLCheckNode.Question',
                    }) /*个问题*/
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
                        }) /*查看*/
                      }
                    </a>
                  )}
                </Descriptions.Item>
              ) : null}
              {showUnauthorized ? (
                <Descriptions.Item
                  label={
                    formatMessage({
                      id:
                        'odc.src.component.Task.component.CommonDetailModal.Nodes.PermissionsInspectionResults',
                    }) /* 权限检查结果 */
                  }
                >
                  {
                    formatMessage({
                      id:
                        'odc.src.component.Task.component.CommonDetailModal.Nodes.UnpredictableAccessToTheDatabase',
                    }) /* 
                  无权限访问数据库：
                   */
                  }
                  {unauthorizedDatabaseNames?.join(', ')}
                </Descriptions.Item>
              ) : null}
            </Descriptions>
          </Descriptions.Item>
        )}
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.CommonTaskDetailModal.TaskFlow.ProcessingTime',
          })}
        >
          <NodeCompleteTime node={node} />
        </Descriptions.Item>
      </Descriptions>
      <LintDrawer visible={visible} closePage={() => setVisible(false)} data={data} />
    </>
  );
};
export default SQLCheckNode;
