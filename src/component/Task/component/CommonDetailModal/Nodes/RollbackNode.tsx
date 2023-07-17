import UserPopover from '@/component/UserPopover';
import { ITaskFlowNode, ITaskResult } from '@/d.ts';
import { Descriptions, Space } from 'antd';
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

  return (
    <>
      <Descriptions column={1} className={styles.block}>
        <Descriptions.Item label="处理人">
          <Space>
            <UserPopover
              name={operator?.name}
              accountName={operator?.accountName}
              roles={operator?.roleNames}
            />
            {autoApprove && <span className={styles.description}>(自动审批)</span>}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="处理状态">
          {resultData?.success ? '成功' : '失败'}
        </Descriptions.Item>
        {resultData?.success ? (
          <Descriptions.Item label="处理结果">
            {resultData?.objectId ? (
              <Space>
                <span>成功生成回滚方案</span>
                <DownloadFileAction taskId={taskId} objectId={resultData?.objectId} />
              </Space>
            ) : (
              <span>无法生成回滚方案</span>
            )}
          </Descriptions.Item>
        ) : (
          <Descriptions.Item label="错误信息">{resultData?.error}</Descriptions.Item>
        )}
      </Descriptions>
    </>
  );
};

export default RollbackNode;
