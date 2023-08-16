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

import { deleteTaskFlow, getTaskFlowList } from '@/common/network/manager';
import { updateRiskLevel } from '@/common/network/riskLevel';
import { IRiskLevel } from '@/d.ts/riskLevel';
import { Acess, canAcess, createPermission } from '@/component/Acess';
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
import Action from '@/component/Action';
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
      title: formatMessage({
        id: 'odc.Secure.Approval.AreYouSureYouWant',
      }),
      //确认要删除审批流程吗？
      icon: (
        <ExclamationCircleFilled
          style={{
            color: 'var(--icon-orange-color)',
          }}
        />
      ),
      cancelText: formatMessage({
        id: 'odc.Secure.Approval.Cancel',
      }),
      //取消
      okText: formatMessage({
        id: 'odc.Secure.Approval.Ok',
      }),
      //确定
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
        formatMessage({
          id: 'odc.Secure.Approval.DeletedSuccessfully',
        }), //删除成功
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
      message.success(
        formatMessage({
          id: 'odc.src.page.Secure.RiskLevel.components.UpdateCompleted.1',
        }), //'更新成功'
      );
      await formRef.resetFields();
      setEditModalOpen(false);
      memoryReload();
    } else {
      message.error(
        formatMessage({
          id: 'odc.src.page.Secure.RiskLevel.components.UpdateFailure.1',
        }), //'更新失败'
      );
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
            {
              formatMessage({
                id: 'odc.src.page.Secure.RiskLevel.components.RiskLevel',
              }) /* 
            风险等级 */
            }
            <span>:</span>
          </div>
          <RiskLevelLabel level={currentRiskLevel?.level} color={currentRiskLevel?.style} />
        </Space>

        <Space className={styles.tag}>
          <div className={styles.tagLabel}>
            {
              formatMessage({
                id: 'odc.src.page.Secure.RiskLevel.components.ApprovalProcess.1',
              }) /* 
            审批流程 */
            }
            <span>:</span>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '8px',
            }}
          >
            {currentRiskLevel?.approvalFlowConfig?.name}
            <Action.Group>
              <Acess {...createPermission(IManagerResourceType.risk_level, actionTypes.update)}>
                <Action.Link disabled={currentRiskLevel?.builtIn} onClick={onpenEditModal}>
                  {
                    formatMessage({
                      id: 'odc.src.page.Secure.RiskLevel.components.Edit',
                    }) /* 
                  编辑
                 */
                  }
                </Action.Link>
              </Acess>
            </Action.Group>
          </div>
        </Space>
      </Space>
      <Modal
        open={editModalOpen}
        title={
          formatMessage({
            id: 'odc.src.page.Secure.RiskLevel.components.EditApprovalProcess',
          }) //'编辑审批流程'
        }
        width={480}
        bodyStyle={{
          padding: '40px',
        }}
        closable
        onCancel={() => setEditModalOpen(false)}
        onOk={() => handleModalSubmit()}
      >
        <Form form={formRef} layout="vertical" requiredMark={'optional'}>
          <Form.Item
            label={
              formatMessage({
                id: 'odc.src.page.Secure.RiskLevel.components.ChooseTheApprovalProcess',
              }) //'选择审批流程'
            }
            name="approvalFlowConfigId"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.src.page.Secure.RiskLevel.components.PleaseSelectTheApprovalProcess',
                }), //'请选择审批流程'
              },
            ]}
          >
            <Select
              options={approvalProcessOptions}
              placeholder={
                formatMessage({
                  id: 'odc.src.page.Secure.RiskLevel.components.PleaseSelectTheApprovalProcess.1',
                }) //'请选择审批流程'
              }
              style={{
                width: '320px',
              }}
              open={selectOpen}
              onDropdownVisibleChange={(visible) => setSelectOpen(visible)}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider
                    style={{
                      margin: '0px 0',
                    }}
                  />
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
                    {
                      formatMessage({
                        id: 'odc.src.page.Secure.RiskLevel.components.ManagementApprovalProcess',
                      }) /* 
                    管理审批流程
                   */
                    }
                  </Button>
                </>
              )}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Drawer
        open={manageApprovalProcessDrawerOpen}
        title={
          formatMessage({
            id: 'odc.src.page.Secure.RiskLevel.components.ManagementApprovalProcess.1',
          }) //'管理审批流程'
        }
        width={720}
        onClose={() => setManageApprovalProcessDrawerOpen(false)}
      >
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              marginBottom: '16px',
            }}
          >
            <Action.Group>
              <Acess
                {...createPermission(IManagerResourceType.approval_flow, actionTypes.create)}
                fallback={
                  <Action.Button
                    disabled
                    type="primary"
                    onClick={async () => {
                      await setFormModalVisible(true);
                    }}
                  >
                    {
                      formatMessage({
                        id: 'odc.src.page.Secure.RiskLevel.components.NewApprovalProcess',
                      }) /* 
                新建审批流程
               */
                    }
                  </Action.Button>
                }
              >
                <Action.Button
                  type="primary"
                  onClick={async () => {
                    await setFormModalVisible(true);
                  }}
                >
                  {
                    formatMessage({
                      id: 'odc.src.page.Secure.RiskLevel.components.NewApprovalProcess',
                    }) /* 
                  新建审批流程
                 */
                  }
                </Action.Button>
              </Acess>
            </Action.Group>
          </div>

          <div style={{ flexGrow: 1, flexShrink: 1 }}>
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
          </div>
        </div>
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
