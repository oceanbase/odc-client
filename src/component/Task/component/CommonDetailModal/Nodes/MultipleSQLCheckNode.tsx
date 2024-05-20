import { getFlowSQLLintResult } from '@/common/network/task';
import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import { ITaskFlowNode } from '@/d.ts';
import { Descriptions, Drawer, Tag } from 'antd';
import React, { useState } from 'react';
import NodeCompleteTime from './Items/NodeCompleteTime';
import NodeStatus from './Items/NodeStatus';
import { formatMessage } from '@/util/intl';
import styles from '../index.less';
import MultipleLintResultTable from '@/page/Workspace/components/SQLResultSet/MultipleAsyncSQLLintTable';
import { IDatabase } from '@/d.ts/database';
interface IProps {
  node: Partial<ITaskFlowNode>;
  flowId: number;
}
const MultipleSQLCheckNode: React.FC<IProps> = function ({ node, flowId }) {
  const { status, nodeType, issueCount, unauthorizedDatabases, id, preCheckOverLimit } = node;
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<
    {
      checkResult: ISQLLintReuslt;
      database: IDatabase;
    }[]
  >([]);
  const showCount = typeof issueCount === 'number';
  const showUnauthorized = unauthorizedDatabases?.length > 0;
  const showReslut = showCount || showUnauthorized || preCheckOverLimit;
  async function viewLintResult() {
    setVisible(true);
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      const result = await getFlowSQLLintResult(flowId, id);
      if (result?.multipleSqlCheckTaskResult?.sqlCheckTaskResultList) {
        const { databaseList, sqlCheckTaskResultList } = result?.multipleSqlCheckTaskResult ?? {};
        const lintResults = [];
        sqlCheckTaskResultList?.forEach((item, index) => {
          lintResults.push(
            ...item?.results?.map((result) => ({
              checkResult: result,
              database: databaseList?.[index],
            })),
          );
        });
        setData(lintResults);
        setVisible(true);
      }
    } finally {
      setIsLoading(false);
    }
  }

  function viewPermissionResult() {
    // setPermissionResultVisible(true);
    setVisible(true);
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
            <Descriptions column={1}>
              {showCount || preCheckOverLimit ? (
                <Descriptions.Item
                  className={preCheckOverLimit ? styles.checkReslut : null}
                  label={
                    formatMessage({
                      id: 'odc.src.component.Task.component.CommonDetailModal.Nodes.SQLExaminationResults',
                    }) /* SQL 检查结果 */
                  }
                >
                  {showCount && (
                    <>
                      {
                        formatMessage(
                          { id: 'src.component.Task.component.CommonDetailModal.Nodes.67EAA454' },
                          { issueCount: issueCount },
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
                          }) /* 
                  高风险
                  */
                        }
                      </Tag>
                      {
                        formatMessage({
                          id: 'odc.src.component.Task.component.CommonDetailModal.Nodes.GradeContinuesToAdvance',
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
                    }) /* 权限检查结果 */
                  }
                >
                  {
                    formatMessage(
                      { id: 'src.component.Task.component.CommonDetailModal.Nodes.90FF76EB' },
                      { unauthorizedDatabasesLength: unauthorizedDatabases?.length },
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
          })}
        >
          <NodeCompleteTime node={node} />
        </Descriptions.Item>
      </Descriptions>
      {/* <LintDrawer visible={visible} closePage={() => setVisible(false)} data={data} /> */}
      <Drawer
        title="检查结果"
        width={720}
        open={visible}
        closable
        onClose={() => {
          setVisible(false);
        }}
      >
        <Descriptions>
          <Descriptions.Item label="SQL 检查结果">存在{issueCount}个问题</Descriptions.Item>
        </Descriptions>
        <MultipleLintResultTable
          pageSize={10}
          showLocate={false}
          hasExtraOpt={false}
          lintResultSet={data}
          sqlChanged={false}
          baseOffset={0}
        />
      </Drawer>
    </>
  );
};
export default MultipleSQLCheckNode;
