import { createRiskDetectRules, updateRiskDetectRule } from '@/common/network/riskDetectRule';
import { IRiskDetectRule, RiskDetectRuleCondition } from '@/d.ts/riskDetectRule';
import { formatMessage } from '@/util/intl';
import { Button, Drawer, Form, Input, message, Space } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect } from 'react';
import RiskLevelLabel from '../../components/RiskLevelLabel';
import { SelectItemProps } from '../interface';
import ConditionGroup from './ConditionGroup';

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
  taskTypeIdMap: {
    [key in string | number]: string;
  };
  sqlCheckResultIdMap: {
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
  taskTypeIdMap,
  sqlCheckResultIdMap,
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
      message.success(
        isEdit
          ? formatMessage({
              id: 'odc.RiskDetectRules.components.FormRiskDetectDrawer.SavedSuccessfully',
            }) //保存成功
          : formatMessage({ id: 'odc.RiskDetectRules.components.FormRiskDetectDrawer.New' }), //新建成功
      );
      handleDrawerClose();
      reload();
    } else {
      message.error(
        isEdit
          ? formatMessage({ id: 'odc.RiskDetectRules.components.FormRiskDetectDrawer.SaveFailed' }) //保存失败
          : formatMessage({
              id: 'odc.RiskDetectRules.components.FormRiskDetectDrawer.FailedToCreate',
            }), //新建失败
      );
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
    return () => {
      formRef.resetFields();
    };
  }, [formModalVisible]);

  return (
    <Drawer
      title={
        isEdit
          ? formatMessage({
              id: 'odc.RiskDetectRules.components.FormRiskDetectDrawer.EditRiskIdentificationRules',
            }) //编辑风险识别规则
          : formatMessage({
              id: 'odc.RiskDetectRules.components.FormRiskDetectDrawer.CreateARiskIdentificationRule',
            }) //新建风险识别规则
      }
      visible={formModalVisible}
      width={600}
      forceRender={true}
      onClose={handleDrawerClose}
      destroyOnClose={true}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Button onClick={handleDrawerClose}>
              {
                formatMessage({
                  id: 'odc.RiskDetectRules.components.FormRiskDetectDrawer.Cancel',
                }) /*取消*/
              }
            </Button>
            <Button type="primary" onClick={handleDrawerSubmit}>
              {
                isEdit
                  ? formatMessage({
                      id: 'odc.RiskDetectRules.components.FormRiskDetectDrawer.Submit',
                    }) //提交
                  : formatMessage({
                      id: 'odc.RiskDetectRules.components.FormRiskDetectDrawer.Create',
                    }) //新建
              }
            </Button>
          </Space>
        </div>
      }
      className={styles.drawer}
    >
      <Space align="center" className={styles.tag}>
        <div className={styles.tagLabel}>
          {
            formatMessage({
              id: 'odc.RiskDetectRules.components.FormRiskDetectDrawer.RiskLevel',
            }) /*风险等级:*/
          }
        </div>
        <RiskLevelLabel level={riskLevel?.level} color={riskLevel?.style} />
      </Space>
      {formModalVisible && (
        <Form key="createForm" form={formRef} layout="vertical" requiredMark="optional">
          <Form.Item
            label={
              formatMessage({ id: 'odc.RiskDetectRules.components.FormRiskDetectDrawer.RuleName' }) //规则名称
            }
            name="name"
            required
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.RiskDetectRules.components.FormRiskDetectDrawer.EnterARuleName',
                }), //请输入规则名称
              },
            ]}
          >
            <Input
              style={{
                width: '568px',
              }}
              placeholder={
                formatMessage({
                  id: 'odc.RiskDetectRules.components.FormRiskDetectDrawer.EnterASpecificationName',
                }) //请输入规范名称
              }
            />
          </Form.Item>
          <Form.Item>
            <ConditionGroup
              {...{
                isEdit,
                formRef,
                selectedRecord,
                environmentIdMap,
                taskTypeIdMap,
                sqlCheckResultIdMap,
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
