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

import CommonIDE from '@/component/CommonIDE';
import { SensitiveRuleType } from '@/d.ts/sensitiveRule';
import odc from '@/plugins/odc';
import { EThemeConfigKey } from '@/store/setting';
import { formatMessage, getLocalDocs } from '@/util/intl';
import { Form, Input, Radio, RadioChangeEvent, Select, Space, Tag, Button, message } from 'antd';
import { useWatch } from 'antd/es/form/Form';
import { useEffect, useState, useRef } from 'react';
import CheckboxInput from './CheckboxInput';
import styles from './index.less';
const DetectWay = ({
  key,
  script,
  formRef,
  hasValidated,
  setScript,
  originType = SensitiveRuleType.PATH,
  onTypeChange,
}) => {
  const [type, setType] = useState<SensitiveRuleType>(originType);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // 监听表单中aiSensitiveTypes字段的变化
  const watchedAiSensitiveTypes = useWatch('aiSensitiveTypes', formRef);

  // 预设的敏感类别
  const predefinedTypes = [
    {
      value: 'personal-name-chinese',
      label: formatMessage({
        id: 'odc.SensitiveRule.components.DetectWay.PersonalNameChinese',
        defaultMessage: '个人姓名(汉字类型)',
      }),
    },
    {
      value: 'personal-name-alphabet',
      label: formatMessage({
        id: 'odc.SensitiveRule.components.DetectWay.PersonalNameAlphabet',
        defaultMessage: '个人姓名(字母类型)',
      }),
    },
    {
      value: 'nickname',
      label: formatMessage({
        id: 'odc.SensitiveRule.components.DetectWay.Nickname',
        defaultMessage: '昵称',
      }),
    },
    {
      value: 'email',
      label: formatMessage({
        id: 'odc.SensitiveRule.components.DetectWay.Email',
        defaultMessage: '邮箱',
      }),
    },
    {
      value: 'address',
      label: formatMessage({
        id: 'odc.SensitiveRule.components.DetectWay.Address',
        defaultMessage: '地址',
      }),
    },
    {
      value: 'phone-number',
      label: formatMessage({
        id: 'odc.SensitiveRule.components.DetectWay.PhoneNumber',
        defaultMessage: '手机号码',
      }),
    },
    {
      value: 'fixed-line-phone-number',
      label: formatMessage({
        id: 'odc.SensitiveRule.components.DetectWay.FixedLinePhoneNumber',
        defaultMessage: '固定电话',
      }),
    },
    {
      value: 'certificate-number',
      label: formatMessage({
        id: 'odc.SensitiveRule.components.DetectWay.CertificateNumber',
        defaultMessage: '证件号码',
      }),
    },
    {
      value: 'bank-card-number',
      label: formatMessage({
        id: 'odc.SensitiveRule.components.DetectWay.BankCardNumber',
        defaultMessage: '银行卡号',
      }),
    },
    {
      value: 'license-plate-number',
      label: formatMessage({
        id: 'odc.SensitiveRule.components.DetectWay.LicensePlateNumber',
        defaultMessage: '车牌号',
      }),
    },
    {
      value: 'device-id',
      label: formatMessage({
        id: 'odc.SensitiveRule.components.DetectWay.DeviceId',
        defaultMessage: '设备唯一识别号',
      }),
    },
    {
      value: 'ip',
      label: formatMessage({
        id: 'odc.SensitiveRule.components.DetectWay.IpAddress',
        defaultMessage: 'IP 地址',
      }),
    },
    {
      value: 'mac',
      label: formatMessage({
        id: 'odc.SensitiveRule.components.DetectWay.MacAddress',
        defaultMessage: 'MAC 地址',
      }),
    },
  ];
  const handleScriptChange = (v: string) => {
    setScript(v);
  };
  const handleTypeChange = (e: RadioChangeEvent) => {
    setType(e.target.value);
    onTypeChange?.(e.target.value);
  };

  // 处理敏感类别的选择和删除
  const handleTagClose = (removedTag: string) => {
    const newTags = selectedTypes.filter((tag) => tag !== removedTag);
    isUserActionRef.current = true;
    setSelectedTypes(newTags);
    formRef?.setFieldsValue({ aiSensitiveTypes: newTags });
  };

  const handleTagAdd = (tag: string) => {
    if (!selectedTypes.includes(tag)) {
      const newTags = [...selectedTypes, tag];
      isUserActionRef.current = true;
      setSelectedTypes(newTags);
      formRef?.setFieldsValue({ aiSensitiveTypes: newTags });
    }
  };

  const handleInputConfirm = () => {
    if (inputValue && !selectedTypes.includes(inputValue)) {
      // 检查自定义类别数量限制
      const customTypesCount = selectedTypes.filter(
        (type) => !predefinedTypes.some((predefined) => predefined.value === type),
      ).length;

      if (customTypesCount >= 10) {
        message.warning(
          formatMessage({
            id: 'odc.SensitiveRule.components.DetectWay.MaxCustomTypesWarning',
            defaultMessage: '最多只能添加10个自定义类别',
          }),
        );
        setInputValue('');
        setInputVisible(false);
        return;
      }

      const newTags = [...selectedTypes, inputValue];
      isUserActionRef.current = true;
      setSelectedTypes(newTags);
      formRef?.setFieldsValue({ aiSensitiveTypes: newTags });
    }
    setInputVisible(false);
    setInputValue('');
  };

  const showInput = () => {
    setInputVisible(true);
  };
  useEffect(() => {
    setScript(script);
  }, [script]);
  useEffect(() => {
    setType(type);
  }, [type]);

  // 使用ref来跟踪是否是由用户操作触发的更新
  const isUserActionRef = useRef(false);

  // 同步表单值和本地状态
  useEffect(() => {
    // 如果是用户操作触发的，跳过这次同步
    if (isUserActionRef.current) {
      isUserActionRef.current = false;
      return;
    }

    if (watchedAiSensitiveTypes && Array.isArray(watchedAiSensitiveTypes)) {
      setSelectedTypes(watchedAiSensitiveTypes);
    } else if (watchedAiSensitiveTypes === undefined || watchedAiSensitiveTypes === null) {
      setSelectedTypes([]);
    }
  }, [watchedAiSensitiveTypes]);
  return (
    <>
      <div
        style={{
          marginBottom: '4px',
        }}
      >
        {
          formatMessage({
            id: 'odc.SensitiveRule.components.DetectWay.IdentificationMethod',
            defaultMessage: '识别方式',
          }) /*识别方式*/
        }
      </div>
      <div className={styles.detectWay}>
        <Form.Item name="type" label="" required>
          <Radio.Group onChange={handleTypeChange}>
            <Radio.Button value={SensitiveRuleType.PATH}>
              {
                formatMessage({
                  id: 'odc.SensitiveRule.components.DetectWay.Path',
                  defaultMessage: '路径',
                }) /*路径*/
              }
            </Radio.Button>
            <Radio.Button value={SensitiveRuleType.REGEX}>
              {
                formatMessage({
                  id: 'odc.SensitiveRule.components.DetectWay.Regular',
                  defaultMessage: '正则',
                }) /*正则*/
              }
            </Radio.Button>
            <Radio.Button value={SensitiveRuleType.GROOVY}>
              {
                formatMessage({
                  id: 'odc.SensitiveRule.components.DetectWay.Script',
                  defaultMessage: '脚本',
                }) /*脚本*/
              }
            </Radio.Button>
            <Radio.Button value={SensitiveRuleType.AI}>
              {
                formatMessage({
                  id: 'odc.SensitiveRule.components.DetectWay.AI',
                  defaultMessage: 'AI',
                }) /*AI*/
              }
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        {type === SensitiveRuleType.PATH && (
          <div>
            <div className={styles.tip}>
              {
                formatMessage({
                  id: 'odc.SensitiveRule.components.DetectWay.UseAsTheWildcardAnd',
                  defaultMessage:
                    '使用「*」作为通配符，使用「,」作为分割符，例如：db*.table.*a,*.*.name',
                }) /*使用「*」作为通配符，使用「,」作为分割符，例如：db*.table.*a,*.*.name*/
              }
            </div>
            <Form.Item
              label={formatMessage({
                id: 'odc.SensitiveRule.components.DetectWay.MatchingRules',
                defaultMessage: '匹配的规则',
              })}
              /*匹配的规则*/ name="pathIncludes"
              required
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.SensitiveRule.components.DetectWay.EnterAMatchingRule',
                    defaultMessage: '请输入匹配的规则',
                  }), //请输入匹配的规则
                },
              ]}
            >
              <Input.TextArea
                placeholder={formatMessage({
                  id: 'odc.SensitiveRule.components.DetectWay.PleaseEnter',
                  defaultMessage: '请输入',
                })}
                /*请输入*/ rows={4}
              ></Input.TextArea>
            </Form.Item>
            <Form.Item
              label={formatMessage({
                id: 'odc.SensitiveRule.components.DetectWay.ExcludedRules',
                defaultMessage: '排除的规则',
              })}
              /*排除的规则*/ name="pathExcludes"
              required
            >
              <Input.TextArea
                placeholder={formatMessage({
                  id: 'odc.SensitiveRule.components.DetectWay.PleaseEnter',
                  defaultMessage: '请输入',
                })}
                /*请输入*/ rows={4}
              ></Input.TextArea>
            </Form.Item>
          </div>
        )}

        {type === SensitiveRuleType.REGEX && (
          <div>
            <div className={styles.tip}>
              {
                formatMessage({
                  id: 'odc.SensitiveRule.components.DetectWay.SelectTheRecognitionObjectBefore',
                  defaultMessage: '请先勾选识别对象，再填写对应的表达式',
                }) /*请先勾选识别对象，再填写对应的表达式*/
              }
            </div>
            <div>
              <Form.Item name={'regExp'} fieldKey={'regExp'} noStyle>
                <Form.Item
                  name={['regExp', 'databaseRegexExpression']}
                  fieldKey={['regExp', 'databaseRegexExpression']}
                  className={styles.formItemGroup}
                  rules={[
                    {
                      required: true,
                      message: 'required',
                    },
                  ]}
                  noStyle
                >
                  <CheckboxInput
                    formRef={formRef}
                    key={[key, 'databaseRegexExpression'].join('_')}
                    hasLabel
                    name={['regExp', 'databaseRegexExpression']}
                    checkValue={'databaseRegexExpression'}
                  />
                </Form.Item>
                <Form.Item
                  name={['regExp', 'tableRegexExpression']}
                  fieldKey={['regExp', 'tableRegexExpression']}
                  className={styles.formItemGroup}
                  noStyle
                >
                  <CheckboxInput
                    formRef={formRef}
                    key={[key, 'tableRegexExpression'].join('_')}
                    name={['regExp', 'tableRegexExpression']}
                    checkValue={'tableRegexExpression'}
                  />
                </Form.Item>
                <Form.Item
                  name={['regExp', 'columnRegexExpression']}
                  fieldKey={['regExp', 'columnRegexExpression']}
                  className={styles.formItemGroup}
                  noStyle
                >
                  <CheckboxInput
                    formRef={formRef}
                    key={[key, 'columnRegexExpression'].join('_')}
                    name={['regExp', 'columnRegexExpression']}
                    checkValue={'columnRegexExpression'}
                  />
                </Form.Item>
                <Form.Item
                  name={['regExp', 'columnCommentRegexExpression']}
                  fieldKey={['regExp', 'columnCommentRegexExpression']}
                  className={styles.formItemGroup}
                  noStyle
                >
                  <CheckboxInput
                    formRef={formRef}
                    key={[key, 'columnCommentRegexExpression'].join('_')}
                    name={['regExp', 'columnCommentRegexExpression']}
                    checkValue={'columnCommentRegexExpression'}
                  />
                </Form.Item>
              </Form.Item>
            </div>
          </div>
        )}

        {type === SensitiveRuleType.GROOVY && (
          <>
            <div className={styles.editor}>
              <Space
                size={4}
                style={{
                  marginBottom: '5px',
                }}
              >
                <div>
                  {
                    formatMessage({
                      id: 'odc.SensitiveRule.components.DetectWay.GroovyScript',
                      defaultMessage: 'Groovy脚本',
                    }) /*Groovy脚本*/
                  }
                </div>
                <a
                  href={odc.appConfig?.docs?.url || getLocalDocs('1.data-desensitization.html')}
                  target={'_blank'}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  rel="noreferrer"
                >
                  {
                    formatMessage({
                      id: 'odc.src.page.Project.Sensitive.components.SensitiveRule.components.LookAtTheDocumentation',
                      defaultMessage: '查看文档',
                    }) /* 
                查看文档
                */
                  }
                </a>
              </Space>
              <div
                style={{
                  height: '250px',
                  paddingBottom: '12px',
                }}
              >
                <CommonIDE
                  session={null}
                  bordered={true}
                  language={'groovy'}
                  initialSQL={script}
                  editorProps={{
                    theme: EThemeConfigKey.ODC_WHITE,
                  }}
                  onSQLChange={(script) => {
                    handleScriptChange(script);
                  }}
                />
              </div>
            </div>
            <div className={hasValidated ? styles.errorTip : styles.errorTipHidden}>
              {
                formatMessage({
                  id: 'odc.SensitiveRule.components.DetectWay.PleaseEnterGroovyScript',
                  defaultMessage: '请输入Groovy脚本',
                }) /*请输入Groovy脚本*/
              }
            </div>
          </>
        )}

        {type === SensitiveRuleType.AI && (
          <div>
            <div className={styles.tip}>
              {
                formatMessage({
                  id: 'odc.SensitiveRule.components.DetectWay.AITip',
                  defaultMessage: 'AI将根据配置信息自动识别敏感数据',
                }) /*AI将根据配置信息自动识别敏感数据*/
              }
            </div>
            <Form.Item
              label={
                formatMessage({
                  id: 'odc.SensitiveRule.components.DetectWay.SensitiveTypes',
                  defaultMessage: '敏感类别',
                }) /*敏感类别*/
              }
              name="aiSensitiveTypes"
              required
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.SensitiveRule.components.DetectWay.SelectSensitiveTypes',
                    defaultMessage: '请至少选择一个敏感类别',
                  }), //请至少选择一个敏感类别
                },
              ]}
            >
              <div
                style={{
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  padding: '8px',
                  minHeight: '32px',
                }}
              >
                {/* 预设类别选择区域 */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    {formatMessage({
                      id: 'odc.SensitiveRule.components.DetectWay.PredefinedTypes',
                      defaultMessage: '预设类别：',
                    })}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {predefinedTypes.map((type) => (
                      <Button
                        key={type.value}
                        size="small"
                        type={selectedTypes.includes(type.value) ? 'primary' : 'default'}
                        onClick={() => {
                          if (selectedTypes.includes(type.value)) {
                            handleTagClose(type.value);
                          } else {
                            handleTagAdd(type.value);
                          }
                        }}
                        style={{ height: '24px', fontSize: '12px' }}
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 自定义输入区域 */}
                <div style={{ marginBottom: selectedTypes.length > 0 ? '8px' : '0' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    {formatMessage({
                      id: 'odc.SensitiveRule.components.DetectWay.CustomTypes',
                      defaultMessage: '自定义类别：',
                    })}
                  </div>
                  {inputVisible ? (
                    <Input
                      type="text"
                      size="small"
                      style={{ width: '200px' }}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onBlur={handleInputConfirm}
                      onPressEnter={handleInputConfirm}
                      placeholder={formatMessage({
                        id: 'odc.SensitiveRule.components.DetectWay.CustomTypeNamePlaceholder',
                        defaultMessage: '输入自定义类别名称',
                      })}
                      maxLength={20}
                      autoFocus
                    />
                  ) : (
                    <Button
                      size="small"
                      type="dashed"
                      onClick={showInput}
                      disabled={(() => {
                        const customTypesCount = selectedTypes.filter(
                          (type) =>
                            !predefinedTypes.some((predefined) => predefined.value === type),
                        ).length;
                        return customTypesCount >= 10;
                      })()}
                      style={{ height: '24px', fontSize: '12px' }}
                    >
                      +{' '}
                      {formatMessage({
                        id: 'odc.SensitiveRule.components.DetectWay.AddCustomType',
                        defaultMessage: '添加自定义类别',
                      })}
                    </Button>
                  )}
                </div>

                {/* 已选择的类别显示区域 */}
                {selectedTypes.length > 0 && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                      {formatMessage(
                        {
                          id: 'odc.SensitiveRule.components.DetectWay.SelectedTypesCount',
                          defaultMessage: '已选择（{total}个，其中自定义{custom}/10）：',
                        },
                        {
                          total: selectedTypes.length,
                          custom: selectedTypes.filter(
                            (type) =>
                              !predefinedTypes.some((predefined) => predefined.value === type),
                          ).length,
                        },
                      )}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {selectedTypes.map((tag) => {
                        const predefinedType = predefinedTypes.find((t) => t.value === tag);
                        const displayName = predefinedType ? predefinedType.label : tag;
                        return (
                          <Tag
                            key={tag}
                            closable
                            onClose={() => handleTagClose(tag)}
                            color={predefinedType ? 'blue' : 'green'}
                          >
                            {displayName}
                          </Tag>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Form.Item>

            <Form.Item
              label={
                formatMessage({
                  id: 'odc.SensitiveRule.components.DetectWay.CustomPrompt',
                  defaultMessage: '自定义提示词',
                }) /*自定义提示词*/
              }
              tooltip={
                <div>
                  <div>
                    {formatMessage({
                      id: 'odc.SensitiveRule.components.DetectWay.CustomPromptDescription',
                      defaultMessage:
                        '用于补充描述特殊的敏感字段识别场景，帮助AI更准确地识别敏感数据',
                    })}
                  </div>
                  <div style={{ marginTop: '8px', fontWeight: 'bold' }}>
                    {formatMessage({
                      id: 'odc.SensitiveRule.components.DetectWay.UsageSuggestions',
                      defaultMessage: '使用建议：',
                    })}
                  </div>
                  <div>
                    •{' '}
                    {formatMessage({
                      id: 'odc.SensitiveRule.components.DetectWay.DescribeBusinessMeaning',
                      defaultMessage: '描述字段的业务含义和敏感特征',
                    })}
                  </div>
                  <div>
                    •{' '}
                    {formatMessage({
                      id: 'odc.SensitiveRule.components.DetectWay.ProvideFieldPatterns',
                      defaultMessage: '提供具体的字段名称模式或数据格式',
                    })}
                  </div>
                  <div>
                    •{' '}
                    {formatMessage({
                      id: 'odc.SensitiveRule.components.DetectWay.AvoidIrrelevantContent',
                      defaultMessage: '避免输入无关或过于宽泛的内容',
                    })}
                  </div>
                  <div style={{ marginTop: '8px', color: '#faad14' }}>
                    {formatMessage({
                      id: 'odc.SensitiveRule.components.DetectWay.PromptQualityNote',
                      defaultMessage: '注意：提示词质量直接影响识别准确性',
                    })}
                  </div>
                </div>
              }
              name="aiCustomPrompt"
              rules={[
                {
                  max: 100,
                  message: formatMessage({
                    id: 'odc.SensitiveRule.components.DetectWay.CustomPromptLengthError',
                    defaultMessage: '自定义提示词不能超过100字',
                  }),
                },
              ]}
            >
              <Input.TextArea
                placeholder={
                  formatMessage({
                    id: 'odc.SensitiveRule.components.DetectWay.CustomPromptPlaceholder',
                    defaultMessage: '描述特殊敏感字段情况，请勿输入无关内容',
                  }) /*描述模糊不清的敏感字段情况*/
                }
                rows={3}
                maxLength={100}
                showCount
              />
            </Form.Item>
          </div>
        )}
      </div>
    </>
  );
};
export default DetectWay;
