import { Button, Descriptions, Drawer, Form, Input, Select, Space, Timeline } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { ColumnsType } from 'antd/es/table';
import classnames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import SecureTable from '../components/SecureTable';
import { CommonTableBodyMode, CommonTableMode } from '../components/SecureTable/interface';
import styles from './index.less';

interface DataType {
  key: React.Key;
  id: number;
  riskLevel: string;
  approvalProcess: string;
}
const columnRiskLevelContentMap = {
  low: '低风险',
  middle: '中风险',
  high: '高风险',
  default: '默认风险等级',
};
const ColumnRiskLevel: React.FC<{ riskLevel: string }> = ({ riskLevel }) => (
  <a className={classnames(styles['risk-level'], styles[`risk-level-${riskLevel}`])}>
    {columnRiskLevelContentMap[riskLevel]}
  </a>
);

const RiskLevel = () => {
  const tableRef = useRef(null);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [editDrawerVisiable, setEditDrawerVisible] = useState<boolean>(false);
  const handleView = (v: DataType) => {
    console.log(v);
    setDrawerVisible(true);
  };
  const handleEdit = (v: DataType) => {
    setEditDrawerVisible(true);
  };
  const handleDrawerClose = () => {
    setDrawerVisible(false);
  };
  const columns: ColumnsType<DataType> = [
    {
      key: 'riskLevel',
      title: '风险等级',
      width: 200,
      dataIndex: 'riskLevel',
      render: (_, { riskLevel }) => <ColumnRiskLevel riskLevel={riskLevel} />,
    },
    {
      key: 'approvalProcess',
      title: '审批流程',
      width: 832,
      dataIndex: 'approvalProcess',
    },
    {
      key: 'action',
      title: '操作',
      width: 200,
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
  const data: DataType[] = [
    {
      key: '1',
      id: 1,
      riskLevel: 'low',
      approvalProcess: 'testApprovalProcess',
    },
    {
      key: '2',
      id: 2,
      riskLevel: 'middle',
      approvalProcess: 'testApprovalProcess',
    },
    {
      key: '3',
      id: 3,
      riskLevel: 'high',
      approvalProcess: 'testApprovalProcess',
    },
    {
      key: '4',
      id: 4,
      riskLevel: 'default',
      approvalProcess: 'testApprovalProcess',
    },
  ];
  const onLoad = async () => {
    await setTimeout(() => {});
  };
  return (
    <>
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
        onLoad={onLoad}
        tableProps={{
          columns: columns,
          dataSource: data,
          pagination: false,
          rowKey: 'id',
          scroll: {
            // x: 928,
          },
        }}
      />
      <Drawer
        width={520}
        visible={drawerVisible}
        onClose={handleDrawerClose}
        title={'查看风险等级'}
        className={styles.riskLevelDrawer}
      >
        <Descriptions column={1}>
          <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'风险等级'}>
            {123}
          </Descriptions.Item>
          <div>审批流程</div>
          <div className={styles.approvalContainer} style={{ marginBottom: '8px' }}>
            <Timeline className={styles.approvalDescriptios}>
              <Timeline.Item>
                <Descriptions title={'审批节点1'}>
                  <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'审批角色'}>
                    DBA
                  </Descriptions.Item>
                </Descriptions>
              </Timeline.Item>
              <Timeline.Item>TT</Timeline.Item>
            </Timeline>
          </div>
          <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'审批有效期'}>
            <div>test</div>
          </Descriptions.Item>
          <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'执行等待有效期'}>
            <div>test</div>
          </Descriptions.Item>
          <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'执行有效期'}>
            「
          </Descriptions.Item>
          <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'备注'}>
            「
          </Descriptions.Item>
        </Descriptions>
      </Drawer>
      <EditRiskLevelDrawer
        visible={editDrawerVisiable}
        handleDrawerClose={() => setEditDrawerVisible(false)}
      />
    </>
  );
};
interface EditRiskLevelProps {
  visible: boolean;
  handleDrawerClose: () => void;
}
const EditRiskLevelDrawer: React.FC<EditRiskLevelProps> = ({ visible, handleDrawerClose }) => {
  const [formRef] = useForm();
  const onClose = () => {
    handleDrawerClose();
    formRef.resetFields();
  };
  useEffect(() => {}, [visible]);
  return (
    <Drawer
      title={'编辑风险等级'}
      width={520}
      visible={visible}
      footerStyle={{
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClose={onClose}
      footer={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary">确定</Button>
        </Space>
      }
      className={styles.riskLevelDrawer}
    >
      <Form form={formRef} layout={'vertical'} requiredMark={'optional'}>
        <Form.Item label={'选择审批流程'} required>
          <Select style={{ width: '250px' }} />
        </Form.Item>
        <Form.Item label={'描述'}>
          <Input.TextArea placeholder={'请输入描述'} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
export default RiskLevel;
