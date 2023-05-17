import { getTaskFlowExists } from '@/common/network/manager';
import HelpDoc from '@/component/helpDoc';
import { IManagerRole, TaskPageType, TaskType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { validTrimEmptyWithWarn } from '@/util/valid';
import { Form, Input, InputNumber, Radio, Select, Space, Tabs } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import type { RadioChangeEvent } from 'antd/lib/radio';
import React from 'react';
import type { IRiskLevelConfig } from '../../interface';
import { AuthProcessItem, RoleSelector } from './component';
import styles from './index.less';

const { TabPane } = Tabs;

const firstLevelConfigs = {
  subTypes: ['UPDATE', 'DELETE', 'INSERT', 'SELECT', 'CREATE', 'DROP', 'ALTER', 'OTHER'],
};

const enabledConfirmPartition = false;

interface IProps {
  isActive: boolean;
  builtIn: boolean;
  originName: string;
  isEdit: boolean;
  formRef: React.RefObject<FormInstance>;
  activeKey: string;
  riskLevelConfigs: IRiskLevelConfig[];
  defaultTaskType?: TaskPageType;
  initSelectedRoles?: IManagerRole[];
  setDegree: (value: number) => void;
  setActiveKey: (value: string) => void;
  handleStatusChange?: (id: number, enabled: boolean, callback: () => void) => void;
  handleEditStatus: () => void;
  setRiskLevelConfigs: (value: IRiskLevelConfig[]) => void;
}

const degreeOptions = Array(10)
  .fill(0)
  .map((item, index) => {
    const label =
      index === 2
        ? formatMessage({ id: 'odc.components.FormTaskModal.Recommended' }) //3（推荐）
        : `${index + 1}`;
    return {
      label,
      value: index + 1,
    };
  });

const degreeTabOptions = Array(10)
  .fill(0)
  .map((item, index) => {
    const level = index + 1;
    const label = formatMessage(
      {
        id: 'odc.components.FormTaskModal.LevelLevel',
      },

      { level: level },
    );

    //`等级 ${level}`
    return { label, value: level };
  });

const ConfigForm: React.FC<IProps> = (props) => {
  const {
    defaultTaskType = TaskType.ASYNC,
    isActive,
    formRef,
    builtIn,
    originName,
    isEdit,
    activeKey,
    riskLevelConfigs,
    initSelectedRoles,
    setActiveKey,
    setDegree,
    handleEditStatus,
    setRiskLevelConfigs,
  } = props;
  const defaultFirstLevelConfigs = defaultTaskType === TaskType.ASYNC ? firstLevelConfigs : null;

  function handleStatusChange(e: RadioChangeEvent, _isEdit: boolean) {
    if (!e.target.value && _isEdit) {
      props.handleStatusChange(null, e.target.value, () => {
        formRef.current.setFieldsValue({
          enabled: true,
        });
      });
    }
  }

  function handleRefFlow(index: number) {
    const riskLevelConfigs = formRef.current?.getFieldValue('riskLevelConfigs');
    const source = riskLevelConfigs[index - 1];
    riskLevelConfigs.splice(index, 1, { ...source });
    formRef.current.setFieldsValue({
      riskLevelConfigs: [...riskLevelConfigs],
    });

    setRiskLevelConfigs([...riskLevelConfigs]);
  }

  const checkNameRepeat = async (ruler, value) => {
    const name = value?.trim();
    if (!name || (isEdit && originName === name)) {
      return;
    }
    const isRepeat = await getTaskFlowExists(name);
    if (isRepeat) {
      throw new Error();
    }
  };

  const handleTypeChange = (value: TaskType) => {
    const riskLevelConfigs = formRef.current?.getFieldValue('riskLevelConfigs');
    let configs = [...riskLevelConfigs];
    if (value !== TaskType.ASYNC) {
      configs = riskLevelConfigs?.map(({ subTypes, ...rest }) => {
        return {
          ...rest,
        };
      });
    } else {
      configs = riskLevelConfigs?.map((item, index) => {
        return index === 0
          ? {
              ...item,
              ...firstLevelConfigs,
            }
          : item;
      });
    }
    formRef.current.setFieldsValue({
      riskLevelConfigs: configs,
    });

    setRiskLevelConfigs(configs);
    setDegree(1);
  };

  return (
    <Form
      ref={formRef}
      layout="vertical"
      requiredMark="optional"
      style={{ display: isActive ? 'block' : 'none' }}
      initialValues={
        !isEdit
          ? {
              taskType:
                defaultTaskType === TaskPageType.ALL ? TaskPageType.EXPORT : defaultTaskType,
              degree: 1,
              riskLevelConfigs: [
                {
                  ...defaultFirstLevelConfigs,
                  approvalNodes: [{}],
                  // containsRiskData: false
                },
              ],

              approvalExpirationIntervalSeconds: 24,
              waitExecutionExpirationIntervalSeconds: 24,
              executionExpirationIntervalSeconds: 24,
              enabled: true,
            }
          : null
      }
      onFieldsChange={handleEditStatus}
      onValuesChange={(changedValues, allValues) => {
        setRiskLevelConfigs(allValues?.riskLevelConfigs);
      }}
    >
      <Form.Item
        label={formatMessage({
          id: 'odc.components.FormTaskModal.TaskFlowName',
        })}
        /*任务流程名称*/
        name="name"
        validateTrigger="onBlur"
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.components.FormTaskModal.EnterATaskFlowName',
            }),

            //请输入任务流程名称
          },
          {
            max: 128,
            message: formatMessage({
              id: 'odc.components.FormTaskModal.configForm.TheProcessNameCannotExceed.1',
            }), //流程名称不超过 128 个字符
          },
          {
            validator: validTrimEmptyWithWarn(
              formatMessage({
                id: 'odc.components.FormTaskModal.configForm.TheProcessNameContainsSpaces',
              }), //流程名称首尾包含空格
            ),
          },
          {
            message: formatMessage({
              id: 'odc.components.FormTaskModal.TheProcessNameAlreadyExists',
            }),

            //流程名称已存在
            validator: checkNameRepeat,
          },
        ]}
      >
        <Input
          placeholder={formatMessage({
            id: 'odc.components.FormTaskModal.EnterATaskFlowName',
          })}

          /*请输入任务流程名称*/
        />
      </Form.Item>
      <Form.Item
        label={formatMessage({
          id: 'odc.components.FormTaskModal.TaskType',
        })}
        /*任务类型*/
        required
      >
        <Space style={{ width: '100%' }}>
          <Form.Item name="taskType">
            <Select
              style={{ width: '120px' }}
              onChange={handleTypeChange}
              options={[
                {
                  label: formatMessage({
                    id: 'odc.components.FormTaskModal.Export',
                  }),

                  //导出
                  value: TaskType.EXPORT,
                },

                {
                  label: formatMessage({
                    id: 'odc.components.FormTaskModal.Import',
                  }),

                  //导入
                  value: TaskType.IMPORT,
                },

                {
                  label: formatMessage({
                    id: 'odc.components.FormTaskModal.AnalogData',
                  }),

                  //模拟数据
                  value: TaskType.DATAMOCK,
                },

                {
                  label: formatMessage({
                    id: 'odc.components.FormTaskModal.DatabaseChanges',
                  }),

                  //数据库变更
                  value: TaskType.ASYNC,
                },

                {
                  label: formatMessage({
                    id: 'odc.components.FormTaskModal.configForm.ShadowTable',
                  }),
                  //影子表
                  value: TaskType.SHADOW,
                },

                {
                  label: 'SQL 计划',
                  value: TaskType.SQL_PLAN,
                  disabled: true,
                },

                {
                  label: formatMessage({
                    id: 'odc.components.FormTaskModal.configForm.PartitionPlan',
                  }),
                  //分区计划
                  value: TaskType.PARTITION_PLAN,
                  disabled: true,
                },

                {
                  label: '数据归档',
                  //数据归档
                  value: TaskType.DATA_SAVE,
                  disabled: true,
                },
              ]}
            />
          </Form.Item>
        </Space>
      </Form.Item>
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const taskType: TaskType = getFieldValue('taskType');
          return (
            <Form.Item
              name="degree"
              required
              label={
                <HelpDoc leftText isTip doc="riskDegree">
                  {
                    formatMessage({
                      id: 'odc.components.FormTaskModal.RiskLevels',
                    })

                    /*风险等级数*/
                  }
                </HelpDoc>
              }
            >
              <Select
                disabled={taskType !== TaskType.ASYNC}
                style={{ width: '120px' }}
                options={degreeOptions}
                onChange={(value) => {
                  setDegree(Number(value));
                }}
              />
            </Form.Item>
          );
        }}
      </Form.Item>
      <Form.Item
        shouldUpdate
        label={
          <div className={styles.labelWrapper}>
            <span className={styles.label}>
              {
                formatMessage({
                  id: 'odc.components.FormTaskModal.TaskApprovalProcess',
                })

                /*任务审批流程*/
              }
            </span>
            <span className={styles.desc}>
              {
                formatMessage({
                  id: 'odc.components.FormTaskModal.WhenATaskMatchesMultiple',
                })

                /*当任务匹配到多个风险等级时，系统优先匹配高等级的审批流程*/
              }
            </span>
          </div>
        }
        labelCol={{
          span: 24,
        }}
        className={styles.taskProcess}
      >
        {({ getFieldValue }) => {
          const taskType: TaskType = getFieldValue('taskType');
          return (
            <Form.List name="riskLevelConfigs">
              {(fields) => (
                <Tabs
                  activeKey={activeKey}
                  onChange={(key) => {
                    setActiveKey(key);
                  }}
                >
                  {fields.map(({ name }, index) => {
                    const { label, value } = degreeTabOptions[index];
                    const selectedRoles =
                      riskLevelConfigs?.[name]?.approvalNodes?.map((item) => ({
                        id: item?.roleId,
                        name: initSelectedRoles?.find((role) => role?.id === item?.roleId)
                          ? item?.roleName
                          : null,
                      })) ?? [];
                    return (
                      <TabPane tab={label} key={index} forceRender>
                        {enabledConfirmPartition && taskType === TaskType.PARTITION_PLAN ? (
                          <Form.Item
                            label={formatMessage({
                              id: 'odc.components.FormTaskModal.configForm.ConfirmPartitionPolicy',
                            })}
                            /*确认分区策略*/ required
                          >
                            <RoleSelector
                              width="226px"
                              name={[name, 'partitionRole']}
                              selectedRoles={selectedRoles}
                            />
                          </Form.Item>
                        ) : null}
                        <AuthProcessItem
                          name={name}
                          degree={value}
                          taskType={taskType}
                          selectedRoles={selectedRoles}
                          onRefFlow={handleRefFlow}
                        />
                      </TabPane>
                    );
                  })}
                </Tabs>
              )}
            </Form.List>
          );
        }}
      </Form.Item>
      <Form.Item
        label={formatMessage({
          id: 'odc.components.FormTaskModal.ProcessValidityPeriod',
        })}
        /*流程有效期*/ required
      >
        <Space size={50} className={styles.infoBlock}>
          <Form.Item
            required
            label={
              <HelpDoc leftText isTip doc="approvalExpiration">
                {
                  formatMessage({
                    id: 'odc.components.FormTaskModal.ApprovalValidityPeriod',
                  })

                  /*审批有效期*/
                }
              </HelpDoc>
            }
          >
            <Space>
              <Form.Item name="approvalExpirationIntervalSeconds">
                <InputNumber max={240} min={0} />
              </Form.Item>
              <span>
                {
                  formatMessage({
                    id: 'odc.components.FormTaskModal.Hours',
                  })

                  /*小时*/
                }
              </span>
            </Space>
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const taskType: TaskType = getFieldValue('taskType');
              return taskType !== TaskType.PERMISSION_APPLY ? (
                <Form.Item
                  required
                  label={
                    <HelpDoc leftText isTip doc="waitExecutionExpiration">
                      {
                        formatMessage({
                          id: 'odc.components.FormTaskModal.WaitForValidityPeriod',
                        })

                        /*执行等待有效期*/
                      }
                    </HelpDoc>
                  }
                >
                  <Space>
                    <Form.Item name="waitExecutionExpirationIntervalSeconds">
                      <InputNumber max={240} min={0} />
                    </Form.Item>
                    <span>
                      {
                        formatMessage({
                          id: 'odc.components.FormTaskModal.Hours',
                        })

                        /*小时*/
                      }
                    </span>
                  </Space>
                </Form.Item>
              ) : null;
            }}
          </Form.Item>
          <Form.Item
            required
            label={
              <HelpDoc leftText isTip doc="executionExpiration">
                {
                  formatMessage({
                    id: 'odc.components.FormTaskModal.ValidityPeriod',
                  })

                  /*执行有效期*/
                }
              </HelpDoc>
            }
          >
            <Space>
              <Form.Item name="executionExpirationIntervalSeconds">
                <InputNumber max={240} min={0} />
              </Form.Item>
              <span>
                {
                  formatMessage({
                    id: 'odc.components.FormTaskModal.Hours',
                  })

                  /*小时*/
                }
              </span>
            </Space>
          </Form.Item>
        </Space>
      </Form.Item>
      <Form.Item
        label={formatMessage({
          id: 'odc.components.FormTaskModal.TaskProcessStatus',
        })}
        /*任务流程状态*/ name="enabled"
        required
      >
        <Radio.Group
          onChange={(e) => {
            handleStatusChange(e, isEdit);
          }}
        >
          <Radio value={true}>
            {
              formatMessage({
                id: 'odc.components.FormTaskModal.Enable',
              })

              /*启用*/
            }
          </Radio>
          <Radio value={false}>
            {
              formatMessage({
                id: 'odc.components.FormTaskModal.Disable',
              })

              /*停用*/
            }
          </Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        label={formatMessage({
          id: 'odc.components.FormTaskModal.Remarks',
        })}
        /*备注*/
        name="description"
        rules={[
          {
            max: 200,
            message: formatMessage({
              id: 'odc.components.FormTaskModal.TheDescriptionCannotExceedCharacters',
            }),

            //备注不超过 200 个字符
          },
        ]}
      >
        <Input.TextArea
          placeholder={formatMessage({
            id: 'odc.components.FormTaskModal.EnterRemarks',
          })}
          /*请输入备注*/ autoSize={{ minRows: 4, maxRows: 4 }}
        />
      </Form.Item>
    </Form>
  );
};

export default ConfigForm;
