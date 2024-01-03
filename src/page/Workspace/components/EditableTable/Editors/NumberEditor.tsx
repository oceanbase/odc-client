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
