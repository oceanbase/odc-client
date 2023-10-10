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
import { FormattedMessage } from '@umijs/max';
// compatible
import { runSQLLint } from '@/common/network/sql';
import { ConnectionMode } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
import { useUpdate } from 'ahooks';
import { Alert, Button, message, Modal } from 'antd';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import MonacoEditor from '../MonacoEditor';
import LintDrawer from '../SQLLintResult/Drawer';

interface IProps {
  sessionStore: SessionStore;
  sql: string;
  tip?: string;
  onSave: (sql?: string) => Promise<boolean | void>;
  visible: boolean;
  onCancel: () => void;
  readonly?: boolean;
  onChange?: (sql: string) => void;
}

const ExecuteSQLModal: React.FC<IProps> = (props) => {
  const { tip, sql, visible, readonly, sessionStore, onCancel, onSave } = props;
  const [loading, setLoading] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [lintVisible, setLintVisible] = useState(false);
  const [lintResult, setLintResult] = useState(null);
  const update = useUpdate();
  const editorRef = useRef<editor.IStandaloneCodeEditor>();

  const connectionMode = sessionStore?.connection?.dialectType;
  const isMySQL = connectionMode === ConnectionMode.MYSQL;

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
    setLoading(true);
    try {
      await onSave(updateSQL);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, [onSave]);

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

  const handleLint = async () => {
    const value = editorRef?.current?.getValue();
    if (!value) {
      return;
    }
    const lint = await runSQLLint(sessionStore?.sessionId, ';', value);
    if (lint) {
      if (!lint.length) {
        message.success(
          formatMessage({ id: 'odc.component.ExecuteSQLModal.SqlCheckPassed' }), //SQL 检查通过
        );
        return;
      }
      setLintVisible(true);
      setLintResult(lint);
    }
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
          <Button key="lint" onClick={handleLint}>
            {
              formatMessage({
                id: 'odc.component.ExecuteSQLModal.SqlCheck',
              }) /*SQL 检查*/
            }
          </Button>,
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
            <Button>
              <FormattedMessage id="app.button.copy" />
            </Button>
          </CopyToClipboard>,
          <Button key="back" onClick={onCancel}>
            <FormattedMessage id="app.button.cancel" />
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
            <FormattedMessage id="app.button.execute" />
          </Button>,
        ]}
      >
        {tip && <Alert message={tip} type="info" showIcon={true} style={{ marginBottom: 4 }} />}
        <div
          style={{
            height: 400,
            width: '100%',
            padding: 4,
            border: '1px solid var(--odc-border-color)',
            borderRadius: 4,
            position: 'relative',
          }}
        >
          <MonacoEditor
            sessionStore={sessionStore}
            readOnly={readonly && !isFormatting}
            defaultValue={sql}
            language={isMySQL ? 'obmysql' : 'oboracle'}
            onValueChange={handleSQLChanged}
            onEditorCreated={(editor) => {
              editorRef.current = editor;
              update();
            }}
          />
        </div>
      </Modal>
      <LintDrawer visible={lintVisible} closePage={() => setLintVisible(false)} data={lintResult} />
    </>
  );
};

export default ExecuteSQLModal;
