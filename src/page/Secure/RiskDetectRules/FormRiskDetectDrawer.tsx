import { IRiskDetectRule } from '@/d.ts/riskDetectRule';
import { Button, Drawer, Form, Input, Space } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { Condition } from 'aws-sdk/clients/cloudwatchevents';
import { useEffect } from 'react';
import ConditionGroup from '../components/Condition';
import styles from './index.less';

interface FormRiskDetectDrawerProps {
  isEdit?: boolean; // isEdit: fasle create | true edit
  riskDetectRule: IRiskDetectRule;
  onCancel?: () => void;
  onSubmit?: () => void;
  formModalVisible: boolean;
  setFormModalVisible: (v: boolean) => void;
}
interface InitValuesProps {
  name?: string;
  conditions?: Condition[];
}
const FormRiskDetectDrawer: React.FC<FormRiskDetectDrawerProps> = ({
  isEdit = false,
  riskDetectRule,
  formModalVisible,
  setFormModalVisible,
}) => {
  const [formRef] = useForm();

  const handleDrawerClose = () => {
    setFormModalVisible(false);
    formRef.resetFields();
  };
  const handleDrawerSubmit = async () => {
    const configValue = await formRef.validateFields().catch();
    // createRiskDetectRules(configValue)
    console.log(configValue);
  };
  useEffect(() => {
    formRef.setFieldsValue(riskDetectRule);
  }, [formModalVisible]);
  return (
    <Drawer
      title={isEdit ? '编辑风险识别规则' : '新建风险识别规则'}
      visible={formModalVisible}
      width={600}
      forceRender={true}
      onClose={handleDrawerClose}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Button onClick={handleDrawerClose}>取消</Button>
            <Button type="primary" onClick={handleDrawerSubmit}>
              新建
            </Button>
          </Space>
        </div>
      }
      className={styles.sqlDrawer}
    >
      {formModalVisible && (
        <Form key="createForm" form={formRef} layout="vertical" initialValues={riskDetectRule}>
          <Form.Item label={'规则名称'} name="name">
            <Input
              style={{
                width: '568px',
              }}
              placeholder={'请输入规范名称'}
            />
          </Form.Item>
          <Form.Item>
            <ConditionGroup initialValue={riskDetectRule?.conditions} />
          </Form.Item>
        </Form>
      )}
    </Drawer>
  );
};
export default FormRiskDetectDrawer;
