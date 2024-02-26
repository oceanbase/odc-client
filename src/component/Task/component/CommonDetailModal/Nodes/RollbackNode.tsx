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
                {resultData?.resultFileDownloadUrl ? (
                  <Space>
                    <span>
                      {
                        formatMessage({
                          id: 'odc.CommonDetailModal.Nodes.RollbackNode.ARollbackSchemeIsSuccessfully',
                        }) /*成功生成回滚方案*/
                      }
                    </span>
                    <DownloadFileAction url={resultData?.resultFileDownloadUrl} />
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
