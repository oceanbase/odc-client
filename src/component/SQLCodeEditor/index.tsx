import { formatMessage } from '@/util/intl';

import '@alipay/ob-editor-react/lib/style'; // 引入样式

import appConfig from '@/constant/appConfig';
import { SchemaStore } from '@/store/schema';
import { SettingStore } from '@/store/setting';
import type { SnippetStore } from '@/store/snippet';
import editorUltis from '@/util/editor';
import { REG_SNIPPET } from '@/util/snippet';
import type { IEditor, IEditorFactory, SQL_OBJECT_TYPE } from '@alipay/ob-editor';
import type { IEditorOptions } from '@alipay/ob-editor/esm/Editor';
import { isEqual } from 'lodash';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { getFontFamily } from './helper';
import SQLService from './service';

const CodeEditor = React.lazy(() => {
  return import('@alipay/ob-editor-react');
});

function getWorker(file: string) {
  if (!appConfig.worker.needOrigin) {
    return `data:text/javascript;charset=utf-8,${encodeURIComponent(
      `importScripts('${window.publicPath}workers/${MONACO_VERSION}/${file}')`,
    )}`;
  } else {
    const url = new URL(`${window.publicPath}workers/${MONACO_VERSION}/${file}`, location.origin);
    return `data:text/javascript;charset=utf-8,${encodeURIComponent(
      `importScripts('${url.href}')`,
    )}`;
  }
}

const sqlServiceCache = {};

export interface ISQLCodeEditorProps {
  disableAutoUpdateInitialValue?: boolean;
  readOnly?: boolean;
  language: string;
  enableSnippet?: boolean;
  snippetStore?: SnippetStore;
  settingStore?: SettingStore;
  schemaStore?: SchemaStore;
  initialValue: string;
  delimiter?: string;
  disableSnippetConvert?: boolean;
  onValueChange?: (sql: string) => void;
  onEditorCreated?: (editor: IEditor) => void;
  editorOptions?: IEditorOptions;
  onOpenObjDetail?: (obj: { objType: SQL_OBJECT_TYPE; name: string }) => void;
}

@inject((stores: any) => ({
  delimiter: stores.connectionStore.delimiter,
  snippetStore: stores.snippetStore,
  schemaStore: stores.schemaStore,
  settingStore: stores.settingStore,
}))
@observer
export class SQLCodeEditor extends React.Component<ISQLCodeEditorProps> {
  public editor: IEditor | null = null;
  private sqlService: SQLService;

  updateServiceConfig = () => {
    this.sqlService.setConfig({
      delimiter: this.props.delimiter,
      isSingle: this.props.language.endsWith('pl'),
    });
  };
  componentDidUpdate(prevProps: ISQLCodeEditorProps) {
    if (!isEqual([prevProps.delimiter], [this.props.delimiter])) {
      this.updateServiceConfig();
    }
  }

  public factory: null;

  // SQL 方言 Web Worker 插件：
  // 1. 如果是云上版本需要请求 CDN
  // 2. 私有云版本请求本地文件

  private readonly sqlWorkers: Record<string, string> = {
    editor: getWorker('editor.worker.min.js'),
    'sql-oceanbase-mysql': getWorker('sql-oceanbase-mysql.worker.min.js'),
    'sql-oceanbase-oracle': getWorker('sql-oceanbase-oracle.worker.min.js'),
    'sql-oceanbase-mysql-pl': getWorker('sql-oceanbase-mysql-pl.worker.min.js'),
    'sql-oceanbase-oracle-pl': getWorker('sql-oceanbase-oracle-pl.worker.min.js'),
  };

  public render() {
    const {
      disableAutoUpdateInitialValue,
      language,
      initialValue,
      readOnly,
      editorOptions,
      settingStore,
    } = this.props;
    return (
      <React.Suspense fallback={'loading...'}>
        <CodeEditor
          language={language}
          initialValue={initialValue}
          onFactoryCreated={this.onFactoryCreated}
          onEditorCreated={this.onEditorCreated}
          onValueChange={this.onValueChange}
          theme={editorOptions?.theme || settingStore.theme?.editorTheme}
          editorOptions={{
            lineNumbers: 'on',
            selectOnLineNumbers: false,
            renderLineHighlight: 'none',
            folding: true,
            fontFamily: getFontFamily(),
            contextmenu: !!this.props.onOpenObjDetail,
            fixedOverflowWidgets: true,
            ...(editorOptions || {}),
          }}
          factory={{
            options: {
              disableTracker: true,
              worker: this.sqlWorkers,
            },
          }}
          disableAutoUpdateInitialValue={disableAutoUpdateInitialValue}
          readOnly={readOnly}
        />
      </React.Suspense>
    );
  }

