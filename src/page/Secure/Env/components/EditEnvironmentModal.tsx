import { IRule, RuleType } from '@/d.ts/rule';
import { Checkbox, Form, Modal, Radio } from 'antd';
import { useForm } from 'antd/es/form/Form';
import React, { useEffect, useState } from 'react';
import EditPropertyComponentMap from './EditPropertyComponent';

interface EditModalProps {
  modalVisible: boolean;
  ruleType: RuleType;
  rule: IRule;
  handleCloseModal: () => void;
  handleUpdateEnvironment: (rule: IRule) => void;
}
const EditModal: React.FC<EditModalProps> = ({
  modalVisible,
  ruleType,
  rule,
  handleCloseModal,
  handleUpdateEnvironment,
}) => {
  const [formRef] = useForm();
  const [initData, setInitData] = useState();
  const onCancel = () => {
    handleCloseModal();
  };
  const onOk = async () => {
    const rawData = await formRef.validateFields().catch();
    const { appliedDialectTypes = [], level = 0 } = rawData;
    const activeKeys = Object.keys(rawData).filter((key) => key.includes('activeKey')) || [];
    const activeProperties = {};
    activeKeys.forEach((activeKey) => {
      activeProperties[`${rule.metadata.propertyMetadatas?.[activeKey.slice(9)]?.name}`] =
        rawData[activeKey];
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
    handleUpdateEnvironment(editedRule as IRule);
  };
  useEffect(() => {
    if (modalVisible) {
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
      propertyMetadatas.forEach((pm, index) => {
        newInitData[`activeKey${index}`] = properties[pm.name];
        if (pm?.candidates) {
          newInitData[`options${index}`] = pm?.candidates?.map((candidate) => ({
            value: candidate,
            label: candidate,
          }));
        }
      });
      setInitData(newInitData as any);

      formRef.setFieldsValue(newInitData);
    }
  }, [modalVisible]);
  return (
    <Modal
      visible={modalVisible}
      onCancel={onCancel}
      title={'编辑'}
      width={480}
      afterClose={() => formRef.resetFields()}
      maskClosable={false}
      centered={true}
      onOk={onOk}
    >
      {
        // modalVisible &&
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
          <Form.Item
            key={'appliedDialectTypes'}
            rules={[
              {
                required: true,
                message: '请选择支持数据源',
              },
            ]}
            label={'支持数据源'}
            name={'appliedDialectTypes'}
          >
            <Checkbox.Group>
              <Checkbox value={'OB_ORACLE'}>ORACLE</Checkbox>
              <Checkbox value={'OB_MYSQL'}>MYSQL</Checkbox>
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
      }
    </Modal>
  );
};
export default EditModal;
