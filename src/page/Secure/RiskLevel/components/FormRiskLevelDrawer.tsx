import { updateRiskLevel } from '@/common/network/riskLevel';
import { getTaskFlowList } from '@/common/network/task';
import { IRiskLevel } from '@/d.ts/riskLevel';
import { UserStore } from '@/store/login';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Drawer, Form, Input, message, Select, Space, Spin } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect, useState } from 'react';
import CreateApproval from './CreateApproval';
import styles from './index.less';

interface FormRiskLevelDrawerProps {
  visible: boolean;
  selectedRecord: IRiskLevel;
  reload: () => void;
  userStore?: UserStore;
  handleEditRiskLevelDrawerClose: () => void;
}

const FormRiskLevelDrawer: React.FC<FormRiskLevelDrawerProps> = ({
  visible,
  selectedRecord,
  reload,
  userStore,
  handleEditRiskLevelDrawerClose,
}) => {
  const {
    user: { organizationId },
  } = userStore;
  const [formRef] = useForm();
  const [createApprovalDrawerOpen, setCreateApprovalDrawerOpen] = useState<boolean>(false);
  const [selectOpen, setSelectOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [approvalProcessOptions, setApprovalProcessOptions] = useState<
    {
      label: string;
      value: number;
    }[]
  >([]);
  const onClose = () => {
    handleEditRiskLevelDrawerClose();
    formRef.resetFields();
  };
  const initEditRiskLevelDrawer = async () => {
    setLoading(true);
    const rawData = (await getTaskFlowList()) || [];
    setApprovalProcessOptions(
      rawData.map((rd) => ({
        label: rd.name,
        value: rd.id,
      })),
    );
    setLoading(false);
  };

  const handleFormSubmit = async () => {
    const rawData = await formRef.validateFields().catch();
    const result = await updateRiskLevel(selectedRecord.id, rawData);
    if (result) {
      message.success('更新成功');
      handleEditRiskLevelDrawerClose();
      formRef.resetFields();
      reload();
    } else {
      message.error('更新失败');
    }
  };
  useEffect(() => {
    if (visible) {
      initEditRiskLevelDrawer();
      formRef.setFieldsValue(selectedRecord);
    }
  }, [visible]);

  return (
    <Drawer
      title={'编辑风险等级'}
      width={520}
      visible={visible}
      footerStyle={{
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      destroyOnClose={true}
      onClose={onClose}
      footer={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={handleFormSubmit}>
            确定
          </Button>
        </Space>
      }
      className={styles.riskLevelDrawer}
    >
      <Spin spinning={loading}>
        <Form form={formRef} layout={'vertical'} requiredMark={'optional'}>
          <Form.Item
            label={'选择审批流程'}
            name="approvalFlowConfigId"
            required
            rules={[
              {
                required: true,
                message: '请选择审批流程',
              },
            ]}
          >
            <Select
              options={approvalProcessOptions}
              placeholder={'请选择'}
              style={{ width: '250px' }}
              open={selectOpen}
              onDropdownVisibleChange={(visible) => setSelectOpen(visible)}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '0px 0' }} />
                  <Button
                    type="text"
                    block
                    style={{
                      textAlign: 'left',
                    }}
                    // icon={<PlusOutlined />}
                    onClick={() => {
                      setSelectOpen(false);
                      setCreateApprovalDrawerOpen(true);
                    }}
                  >
                    <PlusOutlined />
                    新建审批流程
                  </Button>
                  <CreateApproval
                    {...{
                      createApprovalDrawerOpen,
                      setCreateApprovalDrawerOpen,
                      reloadData: initEditRiskLevelDrawer,
                    }}
                  />
                </>
              )}
            />
          </Form.Item>
          <Form.Item label={'描述'} name="description">
            <Input.TextArea placeholder={'请输入描述'} />
          </Form.Item>
        </Form>
      </Spin>
    </Drawer>
  );
};
export default FormRiskLevelDrawer;
