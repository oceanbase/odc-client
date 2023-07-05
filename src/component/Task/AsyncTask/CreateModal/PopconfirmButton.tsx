import { formatMessage } from '@/util/intl';
import { Popconfirm } from 'antd';
import React from 'react';

interface IProps {
  hasEdit: boolean;
  onConfirm: () => void;
}

export const PopconfirmButton: React.FC<IProps> = (props) => {
  const { hasEdit, onConfirm } = props;
  return (
    <>
      {hasEdit ? (
        <Popconfirm
          title={formatMessage({
            id: 'odc.components.CreateAsyncTaskModal.PopconfirmButton.AreYouSureYouWant',
          })} /* 确定要取消新建吗？ */
          okText={formatMessage({
            id: 'odc.components.CreateAsyncTaskModal.PopconfirmButton.Determine',
          })} /* 确定 */
          cancelText={formatMessage({
            id: 'odc.components.CreateAsyncTaskModal.PopconfirmButton.Cancel',
          })} /* 取消 */
          onConfirm={onConfirm}
        >
          {props.children}
        </Popconfirm>
      ) : (
        <span onClick={onConfirm}>{props.children}</span>
      )}
    </>
  );
};
