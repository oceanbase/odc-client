import { listRiskLevels } from '@/common/network/riskLevel';
import { IRiskLevel } from '@/d.ts/riskLevel';
import { Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { inject, observer } from 'mobx-react';
import { useRef, useState } from 'react';
import RiskLevelLabel from '../components/RiskLevelLabel';
import SecureTable from '../components/SecureTable';
import {
  CommonTableBodyMode,
  CommonTableMode,
  ITableLoadOptions,
} from '../components/SecureTable/interface';
import FormRiskLevelDrawer from './components/FormRiskLevelDrawer';
import ViewRiskLevelDrawer from './components/ViewRiskLevelDrawer';
import styles from './index.less';

const ApprovalProcess = ({ nodes = [] }) => {
  return (
    <>
      {nodes
        ?.map((node) => {
          let label = '';
          if (node.autoApproval) {
            label = '自动审批';
          } else if (node?.externalApprovalName) {
            label = `外部审批(${node?.externalApprovalName})`;
          } else {
            label = node?.resourceRoleName || '-';
          }
          return label;
        })
        .join(' - ')}
    </>
  );
};

const RiskLevel = ({ userStore }) => {
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
    setSelectedRecord(record);
    setDrawerVisible(true);
  };
  const handleEdit = (record: IRiskLevel) => {
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
      <ViewRiskLevelDrawer
        {...{
          drawerVisible,
          handleDrawerClose,
          selectedRecord,
        }}
      />
      <FormRiskLevelDrawer
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

export default inject('userStore')(observer(RiskLevel));
