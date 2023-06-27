import { deleteRiskDetectRule, listRiskDetectRules } from '@/common/network/riskDetectRule';
import { listRiskLevels } from '@/common/network/riskLevel';
import Action from '@/component/Action';
import { IRiskDetectRule } from '@/d.ts/riskDetectRule';
import { IRiskLevel } from '@/d.ts/riskLevel';
import { UserStore } from '@/store/login';
import { formatMessage } from '@/util/intl';
import { message, Popconfirm, Space, Spin } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import SecureLayout from '../components/SecureLayout';
import SecureSider, { SiderItem } from '../components/SecureSider';
import SecureTable from '../components/SecureTable';
import {
  CommonTableBodyMode,
  CommonTableMode,
  IOperationOptionType,
  ITableLoadOptions,
} from '../components/SecureTable/interface';
import FormRiskDetectDrawer from './FormRiskDetectDrawer';
import ViewRiskDetectDrawer from './ViewRiskDetectDrawer';
import styles from './index.less';

export const riskDetectRuleNameMap = {
  默认风险: 'DEFAULT',
  低风险: 'LOW',
  中风险: 'MIDDLE',
  高风险: 'HIGH',
};

export const RiskLevelMap = {
  0: '默认风险',
  1: '低风险',
  2: '中风险',
  3: '高风险',
};
export interface RiskLevelMapProps {
  value: number;
  label: string;
  level?: number;
  organizationId?: number;
  name?: string;
  style?: string;
}
export function getRuleDecetedList(riskLevel: IRiskLevel): RiskLevelMapProps {
  return {
    value: riskLevel.id,
    level: riskLevel.level,
    label: RiskLevelMap[riskLevel.level],
    organizationId: riskLevel.organizationId,
    name: riskLevel.name,
    style: riskLevel.style,
  };
}
interface InnerRiskDetectRulesProps {
  userStore: UserStore;
  loading: boolean;
  exSearch: (args: ITableLoadOptions) => Promise<any>;
  exReload: (args: ITableLoadOptions) => Promise<any>;
  riskLevel: RiskLevelMapProps;
  selectedItem: number;
  riskDetectRules: IRiskDetectRule[];
  getListRiskDetectRules: (v: RiskLevelMapProps) => void;
}
const InnerRiskDetectRules: React.FC<InnerRiskDetectRulesProps> = ({
  userStore,
  loading,
  exSearch,
  exReload,
  riskLevel,
  riskDetectRules = [],
  getListRiskDetectRules,
}) => {
  const {
    user: { organizationId },
  } = userStore;
  const tableRef = useRef(null);
  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [viewDrawerVisible, setViewDrawerVisible] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<IRiskDetectRule>();

  const [isEdit, setIsEdit] = useState<boolean>(false);

  const handleDrawerView = (riskDetectRule: IRiskDetectRule) => {
    setIsEdit(false);
    setSelectedRecord({ ...riskDetectRule });
    setViewDrawerVisible(true);
  };

  const handleDrawerEdit = (riskDetectRule: IRiskDetectRule) => {
    setIsEdit(true);
    setSelectedRecord({ ...riskDetectRule });
    setFormModalVisible(true);
  };

  const handleDrawerCreate = () => {
    setIsEdit(false);
    setFormModalVisible(true);
  };
  const loadData = async (args: ITableLoadOptions) => {
    const { filters } = args ?? {};
  };
  const reload = () => {
    getListRiskDetectRules(riskLevel);
  };
  const handleDelete = async (id: number) => {
    const result: boolean = await deleteRiskDetectRule(id);
    if (result) {
      message.success('删除成功');
      reload();
    } else {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<IRiskDetectRule> = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      // width: 573,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      // width: 120,
      key: 'creator',
      render: (_, record) => record?.creator?.name || '默认创建人',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      // width: 200,
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      // width: 200,
      render: (value, record) => {
        return (
          <Space>
            <a onClick={() => {
                handleDrawerView(record);
              }}>查看</a>
            <a onClick={async () => {
                handleDrawerEdit(record);
              }}>编辑</a>
            <Popconfirm title={'是否确定删除？'} okText={'确定'} cancelText={'取消'} onConfirm={() => {
                handleDelete(record.id);
              }} >
              
            <a >删除</a>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  const operationOptions = [];
  operationOptions.push({
    type: IOperationOptionType.button,
    content: '新建风险识别规则',
    //新建流程
    isPrimary: true,
    onClick: handleDrawerCreate,
  });
  operationOptions.push({
    type: IOperationOptionType.icon,
  });

  return (
    <div className={styles.innerRiskDetectRules}>
      <SecureTable
        ref={tableRef}
        mode={CommonTableMode.SMALL}
        body={CommonTableBodyMode.BIG}
        titleContent={null}
        showPagination={false}
        filterContent={{
          searchPlaceholder: formatMessage({
            id: 'odc.components.UserPage.EnterAUserOrAccount',
          }),
          /* 请输入用户/账号搜索 */
        }}
        operationContent={{
          options: operationOptions,
        }}
        onLoad={null}
        onChange={null}
        exSearch={exSearch}
        exReload={exReload}
        tableProps={{
          columns: columns,
          loading: loading,
          dataSource: riskDetectRules,
          rowKey: 'id',
          pagination: false,
          scroll: {
            // x: 1084,
          },
        }}
      />
      <FormRiskDetectDrawer
        {...{
          isEdit,
          riskLevel,
          selectedRecord,
          formModalVisible,
          setFormModalVisible,
          reload,
        }}
      />
      <ViewRiskDetectDrawer
        {...{
          organizationId,
          viewDrawerVisible,
          setViewDrawerVisible,
          riskLevel,
          selectedRecord,
        }}
      />
    </div>
  );
};
const RiskDetectRules: React.FC<{
  userStore: UserStore;
}> = ({ userStore }) => {
  const {
    user: { organizationId },
  } = userStore;

  const [siderLoading, setSiderLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [riskDetectRules, setRiskDetectRules] = useState<IRiskDetectRule[]>([]);
  const [siderItemList, setSiderItemList] = useState<SiderItem[]>([]);

  const [selectedItem, setSelectedItem] = useState<number>(0);
  const [riskLevel, setRiskLevel] = useState<RiskLevelMapProps>();

  const getListRiskDetectRules = async (item) => {
    setLoading(true);
    const rawData = await listRiskDetectRules({
      riskLevelId: item.value,
    });
    setRiskDetectRules(rawData);
    setLoading(false);
  };

  const exSearch = async (args: ITableLoadOptions) => {
    const { searchValue } = args ?? {};
    setLoading(true);
    const rawData = await listRiskDetectRules({
      riskLevelId: riskLevel.value,
      name: searchValue,
    });
    setRiskDetectRules(rawData);
    setLoading(false);
  };
  const exReload = async (args: ITableLoadOptions) => {
    const { searchValue } = args ?? {};
    setLoading(true);
    const rawData = await listRiskDetectRules({
      riskLevelId: riskLevel?.value,
      name: searchValue,
    });
    setRiskDetectRules(rawData);
    setLoading(false);
  };
  const handleItemClick = (item: RiskLevelMapProps) => {
    getListRiskDetectRules(item);
    setRiskLevel(item);
    setSelectedItem(item?.value);
  };

  const initSiderData = async (riskLevels?: IRiskLevel[]) => {
    const nameMap = new Map();
    const rawData = riskLevels.map(getRuleDecetedList).filter((riskDetectRule) => {
      if (!nameMap.has(riskDetectRule.value)) {
        nameMap.set(riskDetectRule.value, riskDetectRule.label);
        return riskDetectRule;
      }
    });
    handleItemClick(rawData[0]);
    setSiderItemList(rawData);
  };
  const initRiskDetectRules = async () => {
    setSiderLoading(true);
    const rawData = await listRiskLevels();
    initSiderData(rawData);
    setSiderLoading(false);
  };
  useEffect(() => {
    initRiskDetectRules();
  }, []);
  return (
    <SecureLayout>
    <SecureSider
      loading={siderLoading}
      siderItemList={siderItemList}
      selectedItem={selectedItem}
      handleItemClick={handleItemClick}
    />
      <InnerRiskDetectRules
        {...{
          loading,
          exSearch,
          exReload,
          userStore,
          riskLevel,
          selectedItem,
          riskDetectRules,
          getListRiskDetectRules,
        }}
      />
    </SecureLayout>
  );
};
export default inject('userStore')(observer(RiskDetectRules));
