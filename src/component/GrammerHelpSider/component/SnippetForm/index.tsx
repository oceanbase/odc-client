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

import EditorToolBar from '@/component/EditorToolBar';
import snippetStore, {
  EnumSnippetAction,
  EnumSnippetType,
  SNIPPET_ACTIONS,
  SNIPPET_TYPES,
} from '@/store/snippet';
import { formatMessage } from '@/util/intl';
import { Button, Drawer, Form, Input, message, Modal, Select } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import React, { PureComponent } from 'react';

import MonacoEditor, { IEditor } from '@/component/MonacoEditor';

const { Option } = Select;
const { TextArea } = Input;
interface IProps {
  visible: boolean;
  action: EnumSnippetAction;
  snippet: any;
  onClose: (isNeedReloadList?: boolean) => void;
}

class SnippetFormDrawer extends PureComponent<IProps> {
  public formRef = React.createRef<FormInstance>();

  // @ts-ignore
  public editor: IEditor;

  private modal: any;

  public getSession() {
    return null;
  }

  onClose = async () => {
    const self = this;
    const { action } = this.props;
    const data = await this.formRef?.current?.getFieldsValue();
    // 用户有输入，加二次确认
    if (data.description || data.body || data.prefix) {
      const actionName = SNIPPET_ACTIONS.find((snippetAction) => snippetAction.key === action)
        ?.name;
      this.modal = Modal.confirm({
        title: formatMessage(
          {
            id: 'odc.component.SnippetForm.ExitTheActionnameCodeSnippet',
          },
          { actionName },
        ), // `退出${actionName}代码片段`
        content: formatMessage(
          {
            id: 'odc.component.SnippetForm.IfTheContentIsNot',
          },
          { actionName },
        ), // `存在未保存内容, 退出${actionName}代码片段`
        onOk() {
          self.props.onClose();
        },
      });
    } else {
      this.props.onClose();
    }
  };

  componentWillUnmount() {
    this.modal?.destroy();
  }

