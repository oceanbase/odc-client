import { formatMessage } from '@/util/intl';
import { modifySync } from '@/common/network/ai';
import { IEditor, IFullEditor } from '@/component/MonacoEditor';
import SessionStore from '@/store/sessionManager/session';
import setting from '@/store/setting';
import { ReactComponent as AIIcon } from '@/svgr/ai_enable.svg';

import { generateUniqKey } from '@/util/utils';
import { clone } from 'lodash';
import { autorun, reaction } from 'mobx';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { render, unmountComponentAtNode } from 'react-dom';
import InlineChat from '.';
import { getKeyCodeText } from '@/component/Input/Keymap/keycodemap';
import copilotStore from '@/store/copilot';
import { message } from 'antd';
import { AIQuestionType } from '@/d.ts/ai';
import Icon from '@ant-design/icons';

interface IStore {
  mode: AIQuestionType;
}

const defaultStore: IStore = {
  mode: AIQuestionType.SQL_MODIFIER,
};

function resetStore(store: IStore) {
  Object.keys(defaultStore).forEach((key) => {
    store[key] = defaultStore[key];
  });
  return store;
}

export function createStore(): IStore {
  const store = clone(defaultStore);
  return store;
}

export function addAIHint(editor: IEditor) {
  const hintText = formatMessage({
    id: 'src.page.Workspace.components.SQLPage.InlineChat.635426C0',
    defaultMessage: '⌘+K 唤起 AI 内嵌对话',
  });

  const hintWidget = {
    domNode: null,
    position: null,
    getId: function () {
      return 'ai.hint.widget';
    },
    getDomNode: function () {
      if (!this.domNode) {
        this.domNode = document.createElement('div');
        this.domNode.style.width = 'max-content';
        this.domNode.textContent = hintText;
        this.domNode.style.color = '#C1CBE0';
        this.domNode.style.pointerEvents = 'none';
        this.domNode.style.fontStyle = 'italic';
        editor.applyFontInfo(this.domNode);
      }
      return this.domNode;
    },
    getPosition: function () {
      return this.position;
    },
  };

  let isWidgetVisible = false;

  const updateHint = () => {
    const shouldShowHint = setting.AIConfig?.copilotEnabled;

    if (!shouldShowHint) {
      if (isWidgetVisible) {
        editor.removeContentWidget(hintWidget);
        isWidgetVisible = false;
      }
      return;
    }

    // 未接受的 AI 补全内容时，隐藏提示（避免与 AI 补全内容重叠）
    if (setting.hasUnacceptedAICompletion) {
      if (isWidgetVisible) {
        editor.removeContentWidget(hintWidget);
        isWidgetVisible = false;
      }
      return;
    }

    const position = editor.getPosition();
    const model = editor.getModel();

    if (!position || !model || !editor.hasTextFocus()) {
      if (isWidgetVisible) {
        editor.removeContentWidget(hintWidget);
        isWidgetVisible = false;
      }
      return;
    }

    const lineContent = model.getLineContent(position.lineNumber);

    if (lineContent.trim() === '') {
      const newPosition = {
        position: { lineNumber: position.lineNumber, column: 1 },
        preference: [monaco.editor.ContentWidgetPositionPreference.EXACT],
      };
      if (!isWidgetVisible) {
        hintWidget.position = newPosition;
        editor.addContentWidget(hintWidget);
        isWidgetVisible = true;
      } else {
        const widgetPosition = hintWidget.position.position;
        if (widgetPosition.lineNumber !== position.lineNumber) {
          editor.removeContentWidget(hintWidget);
          hintWidget.position = newPosition;
          editor.addContentWidget(hintWidget);
        }
      }
    } else {
      if (isWidgetVisible) {
        editor.removeContentWidget(hintWidget);
        isWidgetVisible = false;
      }
    }
  };

  updateHint();

  const disposables = [
    editor.onDidChangeCursorPosition(updateHint),
    editor.onDidFocusEditorWidget(updateHint),
    editor.onDidBlurEditorWidget(updateHint),
    editor.onDidChangeModelContent(updateHint),
    // 响应 AI 配置变化、思考状态和补全状态
    reaction(
      () => ({
        aiEnabled: setting.AIEnabled,
        copilotEnabled: setting.AIConfig?.copilotEnabled,
        isAIThinking: setting.isAIThinking,
        hasUnacceptedAICompletion: setting.hasUnacceptedAICompletion,
      }),
      updateHint,
    ),
  ];

  return () => {
    if (isWidgetVisible) {
      editor.removeContentWidget(hintWidget);
    }
    disposables.forEach((d) => {
      if (typeof d === 'function') {
        d(); // reaction 返回的是函数
      } else {
        d.dispose(); // editor 事件返回的是对象
      }
    });
  };
}

