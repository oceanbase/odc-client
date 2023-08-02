import UserPopover from '@/component/UserPopover';
import { ITaskFlowNode, ITaskResult } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Descriptions, Space } from 'antd';
import { isEmpty } from 'lodash';
import React from 'react';
import { DownloadFileAction } from '../../DownloadFileAction';
import styles from '../index.less';

interface IProps {
  taskId: number;
  node: Partial<ITaskFlowNode>;
  result: ITaskResult;
}

const RollbackNode: React.FC<IProps> = function (props) {
  const { taskId, node, result } = props;
  const { operator, autoApprove } = node;
  const resultData = result?.rollbackPlanResult;
  const isEmptyResult = isEmpty(resultData);

  return (
    <>
      <Descriptions column={1} className={styles.block}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.CommonDetailModal.Nodes.RollbackNode.Handler',
          })} /*处理人*/
        >
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
                    id: 'odc.CommonDetailModal.Nodes.RollbackNode.AutomaticApproval',
                  }) /*(自动审批)*/
                }
              </span>
            )}
          </Space>
        </Descriptions.Item>
        {isEmptyResult ? (
          <>
            <Descriptions.Item
              label={formatMessage({
                id: 'odc.CommonDetailModal.Nodes.RollbackNode.ProcessingStatus',
              })} /*处理状态*/
            >
              -
            </Descriptions.Item>
            <Descriptions.Item
              label={formatMessage({
                id: 'odc.CommonDetailModal.Nodes.RollbackNode.ProcessingResult',
              })} /*处理结果*/
            >
              -
            </Descriptions.Item>
          </>
        ) : (
          <>
            <Descriptions.Item
              label={formatMessage({
                id: 'odc.CommonDetailModal.Nodes.RollbackNode.ProcessingStatus',
              })} /*处理状态*/
            >
              {
                resultData?.success
                  ? formatMessage({ id: 'odc.CommonDetailModal.Nodes.RollbackNode.Success' }) //成功
                  : formatMessage({ id: 'odc.CommonDetailModal.Nodes.RollbackNode.Failed' }) //失败
              }
            </Descriptions.Item>
            {resultData?.success ? (
              <Descriptions.Item
                label={formatMessage({
                  id: 'odc.CommonDetailModal.Nodes.RollbackNode.ProcessingResult',
                })} /*处理结果*/
              >
                {resultData?.objectId ? (
                  <Space>
                    <span>
                      {
                        formatMessage({
                          id: 'odc.CommonDetailModal.Nodes.RollbackNode.ARollbackSchemeIsSuccessfully',
                        }) /*成功生成回滚方案*/
                      }
                    </span>
                    <DownloadFileAction taskId={taskId} objectId={resultData?.objectId} />
                  </Space>
                ) : (
                  <span>
                    {
                      formatMessage({
                        id: 'odc.CommonDetailModal.Nodes.RollbackNode.UnableToGenerateRollbackScheme',
                      }) /*无法生成回滚方案*/
                    }
                  </span>
                )}
              </Descriptions.Item>
            ) : (
              <Descriptions.Item
                label={formatMessage({
                  id: 'odc.CommonDetailModal.Nodes.RollbackNode.ErrorMessage',
                })} /*错误信息*/
              >
                {resultData?.error}
              </Descriptions.Item>
            )}
          </>
        )}
      </Descriptions>
    </>
  );
};

export default RollbackNode;
