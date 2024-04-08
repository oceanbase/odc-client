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

import classNames from 'classnames';
import { useForm, useWatch } from 'antd/lib/form/Form';
import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Drawer,
  Space,
  Form,
  Input,
  Radio,
  Tabs,
  Checkbox,
  Descriptions,
  Modal,
  message,
  Select,
  InputNumber,
  Alert,
} from 'antd';
import CommonTable from '@/component/CommonTable';
import { IOperationOptionType, ITableLoadOptions } from '@/component/CommonTable/interface';
import FormItemPanel from '@/component/FormItemPanel';
import {
  editChannel,
  createChannel,
  deleteChannel,
  detailChannel,
  existsChannel,
  getChannelsList,
  testChannel,
} from '@/common/network/projectNotification';
import {
  EChannelType,
  ELanguage,
  EOverLimitStrategy,
  EOverLimitStrategyMap,
  EOverLimitStrategyTipMap,
  ETimeUnit,
  IChannel,
  IRateLimitConfig,
} from '@/d.ts/projectNotification';
import { IResponseData } from '@/d.ts';
import styles from './index.less';
import { formatMessage, getLocalDocs } from '@/util/intl';
import HelpDoc from '@/component/helpDoc';
import { getChannelColumns } from './columns';
import {
  EChannelTypeMap,
  EContentTemplateMap,
  ELanguageMap,
  TimeUnitMap,
  WebhookPlaceholderMap,
} from './interface';
import odc from '@/plugins/odc';
import { encrypt } from '@/util/utils';

