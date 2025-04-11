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
        label: '选择刷新方式',
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
          <p className={styles.parallelismDegreeLabel}>设置并行度</p>
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
          查看刷新记录 &gt;
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
      message.success('刷新数据成功');
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
              title: `确认要${synchronizeText?.[info.key]?.label}吗`,
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
                style={{ fontSize: 13, cursor: 'pointer', color: 'var(--brand-blue6-color)' }}
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
