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
