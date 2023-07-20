import { IManagerIntegration } from '@/d.ts';
import { ComponentType, IRule, RuleType } from '@/d.ts/rule';
import { Button, Checkbox, Descriptions, Drawer, Form, Radio, Select } from 'antd';
import { useForm } from 'antd/es/form/Form';
import React, { useEffect, useState } from 'react';
import EditPropertyComponentMap from './EditPropertyComponent';
import styles from './index.less';
interface EditRuleDrawerProps {
  editRuleDrawerVisible: boolean;
  ruleType: RuleType;
  rule: IRule;
  integrations: IManagerIntegration[];
  handleCloseModal: (fn?: () => void) => void;
  handleUpdateEnvironment: (rule: IRule, fn?: () => void) => void;
}
// 外部审批集成的标识 key
const ExternalApprovalKey =
  '${com.oceanbase.odc.builtin-resource.regulation.rule.sql-console.external-sql-interceptor.name}';

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
  const [isExternalApproval, setIsExternalApproval] = useState(false);
  const options = integrations?.map(({ id, name }) => {
    return {
      id,
      label: name,
    };
  });

  const onClose = () => {
    handleCloseModal(formRef.resetFields);
  };
  const onOk = async () => {
    const rawData = await formRef.validateFields().catch();
    const { appliedDialectTypes = [], level = 0 } = rawData;
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
          rawData[activeKey];
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
    };
    handleUpdateEnvironment(editedRule as IRule, formRef.resetFields);
  };
  useEffect(() => {
    if (editRuleDrawerVisible) {
      console.log(rule);
      const {
        appliedDialectTypes = [],
        level = 0,
        metadata: { propertyMetadatas },
        properties,
      } = rule;
      const newInitData = {
        appliedDialectTypes,
        level,
      };
      const isExternalApproval = propertyMetadatas?.some(
        (item) => item.name === ExternalApprovalKey,
      );
      propertyMetadatas.forEach((pm, index) => {
        newInitData[`activeKey${index}`] = properties[pm.name];
        if (pm?.candidates) {
          newInitData[`options${index}`] = pm?.candidates?.map((candidate) => ({
            value: candidate,
            label: candidate,
          }));
        }
      });
      setIsExternalApproval(isExternalApproval);
      setInitData(newInitData as any);
      formRef.setFieldsValue(newInitData);
    }
  }, [editRuleDrawerVisible]);
  return (
    <Drawer
      open={editRuleDrawerVisible}
      title={'编辑'}
      width={480}
      className={styles.modal}
      onClose={onClose}
      destroyOnClose={true}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', columnGap: '8px' }}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={onOk}>
            提交
          </Button>
        </div>
      }
    >
      <Descriptions column={1}>
        <Descriptions.Item label={'规则名称'}>{rule?.metadata?.name}</Descriptions.Item>
        <Descriptions.Item label={'规则描述'}>{rule?.metadata?.description}</Descriptions.Item>
        <Descriptions.Item label={'规则类型'}>
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
          activeKey: rule?.properties[rule?.metadata?.name],
        }}
      >
        <Form.Item key={'appliedDialectTypes'} label={'支持数据源'} name={'appliedDialectTypes'}>
          <Checkbox.Group>
            {rule?.metadata?.supportedDialectTypes?.map((sdt) => (
              <Checkbox value={sdt}>{sdt}</Checkbox>
            ))}
          </Checkbox.Group>
        </Form.Item>
        {isExternalApproval && (
          <Form.Item
            name="externalApproval"
            label="配置外部 SQL 检查集成"
            rules={[
              {
                required: true,
                message: '请选择',
              },
            ]}
          >
            <Select options={options} />
          </Form.Item>
        )}
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
            label={'改进等级'}
            name={'level'}
            rules={[
              {
                required: true,
                message: '请选择改进等级',
              },
            ]}
          >
            <Radio.Group>
              <Radio value={0}>无需改进</Radio>
              <Radio value={1}>建议改进</Radio>
              <Radio value={2}>必须改进</Radio>
            </Radio.Group>
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
};

export default EditRuleDrawer;
