import classNames from 'classnames';
import { useForm } from 'antd/lib/form/Form';
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
  ETimeUnit,
  IChannel,
  IRateLimitConfig,
} from '@/d.ts/projectNotification';
import { IResponseData } from '@/d.ts';
import styles from './index.less';
import { formatMessage } from '@/util/intl';
import HelpDoc from '@/component/helpDoc';
import { getChannelColumns } from './columns';
import { EChannelTypeMap, TimeUnitMap } from './interface';

const Channel: React.FC<{
  projectId: number;
}> = ({ projectId }) => {
  const tableRef = useRef<any>();

  const [selectedChannelId, setSelectedChannelId] = useState<number>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState<boolean>(false);
  const [formDrawerOpen, setFormDrawerOpen] = useState<boolean>(false);
  const [channelsList, setChannelsList] = useState<
    IResponseData<Omit<IChannel, 'channelConfig'>>
  >();
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
      title: '确认要删除此通道吗？',
      content: '删除后，关联工单事件的消息推送将不再生效。',
      onOk: async () => {
        const result = await deleteChannel(projectId, channelId);
        if (result) {
          message.success('删除成功!');
          tableRef?.current?.reload?.();
        } else {
          message.error('删除失败');
        }
      },
      onCancel: () => {},
    });
  };
  const handleChannelEdit = (channelId: number) => {
    setSelectedChannelId(channelId);
    setFormDrawerOpen(true);
  };
  const closedCallback = () => {
    selectedChannelId && setSelectedChannelId(null);
    tableRef?.current?.reload();
  };

  const hanleOpenChannelDetailDrawer = (channel: Omit<IChannel, 'channelConfig'>) => {
    setSelectedChannelId(channel?.id);
    setDetailDrawerOpen(true);
  };
  const operationOptions = [
    {
      type: IOperationOptionType.button,
      content: <span>新建通道</span>,
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

export const FromChannelDrawer: React.FC<{
  projectId: number;
  channelId?: number;
  formDrawerOpen: boolean;
  setFormDrawerOpen: (formDrawerOpen: boolean) => void;
  closedCallback?: () => void;
}> = ({ projectId, channelId, formDrawerOpen, setFormDrawerOpen, closedCallback }) => {
  const [formRef] = useForm<IChannel>();
  const [currentChannel, setCurrentChannel] = useState<IChannel>();
  const [hasEdit, setHasEdit] = useState<boolean>(false);
  const [testChannelSuccess, setTestChannelSuccess] = useState<boolean>(false);
  const [testChannelErrorMessage, setTestChannelErrorMessage] = useState<string>(null);
  const [testLoading, setTestLoading] = useState<boolean>(false);
  const loadChannelDetail = async (channelId) => {
    const channel = await detailChannel(projectId, channelId);
    if (channel) {
      setCurrentChannel(channel);
      formRef?.setFieldsValue(channel);
      return;
    }
    message.error('加载通道数据失败');
  };
  const handleTestChannel = async () => {
    setTestChannelErrorMessage(null);
    const channel = await formRef.validateFields().catch();
    setTestLoading(true);
    const result = await testChannel(projectId, channel);
    if (result?.active) {
      setTestChannelSuccess(true);
      message.success('测试消息发送成功！');
    } else {
      setTestChannelSuccess(false);
      message.success('测试消息发送失败！');
      setTestChannelErrorMessage(result?.errorMessage);
    }
    setTestLoading(false);
  };
  const handleFormDrawerClose = () => {
    if (hasEdit) {
      return Modal.confirm({
        centered: true,
        title: channelId ? '确认关闭编辑通道？' : '确认关闭新建通道？',
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
    if (channelId) {
      data = await editChannel(projectId, channelId, result);
    } else {
      data = await createChannel(projectId, result);
    }
    if (data) {
      message.success(channelId ? '保存成功' : '新建成功');
      setFormDrawerOpen(false);
      closedCallback?.();
      return;
    }
    message.success(channelId ? '保存失败' : '新建失败');
  };
  const handleFieldsChange = () => {
    setHasEdit(true);
    setTestChannelSuccess(false);
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

  useEffect(() => {
    if (formDrawerOpen && channelId) {
      loadChannelDetail(channelId);
    } else {
      // 关闭后统一处理数据
      formRef?.resetFields();
      setCurrentChannel(null);
      setHasEdit(false);
      setTestChannelErrorMessage(null);
      setTestChannelSuccess(false);
      setTestLoading(false);
    }
  }, [formDrawerOpen, channelId]);
  return (
    <Drawer
      open={formDrawerOpen}
      destroyOnClose
      closable
      title={channelId ? '编辑通道' : '新建通道'}
      width={520}
      onClose={handleFormDrawerClose}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Button onClick={handleFormDrawerClose}>取消</Button>
            <Button onClick={handleTestChannel} loading={testLoading}>
              发送测试消息
            </Button>
            <Button disabled={!testChannelSuccess} type="primary" onClick={handleFormDrawerSubmit}>
              {channelId ? '保存' : '新建'}
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
              language: ELanguage.ZH_CN,
              rateLimitConfig: null,
              atMobiles: [],
            },
          }
        }
      >
        <Form.Item
          label="通道名称"
          name="name"
          requiredMark="optional"
          validateTrigger="onBlur"
          rules={[
            {
              required: true,
              message: '通道名称不能为空',
            },
            {
              message: '通道名称已存在',
              validator: checkNameRepeat,
            },
          ]}
        >
          <Input placeholder="请输入通道名称" />
        </Form.Item>
        <Form.Item
          label="通道类型"
          name="type"
          requiredMark="optional"
          rules={[
            {
              required: true,
              message: '请选择通道类型',
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
          <Form.Item
            label="Webhook 地址"
            name={['channelConfig', 'webhook']}
            requiredMark="optional"
            validateTrigger="onBlur"
            rules={[
              {
                required: true,
                message: '通道名称不能为空',
              },
            ]}
          >
            <Input placeholder="请输入钉钉群机器人 Webhook 地址" />
          </Form.Item>
          <Form.Item label="签名密钥" name={['channelConfig', 'sign']} requiredMark="optional">
            <Input placeholder="若开启签名校验，请输入密钥" />
          </Form.Item>
          <Form.Item label="指定用户" name={['channelConfig', 'atMobiles']} requiredMark="optional">
            <Select mode="tags" placeholder="请输入用户手机号" />
          </Form.Item>
          <Form.Item label="推送消息模版">
            <Form.Item
              name={['channelConfig', 'language']}
              requiredMark="optional"
              rules={[
                {
                  required: true,
                  message: '请选择通道类型',
                },
              ]}
              style={{
                marginBottom: '8px',
              }}
            >
              <LangagueTab />
            </Form.Item>
            <Form.Item
              name={['channelConfig', 'contentTemplate']}
              requiredMark="optional"
              rules={[
                {
                  required: true,
                  message: '消息模版不能为空',
                },
              ]}
            >
              <Input.TextArea rows={5} maxLength={200} placeholder="请输入消息模版" />
            </Form.Item>
          </Form.Item>
          <FormItemPanel keepExpand noPaddingBottom>
            <Form.Item
              label="消息限流设置"
              name={['channelConfig', 'rateLimitConfig']}
              shouldUpdate
            >
              <CheckboxWithTip />
            </Form.Item>
          </FormItemPanel>
          <Form.Item label="描述" name="description" requiredMark="optional">
            <Input.TextArea maxLength={200} rows={6} placeholder="请输入描述，200字以内" />
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
  const [channel, setChannel] = useState<IChannel>();
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
    let result = `${timeUnitText}不超过${rateLimitConfig?.limit}次`;
    return result;
  }
  return (
    <Drawer
      title="推送通道详情"
      width={520}
      open={detailDrawerOpen}
      closable
      onClose={handleOnClose}
    >
      <Descriptions column={1}>
        <Descriptions.Item label="通道名称">{channel?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="通道类型">
          {EChannelTypeMap?.[channel?.type] || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Webhook地址">
          {channel?.channelConfig?.webhook || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="签名密钥">
          {channel?.channelConfig?.sign || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="指定用户">
          {channel?.channelConfig?.atMobiles?.join('、') || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="消息限流设置">
          {channel?.channelConfig?.rateLimitConfig
            ? parseRateLimitConfigToText(channel?.channelConfig?.rateLimitConfig)
            : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="描述">{channel?.description || '-'}</Descriptions.Item>
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
            timeUnit: ETimeUnit.DAYS,
            limit: 1,
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
                <span style={{ userSelect: 'none' }}>使用消息限流</span>
              </Checkbox>
              <div className={classNames(styles.rateLimitConfigTip)}>
                {rateLimitConfig
                  ? '使用消息限流，可在规定时间内接收消息，避免忽略重要消息'
                  : '不使用消息限流，短时间内可能会收到过多消息，导致重要消息淹没'}
              </div>
              {rateLimitConfig ? (
                <Form.Item noStyle shouldUpdate>
                  <Form.Item label="消息次数限制">
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
                          addonBefore="不超过"
                          style={{ width: '145px' }}
                          addonAfter="次"
                        />
                      </Form.Item>
                    </Space>
                  </Form.Item>

                  <Form.Item
                    label="超出限流处理策略"
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
                          title={formatMessage({
                            id:
                              'odc.src.component.ProcedureParam.DetermineWhetherTheFunctionProduces',
                          })}
                        >
                          忽略
                        </HelpDoc>
                      </Radio>
                      <Radio value={EOverLimitStrategy.RESEND}>
                        <HelpDoc
                          isTip
                          leftText
                          title={formatMessage({
                            id:
                              'odc.src.component.ProcedureParam.DetermineWhetherTheFunctionProduces',
                          })}
                        >
                          重发
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
      label: '中文',
      key: ELanguage.ZH_CN,
      children: null,
    },
    {
      label: '繁体中文',
      key: ELanguage.ZH_TW,
      children: null,
    },
    {
      label: '英文',
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