export function addAIContextMenu(
  editor: IEditor,
  store: IStore,
  showInlineChat: () => void,
  fullEditor: IFullEditor,
  getSession: () => SessionStore,
  hideIcon: () => void,
) {
  const selectionContext = editor.createContextKey<boolean>('selectionContext', false);
  const aiContext = editor.createContextKey<boolean>('aiContext', false);
  const dispose = autorun(() => {
    if (setting.AIEnabled) {
      aiContext.set(true);
    } else {
      aiContext.set(false);
    }
  });
  editor.onDidChangeCursorSelection((e) => {
    const selection = e.selection;
    if (selection.isEmpty()) {
      selectionContext.set(false);
    } else {
      selectionContext.set(true);
    }
  });

  // 监听右键事件，在打开上下文菜单时隐藏 AI Icon
  const editorDomNode = editor.getDomNode();

  if (editorDomNode) {
    editorDomNode.addEventListener('contextmenu', hideIcon);
  }
  editor.addAction({
    label: '🪄 AI Format Document',
    id: 'ai-sql-format',
    contextMenuGroupId: 'navigation',
    precondition: 'aiContext',
    contextMenuOrder: 530,
    keybindingContext: 'aiContext',
    keybindings: [],
    async run() {
      const range = editor.getModel().getFullModelRange();
      const sql = editor.getModel().getValueInRange(range);
      if (!sql?.trim()) {
        return;
      }
      const session = getSession();
      const formattedSQL = await modifySync({
        input: '',
        fileName: '',
        fileContent: sql,
        databaseId: session?.odcDatabase?.id || null,
        startPosition: editor.getModel().getOffsetAt(range.getStartPosition()),
        endPosition: editor.getModel().getOffsetAt(range.getEndPosition()),
        questionType: AIQuestionType.SQL_FORMATTING,
        model: setting.AIConfig?.defaultLlmModel,
        stream: true,
        sid: session?.sessionId || '',
      });
      if (!formattedSQL) {
        return;
      }
      const op = {
        identifier: {
          major: 1,
          minor: 1,
        },

        range,
        text: formattedSQL,
        forceMoveMarkers: true,
      };
      editor.executeEdits('AI_FORMAT', [op]);
    },
  });
  editor.addAction({
    label: '🪄 AI Format Selection',
    id: 'ai-sql-format-selection',
    contextMenuGroupId: 'navigation',
    precondition: 'aiContext && selectionContext',
    contextMenuOrder: 540,
    keybindingContext: 'aiContext && selectionContext',
    keybindings: [],
    async run() {
      const range = editor.getSelection();
      const sql = editor.getModel().getValueInRange(range);
      if (!sql?.trim()) {
        return;
      }
      const session = getSession();
      const formattedSQL = await modifySync({
        input: '',
        fileName: '',
        fileContent: sql,
        databaseId: session?.odcDatabase?.id || null,
        startPosition: editor.getModel().getOffsetAt(range.getStartPosition()),
        endPosition: editor.getModel().getOffsetAt(range.getEndPosition()),
        questionType: AIQuestionType.SQL_FORMATTING,
        model: setting.AIConfig?.defaultLlmModel,
        sid: session?.sessionId || '',
      });
      if (!formattedSQL) {
        return;
      }
      const op = {
        identifier: {
          major: 1,
          minor: 1,
        },

        range,
        text: formattedSQL,
        forceMoveMarkers: true,
      };
      editor.executeEdits('AI_FORMAT', [op]);
    },
  });
  editor.addAction({
    label: formatMessage({
      id: 'src.page.Workspace.components.SQLPage.InlineChat.721ABAD4',
      defaultMessage: '🪄 SQL 改写',
    }),
    id: 'sql-modifier',
    contextMenuGroupId: 'navigation',
    contextMenuOrder: 520,
    precondition: 'aiContext && selectionContext',
    keybindingContext: 'aiContext && selectionContext',
    keybindings: [],
    run() {
      store['mode'] = AIQuestionType.SQL_MODIFIER;
      showInlineChat();
    },
  });
  editor.addAction({
    label: '🪄 SQL Debugging',
    id: 'sql-debugging',
    contextMenuOrder: 510,
    contextMenuGroupId: 'navigation',
    precondition: 'aiContext && selectionContext',
    keybindingContext: 'aiContext && selectionContext',
    keybindings: [],
    run() {
      store['mode'] = AIQuestionType.SQL_DEBUGGING;
      showInlineChat();
    },
  });
  return () => {
    dispose();
  };
}

