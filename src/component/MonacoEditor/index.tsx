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

import React, { useEffect, useMemo, useRef, useState } from 'react';

import * as monaco from 'monaco-editor';

import odc from '@/plugins/odc';
import SessionStore from '@/store/sessionManager/session';
import { SettingStore } from '@/store/setting';
import editorUtils from '@/util/editor';
import { getUnWrapedSnippetBody } from '@/util/snippet';
import { inject, observer } from 'mobx-react';
import styles from './index.less';
import * as groovy from './plugins/languageSupport/groovy';
import { apply as markerPluginApply } from './plugins/marker';
import { getModelService } from './plugins/ob-language/service';
export interface IEditor extends monaco.editor.IStandaloneCodeEditor {
  doFormat: () => void;
  getSelectionContent: () => string;
}

export interface IProps {
  sessionStore?: SessionStore;
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

const MonacoEditor: React.FC<IProps> = function (props) {
  const {
    defaultValue,
    language,
    value,
    theme,
    readOnly,
    settingStore,
    sessionStore,
    onValueChange,
    onEditorCreated,
  } = props;
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

  const sessionRef = useRef<SessionStore>(sessionStore);

  const themeValue = useMemo(() => {
    if (!theme) {
      return settingTheme;
    }
    return theme;
  }, [theme, settingTheme]);

  useEffect(() => {
    sessionRef.current = sessionStore;
  }, [sessionStore]);

  useEffect(() => {
    if (typeof value === 'undefined' || value == innerValue) {
      return;
    }
    /**
     * value 与 innervalue 不匹配，需要更新到value，不过这个时候需要触发onchange，因为这是被动改动
     */
    editorRef.current && editorRef.current.setValue(value);
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

  async function initPlugin() {
    const module = await import('./plugins/ob-language/index');
    if (!editorRef.current?.getModel?.()) {
      return;
    }
    const plugin = module.register();

    groovy.registerGroovyLanguageForMonaco();
    plugin.setModelOptions(
      editorRef.current.getModel().id,
      getModelService(
        {
          modelId: editorRef.current.getModel().id,
          delimiter: sessionRef.current?.params?.delimiter,
        },
        () => sessionRef.current,
      ),
    );
    markerPluginApply(editorRef.current.getModel());
  }

  async function initEditor() {
    editorRef.current = monaco.editor.create(domRef.current, {
      value: innerValue,
      language: language || 'sql',
      theme: themeValue,
      minimap: { enabled: false },
      automaticLayout: true,
      unicodeHighlight: {
        invisibleCharacters: false,
        ambiguousCharacters: false,
      },
      readOnly: readOnly,
    });
    await initPlugin();
    if (!editorRef.current?.getModel?.()) {
      return;
    }
    monaco.editor.setModelLanguage(editorRef.current.getModel(), language || 'sql');
    editorRef.current.onDidChangeModelContent((e) => {
      /**
       * editor value change
       */
      const currentValue = editorRef.current.getValue();
      setInnerValue(currentValue);
    });
    domRef.current.addEventListener('paste', (e) => {
      const data = e.clipboardData.getData('text/html');
      const isODCSnippet = data.indexOf('!isODCSnippet_') > -1;
      if (isODCSnippet) {
        e.preventDefault();
      } else {
        return;
      }
      const text = getUnWrapedSnippetBody(data);
      editorUtils.insertSnippetTemplate(editorRef.current, text);
    });
    onEditorCreated?.(
      Object.assign(editorRef.current, {
        doFormat() {
          const selection = editorRef.current
            .getModel()
            .getValueInRange(editorRef.current.getSelection());
          if (!selection) {
            editorRef.current.trigger('editor', 'editor.action.formatDocument', null);
          } else {
            editorRef.current.trigger('editor', 'editor.action.formatSelection', null);
          }
        },
        getSelectionContent() {
          return editorRef.current.getModel().getValueInRange(editorRef.current.getSelection());
        },
      }),
    );
  }

  useEffect(() => {
    if (
      editorRef.current &&
      language &&
      language !== editorRef.current?.getModel().getLanguageId()
    ) {
      monaco.editor.setModelLanguage(editorRef.current?.getModel(), language || 'sql');
    }
  }, [language]);

  useEffect(() => {
    if (domRef.current && !editorRef.current) {
      window.MonacoEnvironment = {
        getWorkerUrl(workerId: string, label: string) {
          if (!odc.appConfig.worker.needOrigin) {
            return `data:text/javascript;charset=utf-8,${encodeURIComponent(
              `importScripts('${window.publicPath}editor.worker.js')`,
            )}`;
          } else {
            const url = new URL(`${window.publicPath}editor.worker.js`, location.origin);
            return `data:text/javascript;charset=utf-8,${encodeURIComponent(
              `importScripts('${url.href}')`,
            )}`;
          }
        },
      };
      initEditor();
    }
  }, [domRef.current, initEditor]);

  useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <div ref={domRef} className={styles.editor}></div>
    </div>
  );
};

export default inject('settingStore')(observer(MonacoEditor));
