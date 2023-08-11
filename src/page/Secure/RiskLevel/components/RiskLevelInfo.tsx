import { deleteTaskFlow, getTaskFlowList } from '@/common/network/manager';
import { updateRiskLevel } from '@/common/network/riskLevel';
import { IRiskLevel } from '@/d.ts/riskLevel';
import { canAcess } from '@/component/Acess';
import CommonTable from '@/component/CommonTable';
import { IOperationOptionType } from '@/component/CommonTable/interface';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { actionTypes, IManagerResourceType, ITaskFlow } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Divider, Drawer, Form, message, Modal, Select, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { inject, observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { getColumns } from './column';
import CreateApproval from './CreateApproval';
import styles from './index.less';

const RiskLevelInfo = ({ currentRiskLevel, memoryReload }) => {
  const [formRef] = useForm();
  const [approvalProcesses, setApprovalProcesses] = useState<ITaskFlow[]>();
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [selectOpen, setSelectOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [editId, setEditId] = useState<number>(null);
  const [manageApprovalProcessDrawerOpen, setManageApprovalProcessDrawerOpen] = useState<boolean>(
    false,
  );
  const [approvalProcessOptions, setApprovalProcessOptions] = useState<
    {
      label: string;
      value: number;
    }[]
  >([]);

  const canAcessCreate = canAcess({
    resourceIdentifier: IManagerResourceType.approval_flow,
    action: actionTypes.create,
  }).accessible;

  const onpenEditModal = () => {
    formRef.setFieldsValue({
      approvalFlowConfigId: currentRiskLevel?.approvalFlowConfigId,
    });
    setEditModalOpen(true);
  };
  const openFormModal = (id: number = null) => {
    setEditId(id);
    setFormModalVisible(true);
  };
  const handleDelete = (param: React.Key | React.Key[]) => {
    Modal.confirm({
      title: formatMessage({ id: 'odc.Secure.Approval.AreYouSureYouWant' }), //确认要删除审批流程吗？
      icon: <ExclamationCircleFilled style={{ color: 'var(--icon-orange-color)' }} />,
      cancelText: formatMessage({ id: 'odc.Secure.Approval.Cancel' }), //取消
      okText: formatMessage({ id: 'odc.Secure.Approval.Ok' }), //确定
      centered: true,
      onOk: () => {
        handleConfirmDelete(param as number);
      },
    });
  };
  const handleConfirmDelete = async (id: number) => {
    const res = await deleteTaskFlow(id);
    if (res) {
      message.success(
        formatMessage({ id: 'odc.Secure.Approval.DeletedSuccessfully' }), //删除成功
      );
      reloadData();
    }
  };
  const initEditRiskLevelDrawer = async () => {
    setLoading(true);
    const rawData = await getTaskFlowList();
    setApprovalProcessOptions(
      rawData?.contents?.map((rd) => ({
        label: rd.name,
        value: rd.id,
      })),
    );
    setApprovalProcesses(rawData?.contents);
    setLoading(false);
  };
  const reloadData = () => {
    initEditRiskLevelDrawer();
  };
  const handleModalSubmit = async () => {
    const formData = await formRef.validateFields().catch();
    const successFlag = await updateRiskLevel(currentRiskLevel?.id, formData);
    if (successFlag) {
      message.success('更新成功');
      await formRef.resetFields();
      setEditModalOpen(false);
      memoryReload();
    } else {
      message.error('更新失败');
    }
  };
  const columns = getColumns({
    openFormModal,
    handleDelete,
  });
  useEffect(() => {
    if (editModalOpen) {
      initEditRiskLevelDrawer();
    }
  }, [editModalOpen]);

  return (
    <>
      <Space direction="vertical" size={12}>
        <Space className={styles.tag}>
          <div className={styles.tagLabel}>
            风险等级<span>:</span>
          </div>
          <RiskLevelLabel level={currentRiskLevel?.level} color={currentRiskLevel?.style} />
        </Space>

        <Space className={styles.tag}>
          <div className={styles.tagLabel}>
            审批流程<span>:</span>
          </div>
          <div>
            {currentRiskLevel?.approvalFlowConfig?.name}
            <Button
              type="link"
              onClick={onpenEditModal}
              style={{
                padding: '0px 0px 0px 8px',
                border: 'none',
                height: '12px',
                lineHeight: '20px',
              }}
            >
              编辑
            </Button>
          </div>
        </Space>
      </Space>
      <Modal
        open={editModalOpen}
        title={'编辑审批流程'}
        width={480}
        bodyStyle={{ padding: '40px' }}
        closable
        onCancel={() => setEditModalOpen(false)}
        onOk={() => handleModalSubmit()}
      >
        <Form form={formRef} layout="vertical" requiredMark={'optional'}>
          <Form.Item
            label={'选择审批流程'}
            name="approvalFlowConfigId"
            rules={[
              {
                required: true,
                message: '请选择审批流程',
              },
            ]}
          >
            <Select
              options={approvalProcessOptions}
              placeholder={'请选择审批流程'}
              style={{ width: '320px' }}
              open={selectOpen}
              onDropdownVisibleChange={(visible) => setSelectOpen(visible)}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '0px 0' }} />
                  <Button
                    type="link"
                    block
                    style={{
                      textAlign: 'left',
                    }}
                    onClick={() => {
                      setSelectOpen(false);
                      setManageApprovalProcessDrawerOpen(true);
                    }}
                  >
                    管理审批流程
                  </Button>
                </>
              )}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Drawer
        open={manageApprovalProcessDrawerOpen}
        title={'管理审批流程'}
        width={720}
        onClose={() => setManageApprovalProcessDrawerOpen(false)}
      >
        <Button
          style={{
            marginBottom: '16px',
          }}
          type="primary"
          onClick={() => setFormModalVisible(true)}
        >
          新建审批流程
        </Button>
        <CommonTable
          key={'riskLevelInfo'}
          showToolbar={false}
          titleContent={null}
          operationContent={null}
          onLoad={null}
          onChange={null}
          tableProps={{
            columns: columns,
            dataSource: approvalProcesses,
            rowKey: 'id',
            pagination: false,
            loading: loading,
          }}
        />
      </Drawer>
      <CreateApproval
        editId={editId}
        formModalVisible={formModalVisible}
        setFormModalVisible={setFormModalVisible}
        reloadData={reloadData}
      />
    </>
  );
};
export default inject('userStore')(observer(RiskLevelInfo));
