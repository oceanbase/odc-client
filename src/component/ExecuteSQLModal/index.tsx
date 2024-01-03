/*
 * Copyright 2024 OceanBase
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
import React, { useCallback, useEffect, useRef, useState } from 'react';
// compatible
import { getDataSourceModeConfigByConnectionMode } from '@/common/datasource';
import { EStatus } from '@/d.ts';
import LintResultTable from '@/page/Workspace/components/SQLResultSet/LintResultTable';
import modal from '@/store/modal';
import SessionStore from '@/store/sessionManager/session';
import { useUpdate } from 'ahooks';
import { Alert, Button, message, Modal } from 'antd';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import MonacoEditor from '../MonacoEditor';
import { ISQLLintReuslt } from '../SQLLintResult/type';
import styles from './index.less';

interface IProps {
  sessionStore: SessionStore;
  sql: string;
  tip?: string;
  theme?: 'dark' | 'white';
  onSave: (sql?: string) => Promise<boolean | void>;
  visible: boolean;
  onCancel: () => void;
  readonly?: boolean;
  onChange?: (sql: string) => void;
  status?: EStatus;
  lintResultSet?: ISQLLintReuslt[];
  callback?: () => void;
}
const ExecuteSQLModal: React.FC<IProps> = (props) => {
  const {
    tip,
    theme,
    sql,
    visible,
    readonly,
    sessionStore,
    onCancel,
    onSave,
    callback,
    status,
    lintResultSet,
  } = props;
  const [loading, setLoading] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const update = useUpdate();
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  const connectionMode = sessionStore?.connection?.dialectType;
  const config = getDataSourceModeConfigByConnectionMode(connectionMode);

  useEffect(() => {
    if (sql !== editorRef?.current?.getValue()) {
      editorRef.current?.setValue(sql);
    }
  }, [sql, editorRef.current]);

  const handleSubmit = useCallback(async () => {
    const updateSQL = editorRef.current?.getValue();
    if (!updateSQL) {
      return;
    }
    // 没有传入status参数的按之前的逻辑处理
    if (!status || status === EStatus.SUBMIT) {
      setLoading(true);
      try {
        await onSave(updateSQL);
      } catch (e) {
      } finally {
        setLoading(false);
        return;
      }
    } else {
      modal.changeCreateAsyncTaskModal(true, {
        sql: updateSQL,
        databaseId: sessionStore?.odcDatabase?.id,
        rules: lintResultSet,
      });
      onCancel?.();
      // 打开新建数据库抽屉后执行回调完成交互，例如 取消表格编辑状态、关闭当前页
      callback?.();
    }
  }, [onSave, callback]);

  const handleFormat = () => {
    setIsFormatting(true);
    setTimeout(() => {
      // editorRef.current.doFormat();
      setTimeout(() => {
        setIsFormatting(false);
      }, 100);
    }, 200);
  };

  const handleSQLChanged = (sql: string) => {
    props?.onChange?.(sql);
  };

  return (
    <>
      <Modal
        zIndex={1002}
        width={840}
        destroyOnClose={true}
        title={formatMessage({
          id: 'workspace.window.session.modal.sql.title',
        })}
        open={visible}
        onOk={handleSubmit}
        onCancel={onCancel}
        footer={[
          <Button key="format" onClick={handleFormat}>
            {
              formatMessage({
                id: 'odc.component.ExecuteSQLModal.Format',
              })
              /*格式化*/
            }
          </Button>,
          <CopyToClipboard
            key="copy"
            text={sql}
            onCopy={() => {
              message.success(
                formatMessage({
                  id: 'workspace.window.session.modal.sql.copied',
                }),
              );
            }}
          >
            <Button>{formatMessage({ id: 'app.button.copy' })}</Button>
          </CopyToClipboard>,
          <Button key="back" onClick={onCancel}>
            {formatMessage({ id: 'app.button.cancel' })}
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={status === EStatus.DISABLED}
          >
            {formatMessage({ id: 'app.button.execute' })}
          </Button>,
        ].filter(Boolean)}
        className={styles.executeSqlModal}
      >
        {tip && <Alert message={tip} type="info" showIcon={true} style={{ marginBottom: 4 }} />}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: lintResultSet?.length > 0 ? '16px' : '0px',
          }}
        >
          <div
            style={{
              height: lintResultSet?.length > 0 ? 240 : 420,
              width: '100%',
              padding: 4,
              border: '1px solid var(--odc-border-color)',
              borderRadius: 4,
              position: 'relative',
            }}
          >
            <MonacoEditor
              theme={theme}
              sessionStore={sessionStore}
              readOnly={readonly && !isFormatting}
              defaultValue={sql}
              language={config?.sql?.language}
              onValueChange={handleSQLChanged}
              onEditorCreated={(editor) => {
                editorRef.current = editor;
                update();
              }}
            />
          </div>
          {lintResultSet?.length > 0 && (
            <LintResultTable
              resultHeight={166}
              ctx={editorRef.current}
              lintResultSet={lintResultSet}
              hasExtraOpt={false}
              pageSize={5}
            />
          )}
        </div>
      </Modal>
    </>
  );
};

export default ExecuteSQLModal;
