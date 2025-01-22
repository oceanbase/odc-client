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

import {
  batchUpdatePolicy,
  getChannelsList,
  getPoliciesList,
} from '@/common/network/projectNotification';
import CommonTable from '@/component/CommonTable';
import {
  IRowSelecter,
  ITableFilter,
  ITableInstance,
  ITableLoadOptions,
  ITablePagination,
} from '@/component/CommonTable/interface';
import { EChannelType, IChannel, IPolicy, TBatchUpdatePolicy } from '@/d.ts/projectNotification';
import { formatMessage } from '@/util/intl';
import { useSetState } from 'ahooks';
import { Button, Divider, Form, message, Modal, Select } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useRef, useState, useContext } from 'react';
import { DetailChannelDrawer, FromChannelDrawer } from './Channel';
import { getPolicyColumns } from './columns';
import styles from './index.less';
import { EPolicyFormMode, TPolicyForm } from './interface';
import ProjectContext from '@/page/Project/ProjectContext';
import { isProjectArchived } from '@/page/Project/helper';

const Policy: React.FC<{
  projectId: number;
}> = ({ projectId }) => {
  const tableRef = useRef<ITableInstance>();
  const argsRef = useRef<ITableFilter>();
  const originPoliciesRef = useRef<IPolicy[]>();
  const [selectedChannelId, setSelectedChannelId] = useState<number>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState<boolean>(false);
  const [formModalOpen, setFormModalOpen] = useState<boolean>(false);
  const [policies, setPolicies] = useState<IPolicy[]>([]);
  const [pagination, setPagination] = useState<ITablePagination>(null);
  const [policyForm, setPolicyForm] = useSetState<TPolicyForm>({
    mode: EPolicyFormMode.SINGLE,
    policies: [],
  });
  const { project } = useContext(ProjectContext);
  const projectArchived = isProjectArchived(project);
  const loadPolicies = async (args: ITableLoadOptions) => {
    const { eventName, channels } = argsRef.current?.filters ?? {};
    const results = await getPoliciesList(projectId, {});
    originPoliciesRef.current = results?.contents || [];
    let filterPolicies: IPolicy[] = originPoliciesRef.current;

    if (eventName && eventName?.length === 1) {
      filterPolicies = filterPolicies?.filter((policy) =>
        policy?.eventName?.toLocaleLowerCase()?.includes(eventName?.[0]?.toLocaleLowerCase()),
      );
    }
    if (channels && channels?.length === 1) {
      filterPolicies = filterPolicies?.filter((policy) =>
        policy?.channels?.some((channel) =>
          channel?.name?.toLocaleLowerCase()?.includes(channels?.[0]?.toLocaleLowerCase()),
        ),
      );
    }
    setPolicies(filterPolicies);
    if (pagination) {
      setPagination(pagination);
    }
  };
  const loadLocalPolicies = async (args: ITableLoadOptions) => {
    const { pageSize = 0, pagination = null, filters = null } = args;
    const { eventName, channels } = filters ?? {};
    let filterPolicies: IPolicy[] = originPoliciesRef.current;
    argsRef.current = {
      filters,
    };
    if (eventName && eventName?.length === 1) {
      filterPolicies = filterPolicies?.filter((policy) =>
        policy?.eventName?.toLocaleLowerCase()?.includes(eventName?.[0]?.toLocaleLowerCase()),
      );
    }
    if (channels && channels?.length === 1) {
      filterPolicies = filterPolicies?.filter((policy) =>
        policy?.channels?.some((channel) =>
          channel?.name?.toLocaleLowerCase()?.includes(channels?.[0]?.toLocaleLowerCase()),
        ),
      );
    }
    setPolicies(filterPolicies);
    if (pagination) {
      setPagination(pagination);
    }
  };
  const handleUpdatePolicies = (formType: TPolicyForm) => {
    setPolicyForm(formType);
    setFormModalOpen(true);
  };
  /**
   *
   * @param isSingle 是否为单独点击操作
   * @param enabled 是否启用
   * @param isSuccessful 操作结果是否成功
   * @returns string
   */
  const getMessageFormEnableAndResult = (
    isSingle: boolean,
    enabled: boolean,
    isSuccessful: boolean,
  ) => {
    if (isSuccessful) {
      if (enabled) {
        return isSingle
          ? formatMessage({
              id: 'src.page.Project.Notification.components.1FEA773B',
              defaultMessage: '启用成功',
            })
          : formatMessage({
              id: 'src.page.Project.Notification.components.35494597',
              defaultMessage: '批量启用成功',
            });
      }
      return isSingle
        ? formatMessage({
            id: 'src.page.Project.Notification.components.EF079B62',
            defaultMessage: '禁用成功',
          })
        : formatMessage({
            id: 'src.page.Project.Notification.components.4E04D835',
            defaultMessage: '批量禁用成功',
          });
    }
    if (enabled) {
      return isSingle
        ? formatMessage({
            id: 'src.page.Project.Notification.components.868F9EE8',
            defaultMessage: '启用失败',
          })
        : formatMessage({
            id: 'src.page.Project.Notification.components.A075A0DF',
            defaultMessage: '批量启用失败',
          });
    }
    return isSingle
      ? formatMessage({
          id: 'src.page.Project.Notification.components.A4655370',
          defaultMessage: '禁用失败',
        })
      : formatMessage({
          id: 'src.page.Project.Notification.components.EB30B7E4',
          defaultMessage: '批量禁用失败',
        });
  };
  const handleSwitchPoliciesStatus = async (formData: TPolicyForm, enabled?: boolean) => {
    const isSingle = formData.mode === EPolicyFormMode.SINGLE;

    let policies: TBatchUpdatePolicy[];
    if (isSingle) {
      policies = formData?.policies;
      policies[0].enabled = !policies[0].enabled;
    } else {
      policies = formData?.policies?.map((policy) => {
        return {
          ...policy,
          enabled,
        };
      });
    }
    const result = await batchUpdatePolicy(projectId, policies);
    if (result) {
      message.success(getMessageFormEnableAndResult(isSingle, policies?.[0]?.enabled, true));
      setFormModalOpen(false);
      tableRef.current?.resetSelectedRows();
      tableRef.current?.reload();
      return;
    }
    message.error(getMessageFormEnableAndResult(isSingle, policies?.[0]?.enabled, false));
  };

  const hanleOpenChannelDetailDrawer = (channel: Omit<IChannel<EChannelType>, 'channelConfig'>) => {
    setSelectedChannelId(channel?.id);
    setDetailDrawerOpen(true);
  };
  const columns = getPolicyColumns({
    projectId,
    handleUpdatePolicies,
    handleSwitchPoliciesStatus,
    hanleOpenChannelDetailDrawer,
    hideColumns: projectArchived ? ['enabled', 'action'] : [],
  });

  const rowSelector: IRowSelecter<IPolicy> = {
    options: [
      {
        okText: formatMessage({
          id: 'src.page.Project.Notification.components.765E371C',
          defaultMessage: '批量启用',
        }), //'批量启用'
        onOk: (keys) => {
          handleSwitchPoliciesStatus(
            {
              mode: EPolicyFormMode.BATCH,
              policies: originPoliciesRef?.current?.filter((policy) =>
                keys?.includes(policy?.policyMetadataId),
              ),
            },
            true,
          );
        },
      },
      {
        okText: formatMessage({
          id: 'src.page.Project.Notification.components.0A9B6A90',
          defaultMessage: '批量停用',
        }), //'批量停用'
        onOk: (keys) => {
          handleSwitchPoliciesStatus(
            {
              mode: EPolicyFormMode.BATCH,
              policies: originPoliciesRef?.current?.filter((policy) =>
                keys?.includes(policy?.policyMetadataId),
              ),
            },
            false,
          );
        },
      },
      {
        okText: formatMessage({
          id: 'src.page.Project.Notification.components.784354AA',
          defaultMessage: '批量添加通道',
        }), //'批量添加通道'
        onOk: (keys) => {
          handleUpdatePolicies({
            mode: EPolicyFormMode.BATCH,
            policies: originPoliciesRef?.current?.filter((policy) =>
              keys?.includes(policy?.policyMetadataId),
            ),
          });
        },
      },
    ],
  };
  return (
    <div className={styles.common}>
      <FormPolicyModal
        projectId={projectId}
        formModalOpen={formModalOpen}
        setFormModalOpen={setFormModalOpen}
        policyForm={policyForm}
        callback={() => {
          tableRef.current?.resetSelectedRows();
          tableRef.current?.reload(argsRef.current);
        }}
      />

      <DetailChannelDrawer
        projectId={projectId}
        channelId={selectedChannelId}
        detailDrawerOpen={detailDrawerOpen}
        setDetailDrawerOpen={setDetailDrawerOpen}
      />

      <CommonTable
        ref={tableRef}
        key="PolicyCommonTable"
        titleContent={null}
        showToolbar={false}
        onLoad={loadPolicies}
        onChange={loadLocalPolicies}
        operationContent={null}
        tableProps={{
          columns,
          dataSource: policies,
          rowKey: 'policyMetadataId',
          pagination: pagination || false,
        }}
        rowSelecter={projectArchived ? null : rowSelector}
      />
    </div>
  );
};
const FormPolicyModal: React.FC<{
  policyForm: TPolicyForm;
  formModalOpen: boolean;
  projectId: number;
  setFormModalOpen: (open: boolean) => void;
  callback: () => void;
}> = ({ policyForm, formModalOpen, projectId, setFormModalOpen, callback }) => {
  const [formRef] = useForm<{
    channelIds: number[];
  }>();
  const isSingle = policyForm.mode === EPolicyFormMode.SINGLE;
  const [options, setOptions] = useState<{ label: string; value: React.Key }[]>([]);
  const [channelFormDrawerOpen, setChannelFormDrawerOpen] = useState<boolean>(false);
  function onCancel() {
    setFormModalOpen(false);
    formRef.resetFields();
  }
  async function onSubmit() {
    const formData = await formRef.validateFields().catch();
    let policies: TBatchUpdatePolicy[];
    const channels = formData?.channelIds?.map((channelId) => ({
      id: channelId,
    }));
    if (isSingle) {
      policies = [
        {
          ...policyForm?.policies?.[0],
          [policyForm?.policies?.[0]?.id ? 'id' : 'policyMetadataId']:
            policyForm?.policies?.[0]?.id || policyForm?.policies?.[0]?.policyMetadataId,
          channels,
        },
      ];
    } else {
      policies = policyForm?.policies?.map((policy) => ({
        ...policy,
        [policy?.id ? 'id' : 'policyMetadataId']: policy?.id || policy?.policyMetadataId,
        channels,
      }));
    }
    const result = await batchUpdatePolicy(projectId, policies);
    if (result) {
      message.success(
        isSingle
          ? formatMessage({
              id: 'src.page.Project.Notification.components.A45206CB',
              defaultMessage: '操作成功',
            })
          : formatMessage({
              id: 'src.page.Project.Notification.components.3548BA07',
              defaultMessage: '批量操作成功',
            }),
      );
      setFormModalOpen(false);
      callback?.();
      return;
    }
    message.error(
      isSingle
        ? formatMessage({
            id: 'src.page.Project.Notification.components.8B8225C4',
            defaultMessage: '操作失败',
          })
        : formatMessage({
            id: 'src.page.Project.Notification.components.84AACFA4',
            defaultMessage: '批量操作失败',
          }),
    );
  }
  async function loadOptions() {
    const channels = await getChannelsList(projectId);
    const newOptions = channels?.contents?.map((channel) => ({
      label: channel?.name,
      value: channel?.id,
    }));
    setOptions(newOptions);
  }
  useEffect(() => {
    if (formModalOpen) {
      loadOptions();
      if (isSingle) {
        formRef.setFieldsValue({
          channelIds: policyForm?.policies?.[0]?.channels?.map((channel) => channel?.id),
        });
      }
    } else {
      formRef?.resetFields();
      setOptions([]);
    }
  }, [formModalOpen, policyForm]);
  return (
    <>
      <Modal
        title={
          formatMessage({
            id: 'src.page.Project.Notification.components.5620243C',
            defaultMessage: '添加推送通道',
          }) /*"添加推送通道"*/
        }
        width={520}
        open={formModalOpen}
        closable
        centered
        destroyOnClose
        onCancel={onCancel}
        onOk={onSubmit}
      >
        <Form form={formRef} layout="vertical">
          <Form.Item
            label={
              formatMessage({
                id: 'src.page.Project.Notification.components.64150C4D',
                defaultMessage: '推送通道',
              }) /*"推送通道"*/
            }
            name="channelIds"
          >
            <Select
              mode="multiple"
              placeholder={
                formatMessage({
                  id: 'src.page.Project.Notification.components.71558A86',
                  defaultMessage: '请选择',
                }) /*"请选择"*/
              }
              options={options}
              filterOption={(input, option) =>
                (option?.label?.toLowerCase() ?? '').includes(input?.toLowerCase())
              }
              style={{ width: '320px' }}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '0px' }} />
                  <div onClick={() => setChannelFormDrawerOpen(true)} style={{ cursor: 'pointer' }}>
                    <Button type="link">
                      {
                        formatMessage({
                          id: 'src.page.Project.Notification.components.E4C2708A' /*新建推送通道*/,
                          defaultMessage: '新建推送通道',
                        }) /* 新建推送通道 */
                      }
                    </Button>
                  </div>
                </>
              )}
            />
          </Form.Item>
        </Form>
      </Modal>
      <FromChannelDrawer
        projectId={projectId}
        formDrawerOpen={channelFormDrawerOpen}
        setFormDrawerOpen={setChannelFormDrawerOpen}
        closedCallback={loadOptions}
      />
    </>
  );
};
export default Policy;