  handleSubmit = async () => {
    const { action, snippet } = this.props;
    this.formRef.current
      .validateFields()
      .then(async (values) => {
        let r;

        switch (action) {
          case EnumSnippetAction.CREATE:
            r = await snippetStore.createCustomerSnippet(values);

            if (r) {
              message.success(
                formatMessage(
                  {
                    id: 'odc.component.SnippetForm.SyntaxFragmentValuesprefixIsCreated',
                  },

                  { valuesPrefix: values.prefix },
                ),

                // `代码片段 ${values.prefix} 创建成功！`
              );
            }

            break;

          case EnumSnippetAction.EDIT:
            r = await snippetStore.updateCustomerSnippet({
              ...values,
              id: snippet.id,
            });

            if (r) {
              message.success(
                formatMessage(
                  {
                    id: 'odc.component.SnippetForm.TheSyntaxSnippetSnippetprefixHas',
                  },

                  { snippetPrefix: snippet.prefix },
                ),

                // `代码片段 ${snippet.prefix} 更新成功！`
              );
            }

            break;

          default:
            break;
        }

        if (r) {
          this.props.onClose(r);
        }
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  render() {
    const { action, snippet, visible } = this.props;

    if (!action) {
      return null;
    }

    const isMySQL = false;
    const actionItem = SNIPPET_ACTIONS.find((actionItem) => actionItem.key === action);
    const initialValues = {
      prefix: snippet?.prefix,
      snippetType: snippet?.snippetType || EnumSnippetType.NORMAL,
      description: snippet?.description,
      body: snippet?.body,
    };

    return (
      <Drawer
        title={
          formatMessage(
            {
              id: 'odc.component.SnippetForm.ActionitemnameSyntaxFragment',
            },

            { actionItemName: actionItem.name },
          )

          // `${actionItem.name}代码片段`
        }
        width={520}
        maskClosable={false}
        onClose={this.onClose}
        open={visible}
        bodyStyle={{
          paddingBottom: 80,
        }}
      >
        {!visible ? null : (
          <Form layout="vertical" hideRequiredMark initialValues={initialValues} ref={this.formRef}>
            <Form.Item
              name="prefix"
              label={formatMessage({ id: 'odc.component.SnippetForm.Syntax' })}
              /* 语法名称 */
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.component.SnippetForm.EnterASyntaxName',
                  }),
                  // 请填写语法名称
                },
                {
                  max: 60,
                  message: formatMessage({
                    id: 'odc.component.SnippetForm.TheSyntaxNameCannotExceed',
                  }),

                  // 语法名称不能超过 60 个字符
                },
                {
                  pattern: /^[a-zA-Z0-9_]+$/,
                  message: formatMessage({
                    id: 'odc.component.SnippetForm.TheSyntaxNameMustContain',
                  }),

                  // 语法名称为英文字母、数字、下划线组成
                },
              ]}
            >
              <Input
                placeholder={
                  formatMessage({
                    id: 'odc.component.SnippetForm.EnterASyntaxName',
                  })
                  // 请填写语法名称
                }
              />
            </Form.Item>
            <Form.Item
              name="snippetType"
              label={formatMessage({
                id: 'odc.component.SnippetForm.SyntaxType',
              })}
              /* 语法类型 */
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.component.SnippetForm.SelectASyntaxType',
                  }),
                  // 请选择语法类型
                },
              ]}
            >
              <Select
                placeholder={formatMessage({
                  id: 'odc.component.SnippetForm.SelectASyntaxType',
                })}
                /* 请选择语法类型 */
                style={{
                  width: '196px',
                }}
              >
                {SNIPPET_TYPES.filter((item) => item.key !== EnumSnippetType.ALL).map(
                  (snippetType) => (
                    <Option value={snippetType.key} key={snippetType.key}>
                      {snippetType.name}
                    </Option>
                  ),
                )}
              </Select>
            </Form.Item>
            <Form.Item
              label={formatMessage({
                id: 'odc.component.SnippetForm.Syntax.1',
              })}
              /* 代码片段 */
            >
              <div
                style={{
                  height: 340,
                  width: '100%',
                  border: '1px solid var(--odc-border-color)',
                }}
              >
                <EditorToolBar
                  loading={false}
                  ctx={this}
                  actionGroupKey="SNIPPET_CREATE_ACTION_GROUP"
                />
                <div
                  style={{
                    height: 300,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  <Form.Item
                    noStyle
                    name="body"
                    trigger="onValueChange"
                    rules={[
                      {
                        required: true,
                        message: formatMessage({
                          id: 'odc.component.SnippetForm.EnterASyntax',
                        }),
                        // 请输入语法
                      },
                      {
                        max: 2000,
                        message: formatMessage({
                          id: 'odc.component.SnippetForm.TheSyntaxCannotExceedCharacters',
                        }),

                        // 语法长度不能超过 2000 个字符
                      },
                    ]}
                  >
                    <MonacoEditor
                      defaultValue={snippet?.body}
                      language={isMySQL ? 'obmysql' : 'oboracle'}
                      onEditorCreated={(editor: IEditor) => {
                        this.editor = editor;
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
            </Form.Item>
            <Form.Item
              name="description"
              label={formatMessage({
                id: 'odc.component.SnippetForm.SyntaxDescription',
              })}
              /* 语法描述 */
              rules={[
                {
                  required: false,
                  message: formatMessage({
                    id: 'odc.component.SnippetForm.EnterASyntaxDescription',
                  }),

                  // 请输入语法描述
                },
                {
                  max: 200,
                  message: formatMessage({
                    id: 'odc.component.SnippetForm.TheSyntaxDescriptionCannotExceed',
                  }),

                  // 语法描述长度不能超过 200 个字符
                },
              ]}
            >
              <TextArea
                placeholder={formatMessage({
                  id: 'odc.component.SnippetForm.EnterASyntaxDescription',
                })}
                /* 请输入语法描述 */
                style={{
                  height: '120px',
                }}
              />
            </Form.Item>
            <div
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: '100%',
                borderTop: '1px solid var(--divider-color)',
                padding: '8px 16px',
                background: 'var(--background-secondry-color)',
                textAlign: 'right',
              }}
            >
              <Button
                onClick={this.onClose}
                style={{
                  marginRight: 8,
                }}
              >
                {
                  formatMessage({
                    id: 'odc.component.SnippetForm.Cancel',
                  })
                  /* 取消 */
                }
              </Button>
              <Button type="primary" onClick={this.handleSubmit}>
                {
                  formatMessage({
                    id: 'odc.component.SnippetForm.Determine',
                  })
                  /* 确定 */
                }
              </Button>
            </div>
          </Form>
        )}
      </Drawer>
    );
  }
}

export default SnippetFormDrawer;
