import HelpDoc from '@/component/helpDoc';
import { TaskType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Checkbox, Form, Input, InputNumber, Radio, Select, Space, Timeline, Tooltip } from 'antd';
import { uniqBy } from 'lodash';
import React, { useContext } from 'react';
import { ManageContext } from '../../context';
import { TaskSubTypeMap } from '../TaskFlowPage/index';
import styles from './index.less';
// 330 版本支持 风险数据编辑
export const EnabledRiskData = false;

export function getSubTaskOptions() {
  return Object?.keys(TaskSubTypeMap ?? {})?.map((key) => {
    return {
      label: TaskSubTypeMap[key],
      value: key,
    };
  });
}

interface IRoleSelectorProps {
  name: string | any[];
  selectedRoles?: {
    id: number;
    name: string;
  }[];
  width?: string;
}

export const RoleSelector: React.FC<IRoleSelectorProps> = (props) => {
  const { name, width = '200px', selectedRoles = [] } = props;
  const { roles } = useContext(ManageContext);
  const rolesRource = selectedRoles?.filter((item) => item.name);
  const roleList = uniqBy([...rolesRource]?.concat([...roles?.values()]), 'id')?.map((role) => {
    return {
      label: role.name,
      value: role.id,
      disabled: selectedRoles?.some((item) => item.id === role.id),
    };
  });
  return (
    <Form.Item
      name={name}
      validateTrigger={['onChange', 'onBlur']}
      rules={[
        {
          required: true,
          message: formatMessage({
            id: 'odc.components.FormTaskModal.component.SelectARole',
          }),

          //请选择角色
        },
      ]}
      noStyle
    >
      <Select
        placeholder={formatMessage({
          id: 'odc.components.FormTaskModal.component.SelectARole',
        })}
        /*请选择角色*/
        style={{ width }}
        options={roleList}
        showSearch={true}
        filterOption={(value, option) => {
          return (option?.label as string)?.indexOf(value) >= 0;
        }}
      />
    </Form.Item>
  );
};

interface IAuthNodeProps {
  name: number;
  degree: number;
  selectedRoles: {
    id: number;
    name: string;
  }[];
  onRefFlow: () => void;
}

export const AuthNode: React.FC<IAuthNodeProps> = (props) => {
  const { name, degree, selectedRoles, onRefFlow } = props;
  const handleValid = async (_, values) => {
    return !values?.length ? Promise.reject(new Error()) : Promise.resolve();
  };

  return (
    <>
      <Form.List
        name={[name, 'approvalNodes']}
        rules={[
          {
            validator: handleValid,
          },
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <Timeline>
            {fields.map((field, index) => (
              <Timeline.Item
                className={index === fields?.length - 1 && styles.preLastItem}
                key={`${name}-${field.key}`}
              >
                <Space direction="vertical">
                  <span>
                    {
                      formatMessage({
                        id: 'odc.components.FormTaskModal.component.ApprovalNode',
                      })

                      /*审批节点*/
                    }

                    {index + 1}
                  </span>
                  <Space>
                    <RoleSelector name={[field.name, 'roleId']} selectedRoles={selectedRoles} />
                    <Form.Item name={[field.name, 'autoApprove']} valuePropName="checked" noStyle>
                      <Checkbox>
                        {
                          formatMessage({
                            id: 'odc.components.FormTaskModal.component.AutomaticApproval',
                          }) /*自动审批*/
                        }
                      </Checkbox>
                    </Form.Item>
                    {fields.length > 1 ? (
                      <DeleteOutlined
                        className="dynamic-delete-button"
                        onClick={() => remove(field.name)}
                      />
                    ) : null}
                  </Space>
                </Space>
              </Timeline.Item>
            ))}

            <Timeline.Item className={styles.opBtn}>
              <Space split={<span className={styles.desc}>|</span>}>
                <span className={styles.btnLink} onClick={() => add()}>
                  {
                    formatMessage({
                      id: 'odc.components.FormTaskModal.component.AddApprovalNode',
                    })

                    /*添加审批节点*/
                  }
                </span>
                {degree > 1 && (
                  <span className={styles.btnLink} onClick={onRefFlow}>
                    {
                      formatMessage({
                        id: 'odc.components.FormTaskModal.component.ReferenceSuperiorProcess',
                      })

                      /*引用上级流程*/
                    }
                  </span>
                )}
              </Space>
              <Form.ErrorList errors={errors} />
            </Timeline.Item>
          </Timeline>
        )}
      </Form.List>
    </>
  );
};

