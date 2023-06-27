import { listEnvironments } from '@/common/network/env';
import { createRiskDetectRules } from '@/common/network/riskDetectRule';
import { IRiskDetectRule, RiskDetectRuleCondition } from '@/d.ts/riskDetectRule';
import { Button, Drawer, Form, Input, message, Space } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect, useState } from 'react';
import RiskLevelLabel from '../components/RiskLevelLabel';
import ConditionGroup from './components/Condition';

import styles from './index.less';
export interface SelectItemProps {
  label: string;
  value: string;
}
interface FormRiskDetectDrawerProps {
  isEdit?: boolean; // isEdit: fasle create | true edit
  selectedRecord: IRiskDetectRule;
  riskLevel: {
    value: number;
    label: string;
    level?: number;
    organizationId?: number;
    name?: string;
  };
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
  formModalVisible,
  setFormModalVisible,
}) => {
  const [formRef] = useForm();
  const [environmentIdMap, setEnvironmentIdMap] = useState<{
    [key in string]: number;
  }>({});
  const [environmentOptions, setEnvironmentOptions] = useState<SelectItemProps[]
  >([]);
  const [taskTypeOptions, setTaskTypeOptions] = useState<SelectItemProps[]
  >([]);
  const [sqlCheckResultOptions, setSqlCheckResultOptions] = useState<SelectItemProps[]
  >([]);

  const handleDrawerClose = () => {
    setFormModalVisible(false);
    // formRef.resetFields();
  };

  const handleDrawerSubmit = async () => {
    try {
      const rawData = await formRef.validateFields().catch();
      const result = await createRiskDetectRules({
        ...rawData,
        riskLevelId: riskLevel.value,
        risklLevel: riskLevel.level,
        bultin: true,
      });
      if (result) {
        message.success('新建成功');
        handleDrawerClose();
        reload();
      } else {
        message.error('新建失败');
      }
    } catch (error) {
      console.error(error);
    }
  };
  const init = async () => {
    const envOptions = await getEnvironmentOptions();
    const map = {};
    envOptions?.forEach((envOption) => (map[envOption?.value] = envOption?.label));
    setEnvironmentIdMap(map);
    setEnvironmentOptions(envOptions);

    const taskTypeOptions = await getTaskTypeOptions();
    setTaskTypeOptions(taskTypeOptions);

    const sqlCheckResultOptions = await getSqlCheckResultOptions();
    setSqlCheckResultOptions(sqlCheckResultOptions);
  };
  useEffect(() => {
    if (formModalVisible) {
      console.log(selectedRecord);
      init();
      if (isEdit) {
        formRef.setFieldsValue(selectedRecord);
        console.log(selectedRecord);
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
              新建
            </Button>
          </Space>
        </div>
      }
      className={styles.sqlDrawer}
    >
      <Space align="center" className={styles.tag}>
        <div className={styles.tagLabel}>风险等级: </div>
        <RiskLevelLabel
          level={selectedRecord?.riskLevel?.level}
          color={selectedRecord?.riskLevel?.style}
        />
      </Space>
      {formModalVisible && (
        <Form key="createForm" form={formRef} layout="vertical" initialValues={selectedRecord}>
          <Form.Item label={'规则名称'} name="name">
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

const getEnvironmentOptions = async () => {
  const rawData = (await listEnvironments()) || [];
  const newEnvOptions = rawData?.map((rd) => {
    return {
      label: rd.name,
      value: '' + rd.id,
    };
  });
  return newEnvOptions;
};

const getTaskTypeOptions = () => {
  const newTaskTypeOptions = [
    {
      label: 'IMPORT',
      value: 'import',
    },
    {
      label: 'EXPORT',
      value: 'export',
    },
    {
      label: 'MOCKDATA',
      value: 'mockdata',
    },
    {
      label: 'ASYNC',
      value: 'async',
    },
    {
      label: 'PARTITION_PLAN',
      value: 'partition_plan',
    },
    {
      label: 'SQL_PLAN',
      value: 'sql_plan',
    },
    {
      label: 'ALTER_SCHEDULE',
      value: 'alter_schedule',
    },
    {
      label: 'SHADOWTABLE_SYNC',
      value: 'shadowtable_sync',
    },
    {
      label: 'DATA_SAVE',
      value: 'data_save',
    },
  ];
  return newTaskTypeOptions;
};
const getSqlCheckResultOptions = () => {
  const sqlCheckResultOptions = [
    {
      label: '无需改进',
      value: '' + 1,
    },
    {
      label: '建议改进',
      value: '' + 2,
    },
    {
      label: '必须改进',
      value: '' + 3,
    },
  ];
  return sqlCheckResultOptions;
};
