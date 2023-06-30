import { createRiskDetectRules, updateRiskDetectRule } from '@/common/network/riskDetectRule';
import { IRiskDetectRule, RiskDetectRuleCondition } from '@/d.ts/riskDetectRule';
import { Button, Drawer, Form, Input, message, Space } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect } from 'react';
import RiskLevelLabel from '../components/RiskLevelLabel';
import ConditionGroup from './components/ConditionGroup';
import { SelectItemProps } from './index';

import styles from './index.less';
interface FormRiskDetectDrawerProps {
  isEdit?: boolean; // isEdit: fasle create | true edit
  selectedRecord: IRiskDetectRule;
  riskLevel: {
    value: number;
    label: string;
    level?: number;
    organizationId?: number;
    name?: string;
    style?: string;
  };

  environmentIdMap: {
    [key in string | number]: string;
  };
  environmentOptions: SelectItemProps[];
  taskTypeOptions: SelectItemProps[];
  sqlCheckResultOptions: SelectItemProps[];
  reload: () => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  formModalVisible: boolean;
  setFormModalVisible: (v: boolean) => void;
}
interface InitValuesProps {
  name?: string;
  conditions?: RiskDetectRuleCondition[];
}
const FormRiskDetectDrawer: React.FC<FormRiskDetectDrawerProps> = ({
  isEdit = false,
  selectedRecord,
  riskLevel,
  reload,
  environmentIdMap,
  environmentOptions,
  taskTypeOptions,
  sqlCheckResultOptions,
  formModalVisible,
  setFormModalVisible,
}) => {
  const [formRef] = useForm();

  const handleDrawerClose = () => {
    setFormModalVisible(false);
    // formRef.resetFields();
  };

  const handleDrawerSubmit = async () => {
    const rawData = await formRef.validateFields().catch();
    let result = false;
    if (isEdit) {
      result = await updateRiskDetectRule(selectedRecord.id, {
        ...selectedRecord,
        ...rawData,
      });
    } else {
      result = await createRiskDetectRules({
        ...rawData,
        riskLevelId: riskLevel.value,
        risklLevel: riskLevel.level,
        bultin: true,
      });
    }
    if (result) {
      message.success(isEdit ? '保存成功' : '新建成功');
      handleDrawerClose();
      reload();
    } else {
      message.error(isEdit ? '保存失败' : '新建失败');
    }
  };
  useEffect(() => {
    if (formModalVisible) {
      if (isEdit) {
        formRef.setFieldsValue(selectedRecord);
      } else {
        formRef.setFieldsValue({
          name: '',
          conditions: [
            {
              expression: undefined,
              operation: undefined,
              value: undefined,
            },
          ],
        });
      }
    }
  }, [formModalVisible]);

  return (
    <Drawer
      title={isEdit ? '编辑风险识别规则' : '新建风险识别规则'}
      visible={formModalVisible}
      width={600}
      forceRender={true}
      onClose={handleDrawerClose}
      destroyOnClose={true}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Button onClick={handleDrawerClose}>取消</Button>
            <Button type="primary" onClick={handleDrawerSubmit}>
              {isEdit ? '提交' : '新建'}
            </Button>
          </Space>
        </div>
      }
      className={styles.sqlDrawer}
    >
      <Space align="center" className={styles.tag}>
        <div className={styles.tagLabel}>风险等级: </div>
        <RiskLevelLabel level={riskLevel?.level} color={riskLevel?.style} />
      </Space>
      {formModalVisible && (
        <Form
          key="createForm"
          form={formRef}
          layout="vertical"
          requiredMark="optional"
          initialValues={selectedRecord}
        >
          <Form.Item
            label={'规则名称'}
            name="name"
            required
            rules={[
              {
                required: true,
                message: '请输入规则名称',
              },
            ]}
          >
            <Input
              style={{
                width: '568px',
              }}
              placeholder={'请输入规范名称'}
            />
          </Form.Item>
          <Form.Item>
            <ConditionGroup
              {...{
                isEdit,
                formRef,
                selectedRecord,
                environmentIdMap,
                environmentOptions,
                taskTypeOptions,
                sqlCheckResultOptions,
              }}
            />
          </Form.Item>
        </Form>
      )}
    </Drawer>
  );
};
export default FormRiskDetectDrawer;
