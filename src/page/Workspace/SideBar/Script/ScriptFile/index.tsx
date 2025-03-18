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

import { SQLConsoleResourceType } from '@/common/datasource/interface';
import { SQLConsoleEmpty } from '@/component/Empty/SQLConsoleEmpty';
import ScriptEditorModal from '@/page/Workspace/components/ScriptManageModal/ScriptEditorModal';
import { openSQLPageByScript } from '@/store/helper/page';
import type { MenuProps } from 'antd';
import { UserStore } from '@/store/login';
import { formatMessage } from '@/util/intl';
import { batchDownloadScript } from '@/common/network';
import tracert from '@/util/tracert';
import { Input, Spin, Dropdown } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import { inject, observer } from 'mobx-react';
import { useEffect, useMemo, useState, useContext } from 'react';
import styles from './index.less';
import Item from './Item';
import { IScriptMeta } from '@/d.ts';
import useKeyBoardSensor from './hooks/useKeyBoardSensor';

interface IProps {
  userStore?: UserStore;
  uploadFiles?: UploadFile[];
  setUploadFiles?: (files: UploadFile[]) => void;
}

export default inject('userStore')(
  observer(function ScriptFile({ userStore, uploadFiles, setUploadFiles }: IProps) {
    const [loading, setLoading] = useState(false);
    const [searchVaue, setSearchVaue] = useState('');
    const [editingScriptId, setEditingScriptId] = useState(null);
    const [activeFileList, setActiveFileList] = useState<React.Key[]>([]);
    const [interval, setInterval] = useState<React.Key[]>([]);
    const scriptEditorVisible = !!editingScriptId;
    const { crtlorCommandPressed, shiftPressed } = useKeyBoardSensor();
    async function getScriptList() {
      setLoading(true);
      await userStore?.scriptStore?.getScriptList();
      setLoading(false);
    }

    useEffect(() => {
      getScriptList();
      tracert.click('a3112.b41896.c330989.d367623');
    }, []);

    const filteredUploadFiles = useMemo(() => {
      return uploadFiles.filter((file) => {
        return !searchVaue || file.name?.toUpperCase()?.includes(searchVaue?.toUpperCase());
      });
    }, [searchVaue, uploadFiles]);

    const filteredScripts = useMemo(() => {
      return userStore?.scriptStore?.scripts.filter((script) => {
        return !searchVaue || script.objectName?.toUpperCase()?.includes(searchVaue?.toUpperCase());
      });
    }, [searchVaue, userStore?.scriptStore?.scripts]);

    const onFileSelect = (script: IScriptMeta) => {
      // 单击任一脚本，选中单个
      if (!crtlorCommandPressed && !shiftPressed) {
        setActiveFileList([script.id]);
        setInterval([]);
        return;
      }
      if (!activeFileList?.length) {
        setActiveFileList([script.id]);
        setInterval([]);
        return;
      }
      // command/crtl > shift
      if (crtlorCommandPressed && shiftPressed) {
        selectByCrtlorCommand(script);
        return;
      }
      if (crtlorCommandPressed) {
        selectByCrtlorCommand(script);
        return;
      }
      if (shiftPressed) {
        selectByShiftPressed(script);
      }
    };

    const selectByShiftPressed = (script) => {
      const preScriptId = activeFileList?.[activeFileList?.length - 1];
      const preScriptIndex = filteredScripts.findIndex((item) => item.id === preScriptId);
      const targetScriptIndex = filteredScripts.findIndex((item) => item.id === script.id);
      let intervalTemp;
      let preActiveFileList = [...(activeFileList || [])];
      if (preScriptIndex < targetScriptIndex) {
        intervalTemp = filteredScripts
          ?.slice(preScriptIndex + 1, targetScriptIndex + 1)
          .map((item) => item.id);
      }
      if (preScriptIndex > targetScriptIndex) {
        intervalTemp = filteredScripts
          ?.slice(targetScriptIndex, preScriptIndex)
          .map((item) => item.id);
      }
      if (!!interval?.length) {
        preActiveFileList = preActiveFileList.filter((item) => {
          return !interval.includes(item);
        });
      }
      setInterval(intervalTemp);
      setActiveFileList(
        Array.from(new Set([...(intervalTemp || []), ...(preActiveFileList || [])])),
      );
      return;
    };

    const selectByCrtlorCommand = (script) => {
      if (activeFileList?.includes(script.id)) {
        // command + 单击已选中脚本：取消选择当前
        const newActiveFileList = activeFileList.filter((item) => item !== script.id);
        setInterval([]);
        setActiveFileList(newActiveFileList);
      } else {
        // command + 单击未选中脚本：选中多个
        setActiveFileList(Array.from(new Set([...(activeFileList || []), script.id])));
        setInterval([]);
      }
    };

    const contextMenuItems: MenuProps['items'] = useMemo(() => {
      if (!activeFileList?.length) return [];
      return [
        {
          label: '批量下载',
          key: 'bacthDownload',
          onClick: () => {
            batchDownloadScript(activeFileList);
          },
        },
      ];
    }, [activeFileList]);

    return (
      <div className={styles.script}>
        <div className={styles.search}>
          <Input.Search
            onSearch={(v) => setSearchVaue(v)}
            placeholder={formatMessage({
              id: 'odc.Script.ScriptFile.SearchScript',
              defaultMessage: '搜索脚本',
            })}
          />
        </div>
        <Dropdown menu={{ items: contextMenuItems }} trigger={['contextMenu']}>
          <div className={styles.list}>
            <Spin spinning={loading}>
              {filteredUploadFiles?.map((file) => {
                return (
                  <Item
                    key={file.uid + '-uodcfile'}
                    name={file.name}
                    uploading={file.status === 'uploading'}
                    errorMsg={
                      file?.response?.errMsg ||
                      formatMessage({
                        id: 'odc.component.OSSDragger2.FileListItem.UploadFailed',
                        defaultMessage: '上传失败',
                      })
                    }
                    removeUploadFile={() => {
                      setUploadFiles(uploadFiles.filter((file) => file !== file));
                    }}
                  />
                );
              })}
              {filteredScripts?.map((script) => {
                return (
                  <Item
                    key={script.id}
                    name={script.objectName}
                    script={script}
                    activeFile={activeFileList?.includes(script.id)}
                    onClick={() => onFileSelect(script)}
                    onDoubleClick={() => {
                      openSQLPageByScript(script.id, null);
                    }}
                    editFile={() => {
                      setEditingScriptId(script.id);
                    }}
                  />
                );
              })}
              {filteredScripts?.length === 0 &&
                filteredUploadFiles?.length === 0 &&
                (searchVaue ? (
                  <SQLConsoleEmpty />
                ) : (
                  <SQLConsoleEmpty type={SQLConsoleResourceType.Script} />
                ))}
            </Spin>
          </div>
        </Dropdown>
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
      </div>
    );
  }),
);