  private onFactoryCreated = async (factory: IEditorFactory) => {
    const { language, enableSnippet, snippetStore } = this.props;
    // SQLPlugin 这里使用 dynamic import 来加载
    const sqlPlugins = await Promise.all([
      import('@alipay/ob-language-sql-oceanbase-mysql'),
      import('@alipay/ob-language-sql-oceanbase-mysql-pl'),
      import('@alipay/ob-language-sql-oceanbase-oracle'),
      import('@alipay/ob-language-sql-oceanbase-oracle-pl'),
    ]);

    sqlPlugins.forEach((plugin) => {
      factory.registerSQLModePlugin(plugin.default);
    });
    let cacheService = sqlServiceCache[this.props.language];
    if (!cacheService) {
      cacheService = sqlServiceCache[this.props.language] = new SQLService();
    }
    this.sqlService = cacheService;
    this.updateServiceConfig();
    // 配置 SQL Plugin 的 WebWorker url，见[常见问题-SQL 插件如 ob-language-sql-odps 怎样配置 web worker URL]()
    factory.registerSQLWorkerUrls(this.sqlWorkers);
    factory.getSQLMode(this.props.language).registerSQLService(this.sqlService); // 注册ISQLServiced对象
    /**
     * 初始化 snippets
     */
    if (enableSnippet) {
      snippetStore.registerEditor({ factory, language });
      await snippetStore.resetSnippets();
    }
  };
  private onEditorCreated = (editor: IEditor) => {
    this.editor = editor;
    this.props.schemaStore.queryTablesAndViews('', true);
    setTimeout(() => {
      try {
        /**
         * 去除右键的样式以及显示字体
         */
        const textMap = {
          'editor.action.clipboardCutAction': formatMessage({
            id: 'odc.component.SQLCodeEditor.Shear',
          }),
          // 剪切
          'editor.action.clipboardCopyAction': formatMessage({
            id: 'odc.component.SQLCodeEditor.Copy',
          }),
          // 复制
          'editor.action.revealDefinition': formatMessage({
            id: 'odc.component.SQLCodeEditor.ViewDetails',
          }),
          // 查看详情
          'open-detail': formatMessage({
            id: 'odc.component.SQLCodeEditor.ViewDetails',
          }), // 查看详情
        };
        import('@alipay/monaco-editor/esm/vs/platform/actions/common/actions').then((_actions) => {
          const menuItems = _actions?.MenuRegistry?._menuItems;

          if (menuItems) {
            menuItems?.forEach((contextItems, key) => {
              const newItems = contextItems.filter((item) => {
                const { id } = item.command;
                const matchId = id?.split(':')?.reverse()[0];

                if (textMap[matchId]) {
                  item.command.title = textMap[matchId];
                }

                return ![
                  'editor.action.quickCommand',
                  'editor.action.changeAll',
                  'editor.action.formatDocument',
                  'editor.action.formatSelection',
                ].includes(id);
              });
              menuItems.set(key, newItems);
            });
          }
        });
      } catch (e) {
        console.log(e);
      }
    });

    if (this.props.onEditorCreated) {
      this.props.onEditorCreated(editor);
    }

    if (this.props.onOpenObjDetail) {
      editor.registerDetailAction(this.props.onOpenObjDetail);
    }
  };
  private markErrorChar = (value) => {
    const model = this.editor.UNSAFE_getCodeEditor().getModel();

    const markers = [];
    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      if (char === '\u00a0') {
        const position = model.getPositionAt(i);
        markers.push({
          startColumn: position.column,
          endColumn: position.column + 1,
          endLineNumber: position.lineNumber,
          startLineNumber: position.lineNumber,
          severity: 4,
          message: formatMessage({
            id: 'odc.component.SQLCodeEditor.InvalidCharacterUAThis',
          }), // 非法字符(\u00a0)，该字符有可能造成运行报错
        });
      }
    }
    import('@alipay/ob-editor').then((module) => {
      module.monaco.editor.setModelMarkers(model, model.getModeId(), markers);
    });
  };
  private onValueChange = (value: string) => {
    const { disableSnippetConvert } = this.props;
    // handle copy insert snipp
    if (value) {
      if (!disableSnippetConvert) {
        const matches = value.match(REG_SNIPPET);
        if (matches && matches.length) {
          const position = this.editor.getPosition();
          const snippet = matches[0].replace(REG_SNIPPET, '$1');
          const newValue = value.replace(REG_SNIPPET, '');
          this.editor.setValue(newValue);
          this.editor.setPosition(position);
          editorUltis.insertSnippetTemplate(this.editor, snippet);
        }
      }
    }
    this.markErrorChar(value);
    if (this.props.onValueChange) {
      this.props.onValueChange(value);
    }
  };
}
