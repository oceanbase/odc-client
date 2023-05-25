import { Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useRef } from 'react';
import SecureTable from '../components/SecureTable';
import { CommonTableBodyMode, CommonTableMode } from '../components/SecureTable/interface';

interface DataType {
  key: React.Key;
  id: number;
  riskLevel: string;
  approvalProcess: string;
}
const columns: ColumnsType<DataType> = [
  {
    key: 'riskLevel',
    title: '风险等级',
    dataIndex: 'riskLevel',
  },
  {
    key: 'approvalProcess',
    title: '审批流程',
    dataIndex: 'approvalProcess',
  },
  {
    key: 'action',
    title: '操作',
    render: () => {
      return (
        <Space>
          <a>查看</a>
          <a>编辑</a>
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
];
const onLoad = async () => {
  await setTimeout(() => {});
};
const RiskLevel = () => {
  const tableRef = useRef(null);
  return (
    <div>
      <SecureTable
        ref={tableRef}
        mode={CommonTableMode.SMALL}
        body={CommonTableBodyMode.BIG}
        showToolbar={false}
        titleContent={null}
        onLoad={onLoad}
        tableProps={{
          columns: columns,
          dataSource: data,
          rowKey: 'id',
          pagination: false,

          scroll: {
            x: 1000,
          },
        }}
      />
    </div>
  );
};

export default RiskLevel;
