import CommonTable from '@/component/CommonTable';
import { Button, Divider, Form, Modal, Select, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useRef, useState } from 'react';
import { DetailChannelDrawer, FromChannelDrawer } from './Channel';
import {
  batchUpdatePolicy,
  getChannelsList,
  getPoliciesList,
} from '@/common/network/projectNotification';
import {
  IRowSelecter,
  ITableFilter,
  ITableInstance,
  ITableLoadOptions,
  ITablePagination,
} from '@/component/CommonTable/interface';
import { IChannel, IPolicy, TBatchUpdatePolicy } from '@/d.ts/projectNotification';
import { useSetState } from 'ahooks';
import { getPolicyColumns } from './columns';
import { EPolicyFormMode, TPolicyForm } from './interface';
import styles from './index.less';

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
    projectId: projectId,
    policies: [],
  });

  const loadPolicies = async (args: ITableLoadOptions) => {
    const { eventName, channels } = argsRef.current?.filters ?? {};
    const results = await getPoliciesList(projectId, {});
    originPoliciesRef.current = results.contents;
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
  const handleSwitchPolicyStatus = async (policy: IPolicy) => {
    const result = await batchUpdatePolicy(policyForm?.projectId, [
      {
        ...policy,
        enabled: !policy.enabled,
      } as TBatchUpdatePolicy,
    ]);
    if (result) {
      message.success('操作成功');
      setFormModalOpen(false);
      tableRef.current?.reload();
      return;
    }
    message.error('操作失败');
  };

  const hanleOpenChannelDetailDrawer = (channel: Omit<IChannel, 'channelConfig'>) => {
    setSelectedChannelId(channel?.id);
    setDetailDrawerOpen(true);
  };
  const columns = getPolicyColumns({
    projectId,
    handleUpdatePolicies,
    handleSwitchPolicyStatus,
    hanleOpenChannelDetailDrawer,
  });

  const rowSelector: IRowSelecter<IPolicy> = {
    options: [
      {
        okText: '批量添加通道',
        onOk: (keys) => {
          handleUpdatePolicies({
            mode: EPolicyFormMode.BATCH,
            projectId: projectId,
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
        formModalOpen={formModalOpen}
        setFormModalOpen={setFormModalOpen}
        policyForm={policyForm}
        callback={() => {
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
        rowSelecter={rowSelector}
      />
    </div>
  );
};
const FormPolicyModal: React.FC<{
  policyForm: TPolicyForm;
  formModalOpen: boolean;
  setFormModalOpen: (open: boolean) => void;
  callback: () => void;
}> = ({ policyForm, formModalOpen, setFormModalOpen, callback }) => {
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
          [policyForm?.policies?.[0]?.id ? 'id' : 'policyMetadataId']:
            policyForm?.policies?.[0]?.id || policyForm?.policies?.[0]?.policyMetadataId,
          enabled: true,
          channels,
        },
      ];
    } else {
      policies = policyForm?.policies?.map((policy) => ({
        [policy?.id ? 'id' : 'policyMetadataId']: policy?.id || policy?.policyMetadataId,
        enabled: true,
        channels,
      }));
    }
    const result = await batchUpdatePolicy(policyForm?.projectId, policies);
    if (result) {
      message.success(isSingle ? '操作成功' : '批量操作成功');
      setFormModalOpen(false);
      callback?.();
      return;
    }
    message.error(isSingle ? '操作失败' : '批量操作失败');
  }
  async function loadOptions() {
    const channels = await getChannelsList(policyForm?.projectId);
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
        title="添加推送通道"
        width={520}
        open={formModalOpen}
        closable
        centered
        destroyOnClose
        onCancel={onCancel}
        onOk={onSubmit}
      >
        <Form form={formRef} layout="vertical" requiredMark="optional">
          <Form.Item
            label="推送通道"
            name="channelIds"
            rules={[
              {
                required: true,
                message: '推送通道不能为空',
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="请选择"
              options={options}
              style={{ width: '320px' }}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '0px' }} />
                  <div onClick={() => setChannelFormDrawerOpen(true)} style={{ cursor: 'pointer' }}>
                    <Button type="link">新建消息通道</Button>
                  </div>
                </>
              )}
            />
          </Form.Item>
        </Form>
      </Modal>
      <FromChannelDrawer
        projectId={policyForm?.projectId}
        formDrawerOpen={channelFormDrawerOpen}
        setFormDrawerOpen={setChannelFormDrawerOpen}
        closedCallback={loadOptions}
      />
    </>
  );
};
export default Policy;
