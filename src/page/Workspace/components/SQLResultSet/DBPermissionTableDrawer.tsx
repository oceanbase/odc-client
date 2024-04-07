import { formatMessage } from '@/util/intl';
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

import { Button, Drawer, Space } from 'antd';
import React from 'react';
import { IUnauthorizedDatabase } from '@/d.ts/database';
import { DBPermissionTableContent } from './DBPermissionTable';

interface IProps {
  dataSource: IUnauthorizedDatabase[];
  visible: boolean;
  onClose: () => void;
}
const DBPermissionTableDrawer: React.FC<IProps> = function ({ visible, dataSource, onClose }) {
  return (
    <Drawer
      zIndex={1003}
      width={832}
      destroyOnClose
      open={visible}
      title={
        formatMessage({
          id: 'src.page.Workspace.components.SQLResultSet.B81C8729',
        }) /*'权限检查结果'*/
      }
      footer={
        <Space
          style={{
            float: 'right',
          }}
        >
          <Button onClick={onClose}>
            {
              formatMessage({
                id: 'src.page.Workspace.components.SQLResultSet.2C272DCF' /*关闭*/,
              }) /* 关闭 */
            }
          </Button>
        </Space>
      }
      onClose={onClose}
    >
      <DBPermissionTableContent dataSource={dataSource} />
    </Drawer>
  );
};
export default DBPermissionTableDrawer;
