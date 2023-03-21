import {
  createMaskPolicy,
  deleteMaskPolicy,
  getMaskPolicy,
  getMaskPolicyList,
  updateMaskPolicy,
} from '@/common/network/mask';
import type { IMaskPolicy, IMaskRule } from '@/d.ts';
import type { TaskStore } from '@/store/task';
import { formatMessage } from '@/util/intl';
import { generateUniqKey } from '@/util/utils';
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Drawer, Empty, Form, Menu, message, Modal, Space } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import ActionMenu from './actionMenu';
import styles from './index.less';
import EditableTable from './table';

export interface IApplyingRule {
  key: string;
  rule: Partial<IMaskRule>;
  excludes: string[];
  includes: string[];
}

interface IPolicy {
  key: string;
  name: string;
  id?: number;
  isPlus?: boolean;
  isEdit?: boolean;
  rules: IApplyingRule[];
}

interface IProps {
  taskStore?: TaskStore;
  visible: boolean;
  onClose: () => void;
}

let policyIndex = 1;

const MaskPolicyManager: React.FC<IProps> = inject('taskStore')(
  observer((props) => {
    const { taskStore, visible, onClose } = props;
    const [policys, setPolicys] = useState<IPolicy[]>([]);
    const [activeKey, setActiveKey] = useState('');
    const [hasChange, setHasChange] = useState(false);
    const [editingRowKeys, setEditingRowKeys] = useState([]);
    const [editPopKey, setEditPopKey] = useState(null);
    const [form] = Form.useForm();
    const ref = useRef();
    const containerRef = useRef<HTMLDivElement>();
    const confirmModal = useRef<{ destroy: () => void }>(null);

    const menus =
      policys?.map(({ rules, ...rest }) => ({
        ...rest,
      })) ?? [];

    const activePolicy = policys?.find((item) => item.key === activeKey);
    const {
      key: policiesKey,
      id: policiesId,
      name: policiesName,
      rules,
      isPlus,
      isEdit,
    } = activePolicy ?? {};
    const isNameFinish = !isPlus && !isEdit;
    const isDisabledSave = !hasChange || !isNameFinish;

    const loadPolicys = async () => {
      const res = await getMaskPolicyList();
      if (res) {
        const data = res?.contents?.map(({ id, name, ruleApplyings }) => {
          return {
            key: generateUniqKey(),
            id,
            name,
            rules: ruleApplyings?.map((item) => {
              return {
                key: generateUniqKey(),
                ...item,
              };
            }),
          };
        });
        setPolicys(data);
      }
    };

    const handleUpdatePolicy = (key: string, values: Record<string, any>) => {
      const _policys = [...policys];
      const policyIndex = _policys.findIndex((item) => item.key === key);
      const policy = _policys.find((item) => item.key === key);
      const { isPlus, ...reset } = policy;
      _policys.splice(policyIndex, 1, {
        ...reset,
        ...values,
      });

      setPolicys(_policys);
      taskStore.getPolicys();
    };

    const loadDetail = async () => {
      const res = await getMaskPolicy(policiesId);
      const rules =
        res?.ruleApplyings?.map(({ excludes, includes, rule }) => ({
          key: generateUniqKey(),
          rule,
          includes,
          excludes,
        })) ?? [];
      handleUpdatePolicy(policiesKey, {
        rules,
      });
    };

    const onCloseConfirmModal = () => {
      confirmModal?.current?.destroy();
    };

    const handleClose = () => {
      onCloseConfirmModal();
      setHasChange(false);
      setEditingRowKeys([]);
    };

    const handleUpdateRuleByPolicy = (value: Partial<IMaskPolicy>) => {
      const rules =
        value?.ruleApplyings?.map(({ excludes, includes, rule }) => ({
          key: generateUniqKey(),
          rule,
          includes,
          excludes,
        })) ?? [];

      handleUpdatePolicy(policiesKey, {
        ...value,
        rules,
      });
    };

    const handleCreate = async (values: Partial<IMaskPolicy>) => {
      const res = await createMaskPolicy(values);
      if (res) {
        message.success(
          formatMessage({
            id: 'odc.component.MaskPolicyManager.RuleCreatedSuccessfully',
          }),
          //规则创建成功
        );
        handleUpdateRuleByPolicy({
          id: res.id,
          ...values,
        });

        handleClose();
      } else {
        message.error(
          formatMessage({
            id: 'odc.component.MaskPolicyManager.RuleCreationFailed',
          }),
          //规则创建失败
        );
      }
    };

    const handleEdit = async (values: Partial<IMaskPolicy>) => {
      const res = await updateMaskPolicy(values);
      if (res) {
        message.success(
          formatMessage({
            id: 'odc.component.MaskPolicyManager.TheRuleIsSavedSuccessfully',
          }),
          //规则保存成功
        );
        handleUpdateRuleByPolicy(values);
        handleClose();
      } else {
        message.error(
          formatMessage({
            id: 'odc.component.MaskPolicyManager.FailedToSaveTheRule',
          }),
          //规则保存失败
        );
      }
    };

    const handlePlus = () => {
      const key = generateUniqKey();
      policyIndex++;
      setPolicys([
        ...policys,
        {
          key,
          name: formatMessage(
            {
              id: 'odc.component.MaskPolicyManager.PolicyNamePolicyindex',
            },
            { policyIndex: policyIndex },
          ), //`策略名称-${policyIndex}`
          rules: [],
          isPlus: true,
        },
      ]);

      setActiveKey(key);
      setHasChange(true);
    };

    const handleRename = (menu) => {
      const _policys = policys.map((item) => {
        return item.key === menu.key
          ? {
              ...item,
              isEdit: true,
            }
          : item;
      });
      setActiveKey(menu.key);
      setPolicys(_policys);
      setHasChange(true);
    };

    const handleNameChange = async (menu) => {
      const { key, id, name, isPlus } = menu;
      const policy = policys?.find((item) => item.id === id);
      if (id) {
        const { key, rules, ...rest } = policy;
        const res = await updateMaskPolicy({
          ...rest,
          // @ts-ignore
          ruleApplyings: rules.map(({ key, ...rest }) => {
            return {
              ...rest,
            };
          }),
          name,
        });

        if (res) {
          message.success(
            formatMessage({
              id: 'odc.component.MaskPolicyManager.RenamedSuccessfully',
            }),
            //重命名成功
          );
          handleUpdatePolicy(key, { name, isEdit: false });
          setHasChange(false);
        } else {
          message.error(
            formatMessage({
              id: 'odc.component.MaskPolicyManager.RenameFailed',
            }),
            //重命名失败
          );
        }
      } else {
        const data: Partial<IPolicy> = { name, isEdit: false };
        const defaultRuleKey = generateUniqKey();
        if (isPlus && !policy.rules?.length) {
          const newData = [
            {
              key: defaultRuleKey,
              rule: {
                name: '',
              },

              includes: [],
              excludes: [],
            },
          ];

          data.rules = newData;
          setEditingRowKeys([defaultRuleKey]);
        }
        handleUpdatePolicy(key, data);
        setHasChange(true);
      }
    };

    const handleCopy = (menu) => {
      const { name } = menu;
      const { id, ...rest } = policys?.find((item) => item.key === menu.key);
      const key = generateUniqKey();
      setPolicys([
        ...policys,
        {
          ...rest,
          key,
          isPlus: true,
          name: formatMessage(
            {
              id: 'odc.component.MaskPolicyManager.CopyName',
            },

            { name: name },
          ),
          //`复制 ${name}`
        },
      ]);

      setActiveKey(key);
      setHasChange(true);
    };

    const handleDelete = (key) => {
      const _policys = policys.filter((item) => item.key !== key);
      setPolicys(_policys);
      if (activeKey === key) {
        const _key = _policys?.[policys?.length - 1]?.key;
        setActiveKey(_key);
      }
    };

    const handleRemove = async (menu) => {
      const { id, key } = menu;
      Modal.confirm({
        title: formatMessage({
          id: 'odc.component.MaskPolicyManager.AreYouSureYouWant',
        }), //确认要删除脱敏策略吗？
        icon: <ExclamationCircleOutlined style={{ color: 'var(--icon-orange-color)' }} />,
        content: formatMessage({
          id: 'odc.component.MaskPolicyManager.AfterTheDesensitizationPolicyIs',
        }), //删除脱敏策略后，相关字段匹配规则将移除
        cancelText: formatMessage({
          id: 'odc.component.MaskPolicyManager.Cancel',
        }), //取消
        okText: formatMessage({ id: 'odc.component.MaskPolicyManager.Ok' }), //确定
        centered: true,
        onOk: async () => {
          if (id) {
            const res = await deleteMaskPolicy(id);
            if (res) {
              handleDelete(key);
            }
          } else {
            handleDelete(key);
          }
        },
      });
    };

    const handleRuleChange = (rules: IApplyingRule[]) => {
      setHasChange(true);
      handleUpdatePolicy(policiesKey, {
        rules,
      });
    };

    const handleOk = () => {
      form.validateFields().then(() => {
        if (editingRowKeys.length) {
          setEditPopKey(editingRowKeys[0]);
          return;
        }
        const ruleApplyings = rules
          ?.filter(({ rule, includes }) => rule?.id && includes)
          ?.map(({ rule: { id, name }, excludes, includes }) => {
            return {
              rule: { id, name },
              excludes,
              includes,
            };
          });
        if (!ruleApplyings?.length) {
          message.error(
            formatMessage({
              id: 'odc.component.MaskPolicyManager.SelectAtLeastOneRule',
            }), //至少选择一条规则
          );
          return;
        }
        const params = {
          name: policiesName,
          ruleApplyings,
        } as Partial<IMaskPolicy>;

        if (policiesId) {
          handleEdit({
            ...params,
            id: policiesId,
          });
        } else {
          handleCreate(params);
        }
      });
    };

    const checkChange = (callback: () => void) => {
      if (editingRowKeys.length) {
        setEditPopKey(editingRowKeys[0]);
      } else if (hasChange) {
        if (!policiesId) {
          confirmModal.current = Modal.confirm({
            className: styles.confirmModal,
            title: formatMessage({
              id: 'odc.component.MaskPolicyManager.WhetherToCancelTheNew',
            }), //是否取消新建策略
            centered: true,
            content: (
              <div className={styles.footer}>
                <Space>
                  <Button
                    onClick={() => {
                      onCloseConfirmModal();
                    }}
                  >
                    {
                      formatMessage({
                        id: 'odc.component.MaskPolicyManager.Cancel',
                      }) /*取消*/
                    }
                  </Button>
                  <Button
                    onClick={() => {
                      handleDelete(activeKey);
                      handleClose();
                      callback();
                    }}
                  >
                    {
                      formatMessage({
                        id: 'odc.component.MaskPolicyManager.Ok',
                      }) /*确定*/
                    }
                  </Button>
                </Space>
              </div>
            ),
          });
        } else {
          confirmModal.current = Modal.confirm({
            className: styles.confirmModal,
            title: formatMessage({
              id: 'odc.component.MaskPolicyManager.TheDesensitizationPolicyHasBeen',
            }),
            //脱敏策略已修改，是否确认保存
            centered: true,
            content: (
              <div className={styles.footer}>
                <Space>
                  <Button
                    onClick={() => {
                      onCloseConfirmModal();
                    }}
                  >
                    {
                      formatMessage({
                        id: 'odc.component.MaskPolicyManager.Return',
                      })
                      /*返回*/
                    }
                  </Button>
                  <Button
                    onClick={() => {
                      if (!policiesId) {
                        handleDelete(activeKey);
                      }
                      handleClose();
                      callback();
                    }}
                  >
                    {
                      formatMessage({
                        id: 'odc.component.MaskPolicyManager.DoNotSave',
                      })
                      /*不保存*/
                    }
                  </Button>
                  <Button type="primary" onClick={handleOk}>
                    {
                      formatMessage({
                        id: 'odc.component.MaskPolicyManager.Save',
                      })
                      /*保存*/
                    }
                  </Button>
                </Space>
              </div>
            ),
          });
        }
      } else {
        callback();
      }
    };

    const handleClick = ({ key }) => {
      if (key === activeKey) {
        return;
      }
      checkChange(() => {
        setActiveKey(key);
      });
    };

    const handleCheckAndClose = () => {
      checkChange(() => {
        onClose();
      });
    };

    const handleEditRowChange = (key: string, isEditing: boolean) => {
      const keys = [...editingRowKeys];
      if (isEditing) {
        keys.push(key);
      } else {
        const keyIndex = keys.indexOf(key);
        keys.splice(keyIndex, 1);
      }
      setEditingRowKeys(keys);
      if (!keys.length) {
        setEditPopKey(null);
      }
    };

    useEffect(() => {
      if (visible) {
        loadPolicys();
      }
    }, [visible]);

    useEffect(() => {
      if (!activePolicy && policys?.length) {
        setActiveKey(policys[0].key ?? '');
      }
    }, [policys, activePolicy]);

    useEffect(() => {
      if (policiesKey && policiesId) {
        loadDetail();
      }
    }, [policiesId, policiesKey]);

    return (
      <Drawer
        className={styles.drawer}
        visible={visible}
        width={960}
        title={formatMessage({
          id: 'odc.component.MaskPolicyManager.ManageDesensitizationPolicies',
        })}
        /*管理脱敏策略*/
        destroyOnClose
        footer={null}
        onClose={handleCheckAndClose}
      >
        <div className={styles.wrapper} ref={containerRef}>
          <div className={styles.sider}>
            <div className={styles.header}>
              <span>
                {
                  formatMessage({
                    id: 'odc.component.MaskPolicyManager.AllPolicies',
                  })
                  /*全部策略*/
                }
              </span>
              <Button type="text" onClick={handlePlus} disabled={hasChange}>
                <PlusOutlined />
              </Button>
            </div>
            <Menu
              mode="inline"
              className={styles.menu}
              onClick={handleClick}
              selectedKeys={[activeKey]}
            >
              {menus.map((menu) => {
                return (
                  <Menu.Item key={menu?.key} className={styles.menuItem}>
                    <ActionMenu
                      menu={{ ...menu }}
                      menus={menus}
                      hasChange={hasChange}
                      onRename={handleRename}
                      onNameChange={handleNameChange}
                      onCopy={handleCopy}
                      onRemove={handleRemove}
                    />
                  </Menu.Item>
                );
              })}
            </Menu>
          </div>
          {activeKey ? (
            <div className={styles.content} ref={ref}>
              <div className={styles.body}>
                <Alert
                  style={{
                    marginBottom: 12,
                  }}
                  type="info"
                  showIcon
                  message={formatMessage({
                    id: 'odc.component.MaskPolicyManager.SensitiveDataWillBePrioritized',
                  })}
                  /*敏感数据将按照脱敏规则从上往下的排序优先级，进行匹配和排除*/
                />

                <EditableTable
                  wrapperRef={ref}
                  ruleApplyings={rules}
                  activeKey={activeKey}
                  editingRowKeys={editingRowKeys}
                  editPopKey={editPopKey}
                  isNameFinish={isNameFinish}
                  formInstance={form}
                  onChange={handleRuleChange}
                  onEditRowChange={handleEditRowChange}
                />
              </div>
              <div className={styles.footer}>
                <Space size={16}>
                  <Button onClick={handleCheckAndClose}>
                    {
                      formatMessage({
                        id: 'odc.component.MaskPolicyManager.Cancel',
                      })
                      /*取消*/
                    }
                  </Button>
                  <Button type="primary" onClick={handleOk} disabled={isDisabledSave}>
                    {
                      formatMessage({
                        id: 'odc.component.MaskPolicyManager.Save',
                      })
                      /*保存*/
                    }
                  </Button>
                </Space>
              </div>
            </div>
          ) : (
            <div className={styles.empty}>
              <Empty
                description={formatMessage({
                  id: 'odc.component.MaskPolicyManager.NoDesensitizationStrategy',
                })} /*暂无脱敏策略*/
              >
                <Button type="primary" onClick={handlePlus}>
                  {
                    formatMessage({
                      id: 'odc.component.MaskPolicyManager.CreateAPolicy',
                    }) /*新建策略*/
                  }
                </Button>
              </Empty>
            </div>
          )}
        </div>
      </Drawer>
    );
  }),
);

export default MaskPolicyManager;
