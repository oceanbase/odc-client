import { getIntegrationList, getRoleList } from '@/common/network/manager';
import { detailRiskLevel, listRiskLevels, updateRiskLevel } from '@/common/network/riskLevel';
import { getTaskFlowList } from '@/common/network/task';
import { IRiskLevel } from '@/d.ts/riskLevel';
import { UserStore } from '@/store/login';
import { transformSecond } from '@/util/utils';
import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  message,
  Select,
  Space,
  Spin,
  Timeline,
} from 'antd';
import { useForm } from 'antd/es/form/Form';
import { ColumnsType } from 'antd/es/table';
import { inject, observer } from 'mobx-react';
import { useEffect, useRef, useState } from 'react';
import RiskLevelLabel from '../components/RiskLevelLabel';
import SecureTable from '../components/SecureTable';
import {
  CommonTableBodyMode,
  CommonTableMode,
  ITableLoadOptions,
} from '../components/SecureTable/interface';
import FormModal from './components/FormModal';
import styles from './index.less';

const ApprovalProcess = ({ nodes = [] }) => {
  return (
    <>
      {nodes?.map((node) => (node.autoApproval ? '自动审批' : node?.resourceRoleName)).join(' - ')}
    </>
  );
};

const RiskLevel = ({
  userStore,
}) => {
  const tableRef = useRef(null);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [editDrawerVisiable, setEditDrawerVisible] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<IRiskLevel[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<IRiskLevel>(null);
  const loadData = async (args: ITableLoadOptions) => {
    const rawData = await listRiskLevels();
    setDataSource(rawData);
  };
  const handleView = (record: IRiskLevel) => {
    console.log(record);
    setSelectedRecord(record);
    setDrawerVisible(true);
  };
  const handleEdit = (record: IRiskLevel) => {
    console.log(record);
    setSelectedRecord(record);
    setEditDrawerVisible(true);
  };
  const handleDrawerClose = () => {
    setDrawerVisible(false);
  };
  const columns: ColumnsType<IRiskLevel> = [
    {
      key: 'level',
      title: '风险等级',
      // width: 200,
      dataIndex: 'riskLevel',
      render: (_, { level, style }) => <RiskLevelLabel level={level} color={style} />,
    },
    {
      key: 'nodes',
      title: '审批流程',
      // width: 832,
      dataIndex: 'nodes',
      render: (_, { approvalFlowConfig: { nodes = [] } }) => <ApprovalProcess nodes={nodes} />,
    },
    {
      key: 'action',
      title: '操作',
      width: 120,
      render: (_, record) => {
        return (
          <Space>
            <a onClick={() => handleView(record)}>查看</a>
            <a onClick={() => handleEdit(record)}>编辑</a>
          </Space>
        );
      },
    },
  ];
  const handleEditRiskLevelDrawerClose = () => {
    setEditDrawerVisible(false);
  };
  const reload = () => {
    tableRef.current.reload();
  };
  return (
    <div className={styles.riskLevel}>
      <SecureTable
        ref={tableRef}
        mode={CommonTableMode.SMALL}
        body={CommonTableBodyMode.BIG}
        titleContent={null}
        showToolbar={false}
        showPagination={false}
        filterContent={{}}
        operationContent={{
          options: [],
        }}
        onLoad={loadData}
        tableProps={{
          columns: columns,
          dataSource: dataSource,
          pagination: false,
          rowKey: 'id',
          scroll: {
            // x: 1240,
          },
        }}
      />
      <ViewDrawer
        {...{
          drawerVisible,
          handleDrawerClose,
          selectedRecord,
        }}
      />
      <EditRiskLevelDrawer
        {...{
          reload,
          userStore,
          visible: editDrawerVisiable,
          handleEditRiskLevelDrawerClose,
          selectedRecord,
        }}
      />
    </div>
  );
};
const ViewDrawer: React.FC<{
  drawerVisible: boolean;
  handleDrawerClose: () => void;
  selectedRecord;
}> = ({ drawerVisible, handleDrawerClose, selectedRecord = {} }) => {
  const [record, setRecord] = useState<IRiskLevel>();
  // const { level = 0, approvalFlowConfig, description = '' } = record;
  // const {
  //   approvalExpirationIntervalSeconds = 0,
  //   waitExecutionExpirationIntervalSeconds = 0,
  //   executionExpirationIntervalSeconds = 0,
  //   nodes = []
  // } = approvalFlowConfig || {};
  const getDetailRiskLevel = async (riskLevelId: number) => {
    const rawData = await detailRiskLevel(riskLevelId);
    console.log(rawData);
    setRecord(rawData);
  };
  useEffect(() => {
    // setRecord(selectedRecord);
    if (drawerVisible) {
      selectedRecord && getDetailRiskLevel(selectedRecord?.id);
    }
  }, [drawerVisible, selectedRecord]);

  if (!drawerVisible) {
    return null;
  }
  return (
    <Drawer
      width={520}
      open={drawerVisible}
      destroyOnClose={true}
      onClose={handleDrawerClose}
      title={'查看风险等级'}
      className={styles.riskLevelDrawer}
    >
      <Descriptions column={1}>
        <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'风险等级'}>
          <RiskLevelLabel level={record?.level} color={record?.style} />
        </Descriptions.Item>
        <div>审批流程</div>
        <div className={styles.approvalContainer} style={{ marginBottom: '8px' }}>
          <Timeline className={styles.approvalDescriptios}>
            {record?.approvalFlowConfig?.nodes?.map(
              (
                { externalApprovalName = '', autoApproval = false, resourceRoleName = '' },
                index,
              ) => {
                return (
                  <Timeline.Item key={index}>
                    <Descriptions title={externalApprovalName}>
                      <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'审批角色'}>
                        {autoApproval ? '自动审批' : resourceRoleName}
                      </Descriptions.Item>
                    </Descriptions>
                  </Timeline.Item>
                );
              },
            )}
          </Timeline>
        </div>
        <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'审批有效期'}>
          <div>
            {transformSecond(record?.approvalFlowConfig?.approvalExpirationIntervalSeconds)}
          </div>
        </Descriptions.Item>
        <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'执行等待有效期'}>
          <div>
            {transformSecond(record?.approvalFlowConfig?.waitExecutionExpirationIntervalSeconds)}
          </div>
        </Descriptions.Item>
        <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'执行有效期'}>
          <div>
            {transformSecond(record?.approvalFlowConfig?.executionExpirationIntervalSeconds)}
          </div>
        </Descriptions.Item>
        <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'备注'}>
          {record?.description}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};
