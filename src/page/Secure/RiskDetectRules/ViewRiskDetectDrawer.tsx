import { IRiskDetectRule, RiskDetectRuleCondition } from '@/d.ts/riskDetectRule';
import { Descriptions, Drawer } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useRef } from 'react';
import { RiskLevelMapProps } from '.';
import RiskLevelLabel from '../components/RiskLevelLabel';
import SecureTable from '../components/SecureTable';
import { CommonTableBodyMode, CommonTableMode } from '../components/SecureTable/interface';
interface ViewRiskDetectDrawerDrawer {
  viewDrawerVisible: boolean;
  riskLevel: RiskLevelMapProps;
  setViewDrawerVisible: (v: boolean) => void;
  selectedRecord: IRiskDetectRule;
}
const ViewRiskDetectDrawer: React.FC<ViewRiskDetectDrawerDrawer> = ({
  viewDrawerVisible,
  riskLevel,
  setViewDrawerVisible,
  selectedRecord,
}) => {
  // useEffect(() => {

  // }, [])
  return (
    <Drawer
      title={'风险识别规则详情'}
      visible={viewDrawerVisible}
      width={960}
      onClose={() => {
        setViewDrawerVisible(false);
      }}
    >
      <Descriptions column={1}>
        <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'等级'}>
          <RiskLevelLabel level={riskLevel?.level} color={riskLevel?.style} />
        </Descriptions.Item>
        <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'规则名称'}>
          {selectedRecord?.creator?.name}
        </Descriptions.Item>
        <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'条件'}>
          &nbsp;
        </Descriptions.Item>
      </Descriptions>
      <SubTable data={selectedRecord?.conditions} />
    </Drawer>
  );
};

const subTableColumns: ColumnsType<RiskDetectRuleCondition> = [
  {
    key: 'config',
    width: 928,
    dataIndex: 'config',
    title: '配置值',
    render: (_, { expression, operation, value }) => [expression, operation, value].join(', '),
  },
];
const SubTable = ({ data = [] }) => {
  const subTableRef = useRef(null);
  return (
    <SecureTable
      ref={subTableRef}
      mode={CommonTableMode.SMALL}
      body={CommonTableBodyMode.BIG}
      titleContent={null}
      showToolbar={false}
      showPagination={false}
      filterContent={{}}
      operationContent={{
        options: [],
      }}
      onLoad={async () => {}}
      onChange={() => {}}
      tableProps={{
        columns: subTableColumns,
        dataSource: data,
        rowKey: 'id',
        pagination: false,
        scroll: {
          // x: 928,
        },
      }}
    />
  );
};
export default ViewRiskDetectDrawer;
