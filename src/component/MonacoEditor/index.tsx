import React, { useEffect, useMemo, useRef, useState } from 'react';

import * as monaco from 'monaco-editor';

import { SettingStore } from '@/store/setting';
import editorUtils from '@/util/editor';
import { getUnWrapedSnippetBody } from '@/util/snippet';
import { inject, observer } from 'mobx-react';
import styles from './index.less';

export interface IEditor extends monaco.editor.IStandaloneCodeEditor {
  doFormat: () => void;
  getSelectionContent: () => string;
}

export interface IProps {
  settingStore?: SettingStore;
  /**
   * 默认值
   */
  defaultValue?: string;
  /**
   *  双向绑定value
   */
  value?: string;
  /**
   * value 改变事件
   */
  onValueChange?: (v: string) => void;

  language?: string;

  theme?: string;

  readOnly?: boolean;

  onEditorCreated?: (editor: IEditor) => void;
}

const MonacoEditor: React.FC<IProps> = function ({
  defaultValue,
  language,
  value,
  theme,
  readOnly,
  settingStore,
  onValueChange,
  onEditorCreated,
}) {
  const [innerValue, _setInnerValue] = useState<string>(defaultValue);
  const settingTheme = settingStore.theme.editorTheme;
  function setInnerValue(v: string) {
    if (readOnly) {
      return;
    }
    _setInnerValue(v);
    if (onValueChange) {
      onValueChange(v);
    }
  }

  const domRef = useRef<HTMLDivElement>(null);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  const themeValue = useMemo(() => {
    if (!theme) {
      return settingTheme;
    }
    return theme;
  }, [theme, settingTheme]);

  useEffect(() => {
    if (typeof value === 'undefined' || value == innerValue) {
      return;
    }
    /**
     * value 与 innervalue 不匹配，需要更新到value，不过这个时候需要触发onchange，因为这是被动改动
     */
    editorRef.current.setValue(value);
    _setInnerValue(value);
  }, [value]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        readOnly,
        theme: themeValue,
      });
    }
  }, [readOnly, themeValue]);

  useEffect(() => {
    if (domRef.current && !editorRef.current) {
      editorRef.current = monaco.editor.create(domRef.current, {
        value: innerValue,
        language: language || 'sql',
        theme: themeValue,
        minimap: { enabled: false },
        readOnly: readOnly,
      });
      editorRef.current.onDidChangeModelContent((e) => {
        /**
         * editor value change
         */
        const currentValue = editorRef.current.getValue();
        setInnerValue(currentValue);
      });
      domRef.current.addEventListener('paste', (e) => {
        console.log(e.clipboardData.getData('text/html'));
        console.log(e.clipboardData.getData('text/plain'));
        const data = e.clipboardData.getData('text/html');
        const isODCSnippet = data.indexOf('!isODCSnippet_') > -1;
        if (isODCSnippet) {
          e.preventDefault();
        }
        const text = getUnWrapedSnippetBody(data);
        editorUtils.insertSnippetTemplate(editorRef.current, text);
      });
      import('./plugin').then((module) => module.register());
      onEditorCreated?.(
        Object.assign(editorRef.current, {
          doFormat() {},
          getSelectionContent() {
            return editorRef.current.getModel().getValueInRange(editorRef.current.getSelection());
          },
        }),
      );
    }
  }, [domRef.current]);

  return (
    <div className={styles.container}>
      <div ref={domRef} className={styles.editor}></div>
    </div>
  );
};

export default inject('settingStore')(observer(MonacoEditor));
