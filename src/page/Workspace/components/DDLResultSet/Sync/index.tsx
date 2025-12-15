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
import { Dropdown, Button, Divider, Modal, Tooltip } from 'antd';
import React, { useContext, useMemo, useState } from 'react';
import { synchronizeText, refreshMethodAllowsSyncMethods } from './constants';
import SessionStore from '@/store/sessionManager/session';
import { MenuItemGroupType } from 'antd/es/menu/interface';
import Toolbar from '@/component/Toolbar';
import { RefreshMethod } from '@/d.ts';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { ReactComponent as SyncMetadataSvg } from '@/svgr/sync_metadata.svg';
import { syncMaterializedView } from '@/common/network/materializedView/index';
import pageStore from '@/store/page';
import { InputNumber, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import styles from './index.less';
import SyncRecordDrawer from './SyncRecordDrawer';
import MaterializedViewPageContext from '@/page/Workspace/components/MaterializedViewPage/context';

const ToolbarButton = Toolbar.Button;
const { confirm } = Modal;
interface IProps {
  session?: SessionStore;
}

const Sync: React.FC<IProps> = (props) => {
  const { session } = props;
  const [parallelismDegree, setParallelismDegree] = useState<number>();
  const [syncing, setSyncing] = useState<boolean>(false);
  const [openSyncRecordDrawer, setOpenSyncRecordDrawer] = useState<boolean>(false);
  const { materializedView } = useContext(MaterializedViewPageContext);

  const synchronizeOptions: MenuItemGroupType[] = useMemo(() => {
    const options: MenuItemGroupType[] = [
      {
        key: 'group',
        type: 'group',
        label: formatMessage({
          id: 'src.page.Workspace.components.DDLResultSet.Sync.88BF23AB',
          defaultMessage: '选择刷新方式',
        }),
        children: [
          RefreshMethod.REFRESH_FAST,
          RefreshMethod.REFRESH_COMPLETE,
          RefreshMethod.REFRESH_FORCE,
        ].map((item) => ({
          label: (
            <Tooltip title={synchronizeText?.[item]?.tip}>{synchronizeText?.[item]?.label}</Tooltip>
          ),

          key: item,
          disabled:
            !refreshMethodAllowsSyncMethods[materializedView?.info?.refreshMethod]?.includes(item),
        })),
      },
    ];

    return options;
  }, [session.odcDatabase.connectType, JSON.stringify(materializedView)]);

  const customDropdownContent = useMemo(() => {
    return (
      <>
        <Divider style={{ margin: 0 }} />
        <div className={styles.parallelismDegree}>
          <p className={styles.parallelismDegreeLabel}>
            {formatMessage({
              id: 'src.page.Workspace.components.DDLResultSet.Sync.F802A21B',
              defaultMessage: '设置并行度',
            })}
          </p>
          <InputNumber
            min={1}
            max={Number.MAX_SAFE_INTEGER}
            value={parallelismDegree}
            onChange={(e) => setParallelismDegree(e)}
          />
        </div>
        <Button
          type="link"
          onClick={() => {
            setOpenSyncRecordDrawer(true);
          }}
        >
          {formatMessage({
            id: 'src.page.Workspace.components.DDLResultSet.Sync.38BDFD2B',
            defaultMessage: '查看刷新记录',
          })}
        </Button>
      </>
    );
  }, [session.odcDatabase.connectType]);

  const handleSyncMaterializedView = async (method: RefreshMethod) => {
    setSyncing(true);
    const res = await syncMaterializedView({
      dbName: session?.database?.dbName,
      sessionId: session?.sessionId,
      method,
      parallelismDegree,
      materializedViewName: pageStore?.activePage?.params?.materializedViewName,
    });
    if (res) {
      message.success(
        formatMessage({
          id: 'src.page.Workspace.components.DDLResultSet.Sync.F3681DA6',
          defaultMessage: '刷新数据成功',
        }),
      );
    }
    setSyncing(false);
  };

  const handleCloseSyncRecordDrawer = () => {
    setOpenSyncRecordDrawer(false);
  };

  return (
    <>
      <Dropdown
        menu={{
          items: synchronizeOptions,
          onClick(info) {
            confirm({
              title: formatMessage(
                {
                  id: 'src.page.Workspace.components.DDLResultSet.Sync.E5C0001D',
                  defaultMessage: '确认要{synchronizeTextInfoKeyLabel}吗',
                },
                { synchronizeTextInfoKeyLabel: synchronizeText?.[info.key]?.label },
              ),
              icon: <ExclamationCircleFilled />,
              content: synchronizeText?.[info.key]?.descriptions,
              onOk: () => handleSyncMaterializedView(info.key as RefreshMethod),
              onCancel() {},
            });
          },
        }}
        overlayClassName={styles.synchronizeDropdown}
        dropdownRender={(menu) => (
          <>
            {menu}
            {customDropdownContent}
          </>
        )}
      >
        {syncing ? (
          <ToolbarButton
            icon={
              <LoadingOutlined
                style={{ fontSize: 13, cursor: 'pointer', color: 'var(--icon-color-focus)' }}
              />
            }
          />
        ) : (
          <ToolbarButton icon={<SyncMetadataSvg />} />
        )}
      </Dropdown>
      <SyncRecordDrawer
        open={openSyncRecordDrawer}
        onClose={handleCloseSyncRecordDrawer}
        session={session}
      />
    </>
  );
};

export default Sync;
