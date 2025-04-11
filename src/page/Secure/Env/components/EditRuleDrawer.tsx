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

import HelpDoc from '@/component/helpDoc';
import { IManagerIntegration } from '@/d.ts';
import { ComponentType, IRule, RuleType } from '@/d.ts/rule';
import { formatMessage } from '@/util/intl';
import { Button, Checkbox, Col, Descriptions, Drawer, Form, Radio, Row, Switch } from 'antd';
import { useForm } from 'antd/es/form/Form';
import React, { useEffect, useState } from 'react';
import { RiskLevelEnum, RiskLevelTextMap } from '../../interface';
import EditPropertyComponentMap from './EditPropertyComponent';
import styles from './index.less';
import setting from '@/store/setting';
interface EditRuleDrawerProps {
  editRuleDrawerVisible: boolean;
  ruleType: RuleType;
  rule: IRule;
  integrations: IManagerIntegration[];
  handleCloseModal: (fn?: () => void) => void;
  handleUpdateEnvironment: (rule: IRule, fn?: () => void) => void;
}
// 外部审批集成的标识 key
export const SqlInterceptorKey =
  '${com.oceanbase.odc.builtin-resource.regulation.rule.sql-console.external-sql-interceptor.metadata.name}';
const EditRuleDrawer: React.FC<EditRuleDrawerProps> = ({
  editRuleDrawerVisible,
  ruleType,
  rule,
  integrations,
  handleCloseModal,
  handleUpdateEnvironment,
}) => {
  const [formRef] = useForm();
  const [initData, setInitData] = useState();
  const options = integrations?.map(({ id, name }) => {
    return {
      value: id,
      label: name,
    };
  });
  const onClose = () => {
    handleCloseModal(formRef.resetFields);
  };
  const onOk = async () => {
    const rawData = await formRef.validateFields().catch();
    const { appliedDialectTypes = [], level = 1 } = rawData;
    const activeKeys = Object.keys(rawData).filter((key) => key.includes('activeKey')) || [];
    const activeProperties = {};
    activeKeys.forEach((activeKey) => {
      if (
        rule.metadata.propertyMetadatas?.[activeKey.slice(9)]?.componentType ===
        ComponentType.INPUT_STRING
      ) {
        activeProperties[`${rule.metadata.propertyMetadatas?.[activeKey.slice(9)]?.name}`] =
          rawData[activeKey] ? rawData[activeKey] : null;
      } else {
        activeProperties[`${rule.metadata.propertyMetadatas?.[activeKey.slice(9)]?.name}`] =
          rawData[activeKey] !== -1 ? rawData[activeKey] : null;
      }
    });
    const editedRule: Partial<IRule> = {
      ...rule,
      appliedDialectTypes,
      level,
      properties: {
        ...rule.properties,
        ...activeProperties,
      },
      enabled: rawData?.enabled,
    };
    handleUpdateEnvironment(editedRule as IRule, formRef.resetFields);
  };
  useEffect(() => {
    if (editRuleDrawerVisible) {
      const {
        appliedDialectTypes = [],
        level = 0,
        metadata: { propertyMetadatas },
        properties,
        enabled,
      } = rule;
      const newInitData = {
        appliedDialectTypes,
        level,
        enabled,
      };
      setting.getSpaceConfig();
      propertyMetadatas.forEach((pm, index) => {
        newInitData[`activeKey${index}`] = properties?.[pm.name];
        if (pm?.name === SqlInterceptorKey) {
          options.unshift({
            label: formatMessage({
              id: 'odc.src.page.Secure.Env.components.Null',
              defaultMessage: '空',
            }), //'空'
            value: -1,
          });
          newInitData[`options${index}`] = options;
        } else {
          if (pm?.candidates) {
            newInitData[`options${index}`] = pm?.candidates?.map((candidate) => ({
              value: candidate,
              label: candidate,
            }));
          } else {
            newInitData[`options${index}`] = [];
          }
        }
      });
      setInitData(newInitData as any);
      formRef.setFieldsValue(newInitData);
    }
  }, [editRuleDrawerVisible]);
  return (
    <Drawer
      open={editRuleDrawerVisible}
      title={
        formatMessage({
          id: 'odc.Env.components.EditRuleDrawer.Edit',
          defaultMessage: '编辑',
        }) //编辑
      }
      width={480}
      rootClassName={styles.modal}
      onClose={onClose}
      destroyOnClose={true}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            columnGap: '8px',
          }}
        >
          <Button onClick={onClose}>
            {
              formatMessage({
                id: 'odc.Env.components.EditRuleDrawer.Cancel',
                defaultMessage: '取消',
              }) /*取消*/
            }
          </Button>
          <Button type="primary" onClick={onOk}>
            {
              formatMessage({
                id: 'odc.Env.components.EditRuleDrawer.Submit',
                defaultMessage: '提交',
              }) /*提交*/
            }
          </Button>
        </div>
      }
    >
      <Descriptions column={1}>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.Env.components.EditRuleDrawer.RuleName',
              defaultMessage: '规则名称',
            }) //规则名称
          }
        >
          {rule?.metadata?.name}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.Env.components.EditRuleDrawer.RuleDescription',
              defaultMessage: '规则描述',
            }) //规则描述
          }
        >
          {rule?.metadata?.description}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.Env.components.EditRuleDrawer.RuleType',
              defaultMessage: '规则类型',
            }) //规则类型
          }
        >
          {rule?.metadata?.subTypes?.join(',') || '-'}
        </Descriptions.Item>
      </Descriptions>
      <Form
        layout="vertical"
        form={formRef}
        requiredMark="optional"
        initialValues={{
          level: 0,
          appliedDialectTypes: [],
          activeKey: rule?.properties?.[rule?.metadata?.name],
        }}
      >
        <Form.Item
          key={'appliedDialectTypes'}
          label={
            formatMessage({
              id: 'odc.Env.components.EditRuleDrawer.SupportsDataSources',
              defaultMessage: '支持数据源',
            }) //支持数据源
          }
          name={'appliedDialectTypes'}
        >
          <Checkbox.Group style={{ width: '100%' }}>
            {Array.from({
              length: Math.ceil(rule?.metadata?.supportedDialectTypes?.length / 2),
            })?.map((_, index) => {
              const sdt1 = rule?.metadata?.supportedDialectTypes[2 * index];
              const sdt2 = rule?.metadata?.supportedDialectTypes[2 * index + 1];
              const inRange = 2 * index + 1 < rule?.metadata?.supportedDialectTypes?.length; // inRange 为false，已经超出数组长度，不渲染多余的空checkbox
              return (
                <div style={{ display: 'flex', width: '100%' }}>
                  <div style={{ flex: 1 }}>
                    <Checkbox value={sdt1} key={2 * index}>
                      {sdt1}
                    </Checkbox>
                  </div>
                  {inRange && (
                    <div style={{ flex: 1 }}>
                      <Checkbox value={sdt2} key={2 * index + 1}>
                        {sdt2}
                      </Checkbox>
                    </div>
                  )}
                </div>
              );
            })}
          </Checkbox.Group>
        </Form.Item>

        {rule?.metadata?.propertyMetadatas?.map((pm, index) => {
          return (
            <EditPropertyComponentMap
              index={index}
              description={pm.description}
              label={pm?.displayName}
              propertyMetadata={pm}
              initData={initData}
            />
          );
        })}
        {ruleType === RuleType.SQL_CHECK && (
          <Form.Item
            label={
              formatMessage({
                id: 'odc.Env.components.EditRuleDrawer.ImprovementLevel',
                defaultMessage: '改进等级',
              }) //改进等级
            }
            name={'level'}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.Env.components.EditRuleDrawer.SelectAnImprovementLevel',
                  defaultMessage: '请选择改进等级',
                }), //请选择改进等级
              },
            ]}
          >
            <Radio.Group>
              <Radio value={RiskLevelEnum.DEFAULT}>
                <HelpDoc
                  leftText
                  title={formatMessage({
                    id: 'odc.Env.components.EditRuleDrawer.AllowExecution',
                    defaultMessage: '允许执行',
                  })} /*允许执行*/
                >
                  {RiskLevelTextMap[RiskLevelEnum.DEFAULT]}
                </HelpDoc>
              </Radio>
              <Radio value={RiskLevelEnum.SUGGEST}>
                <HelpDoc
                  leftText
                  title={formatMessage({
                    id: 'odc.Env.components.EditRuleDrawer.ApprovalRequiredBeforeExecution',
                    defaultMessage: '执行之前需要审批',
                  })} /*执行之前需要审批*/
                >
                  {RiskLevelTextMap[RiskLevelEnum.SUGGEST]}
                </HelpDoc>
              </Radio>
              <Radio value={RiskLevelEnum.MUST}>
                <HelpDoc
                  leftText
                  title={formatMessage({
                    id: 'odc.Env.components.EditRuleDrawer.ExecutionIsProhibitedAndApproval',
                    defaultMessage: '禁止执行，无法发起审批',
                  })} /*禁止执行，无法发起审批*/
                >
                  {RiskLevelTextMap[RiskLevelEnum.MUST]}
                </HelpDoc>
              </Radio>
            </Radio.Group>
          </Form.Item>
        )}

        <Form.Item
          name="enabled"
          label={
            formatMessage({
              id: 'src.page.Secure.Env.components.074ED6D7',
              defaultMessage: '是否启用',
            }) /*"是否启用"*/
          }
          required
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
export default EditRuleDrawer;
