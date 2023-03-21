import { formatMessage } from '@/util/intl';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Divider, Drawer, message, Modal, Space, Typography } from 'antd';

import { deleteScript, downloadScript } from '@/common/network';
import CommonTable from '@/component/CommonTable';
import { CommonTableMode, ITableInstance } from '@/component/CommonTable/interface';
import ODCDragger from '@/component/OSSDragger2';
import { closePageByScriptIdAndType } from '@/store/helper/page';
import { UserStore } from '@/store/login';
import { ModalStore } from '@/store/modal';
import setting, { SettingStore } from '@/store/setting';
import { formatBytes } from '@/util/utils';
import Cookies from 'js-cookie';
import { debounce, isNil } from 'lodash';
import { inject, observer } from 'mobx-react';
import { getLocale } from 'umi';
import { useColumns } from './columns';
import ScriptEditorModal from './ScriptEditorModal';

interface IScriptManageModalProps {
  modalStore?: ModalStore;
  userStore?: UserStore;
  settingStore?: SettingStore;
}

function checkImportFile(file) {
  const { size } = file;
  if (size <= setting.serverSystemInfo?.maxScriptUploadLength) {
    return true;
  }
  message.error(
    formatMessage({
      id: 'odc.components.OBClientPage.ScriptManageModal.TheSizeOfTheUploaded',
    }),

    // 上传文件大小不能超出限制
  );
  return false;
}

const ScriptManageModal: React.FC<IScriptManageModalProps> = function (props) {
  const { modalStore, userStore, settingStore } = props;
  const visible = modalStore.scriptManageModalVisible;
  const tableRef = useRef<ITableInstance>();
  const [searchName, setSearchName] = useState<string>('');
  const [editingScriptId, setEditingScriptId] = useState(null);
  const scriptEditorVisible = !isNil(editingScriptId);
  const fetchScriptList = useCallback(async () => {
    if (!visible) {
      return;
    }
    await userStore?.scriptStore.getScriptList();
    tableRef.current?.resetSelectedRows();
  }, [visible]);
  const columns = useColumns(
    setEditingScriptId,
    settingStore.serverSystemInfo?.maxScriptEditLength,
    fetchScriptList,
  );

  const uploadList = userStore.scriptStore.scripts;

  const onClose = useCallback(() => {
    modalStore.changeScriptManageModalVisible(false);
  }, [modalStore]);

  const filterList = useMemo(() => {
    return uploadList?.filter((item) => item.objectName.includes(searchName));
  }, [searchName, uploadList]);

  const debounceFetchList = useCallback(debounce(fetchScriptList, 200), [fetchScriptList]);

  useEffect(() => {
    fetchScriptList();
  }, [visible]);

  return (
    <Drawer
      width={720}
      title={formatMessage({
        id: 'odc.components.OBClientPage.ScriptManageModal.ScriptManagement',
      })}
      /* 脚本管理 */
      visible={visible}
      onClose={onClose}
      footer={null}
    >
      <Space style={{ width: '100%' }} direction="vertical">
        <Typography.Text>
          {
            formatMessage({
              id: 'odc.components.OBClientPage.ScriptManageModal.ImportScript',
            })

            /* 导入脚本 */
          }
        </Typography.Text>
        <ODCDragger
          uploadFileOpenAPIName="UploadScript"
          name="file"
          multiple={true}
          onBeforeUpload={(file) => {
            return checkImportFile(file);
          }}
          headers={{
            'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN') || '',
            'Accept-Language': getLocale(),
          }}
          clearSuccess
          action={window.ODCApiHost + `/api/v2/script/scripts/batchUpload`}
          accept=".sql, .pl, .txt"
          onFileChange={debounceFetchList}
        >
          {
            formatMessage({
              id: 'odc.components.OBClientPage.ScriptManageModal.ClickOrDragTheFile',
            })

            /* 点击或将文件拖拽到这里上传 */
          }

          <Typography.Paragraph type="secondary">
            {
              formatMessage({
                id: 'odc.components.ScriptManageModal.TheMaximumNumberOfImported',
              })
              /*导入文件最大不能超过*/
            }

            {formatBytes(setting.serverSystemInfo?.maxScriptUploadLength)}
            {
              formatMessage({
                id: 'odc.components.ScriptManageModal.SupportedExtensionsSqlPlTxt',
              })
              /*，支持扩展名：.sql / .pl / .txt*/
            }
          </Typography.Paragraph>
        </ODCDragger>
      </Space>
      <Divider style={{ margin: '16px 0px' }} />
      <CommonTable
        ref={tableRef}
        mode={CommonTableMode.SMALL}
        tableProps={{
          bordered: true,
          rowKey: 'id',
          columns,
          dataSource: filterList,
        }}
        rowSelecter={{
          options: [
            {
              okText: formatMessage({
                id: 'odc.components.ScriptManageModal.BatchDownload',
              }),
              //批量下载
              onOk: (keys) => {
                downloadScript(keys);
              },
            },

            {
              okText: formatMessage({
                id: 'odc.components.ScriptManageModal.BatchDelete',
              }),
              //批量删除
              onOk: async (keys) => {
                Modal.confirm({
                  title: formatMessage({
                    id: 'odc.components.ScriptManageModal.ConfirmDeletion',
                  }), //确认删除
                  onOk: async () => {
                    if (await deleteScript(keys)) {
                      message.success(
                        formatMessage({
                          id: 'odc.components.ScriptManageModal.Deleted',
                        }),
                        //删除成功
                      );
                      for (let key of keys) {
                        await closePageByScriptIdAndType(key);
                      }
                    }
                    await fetchScriptList();
                  },
                });
              },
            },
          ],
        }}
        onLoad={fetchScriptList}
        titleContent={{
          title: formatMessage({
            id: 'odc.components.ScriptManageModal.ScriptList',
          }),
          //脚本列表
        }}
        filterContent={{
          enabledSearch: true,
          searchPlaceholder: formatMessage({
            id: 'odc.components.ScriptManageModal.EnterAScriptName',
          }),
          //请输入脚本名称
        }}
        onChange={(arg) => {
          setSearchName(arg.searchValue);
        }}
      />

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
    </Drawer>
  );
};

export default inject('modalStore', 'userStore', 'settingStore')(observer(ScriptManageModal));
