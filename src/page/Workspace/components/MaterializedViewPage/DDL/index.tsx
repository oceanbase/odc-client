import React, { useContext, useEffect, useRef, useState } from 'react';
import MaterializedViewPageContext from '../context';
import { SQLCodePreviewer } from '@/component/SQLCodePreviewer';
import { IEditor } from '@/component/MonacoEditor';
import { getDataSourceModeConfig } from '@/common/datasource';
import Toolbar from '@/component/Toolbar';
import { IConStatus } from '@/component/Toolbar/statefulIcon';
import { AlignLeftOutlined, CloudDownloadOutlined, SyncOutlined } from '@ant-design/icons';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';

const ToolbarButton = Toolbar.Button;

interface IProps {}
const MvViewDDL: React.FC<IProps> = () => {
  const { materializedView, session, onRefresh } = useContext(MaterializedViewPageContext);
  const editorRef = useRef<IEditor>();
  const [formated, setFormated] = useState(true);
  const handleFormat = () => {
    if (!formated) {
      editorRef.current?.doFormat();
    } else {
      editorRef.current?.setValue(materializedView?.info?.ddl || '');
    }
    setFormated(!formated);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar style={{ flexShrink: 0, flexGrow: 0 }}>
        <ToolbarButton
          text={
            formated
              ? formatMessage({
                  id: 'odc.components.TablePage.Unformat',
                  defaultMessage: '取消格式化',
                }) // 取消格式化
              : formatMessage({
                  id: 'odc.components.TablePage.Formatting',
                  defaultMessage: '格式化',
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
              defaultMessage: '下载',
            }) //下载
          }
          icon={<CloudDownloadOutlined />}
          onClick={() => {
            downloadPLDDL(
              materializedView?.info?.name,
              'MATERIALIZED_VIEW',
              materializedView?.info?.ddl,
              session.database.dbName,
            );
          }}
        />
        <Toolbar.Button
          icon={<SyncOutlined />}
          text={formatMessage({
            id: 'odc.components.ShowTableBaseInfoForm.Refresh',
            defaultMessage: '刷新',
          })}
          /* 刷新 */ onClick={onRefresh}
        />
      </Toolbar>
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <SQLCodePreviewer
          readOnly
          defaultValue={materializedView?.info?.ddl}
          language={getDataSourceModeConfig(session?.connection?.type)?.sql?.language}
          onEditorCreated={(editor: IEditor) => {
            editorRef.current = editor;
            editorRef.current?.doFormat();
          }}
        />
      </div>
    </div>
  );
};

export default MvViewDDL;
