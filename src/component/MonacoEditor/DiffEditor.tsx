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

import * as monaco from 'monaco-editor';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import styles from './index.less';
import { SettingStore } from '@/store/setting';
import { inject, observer } from 'mobx-react';
import classNames from 'classnames';
import { getFontSize } from './config';

export interface IDiffEditor {
  settingStore?: SettingStore;
  language?: string;
  source: string;
  modifie: string;
  defaultSplit?: boolean;
  theme?: string;
}
export interface IDiffEditorInstance {
  /** @description 切换显示模式，默认为split模式 */
  switchSplit: (v: boolean) => void;
}
const DiffEditor = inject('settingStore')(
  observer(
    forwardRef((props: IDiffEditor, ref: React.Ref<IDiffEditorInstance>) => {
      const {
        settingStore,
        source = null,
        modifie = null,
        language = 'sql',
        defaultSplit = true,
        theme,
      } = props;
      const domRef = useRef<HTMLDivElement | null>(null);
      const editorRef = useRef<monaco.editor.IStandaloneDiffEditor>();
      const settingTheme =
        settingStore.theme.editorTheme?.[settingStore.configurations['odc.editor.style.theme']];
      const [split, setSplit] = useState<boolean>(defaultSplit);
      useImperativeHandle(ref, () => ({
        switchSplit: (v: boolean) => {
          setSplit(v);
        },
      }));
      const themeValue = useMemo(() => {
        if (!theme) {
          return settingTheme;
        }
        return theme;
      }, [theme, settingTheme]);

      useEffect(() => {
        const fontSize = settingStore.configurations['odc.editor.style.fontSize'];
        if (fontSize && editorRef.current) {
          editorRef.current.updateOptions({
            fontSize: getFontSize(fontSize),
          });
        }
      }, [settingStore.configurations?.['odc.editor.style.fontSize']]);

      const initEditor = async () => {
        const originalModel = monaco.editor.createModel(source, language);
        const modifiedModel = monaco.editor.createModel(modifie, language);
        editorRef.current = monaco.editor.createDiffEditor(domRef.current, {
          theme: themeValue,
          minimap: { enabled: false },
          renderOverviewRuler: false,
          automaticLayout: true,
          unicodeHighlight: {
            invisibleCharacters: false,
            ambiguousCharacters: false,
          },
          lineNumbersMinChars: 4,
          lineNumbers: 'on',
          readOnly: true,
          renderSideBySide: true,
          originalEditable: false,
        });
        editorRef.current?.setModel({
          original: originalModel,
          modified: modifiedModel,
        });
      };
      useEffect(() => {
        if (editorRef.current) {
          editorRef.current.updateOptions({
            renderSideBySide: split,
          });
        } else {
          initEditor();
        }
        return () => {
          if (editorRef.current) {
            editorRef.current?.dispose();
          }
        };
      }, [split]);

      return (
        <div className={styles.container}>
          <div ref={domRef} className={styles.editor}></div>
        </div>
      );
    }),
  ),
);
export default DiffEditor;
