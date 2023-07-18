import ScriptEditorModal from '@/page/Workspace/components/ScriptManageModal/ScriptEditorModal';
import { openSQLPageByScript } from '@/store/helper/page';
import { UserStore } from '@/store/login';
import { formatMessage } from '@/util/intl';
import { Input, Spin } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import { inject, observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import styles from './index.less';
import Item from './Item';

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
    const scriptEditorVisible = !!editingScriptId;

    async function getScriptList() {
      setLoading(true);
      await userStore?.scriptStore?.getScriptList();
      setLoading(false);
    }

    useEffect(() => {
      getScriptList();
    }, []);

    return (
      <div className={styles.script}>
        <div className={styles.search}>
          <Input.Search onSearch={(v) => setSearchVaue(v)} placeholder="搜索脚本" size="small" />
        </div>
        <div className={styles.list}>
          <Spin spinning={loading}>
            {uploadFiles
              ?.map((file) => {
                if (searchVaue && !file.name?.toUpperCase()?.includes(searchVaue?.toUpperCase())) {
                  return null;
                }
                return (
                  <Item
                    key={file.uid + '-uodcfile'}
                    name={file.name}
                    uploading={file.status === 'uploading'}
                    errorMsg={
                      file?.response?.errMsg ||
                      formatMessage({
                        id: 'odc.component.OSSDragger2.FileListItem.UploadFailed',
                      })
                    }
                    removeUploadFile={() => {
                      setUploadFiles(uploadFiles.filter((file) => file !== file));
                    }}
                  />
                );
              })
              .filter(Boolean)}
            {userStore?.scriptStore?.scripts
              ?.map((script) => {
                if (
                  searchVaue &&
                  !script.objectName?.toUpperCase()?.includes(searchVaue?.toUpperCase())
                ) {
                  return null;
                }
                return (
                  <Item
                    key={script.id}
                    name={script.objectName}
                    script={script}
                    onClick={() => {
                      openSQLPageByScript(script.id, null);
                    }}
                    editFile={() => {
                      setEditingScriptId(script.id);
                    }}
                  />
                );
              })
              .filter(Boolean)}
          </Spin>
        </div>
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
