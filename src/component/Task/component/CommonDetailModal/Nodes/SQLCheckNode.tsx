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
        <Descriptions.Item>
          <Descriptions column={1} title="处理结果:" className={styles['result-desc']}>
            {typeof issueCount === 'number' ? (
              <Descriptions.Item label="SQL 检查结果">
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
                  <a style={{ marginLeft: 5 }} onClick={viewLintResult}>
                    {
                      formatMessage({
                        id: 'odc.CommonTaskDetailModal.Nodes.SQLCheckNode.View',
                      }) /*查看*/
                    }
                  </a>
                )}
              </Descriptions.Item>
            ) : null}
            {!!unauthorizedDatabaseNames?.length && (
              <Descriptions.Item label="权限检查结果">
                无权限访问数据库：
                {unauthorizedDatabaseNames?.join(', ')}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Descriptions.Item>
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
