import { IEditor } from '@/component/MonacoEditor';
import { SQLCodeEditorDDL } from '@/component/SQLCodeEditorDDL';
import Toolbar from '@/component/Toolbar';
import { IConStatus } from '@/component/Toolbar/statefulIcon';
import { ConnectionMode } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import { AlignLeftOutlined, CloudDownloadOutlined, SyncOutlined } from '@ant-design/icons';
import { inject, observer } from 'mobx-react';
import React, { useContext, useRef, useState } from 'react';
import TablePageContext from '../context';

const ToolbarButton = Toolbar.Button;

interface IProps {
  connectionStore?: ConnectionStore;
}

const TableDDL: React.FC<IProps> = function ({ connectionStore }) {
  const [formated, setFormated] = useState(false);
  const editorRef = useRef<IEditor>();
  const { table, onRefresh } = useContext(TablePageContext);
  const isMySQL = connectionStore.connection?.dialectType === ConnectionMode.OB_MYSQL;
  const handleFormat = () => {
    if (!formated) {
      editorRef.current?.doFormat();
    } else {
      editorRef.current?.setValue(table?.info.DDL || '');
    }
    setFormated(!formated);
  };
  return (
    <>
      <Toolbar>
        <ToolbarButton
          text={
            formated
              ? formatMessage({
                  id: 'odc.components.TablePage.Unformat',
                }) // 取消格式化
              : formatMessage({
                  id: 'odc.components.TablePage.Formatting',
                }) // 格式化
          }
          icon={<AlignLeftOutlined />}
          onClick={handleFormat}
          status={formated ? IConStatus.ACTIVE : IConStatus.INIT}
        />
        <ToolbarButton
          text={
            formatMessage({
              id: 'odc.components.ViewPage.Download',
            }) //下载
          }
          icon={<CloudDownloadOutlined />}
          onClick={() => {
            downloadPLDDL(table?.info?.tableName, 'TABLE', table?.info?.DDL);
          }}
        />
        <Toolbar.Button
          icon={<SyncOutlined />}
          text={formatMessage({
            id: 'odc.components.ShowTableBaseInfoForm.Refresh',
          })}
          /* 刷新 */ onClick={onRefresh}
        />
      </Toolbar>
      <div
        style={{
          height: `calc(100vh - ${48 + 34 + 39 + 50}px)`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <SQLCodeEditorDDL
          readOnly
          defaultValue={table?.info?.DDL}
          language={isMySQL ? 'obmysql' : 'oboracle'}
          onEditorCreated={(editor: IEditor) => {
            editorRef.current = editor;
          }}
        />
      </div>
    </>
  );
};

export default inject('connectionStore')(observer(TableDDL));
