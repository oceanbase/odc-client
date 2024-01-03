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

import { EditorProps } from '@oceanbase-odc/ob-react-data-grid';
import { AutoComplete, Select } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';

import AntdEditorWrap from './AntdEditorWrap';

const Option = Select.Option;

interface IProps<T> extends EditorProps<T> {
  options: string[];
  multiple: boolean;
}

function AutoCompleteEditor<T>({ row, onRowChange, column, width, options }: IProps<T>) {
  const [open, setOpen] = useState(false);
  const { key } = column;
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
      let realValue = value;
      onRowChange({ ...row, [key]: realValue });
    },
    [onRowChange],
  );
  return (
    <AntdEditorWrap>
      <AutoComplete
        ref={editorRef}
        open={open}
        style={{ width: Math.max(width, 180) }}
        onFocus={() => {
          setTimeout(() => {
            setOpen(true);
          }, 150);
        }}
        onSelect={(v) => {
          onRowChange(
            {
              ...row,
              [key]: v,
            },
            true,
          );
        }}
        options={options
          ?.filter((v) => {
            if (!row[key]) {
              return true;
            }
            return v?.toLowerCase().indexOf(row[key].toLowerCase()) > -1;
          })
          .map((value) => {
            return {
              value,
            };
          })}
        onChange={innerOnChange}
        value={row[key]}
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
      />
    </AntdEditorWrap>
  );
}
export function WrapAutoCompleteEditor(options) {
  return (p) => {
    return <AutoCompleteEditor {...p} options={options} />;
  };
}
