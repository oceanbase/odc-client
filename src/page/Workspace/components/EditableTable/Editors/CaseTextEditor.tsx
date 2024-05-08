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
import { EditOutlined } from '@ant-design/icons';
import type { EditorProps } from '@oceanbase-odc/ob-react-data-grid';
import { Modal } from 'antd';
import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CaseTextArea } from '@/component/Input/Case';
import type { TextAreaRef } from 'antd/lib/input/TextArea';
import AntdEditorWrap from './AntdEditorWrap';

interface CaseOptions {
  caseSensitive: boolean;
  escapes: string;
}

export function CaseTextEditor<T>({
  row,
  onRowChange,
  column,
  width,
  caseSensitive,
  escapes,
}: EditorProps<T> & CaseOptions) {
  const { key, name } = column;
  const value = row[key];
  const editorRef = useRef<TextAreaRef>(null);
  const [modalTextValue, setModalTextValue] = useState(null);
  const [isShowTextModal, setIsShowTextModal] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      setTimeout(() => {
        editorRef.current?.focus();
        editorRef.current?.resizableTextArea.textArea.setSelectionRange(
          Number.MAX_SAFE_INTEGER,
          Number.MAX_SAFE_INTEGER,
        );
      }, 100);
    }
  }, [editorRef]);

  const innerOnChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onRowChange({ ...row, [key]: e.target.value });
    },
    [onRowChange],
  );

  return (
    <AntdEditorWrap>
      <div>
        <CaseTextArea
          ref={editorRef}
          caseSensitive={caseSensitive}
          escapes={escapes}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              onRowChange(row, true);
              e.preventDefault();
            }
          }}
          style={{ width: Math.max(width, 200), height: 68 }}
          value={value}
          onChange={innerOnChange}
          autoSize={false}
        />

        <a>
          <EditOutlined
            onClick={() => {
              setModalTextValue(value);
              setIsShowTextModal(true);
            }}
            style={{ position: 'absolute', bottom: 10, right: 18 }}
          />
        </a>
      </div>
      {isShowTextModal ? (
        <Modal
          open={true}
          title={name}
          zIndex={1031}
          okText={formatMessage({
            id: 'odc.EditableTable.Editors.TextEditor.Submitted',
          })} /* 提交 */
          onCancel={() => {
            setIsShowTextModal(false);
            setModalTextValue(null);
          }}
          onOk={() => {
            onRowChange({ ...row, [key]: modalTextValue }, true);
          }}
        >
          <CaseTextArea
            caseSensitive={caseSensitive}
            escapes={escapes}
            autoSize={{ minRows: 15, maxRows: 15 }}
            value={modalTextValue}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
              }
            }}
            onChange={(e) => {
              setModalTextValue(e.target.value);
            }}
          />
        </Modal>
      ) : null}
    </AntdEditorWrap>
  );
}
