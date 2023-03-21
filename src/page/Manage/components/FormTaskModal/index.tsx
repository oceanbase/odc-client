import { createTaskFlow, getTaskFlowDetail, updateTaskFlow } from '@/common/network/manager';
import Action from '@/component/Action';
import { TaskPageType, TaskType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Button, Drawer, message, Modal, Radio, Space } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { flatten } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import type { IRiskLevelConfig, ITaskFlowConfig } from '../../interface';
import { hour2Seconds, seconds2Hour } from '../TaskFlowPage';
import ConfigForm from './configForm';
import styles from './index.less';
import ResourceForm from './resourceForm';

interface IProps {
  visible: boolean;
  editId: number;
  isCopy: boolean;
  defaultTaskType?: TaskPageType;
  onClose: () => void;
  reloadData: () => void;
  openOrderModal: () => void;
  handleStatusChange?: (id: number, enabled: boolean, callback: () => void) => void;
}

const FormTaskModal: React.FC<IProps> = (props) => {
  const [hasChange, setHasChange] = useState(false);
  const [degree, setDegree] = useState(1);
  const [builtIn, setBuiltIn] = useState(false);
  const [originName, setOriginName] = useState('');
  const [activeKey, setActiveKey] = useState('0');
  const [riskLevelConfigs, setRiskLevelConfigs] = useState<IRiskLevelConfig[]>([]);
  const [initSelectedRoles, setInitSelectedRoles] = useState([]);
  const [mode, setMode] = useState('config');
  const [resourceData, setResourceData] = useState({
    associateAll: false,
  });

  const configFormRef = useRef<FormInstance>();
  const resourceFormRef = useRef<FormInstance>();
  const { visible, defaultTaskType, editId, isCopy } = props;
  const isEdit = !!editId && !isCopy;
  const submitText = isEdit
    ? formatMessage({ id: 'odc.components.FormTaskModal.Save' }) //保存
    : formatMessage({ id: 'odc.components.FormTaskModal.Create' }); //新建
  function handleEditStatus() {
    setHasChange(true);
  }

  useEffect(() => {
    if (editId) {
      loadEditData(editId);
    } else {
      setBuiltIn(false);
      setResourceData({
        associateAll: false,
      });
    }
  }, [editId]);

  useEffect(() => {
    if (configFormRef.current) {
      const defaultValues = configFormRef.current?.getFieldValue('riskLevelConfigs') ?? [];
      let riskLevelConfigs: {
        subTypes?: string[];
        containsRiskData?: boolean;
        approvalRoleIds?: (number | string)[];
      }[] = [...defaultValues];

      if (riskLevelConfigs.length >= degree) {
        riskLevelConfigs = riskLevelConfigs.slice(0, degree);
      } else {
        Array(degree - riskLevelConfigs?.length)
          .fill(null)
          .forEach(() => {
            riskLevelConfigs.push({
              containsRiskData: false,
              approvalRoleIds: [undefined],
            });
          });
      }
      configFormRef.current.setFieldsValue({
        riskLevelConfigs,
        degree,
      });

      setActiveKey('0');
    }
  }, [degree]);

  async function loadEditData(_editId: number) {
    const data = await getTaskFlowDetail(_editId);
    const degree = data.riskLevelConfigs.length;
    if (isCopy) {
      data.name = formatMessage(
        {
          id: 'odc.components.FormTaskModal.DatanameCopy',
        },

        { dataName: data.name },
      );

      //`${data.name}_复制`
    }
    const {
      approvalExpirationIntervalSeconds,
      executionExpirationIntervalSeconds,
      waitExecutionExpirationIntervalSeconds,
    } = data;
    const formData = {
      ...data,
      degree,
      riskLevelConfigs: data?.riskLevelConfigs?.map(
        ({ id, approvalRoleIdToInnerUserMap, ...rest }) => ({ ...rest }),
      ),
      approvalExpirationIntervalSeconds: seconds2Hour(approvalExpirationIntervalSeconds),
      executionExpirationIntervalSeconds: seconds2Hour(executionExpirationIntervalSeconds),
      waitExecutionExpirationIntervalSeconds: seconds2Hour(waitExecutionExpirationIntervalSeconds),
    };

    const resourceFormData = {
      associateAll: data.associateAll,
      publicResourcePermissions: data?.relatedResources?.map(
        ({ resourceId: id, resourceType: resourceIdentifier }) => ({
          id,
          resourceIdentifier,
        }),
      ),
    };

    if (data.builtIn && data.taskType === TaskType.ASYNC) {
      formData.riskLevelConfigs[0].subTypes = formData?.subTypes;
    }
    const initSelectedRoles = flatten(
      formData.riskLevelConfigs?.map((item) => item?.approvalNodes),
    )?.map((item) => {
      return {
        id: item?.roleId,
        name: item?.roleName,
      };
    });
    configFormRef.current.setFieldsValue(formData);
    resourceFormRef.current.setFieldsValue(resourceFormData);
    setBuiltIn(formData.builtIn);
    setDegree(degree);
    setOriginName(data.name);
    setRiskLevelConfigs(data.riskLevelConfigs);
    setInitSelectedRoles(initSelectedRoles);
    setResourceData(resourceFormData);
  }

  async function handleSubmit() {
    const configValues = await configFormRef.current.validateFields().catch(handleCatchError);
    const resourceValues = await resourceFormRef.current.validateFields().catch(handleCatchError);
    if (!configValues || !resourceValues) {
      return;
    }
    const {
      approvalExpirationIntervalSeconds,
      executionExpirationIntervalSeconds,
      waitExecutionExpirationIntervalSeconds,
    } = configValues;
    const { associateAll, publicResourcePermissions } = resourceValues;
    const formData = {
      ...configValues,
      associateAll,
      relatedResources: associateAll
        ? undefined
        : publicResourcePermissions
            ?.filter(({ id, resourceIdentifier }) => id && resourceIdentifier)
            ?.map(({ id: resourceId, resourceIdentifier: resourceType }) => ({
              resourceId,
              resourceType,
            })) ?? [],
      approvalExpirationIntervalSeconds: hour2Seconds(approvalExpirationIntervalSeconds),
      executionExpirationIntervalSeconds: hour2Seconds(executionExpirationIntervalSeconds),
      waitExecutionExpirationIntervalSeconds: hour2Seconds(waitExecutionExpirationIntervalSeconds),
    };

    delete formData.degree;
    if (editId && !isCopy) {
      handleEdit({ ...formData, id: editId });
    } else {
      // _.set(formData, 'riskLevelConfigs[0].containsRiskData', true);
      handleCreate(formData);
    }
  }

  async function handleCreate(values: any) {
    const data = await createTaskFlow(values);
    if (data) {
      message.success(
        <Space>
          <span>
            {
              formatMessage({
                id: 'odc.components.FormTaskModal.IfTheConnectionIsCreated',
              }) /*新建成功，关联的连接已默认匹配该流程；如需修改连接匹配的流程，可*/
            }
          </span>
          <Action.Link
            onClick={async () => {
              props.openOrderModal();
            }}
          >
            {
              formatMessage({
                id: 'odc.components.FormTaskModal.SetPriority',
              }) /*设置优先级*/
            }
          </Action.Link>
        </Space>,
      );

      props.reloadData();
      handleClose();
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.FormTaskModal.UnableToCreateTheTask',
        }),

        //任务流程创建失败
      );
    }
  }

  async function handleEdit(values: Partial<ITaskFlowConfig>) {
    const data = await updateTaskFlow(values);
    if (data) {
      message.success(
        formatMessage({
          id: 'odc.components.FormTaskModal.TheTaskFlowIsSaved',
        }), //任务流程保存成功
      );
      props.reloadData();
      props.onClose();
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.FormTaskModal.UnableToSaveTheTask',
        }),

        //任务流程保存失败
      );
    }
  }

  function handleCancel(_isEdit: boolean) {
    if (hasChange) {
      Modal.confirm({
        title: _isEdit
          ? formatMessage({
              id: 'odc.components.FormTaskModal.AreYouSureYouWant',
            })
          : //确定要取消编辑吗？取消保存后，所编辑的内容将不生效
            formatMessage({
              id: 'odc.components.FormTaskModal.AreYouSureYouWant.1',
            }),

        //确定要取消新建吗?
        cancelText: formatMessage({
          id: 'odc.components.FormTaskModal.Cancel',
        }),

        //取消
        okText: formatMessage({ id: 'odc.components.FormTaskModal.Ok' }), //确定
        centered: true,
        onOk: () => {
          setHasChange(false);
          handleClose();
        },
      });
    } else {
      handleClose();
    }
  }

  function handleClose() {
    setMode('config');
    setActiveKey('0');
    setInitSelectedRoles([]);
    setRiskLevelConfigs([]);
    props.onClose();
  }

  function handleCatchError(error) {
    let hasRiskLevelConfigError = false;
    let hasResourceModeError = false;
    let hasConfigModeError = false;

    error?.errorFields?.forEach(({ name }) => {
      if (name.includes('riskLevelConfigs')) {
        hasRiskLevelConfigError = true;
      }
      if (name.includes('publicResourcePermissions')) {
        hasResourceModeError = true;
      } else {
        hasConfigModeError = true;
      }
    });

    if (hasResourceModeError && !hasConfigModeError) {
      setMode('resource');
    } else if (hasConfigModeError && !hasResourceModeError) {
      setMode('config');
    }

    if (hasRiskLevelConfigError) {
      const riskLevelConfigError = error?.errorFields?.find(({ name }) =>
        name.includes('riskLevelConfigs'),
      );

      setActiveKey(riskLevelConfigError?.name[1] + '');
    } else {
      console.error(JSON.stringify(error));
    }
  }

  function handleModeChange(e) {
    setMode(e.target.value);
  }

  function handleSwitchMode(targetMode: 'resource' | 'config') {
    const formRef = targetMode === 'config' ? resourceFormRef : configFormRef;
    if (targetMode === 'config') {
      setMode(targetMode);
    } else {
      formRef.current
        .validateFields()
        .then(() => {
          setMode(targetMode);
        })
        .catch(handleCatchError);
    }
  }

  return (
    <>
      <Drawer
        width={720}
        title={
          isEdit
            ? formatMessage({ id: 'odc.components.FormTaskModal.EditTaskFlow' }) //编辑任务流程
            : formatMessage({
                id: 'odc.components.FormTaskModal.CreateTaskProcess',
              })

          //新建任务流程
        }
        className={styles.taskModal}
        footer={
          <Space>
            {isEdit || mode === 'config' ? (
              <Button
                onClick={() => {
                  handleCancel(isEdit);
                }}
              >
                {
                  formatMessage({
                    id: 'odc.components.FormTaskModal.Cancel',
                  })
                  /*取消*/
                }
              </Button>
            ) : (
              <Button
                onClick={() => {
                  handleSwitchMode('config');
                }}
              >
                {
                  formatMessage({
                    id: 'odc.components.FormTaskModal.PreviousStepSetTheProcess',
                  })
                  /*上一步：设置流程*/
                }
              </Button>
            )}

            {isEdit || mode === 'resource' ? (
              <Button type="primary" onClick={handleSubmit}>
                {submitText}
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() => {
                  handleSwitchMode('resource');
                }}
              >
                {
                  formatMessage({
                    id: 'odc.components.FormTaskModal.NextStepAssociateConnections',
                  })
                  /*下一步： 关联连接*/
                }
              </Button>
            )}
          </Space>
        }
        destroyOnClose
        visible={visible}
        onClose={() => {
          handleCancel(isEdit);
        }}
      >
        {isEdit && (
          <Radio.Group onChange={handleModeChange} value={mode} style={{ marginBottom: 8 }}>
            <Radio.Button value="config">
              {
                formatMessage({
                  id: 'odc.components.FormTaskModal.ProcessConfiguration',
                })
                /*流程配置*/
              }
            </Radio.Button>
            <Radio.Button value="resource">
              {
                formatMessage({
                  id: 'odc.components.FormTaskModal.RelatedResources',
                })
                /*相关资源*/
              }
            </Radio.Button>
          </Radio.Group>
        )}

        <ConfigForm
          defaultTaskType={defaultTaskType}
          isActive={mode === 'config'}
          isEdit={isEdit}
          formRef={configFormRef}
          builtIn={builtIn}
          originName={originName}
          handleEditStatus={handleEditStatus}
          setDegree={setDegree}
          activeKey={activeKey}
          setActiveKey={setActiveKey}
          riskLevelConfigs={riskLevelConfigs}
          initSelectedRoles={initSelectedRoles}
          setRiskLevelConfigs={setRiskLevelConfigs}
        />

        <ResourceForm
          isActive={mode === 'resource'}
          isEdit={isEdit}
          isCopy={isCopy}
          formRef={resourceFormRef}
          initialValue={resourceData}
        />
      </Drawer>
    </>
  );
};

export default FormTaskModal;
