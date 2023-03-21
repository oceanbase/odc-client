import { formatMessage } from '@/util/intl';
import type { EditorProps } from '@alipay/ob-react-data-grid';
import { EditOutlined } from '@ant-design/icons';
import { Input, Modal } from 'antd';
import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { TextAreaRef } from 'antd/lib/input/TextArea';
import AntdEditorWrap from './AntdEditorWrap';

export function TextEditor<T>({ row, onRowChange, column, left, top, width }: EditorProps<T>) {
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
        <Input.TextArea
          ref={editorRef}
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
          visible={true}
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
          <Input.TextArea
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