interface EditRiskLevelDrawerProps {
  visible: boolean;
  selectedRecord: IRiskLevel;
  reload: () => void;
  userStore?: UserStore;
  handleEditRiskLevelDrawerClose: () => void;
}

const EditRiskLevelDrawer: React.FC<EditRiskLevelDrawerProps> = ({
  visible,
  selectedRecord,
  reload,
  userStore,
  handleEditRiskLevelDrawerClose,
}) => {
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
    console.log(rawData);
    setApprovalProcessOptions(
      rawData.map((rd) => ({
        label: rd.name,
        value: rd.id,
      })),
    );
    setLoading(false);
  };

  const handleFormSubmit = async () => {
    try {
      const rawData = await formRef.validateFields();
      console.log(rawData);
      const result = await updateRiskLevel(selectedRecord.id, rawData);
      if (result) {
        message.success('更新成功');
        handleEditRiskLevelDrawerClose();
        formRef.resetFields();
        reload();
      } else {
        message.error('更新失败');
      }
    } catch (error) {
      console.error(error);
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
                      userStore,
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



export default inject(
  'userStore',
)(observer(RiskLevel));
const InnerCreateApproval = ({ createApprovalDrawerOpen, setCreateApprovalDrawerOpen, reloadData, userStore }) => {
  const {
    user: { organizationId },
  } = userStore;

  const [roles, setRoles] = useState([]);
  const [integrations, setIntegrations] = useState([]);

  const loadRoles = async () => {
    const roles = await getRoleList();
    setRoles(roles?.contents);
  };
  const loadIntegrations = async () => {
    const integrations = await getIntegrationList();
    setIntegrations(integrations?.contents);
  };

  useEffect(() => {
    if(createApprovalDrawerOpen) {
      loadRoles();
      loadIntegrations();
    }
  }, [createApprovalDrawerOpen])
  return (
    <>
      <FormModal
        roles={roles}
        integrations={integrations}
        editId={null}
        organizationId={organizationId}
        visible={createApprovalDrawerOpen}
        reloadData={reloadData}
        onClose={() => {
          setCreateApprovalDrawerOpen(false);
        }}
      />
    </>
  );
};

const CreateApproval = inject(
  'userStore',
)(observer(InnerCreateApproval));