function getEmptyPosition(editor: IEditor) {
  /**
   * 计算一个空位
   * 算法：从上下两行开始找，寻找离这个光标最近的空位
   * 假如找到距离 20 以内的，则通过，否则，找5行以内符合要求的
   * 要求预留宽度为 10 字符
   */
  const cursor = editor.getPosition();
  let minDistance = Number.MAX_SAFE_INTEGER;
  let minDistancePos = {
    lineNumber: cursor.lineNumber + 1,
    column: cursor.column,
  };
  let steps = [1, -2, 2, -3, 3, -4, 4, -5, 5];
  let step = steps.shift();
  const selection = editor.getSelection();
  while (minDistance > 20 && step) {
    const line = cursor.lineNumber + step;
    if (selection?.startLineNumber <= line && selection?.endLineNumber >= line) {
      step = steps.shift();
      continue;
    }
    if (line > 0) {
      const isLine1BeginEmpty = !editor
        .getModel()
        .getValueInRange({
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: 10,
        })
        ?.trim();
      if (isLine1BeginEmpty) {
        /**
         * 计算头部
         */
        const right =
          line > editor.getModel().getLineCount()
            ? 0
            : editor.getModel().getLineFirstNonWhitespaceColumn(line);
        if (right >= cursor.column) {
          const distance = Math.abs(line - cursor.lineNumber);
          if (distance < minDistance) {
            minDistance = distance;
            minDistancePos = {
              lineNumber: line,
              column: Math.max(cursor.column - 9, 1),
            };
          }
        } else if (cursor.column > right) {
          const distance = Math.sqrt(
            Math.pow(Math.abs(line - cursor.lineNumber), 2) +
              Math.pow(Math.abs(right - cursor.column), 2),
          );
          if (distance < minDistance) {
            minDistance = distance;
            minDistancePos = {
              lineNumber: line,
              column: right - 9,
            };
          }
        }
      }
      const lineEnd =
        line > editor.getModel().getLineCount() ? 0 : editor.getModel().getLineMaxColumn(line);
      if (lineEnd < cursor.column) {
        const distance = Math.abs(line - cursor.lineNumber);
        if (distance < minDistance) {
          minDistance = distance;
          minDistancePos = {
            lineNumber: line,
            column: cursor.column + 1,
          };
        }
      } else if (lineEnd >= cursor.column) {
        const distance = Math.sqrt(
          Math.pow(Math.abs(line - cursor.lineNumber), 2) +
            Math.pow(Math.abs(lineEnd - cursor.column), 2),
        );
        if (distance < minDistance) {
          minDistance = distance;
          minDistancePos = {
            lineNumber: line,
            column: lineEnd + 1,
          };
        }
      }
    }
    step = steps.shift();
  }
  console.log(minDistance);
  return minDistancePos;
}

