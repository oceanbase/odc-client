import { EditorProps } from '@alipay/ob-react-data-grid';
import { InputRef } from 'antd';
import { useCallback, useEffect, useRef } from 'react';

import InputBigNumber from '@/component/InputBigNumber';
import AntdEditorWrap from './AntdEditorWrap';

export function InputNumberEditor<T>({ row, onRowChange, column, width }: EditorProps<T>) {
  const { key } = column;
  const value = row[key];
  const editorRef = useRef<InputRef>(null);
  useEffect(() => {
    if (editorRef.current) {
      setTimeout(() => {
        editorRef.current?.focus();
        editorRef.current?.setSelectionRange(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
      }, 100);
    }
  }, [editorRef]);
  const innerOnChange = useCallback(
    (value: string) => {
      onRowChange({ ...row, [key]: value });
    },
    [onRowChange],
  );
  return (
    <AntdEditorWrap>
      <InputBigNumber
        inputRef={editorRef}
        onKeyDown={(e) => {
          if (e.key === 'Tab') {
            onRowChange(row, true);
            e.preventDefault();
          }
        }}
        bordered={false}
        style={{ width }}
        value={value}
        onChange={innerOnChange}
      />
    </AntdEditorWrap>
  );
}
