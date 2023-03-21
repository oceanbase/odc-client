import {
  createResourceGroup,
  getResourceGroupDetail,
  getResourceGroupExists,
  updateResourceGroup,
} from '@/common/network/manager';
import ConnectionPopover from '@/component/ConnectionPopover';
import type { IManagerPublicConnection, IManagerResourceGroup } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { validTrimEmptyWithWarn } from '@/util/valid';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { RadioChangeEvent } from 'antd';
import { Button, Drawer, Form, Input, message, Modal, Popover, Radio, Select, Space } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import React, { useEffect, useRef, useState } from 'react';
import styles from './index.less';

const { Option } = Select;
interface IProps {
  visible: boolean;
  editId?: number;
  publicConnections: IManagerPublicConnection[];
  onClose: () => void;
  handleStatusChange?: (
    status: boolean,
    resourceGroup: IManagerResourceGroup,
    callback: () => void,
  ) => void;
  reloadData?: () => void;
}

interface IConnectionOptions extends IManagerPublicConnection {
  selected: boolean;
}

const FormResourceGroupModal: React.FC<IProps> = (props) => {
  const { visible, editId, publicConnections } = props;
  const [hasChange, setHasChange] = useState(false);
  const [data, setData] = useState(null);
  const [connectionsOption, setConnectionsOption] = useState(publicConnections);
  const formRef = useRef<FormInstance>(null);
  const isEdit = !!editId;

  const handleFilteredOption = (
    selectedConnection: {
      enabled: boolean;
      id: number;
      name: string;
    }[],
  ) => {
    const filteredOptions = connectionsOption?.map((item) => {
      const selected = selectedConnection?.some((selectedItem) => selectedItem?.id === item?.id);
      return { ...item, selected };
    });
    setConnectionsOption(filteredOptions);
  };

  const loadDetailDate = async (id: number) => {
    const detail = await getResourceGroupDetail(id);
    if (detail) {
      handleFilteredOption(detail.connections);
      setData(detail);
      formRef.current.setFieldsValue(detail);
    }
  };

  useEffect(() => {
    if (editId) {
      loadDetailDate(editId);
    }
  }, [editId, visible]);

  useEffect(() => {
    setConnectionsOption(publicConnections);
  }, [publicConnections]);

  const handleClose = () => {
    formRef.current?.resetFields();
    setData(null);
    setConnectionsOption(publicConnections);
    props.onClose();
  };

  const handleCreate = async (values: Partial<IManagerResourceGroup>) => {
    const res = await createResourceGroup(values);
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.components.FormResourceGroupModal.ResourceGroupCreated',
        }),
        // 资源组创建成功
      );
      props.reloadData?.();
      handleClose();
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.FormResourceGroupModal.UnableToCreateTheResource',
        }),
        // 资源组创建失败
      );
    }
  };

  const handleEdit = async (values: Partial<IManagerResourceGroup>) => {
    const res = await updateResourceGroup({
      ...values,
      id: editId,
    });

    if (res) {
      message.success(
        formatMessage({
          id: 'odc.components.FormResourceGroupModal.TheResourceGroupIsSaved',
        }),
        // 资源组保存成功
      );
      props.reloadData?.();
      handleClose();
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.FormResourceGroupModal.UnableToSaveTheResource',
        }),
        // 资源组保存失败
      );
    }
  };

  const handleSubmit = () => {
    formRef.current
      .validateFields()
      .then((values) => {
        const formData = {
          ...values,
          name: values.name?.trim(),
          connections: values?.connections?.filter((item) => item?.id),
        };
        if (!formData.connections) {
          formData.connections = [];
        }
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

  const checkAccountRepeat = async (ruler, value) => {
    const name = value?.trim();
    if (!name || (isEdit && data?.name === name)) {
      return;
    }
    const isRepeat = await getResourceGroupExists(name);
    if (isRepeat) {
      throw new Error();
    }
  };

  const handleCancel = () => {
    if (hasChange) {
      Modal.confirm({
        title: isEdit
          ? formatMessage({
              id: 'odc.components.FormResourceGroupModal.AreYouSureYouWant',
            })
          : // 确定要取消编辑吗？取消保存后，所编辑的内容将不生效
            formatMessage({
              id: 'odc.components.FormResourceGroupModal.AreYouSureYouWant.1',
            }),
        // 确定要取消新建吗?
        cancelText: formatMessage({
          id: 'odc.components.FormResourceGroupModal.Cancel',
        }),
        // 取消
        okText: formatMessage({
          id: 'odc.components.FormResourceGroupModal.Determine',
        }),
        // 确定
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
        formRef.current.setFieldsValue({
          status: true,
        });
      });
    }
  };

  const handleConnectionChange = () => {
    const selectedConnection = formRef.current.getFieldValue('connections');
    handleFilteredOption(selectedConnection);
  };

  return (
    <>
      <Drawer
        width={isEdit ? 520 : 720}
        title={
          isEdit
            ? formatMessage({
                id: 'odc.components.FormResourceGroupModal.EditAResourceGroup',
              })
            : // 编辑资源组
              formatMessage({
                id: 'odc.components.FormResourceGroupModal.CreateAResourceGroup',
              })
          // 新建资源组
        }
        className={styles.resourceGroup}
        footer={
          <Space>
            <Button onClick={handleCancel}>
              {
                formatMessage({
                  id: 'odc.components.FormResourceGroupModal.Cancel',
                })
                /* 取消 */
              }
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              {
                isEdit
                  ? formatMessage({
                      id: 'odc.components.FormResourceGroupModal.Save',
                    })
                  : // 保存
                    formatMessage({
                      id: 'odc.components.FormResourceGroupModal.New',
                    })
                // 新建
              }
            </Button>
          </Space>
        }
        destroyOnClose
        visible={visible}
        onClose={handleCancel}
      >
        <Form
          ref={formRef}
          layout="vertical"
          requiredMark="optional"
          initialValues={
            data || {
              enabled: true,
            }
          }
          onFieldsChange={handleEditStatus}
        >
          <Form.Item
            label={formatMessage({
              id: 'odc.components.FormResourceGroupModal.ResourceGroupName',
            })}
            /* 资源组名称 */
            name="name"
            validateTrigger="onBlur"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.components.FormResourceGroupModal.EnterAResourceGroupName',
                }), // 请输入资源组名称
              },
              {
                max: 64,
                message: formatMessage({
                  id: 'odc.components.FormResourceGroupModal.TheResourceGroupNameCannot.1',
                }), //资源组名称不超过 64个字符
              },
              {
                validator: validTrimEmptyWithWarn(
                  formatMessage({
                    id: 'odc.components.FormResourceGroupModal.TheResourceGroupNameContains',
                  }), //资源组名称首尾包含空格
                ),
              },
              {
                message: formatMessage({
                  id: 'odc.components.FormResourceGroupModal.TheResourceGroupNameAlready',
                }), // 资源组名称已存在
                validator: checkAccountRepeat,
              },
            ]}
          >
            <Input
              placeholder={formatMessage({
                id: 'odc.components.FormResourceGroupModal.EnterAResourceGroupName',
              })}
              /* 请输入资源组名称 */
            />
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'odc.components.FormResourceGroupModal.ResourceGroupStatus',
            })}
            /* 资源组状态 */
            name="enabled"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.components.FormResourceGroupModal.SelectAStatus',
                }),
                // 请选择状态
              },
            ]}
          >
            <Radio.Group onChange={handleStatusChange}>
              <Radio value={true}>
                {
                  formatMessage({
                    id: 'odc.components.FormResourceGroupModal.Enable',
                  })
                  /* 启用 */
                }
              </Radio>
              <Radio value={false}>
                {
                  formatMessage({
                    id: 'odc.components.FormResourceGroupModal.Disable',
                  })
                  /* 停用 */
                }
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label={
              formatMessage({
                id: 'odc.components.FormResourceGroupModal.PublicConnection',
              }) /* 公共连接 */
            }
          >
            <Form.List name="connections">
              {(fields, { add, remove }) => (
                <div className={styles.infoBlock}>
                  {fields.map(({ key, name, fieldKey }: any) => (
                    <Space key={key} align="baseline">
                      <Form.Item
                        style={{ width: `${isEdit ? '450px' : '650px'}` }}
                        name={[name, 'id']}
                        fieldKey={[fieldKey, 'id']}
                      >
                        <Select
                          showSearch={true}
                          filterOption={(value, option) => {
                            return option?.title?.toLowerCase()?.indexOf(value?.toLowerCase()) >= 0;
                          }}
                          placeholder={formatMessage({
                            id: 'odc.components.FormResourceGroupModal.SelectPublicConnection',
                          })}
                          /* 请选择公共连接 */
                          onChange={handleConnectionChange}
                        >
                          {connectionsOption?.map((item: IConnectionOptions) => {
                            const { name: labelName, id, selected } = item;
                            return (
                              <Option value={id} title={labelName} key={id} disabled={selected}>
                                <Popover
                                  overlayClassName={styles.connectionPopover}
                                  placement="left"
                                  content={<ConnectionPopover connection={item} />}
                                >
                                  <div className={styles.labelName}>{labelName}</div>
                                </Popover>
                              </Option>
                            );
                          })}
                        </Select>
                      </Form.Item>
                      <DeleteOutlined
                        onClick={() => {
                          remove(name);
                          handleConnectionChange();
                        }}
                      />
                    </Space>
                  ))}

                  <Form.Item style={{ marginBottom: 0, width: '100%' }}>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      {
                        formatMessage({
                          id: 'odc.components.FormResourceGroupModal.AddConnection',
                        })
                        /* 添加连接 */
                      }
                    </Button>
                  </Form.Item>
                </div>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'odc.components.FormResourceGroupModal.Note',
            })}
            /* 备注 */
            name="description"
            rules={[
              {
                max: 140,
                message: formatMessage({
                  id: 'odc.components.FormResourceGroupModal.TheDescriptionCannotExceedCharacters',
                }),
                // 备注不超过 140 个字符
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
export default FormResourceGroupModal;
