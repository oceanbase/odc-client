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

import { IEditor } from '@/component/MonacoEditor';
import { SQLCodeEditorDDL } from '@/component/SQLCodeEditorDDL';
import Toolbar from '@/component/Toolbar';
import { IConStatus } from '@/component/Toolbar/statefulIcon';
import { ConnectionMode } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import { AlignLeftOutlined, CloudDownloadOutlined, SyncOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react';
import React, { useContext, useRef, useState } from 'react';
import TablePageContext from '../context';
import { getDataSourceModeConfig } from '@/common/datasource';

const ToolbarButton = Toolbar.Button;

interface IProps {}

const TableDDL: React.FC<IProps> = function ({}) {
  const [formated, setFormated] = useState(false);
  const editorRef = useRef<IEditor>();
  const { table, onRefresh, session } = useContext(TablePageContext);
  const handleFormat = () => {
    if (!formated) {
      editorRef.current?.doFormat();
    } else {
      editorRef.current?.setValue(table?.info.DDL || '');
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
            downloadPLDDL(
              table?.info?.tableName,
              'TABLE',
              table?.info?.DDL,
              session.database.dbName,
            );
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
          flex: 1,
          // height: `calc(100vh - ${48 + 34 + 39 + 50}px)`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <SQLCodeEditorDDL
          readOnly
          defaultValue={table?.info?.DDL}
          language={getDataSourceModeConfig(session?.connection?.type)?.sql?.language}
          onEditorCreated={(editor: IEditor) => {
            editorRef.current = editor;
          }}
        />
      </div>
    </div>
  );
};

export default observer(TableDDL);
