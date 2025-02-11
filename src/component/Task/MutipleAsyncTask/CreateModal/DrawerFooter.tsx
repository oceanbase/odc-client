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
import { Button, Space } from 'antd';

const DrawerFooter: React.FC<{
  hasEdit: boolean;
  confirmLoading: boolean;
  handleSubmit: () => void;
  handleCancel: (hasEdit: boolean) => void;
}> = ({ hasEdit, confirmLoading, handleSubmit, handleCancel }) => {
  return (
    <Space>
      <Button
        onClick={() => {
          handleCancel(hasEdit);
        }}
      >
        {
          formatMessage({
            id: 'odc.components.CreateAsyncTaskModal.Cancel',
            defaultMessage: '取消',
          })

          /* 取消 */
        }
      </Button>
      <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>
        {
          formatMessage({
            id: 'odc.components.CreateAsyncTaskModal.New',
            defaultMessage: '新建',
          })

          /* 新建 */
        }
      </Button>
    </Space>
  );
};
export default DrawerFooter;
