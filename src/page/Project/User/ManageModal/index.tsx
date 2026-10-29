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
import SCLayout, { MenuItem } from '@/page/Project/components/SCLayout';
import { Drawer } from 'antd';
import React, { useState } from 'react';
import ManageDataBaseModal from './Database/index';
import ManageTableModal from './Table/index';

import styles from './index.less';

enum EManagePermissionType {
  DATABASE = 'database',
  TABLE = 'table',
}

const contentMap = {
  [EManagePermissionType.DATABASE]: {
    component: ManageDataBaseModal,
  },
  [EManagePermissionType.TABLE]: {
    component: ManageTableModal,
  },
};

const items: MenuItem[] = [
  {
    label: formatMessage({
      id: 'src.page.Project.User.ManageModal.946C38DA',
      defaultMessage: '库权限',
    }),
    key: EManagePermissionType.DATABASE,
  },
  {
    label: formatMessage({
      id: 'src.page.Project.User.ManageModal.AE2E1625',
      defaultMessage: '表/视图权限',
    }),
    key: EManagePermissionType.TABLE,
  },
];

interface IProps {
  visible: boolean;
  projectId: number;
  userId: number;
  isOwner: boolean;
  isDBA: boolean;
  onClose: () => void;
}

const ManageModal: React.FC<IProps> = (props) => {
  const { visible, onClose, projectId, userId, isOwner, isDBA } = props;
  const [key, setKey] = useState<string>(items?.[0]?.key as string);
  const Component = contentMap?.[key]?.component;

  const handleItemOnClick = (key: string) => {
    setKey(key);
  };

  return (
    <Drawer
      open={visible}
      width={925}
      title={formatMessage({
        id: 'src.page.Project.User.ManageModal.A4F73E8C',
        defaultMessage: '管理权限',
      })}
      destroyOnClose
      className={styles.detailDrawer}
      footer={null}
      onClose={() => {
        onClose();
      }}
    >
      <div className={styles.sider}>
        <SCLayout
          sider={{
            loading: false,
            items,
            selectedKey: [key],
            handleItemOnClick,
            siderStyle: { flex: '0 0 100px' },
            contentStyle: { display: 'flex', flexDirection: 'column' },
          }}
          content={
            <Component
              key={key}
              projectId={projectId}
              userId={userId}
              isOwner={isOwner}
              isDBA={isDBA}
            />
          }
        />
      </div>
    </Drawer>
  );
};

export default ManageModal;
