import {
  createAutoRule,
  getAutoRule,
  getAutoRuleEventList,
  geteAutoRuleExists,
  getPublicConnectionList,
  getRoleList,
  updateAutoRule,
} from '@/common/network/manager';
import { IResourceOption, ResourceSelector } from '@/component/Manage/ResourceSelector';
import appConfig from '@/constant/appConfig';
import type { IAutoAuthRule, IManagerPublicConnection, IManagerResourceGroup } from '@/d.ts';
import { IManagerResourceType, IManagerRole } from '@/d.ts';
import { formatMessage, getLocalDocs } from '@/util/intl';
import { validTrimEmptyWithWarn } from '@/util/valid';
import { QuestionCircleOutlined } from '@ant-design/icons';
import type { RadioChangeEvent } from 'antd';
import {
  Button,
  Checkbox,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Select,
  Space,
  Tooltip,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import React, { useEffect, useState } from 'react';
import ConditionSelect from './conditionSelect';
import styles from './index.less';

export const connectionAccessTypeOptions = [
  {
    label: '数据源',
    value: IManagerResourceType.public_connection,
  },
];

export const connectionAccessActionOptions = [
  {
    label: formatMessage({ id: 'odc.components.FormAutoAuthModal.ReadOnly' }), //只读
    value: 'readonlyconnect',
  },
  {
    label: formatMessage({ id: 'odc.components.FormAutoAuthModal.ReadWrite' }), //读写
    value: 'connect',
  },
  {
    label: formatMessage({ id: 'odc.components.FormAutoAuthModal.CanApply' }), //可申请
    value: 'apply',
  },
];

interface IProps {
  visible: boolean;
  editId?: number;
  onClose: () => void;
  handleStatusChange?: (
    status: boolean,
    resourceGroup: IAutoAuthRule,
    callback: () => void,
  ) => void;
  reloadData?: () => void;
}

type IAutoAuthRuleFormData = IAutoAuthRule;

export interface IOption {
  label: string;
  value: string | number;
}

const getResourceOptions = (data: IManagerPublicConnection[] | IManagerResourceGroup[]) => {
  return (
    data?.map(({ id, name, ...rest }) => ({
      ...rest,
      resourceId: id,
      name,
    })) ?? []
  );
};

const FormModal: React.FC<IProps> = (props) => {
  const { visible, editId } = props;
  const [hasChange, setHasChange] = useState(false);
  const [dataSource, setDataSource] = useState<IManagerPublicConnection[]>([]);
  const [roles, setRoles] = useState<IManagerRole[]>([]);
  const [data, setData] = useState<Partial<IAutoAuthRuleFormData>>(null);
  const [events, setEvents] = useState([]);
  const [connectionAccessOptionsMap, setConnectionAccessOptionsMap] = useState<{
    [key: string]: IResourceOption[];
  }>({
    [IManagerResourceType.public_connection]: getResourceOptions(dataSource),
  });

  const loadRoles = async () => {
    const roles = await getRoleList();
    setRoles(roles?.contents);
  };

  const loadDataSource = async () => {
    const dataSource = await getPublicConnectionList();
    setDataSource(dataSource?.contents);
  };

  const initialValue = {};
  const [form] = useForm();
  const isEdit = !!editId;

  const eventOtions = events?.map(({ name, id }) => ({
    label: name,
    value: id,
  }));

  const roleOptions = roles?.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const loadEventList = async () => {
    const res = await getAutoRuleEventList();
    if (res) {
      setEvents(res);
      if (!isEdit) {
        const defaultEvent = res?.[0];
        const defaultValue = {
          eventId: defaultEvent?.id,
          conditions: [
            {
              object: defaultEvent?.variables?.[0],
              expression: undefined,
              operation: 'contains',
              value: undefined,
            },
          ],

          permissions: [
            {
              actions: 'readonlyconnect',
              resourceId: undefined,
              resourceType: 'ODC_CONNECTION',
            },
          ],
        };
        form.setFieldsValue(defaultValue);
        setData(defaultValue);
      }
    }
  };

  const loadDetailData = async (id: number) => {
    const res = await getAutoRule(id);
    if (res) {
      const { actions } = res;
      const _actions = [];
      const hasRole = actions?.some((item) => item.action === 'BindRole');
      const hasPermission = actions?.some((item) => item.action === 'BindPermission');
      const roles = actions
        ?.filter((item) => item.action === 'BindRole')
        ?.map((item) => item?.arguments?.roleId);
      const permissions = actions
        ?.filter((item) => item.action === 'BindPermission')
        ?.map((item) => item?.arguments);
      const conditions = res?.conditions?.map(({ expression, object, operation, value }) => {
        return {
          expression,
          object,
          operation,
          value,
        };
      });
      if (hasRole) {
        _actions.push('BindRole');
      }
      if (hasPermission) {
        _actions.push('BindPermission');
      }
      const formData = {
        ...res,
        actions: _actions,
        roles,
        permissions,
        conditions,
      };
      setData(formData);
      form.setFieldsValue(formData);
    }
  };

  useEffect(() => {
    if (editId) {
      loadDetailData(editId);
    }
    loadEventList();
    loadRoles();
    loadDataSource();
  }, [editId, visible]);

  useEffect(() => {
    setConnectionAccessOptionsMap({
      [IManagerResourceType.public_connection]: getResourceOptions(dataSource),
    });
  }, [dataSource]);

  const handleClose = () => {
    form?.resetFields();
    setData(null);
    props.onClose();
  };

  const handleCreate = async (values: Partial<IAutoAuthRule>) => {
    const res = await createAutoRule(values);
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.components.FormAutoAuthModal.RuleCreatedSuccessfully',
        }), //规则创建成功
      );
      props.reloadData();
      handleClose();
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.FormAutoAuthModal.RuleCreationFailed',
        }), //规则创建失败
      );
    }
  };

  const handleEdit = async (values: Partial<IAutoAuthRule>) => {
    const res = await updateAutoRule({
      ...values,
      id: editId,
    });

    if (res) {
      message.success(
        formatMessage({
          id: 'odc.components.FormAutoAuthModal.TheRuleIsSavedSuccessfully',
        }), //规则保存成功
      );
      props.reloadData();
      handleClose();
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.FormAutoAuthModal.FailedToSaveTheRule',
        }), //规则保存失败
      );
    }
  };

  const getFormData = (values: Record<string, any>) => {
    const { name, enabled, eventId, description, conditions = [], roles, permissions } = values;
    const actions = [];
    roles?.forEach((id) => {
      actions.push({
        action: 'BindRole',
        arguments: {
          roleId: id,
        },
      });
    });

    permissions?.forEach(({ resourceType, resourceId, actions: _actions }) => {
      actions.push({
        action: 'BindPermission',
        arguments: {
          resourceType,
          resourceId,
          actions: _actions,
        },
      });
    });

    const formData = {
      name,
      enabled,
      eventId,
      description,
      conditions,
      actions,
    };
    return formData;
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then(({ precisionSlider, ...values }) => {
        const formData = getFormData(values);
        if (editId) {
          handleEdit(formData);
        } else {
          handleCreate(formData);
        }
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  const handleCancel = () => {
    if (hasChange) {
      Modal.confirm({
        title: isEdit
          ? formatMessage({
              id: 'odc.components.FormAutoAuthModal.AreYouSureYouWant',
            }) //确定要取消编辑吗？取消保存后，所编辑的内容将不生效
          : formatMessage({
              id: 'odc.components.FormAutoAuthModal.AreYouSureYouWant.1',
            }), //确定要取消新建吗?
        cancelText: formatMessage({
          id: 'odc.components.FormAutoAuthModal.Cancel',
        }), //取消
        okText: formatMessage({ id: 'odc.components.FormAutoAuthModal.Ok' }), //确定
        centered: true,
        onOk: () => {
          setHasChange(false);
          handleClose();
        },
      });
    } else {
      handleClose();
    }
  };

  const handleEditStatus = () => {
    setHasChange(true);
  };

  const handleStatusChange = (e: RadioChangeEvent) => {
    if (!e.target.value && isEdit) {
      props.handleStatusChange(e.target.value, null, () => {
        form.setFieldsValue({
          status: true,
        });
      });
    }
  };

  const checkNameRepeat = async (ruler, value) => {
    const name = value?.trim();
    if (!name || (isEdit && data?.name === name)) {
      return;
    }
    const isRepeat = await geteAutoRuleExists(name);
    if (isRepeat) {
      throw new Error();
    }
  };

  const handleConnectionAccessOptionsChange = (value) => {
    setConnectionAccessOptionsMap(value);
  };

  const handleFieldChange = (label: string, value: any) => {
    form.setFieldsValue({
      [label]: value,
    });
  };

  const iconStyle = {
    color: 'var(--text-color-hint)',
  };

  const helpDocUrl =
    appConfig.docs.url || getLocalDocs('5.web-odc-manage-automatic-authorization-rules.html');

  return (
    <>
      <Drawer
        width={720}
        title={
          isEdit
            ? formatMessage({ id: 'odc.components.FormAutoAuthModal.EditRule' }) //编辑规则
            : formatMessage({
                id: 'odc.components.FormAutoAuthModal.CreateARule',
              }) //新建规则
        }
        className={styles.autoAuth}
        footer={
          <Space>
            <Button onClick={handleCancel}>
              {
                formatMessage({
                  id: 'odc.components.FormAutoAuthModal.Cancel',
                }) /*取消*/
              }
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              {
                isEdit
                  ? formatMessage({
                      id: 'odc.components.FormAutoAuthModal.Save',
                    }) //保存
                  : formatMessage({
                      id: 'odc.components.FormAutoAuthModal.Create',
                    }) //新建
              }
            </Button>
          </Space>
        }
        destroyOnClose
        visible={visible}
        onClose={handleCancel}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark="optional"
          initialValues={{
            enabled: true,
            condition: [null],
          }}
          onFieldsChange={handleEditStatus}
        >
          <Form.Item
            label={formatMessage({
              id: 'odc.components.FormAutoAuthModal.RuleName',
            })} /*规则名称*/
            name="name"
            validateTrigger="onBlur"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.components.FormAutoAuthModal.EnterARuleName',
                }), //请输入规则名称
              },
              {
                max: 64,
                message: formatMessage({
                  id: 'odc.components.FormAutoAuthModal.TheRuleNameCannotExceed.1',
                }), //规则名称不超过 64个字符
              },
              {
                validator: validTrimEmptyWithWarn(
                  formatMessage({
                    id: 'odc.components.FormAutoAuthModal.TheRuleNameContainsSpaces',
                  }), //规则名称首尾包含空格
                ),
              },
              {
                message: formatMessage({
                  id: 'odc.components.FormAutoAuthModal.TheRuleNameAlreadyExists',
                }), //规则名称已存在
                validator: checkNameRepeat,
              },
            ]}
          >
            <Input
              placeholder={formatMessage({
                id: 'odc.components.FormAutoAuthModal.EnterARuleName',
              })} /*请输入规则名称*/
            />
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'odc.components.FormAutoAuthModal.Status',
            })} /*状态*/
            name="enabled"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.components.FormAutoAuthModal.SelectAStatus',
                }), //请选择状态
              },
            ]}
          >
            <Radio.Group onChange={handleStatusChange}>
              <Radio value={true}>
                {
                  formatMessage({
                    id: 'odc.components.FormAutoAuthModal.Enable',
                  }) /*启用*/
                }
              </Radio>
              <Radio value={false}>
                {
                  formatMessage({
                    id: 'odc.components.FormAutoAuthModal.Disable',
                  }) /*停用*/
                }
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'odc.components.FormAutoAuthModal.TriggerEvent',
            })} /*触发事件*/
            name="eventId"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.components.FormAutoAuthModal.PleaseSelectTriggerEvent',
                }), //请选择触发事件
              },
            ]}
          >
            <Select
              placeholder={formatMessage({
                id: 'odc.components.FormAutoAuthModal.PleaseSelectTriggerEvent',
              })}
              /*请选择触发事件*/ options={eventOtions}
              style={{ width: '240px' }}
            />
          </Form.Item>
          <Form.Item
            label={
              <Space size={2}>
                <span>
                  {
                    formatMessage({
                      id: 'odc.components.FormAutoAuthModal.MatchingCondition',
                    }) /*匹配条件*/
                  }
                </span>
                <a
                  href={helpDocUrl}
                  target={'_blank'}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  rel="noreferrer"
                >
                  {
                    formatMessage({
                      id: 'odc.components.FormAutoAuthModal.HelpDocument',
                    }) /*帮助文档*/
                  }
                </a>
              </Space>
            }
            shouldUpdate
          >
            {({ getFieldValue }) => {
              const eventId = getFieldValue('eventId');
              const variables = events?.find((item) => item.id === eventId)?.variables;
              return <ConditionSelect variables={variables} />;
            }}
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'odc.components.FormAutoAuthModal.PerformAnAction',
            })}
            /*执行动作*/ name="actions"
          >
            <Checkbox.Group
              options={[
                {
                  label: (
                    // 使用 help doc
                    <Space>
                      {
                        formatMessage({
                          id: 'odc.components.FormAutoAuthModal.GrantRoles',
                        }) /*授予角色*/
                      }

                      <Tooltip
                        title={formatMessage({
                          id: 'odc.components.FormAutoAuthModal.GrantRoleRelatedConnectionAccess',
                        })} /*将角色相关的连接访问权限、资源管理权限、系统操作权限均授予用户*/
                      >
                        <QuestionCircleOutlined style={iconStyle} />
                      </Tooltip>
                    </Space>
                  ),

                  value: 'BindRole',
                },
                {
                  label: (
                    <Space>
                      {
                        formatMessage({
                          id: 'odc.components.FormAutoAuthModal.GrantAccessToConnections',
                        }) /*授予连接访问权限*/
                      }

                      <Tooltip
                        title={formatMessage({
                          id: 'odc.components.FormAutoAuthModal.CustomPublicConnectionAccessPermissions',
                        })} /*自定义公共连接的访问权限（只读/读写/申请）*/
                      >
                        <QuestionCircleOutlined style={iconStyle} />
                      </Tooltip>
                    </Space>
                  ),

                  value: 'BindPermission',
                },
              ]}
            />
          </Form.Item>

          <Form.Item shouldUpdate>
            {({ getFieldValue }) => {
              const action = getFieldValue('actions');
              const isBindRole = action?.includes('BindRole');
              const isBindPermission = action?.includes('BindPermission');
              const items = [];
              if (isBindRole) {
                items.push(
                  <Form.Item
                    label={formatMessage({
                      id: 'odc.components.FormAutoAuthModal.Role',
                    })} /*角色*/
                    name="roles"
                    rules={[
                      {
                        required: true,
                        message: formatMessage({
                          id: 'odc.components.FormAutoAuthModal.SelectARole',
                        }), //请选择角色
                      },
                    ]}
                  >
                    <Select
                      allowClear
                      mode="multiple"
                      placeholder={formatMessage({
                        id: 'odc.components.FormAutoAuthModal.SelectARole',
                      })} /*请选择角色*/
                      style={{ width: '420px' }}
                      options={roleOptions}
                      showSearch={true}
                      filterOption={(value, option) => {
                        return option?.label?.toLowerCase()?.indexOf(value?.toLowerCase()) >= 0;
                      }}
                    />
                  </Form.Item>,
                );
              }
              if (isBindPermission) {
                items.push(
                  <>
                    <div className={styles['resource-header']}>
                      <div style={{ width: '100px' }}>
                        {
                          formatMessage({
                            id: 'odc.components.FormAutoAuthModal.AccessiblePublicConnections',
                          }) /*可访问的公共连接*/
                        }
                      </div>
                      <div style={{ width: '108px' }}>
                        {
                          formatMessage({
                            id: 'odc.components.FormAutoAuthModal.AccessPermission',
                          }) /*访问权限*/
                        }
                      </div>
                    </div>
                    <ResourceSelector
                      required={false}
                      name="permissions"
                      optionsMap={connectionAccessOptionsMap}
                      onOptionsChange={handleConnectionAccessOptionsChange}
                      typeOptions={connectionAccessTypeOptions}
                      actionOptions={connectionAccessActionOptions}
                      initialValue={data}
                      isEdit={isEdit}
                      isCopy={false}
                      formRef={{
                        current: form,
                      }}
                      onFieldChange={handleFieldChange}
                    />
                  </>,
                );
              }
              return items;
            }}
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'odc.components.FormAutoAuthModal.Remarks',
            })} /*备注*/
            name="description"
            rules={[
              {
                max: 140,
                message: formatMessage({
                  id: 'odc.components.FormAutoAuthModal.TheDescriptionCannotExceedCharacters',
                }), //备注不超过 140 个字符
              },
            ]}
          >
            <Input.TextArea autoSize={{ minRows: 4, maxRows: 4 }} />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};
export default FormModal;
