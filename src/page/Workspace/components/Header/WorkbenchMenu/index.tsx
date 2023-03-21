import { ConnectionMode, ISQLScript } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import {
  closePageByScriptIdAndType,
  openNewDefaultPLPage,
  openNewSQLPage,
  openOBClientPage,
  openSQLPageByScript,
} from '@/store/helper/page';
import { UserStore } from '@/store/login';
import { ModalStore } from '@/store/modal';
import { SchemaStore } from '@/store/schema';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { formatBytes, isWin64 } from '@/util/utils';
import { DeleteOutlined, EditOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu, message, Modal, Space, Tooltip } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useState } from 'react';
import { FormattedMessage } from 'umi';

import { deleteScript } from '@/common/network';
import DropdownMenu from '@/component/DropdownMenu';
import { SettingStore } from '@/store/setting';
import { isNil } from 'lodash';
import type { MenuInfo } from 'rc-menu/lib/interface';
import ScriptEditorModal from '../../ScriptManageModal/ScriptEditorModal';
import styles from './index.less';
const { SubMenu } = Menu;

interface IProps {
  connectionStore?: ConnectionStore;
  userStore?: UserStore;
  modalStore?: ModalStore;
  settingStore?: SettingStore;
  schemaStore?: SchemaStore;
}

enum MenuKey {
  CREATE_SQL = 'CREATE_SQL',
  CREATE_PL = 'CREATE_PL',
  OB_CLIENT = 'OB_CLIENT',
  SCRIPT_MANAGE = 'SCRIPT_MANAGE',
}

const WorkbenchMenu: React.FC<IProps> = function ({
  connectionStore,
  userStore,
  modalStore,
  settingStore,
  schemaStore,
}) {
  const { connection } = connectionStore;
  const { scriptStore } = userStore;
  const { scripts } = scriptStore;
  const [editingScriptId, setEditingScriptId] = useState(null);
  const scriptEditorVisible = !isNil(editingScriptId);
  const handleClickMenu = (clickParam: MenuInfo) => {
    switch (clickParam.key) {
      case MenuKey.CREATE_SQL:
        openNewSQLPage();
        break;

      case MenuKey.CREATE_PL:
        openNewDefaultPLPage();
        break;
      case MenuKey.OB_CLIENT:
        openOBClientPage();
        break;
      case MenuKey.SCRIPT_MANAGE:
        modalStore.changeScriptManageModalVisible(true);
      default:
    }
  };

  const handleOpenSQLPage = async (script: ISQLScript) => {
    await openSQLPageByScript(script.id);
  };

  const handleDeleteScript = async (script: ISQLScript) => {
    Modal.confirm({
      title: formatMessage({ id: 'odc.Header.WorkbenchMenu.DeleteScript' }), //删除脚本
      content: formatMessage(
        {
          id: 'odc.Header.WorkbenchMenu.AreYouSureYouWant',
        },
        { scriptObjectName: script.objectName },
      ), //`确定要删除脚本${script.objectName}吗`
      okText: formatMessage({ id: 'app.button.ok' }),

      cancelText: formatMessage({
        id: 'app.button.cancel',
      }),

      onOk: async () => {
        const isSuccess = await deleteScript([script.id]);

        if (!isSuccess) {
          return;
        }

        message.success(
          formatMessage({
            id: 'portal.connection.delete.success',
          }),
        );

        // 1.刷新列表

        await userStore?.scriptStore.getScriptList(); // 2.关闭页面，如果已经打开的话

        closePageByScriptIdAndType(script.id);
      },
    });
  };
  const maxScriptEditLength = settingStore.serverSystemInfo?.maxScriptEditLength;
  return (
    <>
      <DropdownMenu
        overlay={
          <Menu
            style={{
              width: '200px',
            }}
            onClick={handleClickMenu}
          >
            <Menu.Item key={MenuKey.CREATE_SQL}>
              <FormattedMessage id="workspace.header.create.sql" />
            </Menu.Item>
            {connection.dbMode == ConnectionMode.OB_ORACLE ? (
              <Menu.Item key={MenuKey.CREATE_PL}>
                <FormattedMessage id="workspace.header.create.pl" />
              </Menu.Item>
            ) : null}
            {(isClient() && !isWin64()) || !schemaStore.enableObclient ? null : (
              <Menu.Item key={MenuKey.OB_CLIENT}>
                {
                  formatMessage({
                    id: 'odc.components.Header.CommandLineWindow',
                  })

                  /* 命令行窗口 */
                }
              </Menu.Item>
            )}

            <SubMenu
              popupClassName={styles.sqlListMenu}
              key="sql-submenu"
              title={formatMessage({
                id: 'workspace.header.sql.saved',
              })}
            >
              {scripts?.map((script: ISQLScript) => {
                const isOutLimit = script.contentLength > maxScriptEditLength;
                const maxLimitText = formatBytes(maxScriptEditLength);
                return (
                  <Menu.Item
                    key={`sql-${script.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    className={styles.sqlScriptItem}
                  >
                    {isOutLimit ? (
                      <Tooltip
                        title={
                          formatMessage(
                            {
                              id: 'odc.Header.WorkbenchMenu.CurrentlyYouCannotEditFiles',
                            },

                            { maxLimitText: maxLimitText },
                          )
                          //`暂不支持超过 ${maxLimitText} 的文件编辑`
                        }
                      >
                        <span>{script.objectName}</span>
                      </Tooltip>
                    ) : (
                      <>
                        <span
                          className={styles.scriptName}
                          onClick={() => handleOpenSQLPage(script)}
                        >
                          {script.objectName}
                        </span>
                        <EditOutlined
                          className={styles.sqlOperation}
                          style={{
                            marginRight: 8,
                          }}
                          onClick={async () => {
                            setEditingScriptId(script.id);
                          }}
                        />

                        <DeleteOutlined
                          className={styles.sqlOperation}
                          onClick={() => handleDeleteScript(script)}
                        />
                      </>
                    )}
                  </Menu.Item>
                );
              })}
              <Menu.Item key={MenuKey.SCRIPT_MANAGE}>
                <Space>
                  <SettingOutlined />
                  {formatMessage({
                    id: 'odc.Header.WorkbenchMenu.TaskManagement',
                  })}
                </Space>
              </Menu.Item>
            </SubMenu>
          </Menu>
        }
      >
        <FormattedMessage id="workspace.header.sql" />
      </DropdownMenu>
      <ScriptEditorModal
        visible={scriptEditorVisible}
        scriptId={editingScriptId}
        onClose={() => {
          setEditingScriptId(null);
        }}
        onOk={async () => {
          await userStore!.scriptStore.getScriptList();
          setEditingScriptId(null);
        }}
      />
    </>
  );
};

export default inject(
  'userStore',
  'connectionStore',
  'modalStore',
  'settingStore',
  'schemaStore',
)(observer(WorkbenchMenu));
