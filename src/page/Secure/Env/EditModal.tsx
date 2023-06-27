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
  const [options, setOptions] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);
  const onCancel = () => {
    handleCloseModal();
  };
  const onOk = async () => {
    const {
      appliedDialectTypes = [],
      level = 0,
      activeKey = null,
    } = await formRef.validateFields().catch();
    const editedRule: Partial<IRule> = {
      ...rule,
      appliedDialectTypes,
      level,
      properties: {
        ...rule.properties,
        [`${rule.metadata.propertyMetadatas?.[0]?.name}`]: activeKey,
      },
    };
    handleUpdateEnvironment(editedRule as IRule);
  };
  useEffect(() => {
    if (modalVisible) {
      console.log(rule);
      const {
        appliedDialectTypes = [],
        level = 0,
        metadata: { propertyMetadatas },
        properties,
      } = rule;

      const { candidates = [], name: activeKey } = propertyMetadatas?.[0];
      const options = candidates?.map((candidate) => {
        return {
          value: candidate,
          label: candidate,
        };
      });
      setOptions(options);
      formRef.setFieldsValue({
        appliedDialectTypes,
        activeKey: properties[activeKey],
        level,
      });
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
          <EditPropertyComponentMap
            label={rule?.metadata?.name}
            propertyMetadata={rule?.metadata?.propertyMetadatas?.[0]}
            options={options}
          />
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