interface IAuthProcessItemProps {
  name: number;
  degree: number;
  taskType: TaskType;
  selectedRoles: {
    id: number;
    name: string;
  }[];
  onRefFlow: (index: number) => void;
}

export const AuthProcessItem: React.FC<IAuthProcessItemProps> = (props) => {
  const { name, degree, taskType, selectedRoles, onRefFlow } = props;
  const showTaskSubclass = taskType === TaskType.ASYNC;
  const subTaskOptions = getSubTaskOptions();
  const handleRefFlow = () => {
    onRefFlow(name);
  };

  return (
    <>
      {showTaskSubclass && (
        <>
          <Space direction="vertical" size={5} className={styles.childType}>
            <Form.Item
              required
              label={
                <Space>
                  <span>
                    {
                      formatMessage({
                        id: 'odc.components.FormTaskModal.component.TaskSubclass',
                      })

                      /*任务子类*/
                    }
                  </span>
                  <Tooltip
                    title={formatMessage({
                      id: 'odc.components.FormTaskModal.component.SelectTheTaskSubclassesIncluded',
                    })}

                    /*选择当前风险等级下包含的任务子类*/
                  >
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Space>
              }
              name={[name, 'subTypes']}
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.components.FormTaskModal.component.SelectATaskSubclass',
                  }),
                  //请选择任务子类
                },
              ]}
            >
              <Checkbox.Group disabled={degree === 1} options={subTaskOptions} />
            </Form.Item>
            {degree === 1 && (
              <span className={styles.desc}>
                {
                  formatMessage({
                    id: 'odc.components.FormTaskModal.component.LevelIsUsedToEnsure',
                  })

                  /*等级 1 用于保障所有任务均能匹配到审批流程，默认选择任务子类，不支持修改*/
                }
              </span>
            )}
          </Space>
          {degree > 1 && (
            <>
              {EnabledRiskData && (
                <Form.Item
                  required
                  initialValue={false}
                  label={formatMessage({
                    id: 'odc.components.FormTaskModal.component.RiskData',
                  })}
                  /*风险数据*/ name={[name, 'containsRiskData']}
                >
                  <Radio.Group
                    options={[
                      {
                        label: formatMessage({
                          id: 'odc.components.FormTaskModal.component.NotIncluded',
                        }),

                        //不包含
                        value: false,
                      },

                      {
                        label: formatMessage({
                          id: 'odc.components.FormTaskModal.component.Include',
                        }),

                        //包含
                        value: true,
                      },
                    ]}
                  />
                </Form.Item>
              )}

              <Form.Item
                label={formatMessage({
                  id: 'odc.components.FormTaskModal.component.NumberOfChangedSqlStatements',
                })}
                /*变更的 SQL 数量范围*/ className={styles.varible}
              >
                <Input.Group compact>
                  <Form.Item name={[name, 'minAffectedRows']}>
                    <InputNumber
                      placeholder={formatMessage({
                        id: 'odc.components.FormTaskModal.component.MinimumValue',
                      })}
                      /*最小值*/ className={styles.inputLeft}
                      min={0}
                    />
                  </Form.Item>
                  <InputNumber placeholder="-" disabled className={styles.inputSplit} />
                  <Form.Item name={[name, 'maxAffectedRows']}>
                    <InputNumber
                      className={styles.inputRight}
                      min={0}
                      placeholder={formatMessage({
                        id: 'odc.components.FormTaskModal.component.Maximum',
                      })}

                      /*最大值*/
                    />
                  </Form.Item>
                </Input.Group>
              </Form.Item>
            </>
          )}
        </>
      )}

      <Form.Item
        className={`${showTaskSubclass && styles.formDvider} ${styles.approvalWrapper}`}
        label={
          <HelpDoc leftText isTip doc="approvalRoles">
            {
              formatMessage({
                id: 'odc.components.FormTaskModal.component.ConfigureApprovalNodes',
              })

              /*设置审批节点*/
            }
          </HelpDoc>
        }
        required
      >
        <AuthNode
          name={name}
          degree={degree}
          selectedRoles={selectedRoles}
          onRefFlow={handleRefFlow}
        />
      </Form.Item>
    </>
  );
};