export function addAIIcon(
  editor: IEditor,
  store: IStore,
  showInlineChat: () => void,
  fullEditor: IFullEditor,
): { dispose: () => void; hideIcon: () => void } {
  let iconWidget;
  const clearEditor = () => {
    if (iconWidget) {
      editor.removeContentWidget(iconWidget);
      iconWidget = null;
    }
  };
  let root;
  const disposeEditor = editor.onDidChangeCursorSelection((e) => {
    clearEditor();
    if (!setting.AIConfig?.completionEnabled) {
      return;
    }
    const selection = editor.getSelection();
    if (
      editor.getModel()?.getOffsetAt(selection?.getStartPosition()) ===
      editor.getModel()?.getOffsetAt(selection?.getEndPosition())
    ) {
      return;
    }
    const dom = document.createElement('div');
    // const handleAddToConversation = () => {
    //   const str = editor.getSelectionContent();
    //   if (str?.length <= 2000) {
    //     copilotStore?.toggleVisibility?.(true);
    //     copilotStore?.addCodeBlock?.(editor.getSelectionContent());
    //     editor.removeContentWidget(iconWidget);
    //     iconWidget = null;
    //   } else {
    //     message.warning('选中 SQL 超过 2000 个字符，暂不支持添加到对话，请重新选择'
    //     );
    //   }
    // };
    const handleEdit = () => {
      const selection = editor.getSelection();
      store.mode = monaco.Position.equals(selection.getStartPosition(), selection.getEndPosition())
        ? AIQuestionType.NL_2_SQL
        : AIQuestionType.SQL_MODIFIER;
      showInlineChat();
      editor.removeContentWidget(iconWidget);
      iconWidget = null;
    };
    iconWidget = {
      domNode: (function () {
        const id = generateUniqKey();
        let domNode = dom;
        domNode.id = id;
        return domNode;
      })(),
      getId: function () {
        return 'inlinechat.widget';
      },
      getDomNode: function () {
        return this.domNode;
      },
      getPosition: function () {
        const pos = getEmptyPosition(editor);
        const model = editor.getModel();
        const layoutInfo = editor.getLayoutInfo();
        const lineCount = model?.getLineCount() || 0;

        // 检查位置是否太靠近编辑器底部
        // 如果控件位置在最后5行内，或者超出了可见区域，优先使用 ABOVE 定位
        const isNearBottom = lineCount > 0 && pos.lineNumber > lineCount - 5;

        // 获取视口信息来判断是否在可见区域底部
        const visibleRanges = editor.getVisibleRanges();
        const isInVisibleBottom =
          visibleRanges.length > 0 &&
          pos.lineNumber > visibleRanges[visibleRanges.length - 1].endLineNumber - 3;

        return {
          position: {
            lineNumber: pos.lineNumber,
            column: pos.column,
          },
          preference:
            isNearBottom || isInVisibleBottom
              ? [
                  // 靠近底部时，优先在上方显示
                  monaco.editor.ContentWidgetPositionPreference.ABOVE,
                  monaco.editor.ContentWidgetPositionPreference.BELOW,
                ]
              : [
                  // 否则使用精确定位
                  monaco.editor.ContentWidgetPositionPreference.EXACT,
                ],
        };
      },
    };
    if (
      editor.getModel()?.getOffsetAt(selection?.getStartPosition()) !==
      editor.getModel()?.getOffsetAt(selection?.getEndPosition())
    ) {
      editor.addContentWidget(iconWidget);
      render(
        <div
          style={{
            display: 'inline-block',
          }}
        >
          <span
            style={{
              padding: '2px 8px',
              border: '1px solid #cdd5e4',
              borderRadius: 4,
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'fit-content',
              whiteSpace: 'nowrap',
            }}
          >
            <Icon component={AIIcon} style={{ fontSize: 16 }} />

            <div style={{ display: 'flex', padding: '0px 8px', alignItems: 'center' }}>
              <span
                style={{ marginRight: 4, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                onClick={handleEdit}
              >
                <span>
                  {formatMessage({
                    id: 'src.page.Workspace.components.SQLPage.InlineChat.C959B841',
                    defaultMessage: '编辑',
                  })}
                </span>
                <span style={{ color: '#8592ad', margin: '0 4px' }}>{getKeyCodeText('57,41')}</span>
              </span>
              {/* <span style={{ cursor: 'pointer' }} onClick={handleAddToConversation}>
                 <span>
                添加到对话
                 </span>
                 <span style={{ color: '#8592ad', marginLeft: 4 }}>{getKeyCodeText('57,42')}</span>
                </span> */}
            </div>
          </span>
        </div>,
        dom,
      );
      root = {
        unmount: () => {
          unmountComponentAtNode(dom);
        },
      };
    }
  });
  editor.addAction({
    id: 'disable-expand-line',
    label: 'Disable Expand Line Selection',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL],
    run: function () {
      const str = editor.getSelectionContent();
      if (str?.length) {
        copilotStore.toggleVisibility(true);
        if (str?.length <= 2000) {
          copilotStore?.addCodeBlock?.(str);
          editor.removeContentWidget(iconWidget);
        } else {
          message.warning(
            formatMessage({
              id: 'src.page.Workspace.components.SQLPage.InlineChat.FD0B4202',
              defaultMessage: '选中 SQL 超过 2000 个字符，暂不支持添加到对话，请重新选择',
            }),
          );
        }
      } else {
        copilotStore.toggleVisibility();
      }
    },
  });
  function dispose() {
    disposeEditor.dispose();
    root?.unmount();
    root = null;
  }

  function hideIcon() {
    clearEditor();
  }

  return { dispose, hideIcon };
}
/**
 * 增加ai action，唤起对话窗
 */
export function addAIAction(
  editor: IEditor,
  getSession: () => SessionStore,
  store: IStore,
  fullEditor: IFullEditor,
  onRefreshModels?: () => void,
) {
  let inlineChatDispose;
  async function showInlineChat() {
    if (inlineChatDispose) {
      inlineChatDispose();
    }
    if (!setting.AIConfig?.copilotEnabled) {
      return;
    }
    /**
     * 暂停50ms，避免monaco计算bug
     */
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 150);
    });
    const selection = editor.getSelection();
    const selectedSQL = selection ? editor.getModel()?.getValueInRange(selection) || '' : '';
    const begin = selection
      ? Math.min(selection.startLineNumber, selection.endLineNumber)
      : editor.getPosition()?.lineNumber;
    let viewZoneId = null;
    const dom = document.createElement('div');
    editor.changeViewZones(function (changeAccessor) {
      viewZoneId = changeAccessor.addZone({
        afterLineNumber: begin - 1,
        heightInPx: 110,
        domNode: dom,
      });
    });
    const root = { unmount: () => {} };
    let dispose: monaco.IDisposable;
    inlineChatDispose = () => {
      root?.unmount?.();
      dispose?.dispose?.();
      editor.changeViewZones(function (changeAccessor) {
        changeAccessor.removeZone(viewZoneId);
      });
      inlineChatDispose = null;
    };
    render(
      <div
        style={{
          width: 560,
          height: 100,
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          zIndex: 100,
        }}
      >
        <InlineChat
          mode={store.mode}
          dispose={inlineChatDispose}
          editor={editor}
          fullEditor={fullEditor}
          session={getSession()}
          initialValue={selectedSQL}
          onRefreshModels={onRefreshModels}
        />
      </div>,
      dom,
    );
    root.unmount = () => {
      unmountComponentAtNode(dom);
    };
    dispose = editor.onKeyDown((e) => {
      if (e.keyCode === 9) {
        inlineChatDispose();
      }
    });
  }
  editor.addAction({
    id: 'ai',
    label: '🪄 AI Inline Chat',
    contextMenuGroupId: 'navigation',
    precondition: 'aiContext',
    keybindingContext: 'aiContext',
    contextMenuOrder: 500,
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK],
    run: async (_editor) => {
      const selection = _editor.getSelection();
      store.mode = monaco.Position.equals(selection.getStartPosition(), selection.getEndPosition())
        ? AIQuestionType.NL_2_SQL
        : AIQuestionType.SQL_MODIFIER;
      showInlineChat();
    },
  });
  return showInlineChat;
}

export function getDefaultValue(mode: AIQuestionType) {
  switch (mode) {
    case AIQuestionType.SQL_DEBUGGING: {
      return formatMessage({
        id: 'src.page.Workspace.components.SQLPage.InlineChat.3A3302EF',
        defaultMessage: '修复语法问题',
      });
    }
    case AIQuestionType.SQL_OPTIMIZER: {
      return formatMessage({
        id: 'src.page.Workspace.components.SQLPage.InlineChat.8BD32D06',
        defaultMessage: '优化SQL',
      });
    }
    default: {
      return '';
    }
  }
}
