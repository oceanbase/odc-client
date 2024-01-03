/*
 * Copyright 2024 OceanBase
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

import FormItemPanel from '@/component/FormItemPanel';
import HelpDoc from '@/component/helpDoc';
import { IPartitionPlanPeriodUnit, IPartitionPlanRecord, IPartitionPlanRecordDetail } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import {
  Button,
  Checkbox,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Tag,
} from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

interface IProps {
  visible: boolean;
  isBatch: boolean;
  activePartitionPlans: IPartitionPlanRecord[];
  onChange: (value: IPartitionPlanRecordDetail) => void;
  onClose: () => void;
}

const unitOptions = [
  {
    label: formatMessage({
      id: 'odc.components.PartitionPolicyTable.configModal.Day',
    }), //日
    value: IPartitionPlanPeriodUnit.DAY,
  },

  {
    label: formatMessage({
      id: 'odc.components.PartitionPolicyTable.configModal.Month',
    }), //月
    value: IPartitionPlanPeriodUnit.MONTH,
  },

  {
    label: formatMessage({
      id: 'odc.components.PartitionPolicyTable.configModal.Year',
    }), //年
    value: IPartitionPlanPeriodUnit.YEAR,
  },
];

const suffixOptions = [
  {
    label: 'yyyy',
    value: 'yyyy',
  },

  {
    label: 'yyyyMMdd',
    value: 'yyyyMMdd',
  },

  {
    label: 'yyyyMM',
    value: 'yyyyMM',
  },

  {
    label: 'yyyy_MM_dd',
    value: 'yyyy_MM_dd',
  },

  {
    label: 'yyyy_MM',
    value: 'yyyy_MM',
  },
];

const defaultValueMap = {
  [IPartitionPlanPeriodUnit.DAY]: 'yyyy_MM_dd',
  [IPartitionPlanPeriodUnit.MONTH]: 'yyyy_MM',
  [IPartitionPlanPeriodUnit.YEAR]: 'yyyy',
};

export const getUnitLabel = (value: IPartitionPlanPeriodUnit) => {
  return unitOptions.find((item) => item.value === value)?.label;
};

const defaultInitialValues = {
  preCreatePartitionCount: 12,
  partitionInterval: 12,
  expirePeriod: 12,
  partitionNamingPrefix: 'p',
  partitionIntervalUnit: IPartitionPlanPeriodUnit.MONTH,
  expirePeriodUnit: IPartitionPlanPeriodUnit.MONTH,
  isAutoPartition: true,
  partitionNamingSuffixExpression: defaultValueMap[IPartitionPlanPeriodUnit.MONTH],
};

const ConfigModal: React.FC<IProps> = (props) => {
  const { visible, activePartitionPlans, isBatch, onChange, onClose } = props;
  const [isAutoPartition, setIsAutoPartition] = useState(true);
  const [form] = Form.useForm();
  const isRequired = isAutoPartition;
  const tableLen = activePartitionPlans?.length;
  const moreText =
    tableLen > 10
      ? formatMessage(
          {
            id: 'odc.components.PartitionPolicyTable.configModal.WaitForTablelenTables',
          },
          { tableLen: tableLen },
        ) //`...等 ${tableLen} 个表`
      : '';
  const tableLabels = activePartitionPlans
    ?.slice(0, 10)
    ?.map((item) => item.tableName)
    ?.join('; ');

  const handleClose = () => {
    form.resetFields();
    setIsAutoPartition(true);
    onClose();
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((data) => {
        onChange(data);
        handleClose();
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  const handleAutoPartitionChange = (e) => {
    setIsAutoPartition(!e.target.checked);
  };

  const handleIntervalUnitChange = (value) => {
    const partitionNamingSuffixExpression = defaultValueMap[value];
    form.setFieldsValue({
      partitionNamingSuffixExpression,
    });
  };

  useEffect(() => {
    if (visible) {
      const value = activePartitionPlans?.[0]?.detail ?? defaultInitialValues;
      form.setFieldsValue(value);
      setIsAutoPartition(value.isAutoPartition);
    }
  }, [activePartitionPlans, visible]);

  return (
    <Modal
      title={formatMessage({
        id: 'odc.components.PartitionPolicyTable.configModal.SetPartitionPolicies',
      })} /*设置分区策略*/
      visible={visible}
      width={600}
      onCancel={handleClose}
      footer={
        <Space>
          <Button onClick={handleClose}>
            {
              formatMessage({
                id: 'odc.components.PartitionPolicyTable.configModal.Cancel',
              }) /*取消*/
            }
          </Button>
          {isBatch ? (
            <Popconfirm
              overlayStyle={{ width: '216px' }}
              title={formatMessage({
                id: 'odc.components.PartitionPolicyTable.configModal.BatchSettingWillOverwriteThe',
              })} /*批量设置将覆盖原有的策略，是否确定设置？*/
              onConfirm={handleOk}
              okText={formatMessage({
                id: 'odc.components.PartitionPolicyTable.configModal.Ok',
              })} /*确定*/
              cancelText={formatMessage({
                id: 'odc.components.PartitionPolicyTable.configModal.Return',
              })} /*返回*/
            >
              <Button type="primary">
                {
                  formatMessage({
                    id: 'odc.components.PartitionPolicyTable.configModal.Ok',
                  }) /*确定*/
                }
              </Button>
            </Popconfirm>
          ) : (
            <Button type="primary" onClick={handleOk}>
              {
                formatMessage({
                  id: 'odc.components.PartitionPolicyTable.configModal.Ok',
                }) /*确定*/
              }
            </Button>
          )}
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        initialValues={defaultInitialValues}
      >
        <Descriptions>
          <Descriptions.Item
            label={formatMessage({
              id: 'odc.components.PartitionPolicyTable.configModal.RangePartitionTable',
            })} /*Range 分区表*/
          >{`${tableLabels}${moreText}`}</Descriptions.Item>
        </Descriptions>
        <FormItemPanel
          keepExpand
          label={formatMessage({
            id: 'odc.components.PartitionPolicyTable.configModal.PartitionPolicy',
          })} /*分区策略*/
        >
          <Space size={20} align="start">
            <Form.Item
              required
              name="preCreatePartitionCount"
              label={
                <HelpDoc doc="preCreatePartitionCount" leftText>
                  {
                    formatMessage({
                      id:
                        'odc.components.PartitionPolicyTable.configModal.NumberOfPreCreatedPartitions',
                    }) /*预创建分区数量*/
                  }
                </HelpDoc>
              }
              rules={[
                {
                  required: isRequired,
                  message: formatMessage({
                    id: 'odc.components.PartitionPolicyTable.configModal.EnterTheNumberOfPre',
                  }), //请输入预创建分区数量
                },
              ]}
            >
              <InputNumber min={0} style={{ width: 100 }} disabled={!isAutoPartition} />
            </Form.Item>
            <Form.Item
              required
              name="partitionInterval"
              label={
                <HelpDoc doc="partitionInterval" leftText>
                  {
                    formatMessage({
                      id: 'odc.components.PartitionPolicyTable.configModal.PartitionInterval',
                    }) /*分区间隔*/
                  }
                </HelpDoc>
              }
              rules={[
                {
                  required: isRequired,
                  message: formatMessage({
                    id: 'odc.components.PartitionPolicyTable.configModal.EnterPartitionInterval',
                  }), //请输入分区间隔
                },
              ]}
            >
              <InputNumber
                min={0}
                disabled={!isAutoPartition}
                addonAfter={
                  <Form.Item name="partitionIntervalUnit" noStyle>
                    <Select
                      options={unitOptions}
                      style={{ width: 60 }}
                      onChange={handleIntervalUnitChange}
                    />
                  </Form.Item>
                }
                style={{ width: 160 }}
              />
            </Form.Item>
            <Form.Item
              required
              name="expirePeriod"
              label={
                <HelpDoc doc="expirePeriod" leftText>
                  {
                    formatMessage({
                      id: 'odc.components.PartitionPolicyTable.configModal.RetentionDuration',
                    }) /*保留时长*/
                  }
                </HelpDoc>
              }
              rules={[
                {
                  required: isRequired,
                  message: formatMessage({
                    id:
                      'odc.components.PartitionPolicyTable.configModal.PleaseEnterTheRetentionPeriod',
                  }), //请输入保留时长
                },
              ]}
            >
              <InputNumber
                min={0}
                disabled={!isAutoPartition}
                addonAfter={
                  <Form.Item name="expirePeriodUnit" noStyle>
                    <Select options={unitOptions} style={{ width: 60 }} />
                  </Form.Item>
                }
                style={{ width: 160 }}
              />
            </Form.Item>
          </Space>
          <Form.Item
            label={formatMessage({
              id: 'odc.components.PartitionPolicyTable.configModal.NamingRules',
            })}
            /*命名规则*/ required
          >
            <Space size={20} align="start">
              <Form.Item
                name="partitionNamingPrefix"
                rules={[
                  {
                    required: isRequired,
                    message: formatMessage({
                      id: 'odc.components.PartitionPolicyTable.configModal.EnterAPrefix',
                    }), //请输入前缀
                  },
                  {
                    pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
                    message: formatMessage({
                      id:
                        'odc.components.PartitionPolicyTable.configModal.OnlyEnglishDigitsAndUnderscores',
                    }), //仅支持英文/数字/下划线，且以英文开头
                  },
                  {
                    max: 32,
                    message: formatMessage({
                      id: 'odc.components.PartitionPolicyTable.configModal.NoMoreThanCharacters',
                    }), //不超过32个字符
                  },
                ]}
              >
                <Input
                  disabled={!isAutoPartition}
                  addonBefore={formatMessage({
                    id: 'odc.components.PartitionPolicyTable.configModal.Prefix',
                  })}
                  /*前缀*/ style={{ width: 140 }}
                />
              </Form.Item>
              <Input.Group compact>
                <Tag className={styles.suffix}>
                  {
                    formatMessage({
                      id: 'odc.components.PartitionPolicyTable.configModal.Suffix',
                    }) /*后缀*/
                  }
                </Tag>
                <Form.Item
                  name="partitionNamingSuffixExpression"
                  rules={[
                    {
                      required: isRequired,
                      message: formatMessage({
                        id: 'odc.components.PartitionPolicyTable.configModal.PleaseSelectASuffix',
                      }), //请选择后缀
                    },
                  ]}
                >
                  <Select
                    disabled={!isAutoPartition}
                    options={suffixOptions}
                    style={{ width: 140 }}
                  />
                </Form.Item>
              </Input.Group>
            </Space>
          </Form.Item>
        </FormItemPanel>
        <Form.Item
          name="isAutoPartition"
          required
          getValueFromEvent={(e) => {
            return !e.target.checked;
          }}
        >
          <Checkbox checked={!isAutoPartition} onChange={handleAutoPartitionChange}>
            {
              formatMessage({
                id: 'odc.components.PartitionPolicyTable.configModal.DoNotSetPartitionPolicies',
              }) /*不设置分区策略*/
            }
          </Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConfigModal;
