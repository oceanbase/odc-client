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

/**
 * 编辑器（只读）的场景下，也可以具备编辑的能力（格式化）
 * 说明：当前odc编辑器在（只读）模式下，不具备可编辑的原生能力（格式化）
 * 场景：仅需要查看格式化后的 SQL，不需要具备编辑能力的场景
 */
import React from 'react';
import MonacoEditor, { IEditor, IProps } from '../MonacoEditor';

export class SQLCodePreviewer extends React.PureComponent<IProps> {
  render() {
    return (
      <>
        <MonacoEditor
          {...this.props}
          onEditorCreated={(editor: IEditor) => {
            const newEditor = Object.create(editor);
            this.props.onEditorCreated?.(
              Object.assign(newEditor, {
                doFormat() {
                  import('@oceanbase-odc/ob-parser-js').then((module) => {
                    const doc = new module.SQLDocument({
                      text: editor.getValue(),
                    });
                    editor.setValue(doc.getFormatText());
                  });
                },
              }),
            );
          }}
        />
      </>
    );
  }
}