const Channel: React.FC<{
  projectId: number;
}> = ({ projectId }) => {
  const tableRef = useRef<any>();

  const [selectedChannelId, setSelectedChannelId] = useState<number>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState<boolean>(false);
  const [formDrawerOpen, setFormDrawerOpen] = useState<boolean>(false);
  const [channelsList, setChannelsList] =
    useState<IResponseData<Omit<IChannel<EChannelType>, 'channelConfig'>>>();
  const loadChannels = async (args: ITableLoadOptions) => {
    const { filters, sorter, pagination, pageSize } = args ?? {};
    const { name, type } = filters ?? {};
    const { column, order } = sorter ?? {};
    const { current = 1 } = pagination ?? {};
    const data = {
      name,
      type,
      sort: column?.dataIndex,
      page: current,
      size: pageSize,
    };
    data.sort = column ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}` : undefined;
    const rawChannelsList = await getChannelsList(projectId, data);
    if (rawChannelsList) {
      setChannelsList(rawChannelsList);
    }
  };
  const handleDelete = (channelId: number) => {
    return Modal.confirm({
      title: formatMessage({ id: 'src.page.Project.Notification.components.C66FA7EF' }), //'确认要删除此通道吗？'
      content: formatMessage({ id: 'src.page.Project.Notification.components.C6EB2CE0' }), //'删除后，关联工单事件的消息推送将不再生效。'
      onOk: async () => {
        const result = await deleteChannel(projectId, channelId);
        if (result) {
          message.success(
            formatMessage({
              id: 'src.page.Project.Notification.components.00F5D0D6' /*'删除成功!'*/,
            }),
          );
          tableRef?.current?.reload?.();
          return;
        }
        message.error(
          formatMessage({ id: 'src.page.Project.Notification.components.FBB6B2D7' /*'删除失败'*/ }),
        );
      },
      onCancel: () => {},
    });
  };
  const handleChannelEdit = (channelId: number) => {
    setSelectedChannelId(channelId);
    setFormDrawerOpen(true);
  };
  const closedCallback = (needReload?: boolean) => {
    setSelectedChannelId(null);
    needReload && tableRef?.current?.reload();
  };

  const hanleOpenChannelDetailDrawer = (channel: Omit<IChannel<EChannelType>, 'channelConfig'>) => {
    setSelectedChannelId(channel?.id);
    setDetailDrawerOpen(true);
  };
  const operationOptions = [
    {
      type: IOperationOptionType.button,
      content: (
        <span>
          {
            formatMessage({
              id: 'src.page.Project.Notification.components.5909ABDC' /*新建推送通道*/,
            }) /* 新建推送通道 */
          }
        </span>
      ),
      isPrimary: true,
      onClick: () => {
        setFormDrawerOpen(true);
      },
    },
  ];

  const columns = getChannelColumns({
    handleDelete,
    handleChannelEdit,
    hanleOpenChannelDetailDrawer,
  });
  return (
    <div className={styles.common}>
      <FromChannelDrawer
        projectId={projectId}
        channelId={selectedChannelId}
        formDrawerOpen={formDrawerOpen}
        setFormDrawerOpen={setFormDrawerOpen}
        closedCallback={closedCallback}
      />

      <DetailChannelDrawer
        projectId={projectId}
        channelId={selectedChannelId}
        detailDrawerOpen={detailDrawerOpen}
        setDetailDrawerOpen={setDetailDrawerOpen}
      />

      <CommonTable
        key="ChannelCommonTable"
        ref={tableRef}
        titleContent={null}
        showToolbar={true}
        onLoad={loadChannels}
        onChange={loadChannels}
        operationContent={{ options: operationOptions }}
        tableProps={{
          columns,
          dataSource: channelsList?.contents || [],
          pagination: {
            current: channelsList?.page?.number,
            total: channelsList?.page?.totalElements,
          },
        }}
      />
    </div>
  );
};

const docUrlMap = {
  [EChannelType.DING_TALK]:
    'https://help.aliyun.com/zh/arms/alarm-operation-center/obtain-the-webhook-url-of-a-dingtalk-chatbot',
  [EChannelType.FEI_SHU]: 'https://open.feishu.cn/document/client-docs/bot-v3/add-custom-bot',
  [EChannelType.WE_COM]: 'https://help.aliyun.com/zh/arms/alarm-operation-center/wecom-chatbots',
  [EChannelType.WEBHOOK]: null,
};
type GetFinalSignParams = {
  channelId: number;
  hasChangeSign: boolean;
  sign: string;
};
type GetFinalSignFunc = (params: GetFinalSignParams) => string | null;
export const FromChannelDrawer: React.FC<{
  projectId: number;
  channelId?: number;
  formDrawerOpen: boolean;
  setFormDrawerOpen: (formDrawerOpen: boolean) => void;
  closedCallback?: (needReload?: boolean) => void;
}> = ({ projectId, channelId, formDrawerOpen, setFormDrawerOpen, closedCallback }) => {
  const [formRef] = useForm<IChannel<EChannelType>>();
  const type = useWatch('type', formRef);
  const sign = useWatch(['channelConfig', 'sign'], formRef);
  const isWebhook = type === EChannelType.WEBHOOK;
  const hasSign = [EChannelType.DING_TALK, EChannelType.FEI_SHU]?.includes(type);
  const hasAtMobiles = [EChannelType.DING_TALK, EChannelType.WE_COM]?.includes(type);
  const [currentChannel, setCurrentChannel] = useState<IChannel<EChannelType>>();
  const [hasChangeSign, setHasChangeSign] = useState<boolean>(false);
  const [hasEdit, setHasEdit] = useState<boolean>(false);
  const [testChannelSuccess, setTestChannelSuccess] = useState<boolean>(false);
  const [testChannelErrorMessage, setTestChannelErrorMessage] = useState<string>(null);
  const [testLoading, setTestLoading] = useState<boolean>(false);
  const tip = formatMessage({ id: 'src.page.Project.Notification.components.0963E13A' }); //`配置{"key":"value"}来验证json结构的返回结果，验证返回结果中包含配置中的所有key、value，则认为发送成功`
  const loadChannelDetail = async (channelId) => {
    const channel = await detailChannel(projectId, channelId);
    if (channel) {
      setCurrentChannel(channel);
      formRef?.setFieldsValue(channel);
      return;
    }
    message.error(
      formatMessage({
        id: 'src.page.Project.Notification.components.A2B52297' /*'加载通道数据失败'*/,
      }),
    );
  };
  const handleTestChannel = async () => {
    setTestChannelErrorMessage(null);
    const channel = await formRef.validateFields().catch();
    setTestLoading(true);
    if (type === EChannelType.DING_TALK || type === EChannelType.FEI_SHU) {
      // 加密后的密钥在编辑时显示为星号，只有用户主动点击修改，并且修改输入框中的内容时才会重新生成加密后的密钥。
      (channel as IChannel<EChannelType.FEI_SHU | EChannelType.DING_TALK>).channelConfig.sign =
        getFinalSign({
          channelId,
          hasChangeSign,
          sign,
        });
    }
    if (channelId) {
      channel.id = channelId;
    }
    const result = await testChannel(projectId, channel);
    if (result?.active) {
      setTestChannelSuccess(true);
      message.success(
        formatMessage({
          id: 'src.page.Project.Notification.components.A50DD7D6' /*'测试消息发送成功！'*/,
        }),
      );
    } else {
      setTestChannelSuccess(false);
      message.error(
        formatMessage({
          id: 'src.page.Project.Notification.components.494A6AA0' /*'测试消息发送失败！'*/,
        }),
      );
      setTestChannelErrorMessage(result?.errorMessage);
    }
    setTestLoading(false);
  };
  /**
   * 根据对应参数判断最终返回密钥表单项的值
   * @param param0
   * @returns string ｜ null
   */
  const getFinalSign: GetFinalSignFunc = ({ channelId, hasChangeSign, sign }) => {
    if (channelId) {
      // 编辑时内容未被修改返回null，已被修改则返回加密后的结果，未输入密钥时返回encrypt('')
      return hasChangeSign ? encrypt(sign ? sign : '') : null;
    } else {
      // 新建时 未输入密钥时返回encrypt('');
      return encrypt(sign ? sign : '');
    }
  };
  const handleFormDrawerClose = () => {
    if (hasEdit) {
      return Modal.confirm({
        centered: true,
        title: channelId
          ? formatMessage({ id: 'src.page.Project.Notification.components.1E5D8CF3' })
          : formatMessage({ id: 'src.page.Project.Notification.components.5ED12758' }),
        onOk: () => {
          setFormDrawerOpen(false);
        },
        onCancel: () => {},
      });
    }
    setFormDrawerOpen(false);
  };
  const handleFormDrawerSubmit = async () => {
    const result = await formRef.validateFields().catch();
    result.id ??= channelId;
    let data;
    // 只有飞书群和钉钉群机器人才有密钥
    if (type === EChannelType.DING_TALK || type === EChannelType.FEI_SHU) {
      // 加密后的密钥在编辑时显示为星号，只有用户主动点击修改，并且修改输入框中的内容时才会重新生成加密后的密钥。
      (result as IChannel<EChannelType.FEI_SHU | EChannelType.DING_TALK>).channelConfig.sign =
        getFinalSign({
          channelId,
          hasChangeSign,
          sign,
        });
    }
    if (channelId) {
      data = await editChannel(projectId, channelId, result);
    } else {
      data = await createChannel(projectId, result);
    }
    if (data) {
      message.success(
        channelId
          ? formatMessage({ id: 'src.page.Project.Notification.components.E4112EC6' })
          : formatMessage({ id: 'src.page.Project.Notification.components.A1ADE4ED' }),
      );
      setFormDrawerOpen(false);
      closedCallback?.(true);
      return;
    }
    message.error(
      channelId
        ? formatMessage({ id: 'src.page.Project.Notification.components.CD9CDC1F' })
        : formatMessage({ id: 'src.page.Project.Notification.components.562D512A' }),
    );
  };
  const handleFieldsChange = async (changedFields, allFields) => {
    if (changedFields?.[0]?.name?.join('') === 'description') {
      return;
    }
    setHasEdit(true);
    setTestChannelSuccess(false);
    if (changedFields?.[0]?.name?.join('') === ['channelConfig', 'language'].join('')) {
      const _language = formRef.getFieldValue(['channelConfig', 'language']) || ELanguage.ZH_CN;
      await formRef.setFieldValue(
        ['channelConfig', 'contentTemplate'],
        EContentTemplateMap?.[_language],
      );
    }
  };

  const checkNameRepeat = async (ruler, value) => {
    const name = value?.trim();
    if (!name || (channelId && currentChannel?.name === name)) {
      return;
    }
    const isRepeat = await existsChannel(projectId, name);
    if (isRepeat) {
      throw new Error();
    }
  };
  const modifySwitch = async () => {
    if (hasChangeSign) {
      setHasChangeSign(false);
      await formRef.setFieldValue(
        ['channelConfig', 'sign'],
        (currentChannel as IChannel<EChannelType.FEI_SHU | EChannelType.DING_TALK>)?.channelConfig
          ?.sign,
      );
    } else {
      setHasChangeSign(true);
      await formRef.resetFields([['channelConfig', 'sign']]);
    }
  };

  useEffect(() => {
    if (formDrawerOpen && channelId) {
      loadChannelDetail(channelId);
    } else {
      // 关闭后统一处理数据
      formRef?.resetFields();
      setCurrentChannel(null);
      setHasChangeSign(false);
      setHasEdit(false);
      setTestChannelErrorMessage(null);
      setTestChannelSuccess(false);
      setTestLoading(false);
      closedCallback?.();
    }
  }, [formDrawerOpen]);
  return (
    <Drawer
      open={formDrawerOpen}
      destroyOnClose
      closable
      title={
        channelId
          ? formatMessage({ id: 'src.page.Project.Notification.components.086256DF' })
          : formatMessage({ id: 'src.page.Project.Notification.components.9A35D4DD' })
      }
      width={520}
      onClose={handleFormDrawerClose}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Button onClick={handleFormDrawerClose}>
              {
                formatMessage({
                  id: 'src.page.Project.Notification.components.BA80DE5A' /*取消*/,
                }) /* 取消 */
              }
            </Button>
            <Button onClick={handleTestChannel} loading={testLoading}>
              {
                formatMessage({
                  id: 'src.page.Project.Notification.components.0ED8B37C' /*发送测试消息*/,
                }) /* 发送测试消息 */
              }
            </Button>
            <Button disabled={!testChannelSuccess} type="primary" onClick={handleFormDrawerSubmit}>
              {channelId
                ? formatMessage({ id: 'src.page.Project.Notification.components.F21F4A25' })
                : formatMessage({ id: 'src.page.Project.Notification.components.3FA9FBAE' })}
            </Button>
          </Space>
        </div>
      }
    >
      {testChannelErrorMessage && (
        <Alert
          type="error"
          showIcon
          message={testChannelErrorMessage}
          closable
          style={{ marginBottom: '8px' }}
        />
      )}

      <Form
        form={formRef}
        layout="vertical"
        onFieldsChange={handleFieldsChange}
        initialValues={
          !channelId && {
            type: EChannelType.DING_TALK,
            channelConfig: {
              httpMethod: 'POST',
              language: ELanguage.ZH_CN,
              contentTemplate: EContentTemplateMap[ELanguage.ZH_CN],
              rateLimitConfig: null,
              atMobiles: [],
            },
          }
        }
      >
        <Form.Item
          label={
            formatMessage({
              id: 'src.page.Project.Notification.components.E6860CB3',
            }) /*"通道名称"*/
          }
          name="name"
          requiredMark="optional"
          validateTrigger="onBlur"
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'src.page.Project.Notification.components.2E3BEDFA' }), //'请输入'
            },
            {
              message: formatMessage({ id: 'src.page.Project.Notification.components.CA33D8AB' }), //'通道名称已存在'
              validator: checkNameRepeat,
            },
          ]}
        >
          <Input
            placeholder={
              formatMessage({
                id: 'src.page.Project.Notification.components.4E72988A',
              }) /*"请输入通道名称"*/
            }
          />
        </Form.Item>
        <Form.Item
          label={
            formatMessage({
              id: 'src.page.Project.Notification.components.6A1DF023',
            }) /*"通道类型"*/
          }
          name="type"
          requiredMark="optional"
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'src.page.Project.Notification.components.7C80562E' }), //'请选择通道类型'
            },
          ]}
        >
          <Radio.Group defaultValue={EChannelType.DING_TALK}>
            <Radio.Button value={EChannelType.DING_TALK}>
              {EChannelTypeMap[EChannelType.DING_TALK]}
            </Radio.Button>
            <Radio.Button value={EChannelType.FEI_SHU}>
              {EChannelTypeMap[EChannelType.FEI_SHU]}
            </Radio.Button>
            <Radio.Button value={EChannelType.WE_COM}>
              {EChannelTypeMap[EChannelType.WE_COM]}
            </Radio.Button>
            <Radio.Button value={EChannelType.WEBHOOK}>
              {EChannelTypeMap[EChannelType.WEBHOOK]}
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="channelConfig">
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              return (
                <>
                  <Form.Item
                    label={
                      <Space>
                        <div>
                          {
                            formatMessage({
                              id: 'src.page.Project.Notification.components.D55443F5' /*Webhook 地址*/,
                            }) /* Webhook 地址 */
                          }
                        </div>
                        {docUrlMap?.[type] && (
                          <a
                            href={docUrlMap[type]}
                            target={'_blank'}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            rel="noreferrer"
                          >
                            {
                              formatMessage({
                                id: 'src.page.Project.Notification.components.E5532E71' /*如何配置*/,
                              }) /* 如何配置 */
                            }
                          </a>
                        )}
                      </Space>
                    }
                    name={['channelConfig', 'webhook']}
                    requiredMark="optional"
                    validateTrigger="onBlur"
                    rules={[
                      {
                        required: true,
                        message: formatMessage({
                          id: 'src.page.Project.Notification.components.982731E2',
                        }), //'请输入'
                      },
                    ]}
                  >
                    <Input placeholder={WebhookPlaceholderMap?.[type]} />
                  </Form.Item>
                  {hasSign ? (
                    <>
                      <Form.Item
                        label={
                          formatMessage({
                            id: 'src.page.Project.Notification.components.BE20D900',
                          }) /*"签名密钥"*/
                        }
                        name={['channelConfig', 'sign']}
                        requiredMark="optional"
                      >
                        <Input
                          placeholder={
                            formatMessage({
                              id: 'src.page.Project.Notification.components.A3866291',
                            }) /*"若开启签名校验，请输入密钥"*/
                          }
                          type="password"
                          disabled={channelId && !hasChangeSign}
                        />
                      </Form.Item>
                      {channelId && (
                        <a className={styles?.modifyBtn} onClick={modifySwitch}>
                          {hasChangeSign
                            ? formatMessage({
                                id: 'src.page.Project.Notification.components.042EAFE9',
                              })
                            : formatMessage({
                                id: 'src.page.Project.Notification.components.2EE5076E',
                              })}
                        </a>
                      )}
                    </>
                  ) : null}
                  {isWebhook ? (
                    <Form.Item noStyle shouldUpdate>
                      <Form.Item
                        label={
                          formatMessage({
                            id: 'src.page.Project.Notification.components.8062E4B6',
                          }) /*"代理"*/
                        }
                        requiredMark="optional"
                        name={['channelConfig', 'httpProxy']}
                      >
                        <Input
                          placeholder={
                            formatMessage({
                              id: 'src.page.Project.Notification.components.753E4F73',
                            }) /*"请输入"*/
                          }
                        />
                      </Form.Item>
                      <Form.Item
                        label={
                          formatMessage({
                            id: 'src.page.Project.Notification.components.DFE43F9E',
                          }) /*"请求方法"*/
                        }
                        name={['channelConfig', 'httpMethod']}
                      >
                        <Radio.Group>
                          <Radio value="POST">POST</Radio>
                          <Radio value="GET">GET</Radio>
                          <Radio value="PUT">PUT</Radio>
                        </Radio.Group>
                      </Form.Item>
                      <Form.Item
                        label="Header"
                        requiredMark="optional"
                        name={['channelConfig', 'headersTemplate']}
                      >
                        <Input.TextArea
                          placeholder={
                            formatMessage({
                              id: 'src.page.Project.Notification.components.B318E408',
                            }) /*"请输入header，赞不支持模版，为空表示不使用header参数，多个header的格式为key1:value1; key2: value2"*/
                          }
                          rows={4}
                        />
                      </Form.Item>
                      <Form.Item
                        label="Body"
                        requiredMark="optional"
                        name={['channelConfig', 'bodyTemplate']}
                      >
                        <Input.TextArea
                          placeholder={
                            formatMessage({
                              id: 'src.page.Project.Notification.components.130EA25D',
                            }) /*"请输入body模版，可通过输入$(message)引用通知消息，为空表示不使用HTTP body"*/
                          }
                          rows={4}
                        />
                      </Form.Item>
                      <Form.Item
                        label={
                          formatMessage({
                            id: 'src.page.Project.Notification.components.A1BCCE0E',
                          }) /*"Response校验"*/
                        }
                        required
                        requiredMark="optional"
                      >
                        <Form.Item noStyle name={['channelConfig', 'responseValidation']}>
                          <Input.TextArea
                            placeholder={
                              formatMessage({
                                id: 'src.page.Project.Notification.components.C752DB2D',
                              }) /*"请输入"*/
                            }
                            rows={4}
                          />
                        </Form.Item>
                        <div className={styles.tip}>{tip}</div>
                      </Form.Item>
                    </Form.Item>
                  ) : null}
                  {hasAtMobiles ? (
                    <Form.Item
                      label={
                        formatMessage({
                          id: 'src.page.Project.Notification.components.3B557A1D',
                        }) /*"指定用户"*/
                      }
                      name={['channelConfig', 'atMobiles']}
                      requiredMark="optional"
                    >
                      <Select
                        mode="tags"
                        placeholder={
                          formatMessage({
                            id: 'src.page.Project.Notification.components.8CA4B168',
                          }) /*"请输入用户手机号"*/
                        }
                      />
                    </Form.Item>
                  ) : null}
                </>
              );
            }}
          </Form.Item>
          <Form.Item
            label={
              formatMessage({
                id: 'src.page.Project.Notification.components.099A08A2',
              }) /*"推送消息模版"*/
            }
            style={{
              marginBottom: '1px',
            }}
          >
            <Form.Item
              name={['channelConfig', 'language']}
              requiredMark="optional"
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'src.page.Project.Notification.components.EA00E8BD',
                  }), //'请选择通道类型'
                },
              ]}
              style={{
                marginBottom: '8px',
              }}
            >
              <LangagueTab />
            </Form.Item>
            <Form.Item>
              <Form.Item
                noStyle
                shouldUpdate
                name={['channelConfig', 'contentTemplate']}
                requiredMark="optional"
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'src.page.Project.Notification.components.87BD7057',
                    }), //'消息模版不能为空'
                  },
                ]}
              >
                <Input.TextArea
                  rows={5}
                  maxLength={200}
                  placeholder={
                    formatMessage({
                      id: 'src.page.Project.Notification.components.16067FAA',
                    }) /*"请输入消息模版"*/
                  }
                />
              </Form.Item>
              <div>
                <span style={{ color: 'var(--neutral-black45-color)' }}>
                  {formatMessage({ id: 'src.page.Project.Notification.components.D0CF8521' })}
                </span>
                <a
                  href={odc.appConfig?.docs?.url || getLocalDocs('1000.message-notification.html')}
                  target={'_blank'}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  rel="noreferrer"
                >
                  {
                    formatMessage({
                      id: 'src.page.Project.Notification.components.E3748BB5' /*查看标签说明*/,
                    }) /* 查看标签说明 */
                  }
                </a>
              </div>
            </Form.Item>
          </Form.Item>
          <Form.Item
            label={
              formatMessage({
                id: 'src.page.Project.Notification.components.ACDD499F',
              }) /*"消息限流设置"*/
            }
          >
            <FormItemPanel keepExpand noPaddingBottom>
              <Form.Item name={['channelConfig', 'rateLimitConfig']} shouldUpdate>
                <CheckboxWithTip />
              </Form.Item>
            </FormItemPanel>
          </Form.Item>

          <Form.Item
            label={
              formatMessage({ id: 'src.page.Project.Notification.components.9AD8F3D8' }) /*"描述"*/
            }
            name="description"
            requiredMark="optional"
          >
            <Input.TextArea
              maxLength={200}
              rows={6}
              placeholder={
                formatMessage({
                  id: 'src.page.Project.Notification.components.DC9065DF',
                }) /*"请输入描述，200字以内"*/
              }
            />
          </Form.Item>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export const DetailChannelDrawer: React.FC<{
  projectId: number;
  channelId: number;
  detailDrawerOpen: boolean;
  setDetailDrawerOpen: (oepn: boolean) => void;
}> = ({ projectId, channelId, detailDrawerOpen, setDetailDrawerOpen }) => {
  const [channel, setChannel] = useState<IChannel<EChannelType>>();
  const handleOnClose = () => {
    setDetailDrawerOpen(false);
  };
  const loadChannelDetail = async (channelId) => {
    const channel = await detailChannel(projectId, channelId);
    if (channel) {
      setChannel(channel);
    }
  };
  useEffect(() => {
    if (detailDrawerOpen) {
      loadChannelDetail(channelId);
    } else {
      setChannel(null);
    }
  }, [detailDrawerOpen]);
  function parseRateLimitConfigToText(rateLimitConfig: IRateLimitConfig) {
    const timeUnitText = TimeUnitMap?.[rateLimitConfig?.timeUnit];
    const rateLimitConfigLimit = rateLimitConfig?.limit;
    let result =
      timeUnitText +
      formatMessage(
        { id: 'src.page.Project.Notification.components.EE8B3451' },
        { rateLimitConfigLimit: rateLimitConfigLimit },
      ); //`不超过${rateLimitConfigLimit}次`
    return result;
  }
  const isWebhook = channel?.type === EChannelType.WEBHOOK;
  const hasSign = [EChannelType.DING_TALK, EChannelType.FEI_SHU]?.includes(channel?.type);
  const hasAtMobiles = [EChannelType.DING_TALK, EChannelType.WE_COM]?.includes(channel?.type);
  return (
    <Drawer
      title={
        formatMessage({
          id: 'src.page.Project.Notification.components.139882C5',
        }) /*"推送通道详情"*/
      }
      width={520}
      open={detailDrawerOpen}
      closable
      onClose={handleOnClose}
    >
      <Descriptions column={1}>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.page.Project.Notification.components.82FB9375',
            }) /*"通道名称"*/
          }
        >
          {channel?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.page.Project.Notification.components.6CDFEC70',
            }) /*"通道类型"*/
          }
        >
          {EChannelTypeMap?.[channel?.type] || '-'}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.page.Project.Notification.components.F40AD99E',
            }) /*"Webhook地址"*/
          }
        >
          {channel?.channelConfig?.webhook || '-'}
        </Descriptions.Item>
        {hasSign && (
          <Descriptions.Item
            label={
              formatMessage({
                id: 'src.page.Project.Notification.components.1D7A027D',
              }) /*"签名密钥"*/
            }
          >
            {(channel as IChannel<EChannelType.DING_TALK | EChannelType.FEI_SHU>)?.channelConfig
              ?.sign || '-'}
          </Descriptions.Item>
        )}

        {hasAtMobiles && (
          <Descriptions.Item
            label={
              formatMessage({
                id: 'src.page.Project.Notification.components.2DFCA81C',
              }) /*"指定用户"*/
            }
          >
            {(
              channel as IChannel<EChannelType.DING_TALK | EChannelType.WE_COM>
            )?.channelConfig?.atMobiles?.join('、') || '-'}
          </Descriptions.Item>
        )}

        {isWebhook && (
          <>
            <Descriptions.Item
              label={
                formatMessage({
                  id: 'src.page.Project.Notification.components.2724965A',
                }) /*"代理"*/
              }
            >
              {(channel as IChannel<EChannelType.WEBHOOK>)?.channelConfig?.httpProxy || '-'}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                formatMessage({
                  id: 'src.page.Project.Notification.components.95A710C5',
                }) /*"请求方法"*/
              }
            >
              {(channel as IChannel<EChannelType.WEBHOOK>)?.channelConfig?.httpMethod || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Header">
              {(channel as IChannel<EChannelType.WEBHOOK>)?.channelConfig?.headersTemplate || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Body">
              {(channel as IChannel<EChannelType.WEBHOOK>)?.channelConfig?.bodyTemplate || '-'}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                formatMessage({
                  id: 'src.page.Project.Notification.components.E00F566E',
                }) /*"Response校验"*/
              }
            >
              {(channel as IChannel<EChannelType.WEBHOOK>)?.channelConfig?.responseValidation ||
                '-'}
            </Descriptions.Item>
          </>
        )}

        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.page.Project.Notification.components.8B494D6C',
            }) /*"消息限流设置"*/
          }
        >
          {channel?.channelConfig?.rateLimitConfig
            ? parseRateLimitConfigToText(channel?.channelConfig?.rateLimitConfig)
            : '-'}
        </Descriptions.Item>
        {channel?.channelConfig?.rateLimitConfig?.overLimitStrategy && (
          <Descriptions.Item
            label={formatMessage({ id: 'src.page.Project.Notification.components.C91AC4BD' })}
          >
            <HelpDoc
              isTip
              leftText
              title={
                EOverLimitStrategyTipMap?.[
                  channel?.channelConfig?.rateLimitConfig?.overLimitStrategy
                ]
              }
            >
              {EOverLimitStrategyMap?.[channel?.channelConfig?.rateLimitConfig?.overLimitStrategy]}
            </HelpDoc>
          </Descriptions.Item>
        )}

        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.page.Project.Notification.components.A78D1371',
            }) /*"消息模版"*/
          }
        >
          {ELanguageMap?.[channel?.channelConfig?.language] || '-'}
        </Descriptions.Item>
      </Descriptions>
      <pre
        style={{
          borderRadius: '2px',
          backgroundColor: '#F7F9FB',
          padding: '8px 12px',
        }}
      >
        {channel?.channelConfig?.contentTemplate || '-'}
      </pre>
      <Descriptions column={1}>
        <Descriptions.Item
          label={
            formatMessage({ id: 'src.page.Project.Notification.components.DCC955A7' }) /*"描述"*/
          }
        >
          {channel?.description || '-'}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

const CheckboxWithTip: React.FC<{
  value?: IRateLimitConfig;
  onChange?: (v: any) => void;
}> = ({ value, onChange }) => {
  const [checked, setChecked] = useState<boolean>(Boolean(value));
  const handleCheckboxOnChange = () => {
    onChange(
      !checked
        ? {
            timeUnit: ETimeUnit.MINUTES,
            limit: 20,
            overLimitStrategy: EOverLimitStrategy.THROWN,
          }
        : null,
    );
    setChecked(!checked);
  };
  useEffect(() => {
    setChecked(Boolean(value));
  }, [value]);
  return (
    <div className={styles.rateLimitConfig}>
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) => {
          const rateLimitConfig = getFieldValue(['channelConfig', 'rateLimitConfig']);
          return (
            <div
              className={classNames({
                [styles.rateLimitConfigBottom]: !checked,
              })}
            >
              <Checkbox checked={checked} onChange={() => handleCheckboxOnChange()}>
                <span style={{ userSelect: 'none' }}>
                  {
                    formatMessage({
                      id: 'src.page.Project.Notification.components.DD7AFBF7' /*使用消息限流*/,
                    }) /* 使用消息限流 */
                  }
                </span>
              </Checkbox>
              <div className={classNames(styles.rateLimitConfigTip)}>
                {rateLimitConfig
                  ? formatMessage({ id: 'src.page.Project.Notification.components.6A310F2D' })
                  : formatMessage({ id: 'src.page.Project.Notification.components.ED0EC433' })}
              </div>
              {rateLimitConfig ? (
                <Form.Item noStyle shouldUpdate>
                  <Form.Item
                    label={
                      formatMessage({
                        id: 'src.page.Project.Notification.components.E773F39A',
                      }) /*"消息次数限制"*/
                    }
                    style={{
                      marginTop: '16px',
                    }}
                  >
                    <Space>
                      <Form.Item name={['channelConfig', 'rateLimitConfig', 'timeUnit']}>
                        <Select
                          style={{ width: '135px' }}
                          options={[
                            {
                              label: TimeUnitMap[ETimeUnit.DAYS],
                              value: ETimeUnit.DAYS,
                            },
                            {
                              label: TimeUnitMap[ETimeUnit.HOURS],
                              value: ETimeUnit.HOURS,
                            },
                            {
                              label: TimeUnitMap[ETimeUnit.MINUTES],
                              value: ETimeUnit.MINUTES,
                            },
                          ]}
                        />
                      </Form.Item>
                      <Form.Item name={['channelConfig', 'rateLimitConfig', 'limit']}>
                        <InputNumber
                          addonBefore={
                            formatMessage({
                              id: 'src.page.Project.Notification.components.713896D2',
                            }) /*"不超过"*/
                          }
                          style={{ width: '145px' }}
                          min={1}
                          addonAfter={
                            formatMessage({
                              id: 'src.page.Project.Notification.components.90C16E2F',
                            }) /*"次"*/
                          }
                        />
                      </Form.Item>
                    </Space>
                  </Form.Item>
                  <Form.Item
                    label={
                      formatMessage({
                        id: 'src.page.Project.Notification.components.0785D0CB',
                      }) /*"超出限流处理策略"*/
                    }
                    name={['channelConfig', 'rateLimitConfig', 'overLimitStrategy']}
                    style={{
                      marginBottom: '8px',
                    }}
                  >
                    <Radio.Group>
                      <Radio value={EOverLimitStrategy.THROWN}>
                        <HelpDoc
                          isTip
                          leftText
                          title={EOverLimitStrategyTipMap?.[EOverLimitStrategy.THROWN]}
                        >
                          {EOverLimitStrategyMap?.[EOverLimitStrategy.THROWN]}
                        </HelpDoc>
                      </Radio>
                      <Radio value={EOverLimitStrategy.RESEND}>
                        <HelpDoc
                          isTip
                          leftText
                          title={EOverLimitStrategyTipMap?.[EOverLimitStrategy.RESEND]}
                        >
                          {EOverLimitStrategyMap?.[EOverLimitStrategy.RESEND]}
                        </HelpDoc>
                      </Radio>
                    </Radio.Group>
                  </Form.Item>
                </Form.Item>
              ) : null}
            </div>
          );
        }}
      </Form.Item>
    </div>
  );
};
const LangagueTab: React.FC<{
  value?: ELanguage;
  onChange?: (v: any) => void;
}> = ({ value, onChange }) => {
  const [tabKey, setTabKey] = useState<ELanguage>(value);
  const handleTabActiveKeyOnChange = (activeKey: ELanguage) => {
    setTabKey(activeKey);
    onChange(activeKey);
  };
  useEffect(() => {
    setTabKey(value);
  }, [value]);
  const items = [
    {
      label: ELanguageMap[ELanguage.ZH_CN],
      key: ELanguage.ZH_CN,
      children: null,
    },
    {
      label: ELanguageMap[ELanguage.ZH_TW],
      key: ELanguage.ZH_TW,
      children: null,
    },
    {
      label: ELanguageMap[ELanguage.EN_US],
      key: ELanguage.EN_US,
      children: null,
    },
  ];

  return (
    <Tabs
      activeKey={tabKey}
      onTabClick={(key) => handleTabActiveKeyOnChange(key as ELanguage)}
      type="card"
      size="small"
      items={items}
      className={styles.langagueTab}
    />
  );
};
export default Channel;
