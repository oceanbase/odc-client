import { IEditor, IFullEditor } from '@/component/MonacoEditor';
import SessionStore from '@/store/sessionManager/session';
import * as monaco from 'monaco-editor';
import Icon, {
  CloseOutlined,
  InfoCircleFilled,
  PauseCircleOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { history } from '@umijs/max';
import {
  Button,
  Dropdown,
  Input,
  InputRef,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import styles from './index.less';
import { AIQuestionType } from '@/d.ts/ai';
import { modifySync } from '@/common/network/ai';
import login from '@/store/login';
import odc from '@/plugins/odc';
import { getDefaultValue } from './util';
import { IModel } from '@/d.ts/llm';
import { VendorsConfig } from '@/page/ExternalIntegration/LargeModel/constant';
import setting from '@/store/setting';

interface IProps {
  dispose: () => void;
  editor: IEditor;
  session: SessionStore;
  mode: AIQuestionType;
  fullEditor: IFullEditor;
  modelsData?: {
    allModels: IModel[];
    modelsLoading: boolean;
    onRefreshModels?: () => void;
  };
}

export default function InlineChat({
  dispose,
  editor,
  session,
  mode: propMode,
  fullEditor,
  modelsData,
}: IProps) {
  const inputRef = React.useRef<InputRef>(null);
  const [mode, setMode] = useState(propMode);
  const [value, setValue] = useState<string>(getDefaultValue(propMode));
  const [applied, setApplied] = useState(false);
  const [isShowMode, setIsShowMode] = useState(false);
  const needRollback = useRef(false);
  const isAdmin = login.user?.roles?.some((role) => role.type === 'admin');
  // 判断当前是否输入法正在输入拼音
  const [lock, setLock] = useState(false);
  const [isShowModelSelect, setIsShowModelSelect] = useState(false);

  // 使用传入的 modelsData 或者本地状态作为备选
  const allModels = modelsData?.allModels || [];
  const modelsLoading = modelsData?.modelsLoading || false;

  const [selectedModel, setSelectedModel] = useState<string>(
    setting.AIConfig?.defaultLlmModel || '',
  );
  const [searchValue, setSearchValue] = useState<string>('');

  const {
    run: fetchCompletion,
    loading,
    cancel,
  } = useRequest(modifySync, {
    manual: true,
  });

  useEffect(() => {
    if (mode === AIQuestionType.SQL_MODIFIER || mode === AIQuestionType.NL_2_SQL) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    } else {
      send();
    }
    return () => {
      if (needRollback.current) {
        rollback();
      }
    };
  }, []);

  async function send() {
    const tip = renderLargeModelTip();
    if (tip) {
      message.warning(tip);
    }
    if (editor.getValue()?.length > 5000) {
      message.error('超过最大长度限制');
      return;
    }
    const selection = editor.getSelection();
    const start = editor.getModel()?.getOffsetAt(selection?.getStartPosition());
    const end = Math.max(editor.getModel()?.getOffsetAt(selection?.getEndPosition()) - 1, 0);
    let submitMode = mode;
    if (
      submitMode === AIQuestionType.SQL_MODIFIER &&
      selection?.getStartPosition().equals(selection?.getEndPosition())
    ) {
      submitMode = AIQuestionType.NL_2_SQL;
    }
    const data = await fetchCompletion({
      input: value,
      fileName: '',
      fileContent: editor.getValue(),
      databaseId: session?.odcDatabase?.id,
      startPosition: start,
      endPosition: end,
      questionType: submitMode,
      sid: session?.sessionId,
      model: selectedModel,
    });
    if (data) {
      needRollback.current = true;
      const oldModel = editor.getModel();
      const newModel = monaco.editor.createModel(oldModel.getValue(), oldModel.getLanguageId());
      fullEditor?.getOriginalEditor()?.setModel(newModel);
      editor.executeEdits('source', [
        {
          range: editor.getSelection(),
          text: data,
        },
      ]);
      setApplied(true);
    }
  }
  function rollback() {
    editor.trigger('myapp', 'undo', null);
    fullEditor?.getOriginalEditor()?.setModel(editor.getModel());
    setApplied(false);
    needRollback.current = false;
  }
  function submit() {
    const model = editor.getModel();
    fullEditor?.getOriginalEditor()?.getModel().setValue(model.getValue());
    fullEditor?.getOriginalEditor()?.setModel(model);
    needRollback.current = false;
    dispose();
  }

  function renderInputAction() {
    if (applied) {
      return null;
    } else if (loading) {
      return (
        <Button
          type="text"
          onClick={() => {
            cancel();
          }}
          className={styles.button}
        >
          <PauseCircleOutlined />
        </Button>
      );
    } else {
      return (
        <Button
          disabled={mode === AIQuestionType.SQL_MODIFIER && !value}
          className={styles.button}
          onClick={() => send()}
          type="text"
        >
          <SendOutlined />
        </Button>
      );
    }
  }

  // 根据搜索值过滤模型
  const filteredModels = allModels.filter(
    (model) => !searchValue || model.modelName.toLowerCase().includes(searchValue.toLowerCase()),
  );

  // 按提供商分组模型
  const groupedModels = filteredModels.reduce((acc, model) => {
    const providerName = model.providerName;
    if (!acc[providerName]) {
      acc[providerName] = [];
    }
    acc[providerName].push(model);
    return acc;
  }, {} as Record<string, IModel[]>);

  // 生成 Select 的 options
  const selectOptions = Object.entries(groupedModels).map(([providerName, models]) => ({
    label: <span className={styles.providerLabel}>{providerName}</span>,
    options: models.map((model) => ({
      label: (
        <span className={styles.optionContainer}>
          <Icon style={{ fontSize: 16 }} component={VendorsConfig[providerName]?.icon} />
          <span style={{ marginLeft: 8 }}>{model.modelName}</span>
        </span>
      ),
      value: `${providerName}/${model.modelName}`,
      disabled: !model.enabled,
    })),
  }));

  useEffect(() => {
    if (setting.AIConfig?.defaultLlmModel) {
      const modelName = setting.AIConfig?.defaultLlmModel;
      setSelectedModel(modelName);
    } else if (selectOptions.length > 0) {
      const modelName = `${selectOptions[0].label}/${selectOptions[0].options[0].value}`;
      setSelectedModel(modelName);
    }
  }, [selectOptions, setting.AIConfig?.defaultLlmModel]);

  const renderLargeModelSelect = () => {
    if (modelsLoading) {
      return (
        <div className={styles.modelSelect}>
          <Typography.Text style={{ fontSize: 11, color: '#8592ad' }} type="secondary">
            正在加载模型列表...
          </Typography.Text>
        </div>
      );
    }

    if (allModels?.length === 0) {
      return (
        <div className={styles.modelSelect}>
          <Typography.Text style={{ fontSize: 11, color: '#8592ad' }} type="secondary">
            暂无可用模型
          </Typography.Text>
          {modelsData?.onRefreshModels && (
            <Button
              size="small"
              type="link"
              onClick={modelsData.onRefreshModels}
              style={{ padding: '0 4px', fontSize: 11 }}
            >
              重试
            </Button>
          )}
        </div>
      );
    }

    const selectedModelInfo = allModels.find(
      (m) => `${m.providerName}/${m.modelName}` === selectedModel,
    );
    const isSelectedModelAvailable = selectedModelInfo?.enabled;

    return (
      <div className={styles.modelSelect}>
        <div>
          <Tooltip
            trigger={isShowModelSelect ? 'click' : 'hover'}
            title={selectedModelInfo ? `${selectedModelInfo.modelName}` : ''}
          >
            <Select
              variant="borderless"
              dropdownAlign={{ offset: [0, 0] }}
              defaultValue={selectedModel}
              onChange={setSelectedModel}
              onOpenChange={(open) => {
                setIsShowModelSelect(open);
              }}
              popupRender={(menu) => (
                <div>
                  {/* 搜索框 */}
                  <div style={{ padding: '8px' }}>
                    <Input
                      placeholder="搜索模型名称"
                      size="small"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      allowClear
                    />
                  </div>
                  {menu}
                </div>
              )}
              placeholder="请选择模型"
              style={{ width: 230 }}
              options={selectOptions}
              loading={modelsLoading}
              showSearch={false}
              filterOption={false}
            />
          </Tooltip>
          {selectedModel && !isSelectedModelAvailable && (
            <Tooltip title="当前模型不可用">
              <InfoCircleFilled className={styles.warningIcon} />
            </Tooltip>
          )}
        </div>
        <Typography.Text style={{ fontSize: 11, color: '#8592ad' }} type="secondary">
          AI 助手生成内容的准确性和完整性无法保证，仅供参考
        </Typography.Text>
      </div>
    );
  };

  const renderLargeModelTip = (type?: string) => {
    const icon = type && <InfoCircleFilled className={styles[type]} />;
    if (allModels?.length > 0) {
      return null;
    }
    if (isAdmin) {
      return (
        <div className={styles.largeModelTip}>
          {icon}
          <span>
            暂无可用模型，请前往
            <span
              className={styles.tab}
              onClick={() => {
                if (login.isPrivateSpace()) {
                  message.warning('请前往团队空间');
                  return;
                }
                history.push('/externalIntegration/approval');
              }}
            >
              外部集成&gt;大模型集成
            </span>{' '}
            进行模型设置
          </span>
        </div>
      );
    } else {
      return (
        <div className={styles.largeModelTip}>
          {icon}
          <span>暂无可用模型，请联系系统管理员进行模型设置</span>
        </div>
      );
    }
  };
  function renderTip() {
    if (applied) {
      return (
        <Space>
          <Button
            style={{
              lineHeight: '28px',
              height: 28,
              backgroundImage: 'linear-gradient(111deg, #0080ff 0%, #002bff 100%)',
            }}
            type="primary"
            onClick={submit}
          >
            接受
          </Button>
          <Button style={{ lineHeight: '28px', height: 28 }} onClick={rollback}>
            忽略
          </Button>
        </Space>
      );
    }
    if (!loading) {
      if (allModels?.length === 0 && !modelsLoading) {
        return renderLargeModelTip('info');
      } else {
        return renderLargeModelSelect();
      }
    }
    return (
      <Typography.Text style={{ fontSize: 12, color: '#8592ad' }} type="secondary">
        AI 生成中...
      </Typography.Text>
    );
  }
  function getModeTag() {
    switch (mode) {
      case AIQuestionType.SQL_OPTIMIZER: {
        return (
          <Tag
            className={classNames(styles.tag, {
              [styles.active]: isShowMode,
            })}
            bordered={false}
          >
            SQL 优化
          </Tag>
        );
      }
      case AIQuestionType.SQL_DEBUGGING: {
        return (
          <Tag
            bordered={false}
            className={classNames(styles.tag, {
              [styles.active]: isShowMode,
            })}
          >
            SQL 纠错
          </Tag>
        );
      }
      case AIQuestionType.SQL_MODIFIER: {
        return (
          <Tag
            bordered={false}
            className={classNames(styles.tag, {
              [styles.active]: isShowMode,
            })}
          >
            SQL 改写
          </Tag>
        );
      }
      case AIQuestionType.NL_2_SQL: {
        return (
          <Tag
            bordered={false}
            className={classNames(styles.tag, {
              [styles.active]: isShowMode,
            })}
          >
            SQL 生成
          </Tag>
        );
      }
      default: {
        return null;
      }
    }
  }
  return (
    <Space direction="vertical" className={styles.inlineChatWrapper}>
      <div className={styles.sqlInputWrapper}>
        <span className={styles.inputDecarationBorder}>
          <Dropdown
            trigger={['click']}
            open={isShowMode}
            placement="bottomLeft"
            onOpenChange={(open) => {
              if (open) {
                return;
              }
              setIsShowMode(open);
            }}
            destroyOnHidden
            autoFocus
            menu={{
              autoFocus: true,
              activeKey: mode,
              onClick(info) {
                if (!mode) {
                  setValue('');
                }
                setMode(info.key as AIQuestionType);
                setIsShowMode(false);
                inputRef.current?.focus();
              },
              items: [
                {
                  type: 'group',
                  key: 'instruction',
                  label: '指令',
                  children: [
                    {
                      label: 'SQL 生成',
                      key: AIQuestionType.NL_2_SQL,
                      onClick() {
                        console.log('click n2 sql');
                      },
                    },
                    {
                      label: 'SQL 纠错',
                      key: AIQuestionType.SQL_DEBUGGING,
                    },
                    {
                      label: 'SQL 改写',
                      key: AIQuestionType.SQL_MODIFIER,
                    },
                    {
                      label: 'SQL 优化',
                      key: AIQuestionType.SQL_OPTIMIZER,
                    },
                  ],
                },
              ],
            }}
          >
            <Input
              className={classNames(styles.sqlInput, {
                [styles.loadingInput]: loading,
              })}
              disabled={loading}
              prefix={
                <span
                  onClick={() => {
                    setIsShowMode(true);
                  }}
                >
                  {getModeTag()}
                </span>
              }
              ref={inputRef}
              suffix={renderInputAction()}
              value={value}
              onChange={(e) => {
                if (!value && e.target.value && !mode && e.target.value === '/') {
                  setIsShowMode(true);
                }
                setValue(e.target.value);
              }}
              placeholder="请输入消息"
              onCompositionStart={() => setLock(true)}
              onCompositionEnd={() => setLock(false)}
              onPressEnter={(e) => {
                if (!applied && !loading && value && !lock) {
                  send();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  if (loading) {
                    cancel();
                  }
                  dispose();
                }
                if (lock) {
                  return;
                }
                if (e.key === 'Delete' && mode) {
                  setMode(undefined);
                } else if (e.key === 'Backspace' && !value) {
                  setMode(undefined);
                }
              }}
            />
          </Dropdown>
        </span>
        <Button className={styles.close} onClick={() => dispose()} size="small" type="text">
          <CloseOutlined />
        </Button>
      </div>

      {renderTip()}
    </Space>
  );
}
