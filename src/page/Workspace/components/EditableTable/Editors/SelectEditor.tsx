import { EditorProps } from '@alipay/ob-react-data-grid';
import { Select } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';

import { isString } from 'lodash';
import AntdEditorWrap from './AntdEditorWrap';

const Option = Select.Option;

interface IProps<T> extends EditorProps<T> {
  options: (string | { text: string; value: string })[];
  multiple: boolean;
  loading?: boolean;
}

export function SelectEditor<T>({
  row,
  onRowChange,
  column,
  width,
  options,
  multiple,
  loading,
}: IProps<T>) {
  const [open, setOpen] = useState(false);
  const { key } = column;
  let realValue = row[key];
  if (multiple && isString(realValue)) {
    realValue = realValue?.split(',');
  }
  const editorRef = useRef<any>(null);
  useEffect(() => {
    if (editorRef.current) {
      setTimeout(() => {
        editorRef.current?.focus();
      }, 100);
    }
  }, [editorRef]);
  const innerOnChange = useCallback(
    (value: string | string[]) => {
      console.log('onchange event');
      let realValue = value;
      // if (isArray(value)) {
      //     realValue = value.join(',')
      // }
      onRowChange({ ...row, [key]: realValue }, !multiple);
    },
    [onRowChange],
  );
  return (
    <AntdEditorWrap>
      <Select
        ref={editorRef}
        open={open}
        showSearch
        loading={loading}
        onFocus={() => {
          setTimeout(() => {
            setOpen(true);
          }, 150);
        }}
        mode={multiple ? 'multiple' : undefined}
        bordered={false}
        listHeight={170}
        style={{ width: Math.max(width, 180) }}
        value={realValue}
        onChange={innerOnChange}
        optionFilterProp="children"
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Tab') {
            onRowChange(row, true);
            e.preventDefault();
          }
        }}
        getPopupContainer={(node) => {
          return node;
        }}
      >
        {options?.map((value) => {
          if (typeof value === 'string') {
            return (
              <Option key={value} value={value}>
                {value}
              </Option>
            );
          }
          return (
            <Option key={value.value} value={value.value}>
              {value.text}
            </Option>
          );
        })}
      </Select>
    </AntdEditorWrap>
  );
}
export function WrapSelectEditor(options, multiple: boolean = true) {
  return (p) => {
    return <SelectEditor {...p} options={options} multiple={multiple} />;
  };
}
