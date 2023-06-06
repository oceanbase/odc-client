import { deleteRiskDetectRule, listRiskDetectRules } from '@/common/network/riskDetectRule';
import Action from '@/component/Action';
import { RiskDetectRuleType } from '@/d.ts';
import { IRiskDetectRule } from '@/d.ts/riskDetectRule';
import { SecureStore } from '@/store/secure';
import { formatMessage } from '@/util/intl';
import { message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { inject, observer } from 'mobx-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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

enum OperationType {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  COPY = 'COPY',
  DELETE = 'DELETE',
  ENABLE = 'ENABLE',
  DISABLE = 'DISABLE',
}
export const riskDetectRuleNameMap = {
  默认风险: 'DEFAULT',
  低风险: 'LOW',
  中风险: 'MIDDLE',
  高风险: 'HIGH',
};
export function getRuleDecetedList(riskDetectRule: IRiskDetectRule): {
  value: RiskDetectRuleType;
  label: string;
} {
  return {
    value: riskDetectRuleNameMap[riskDetectRule.name] || riskDetectRule.name,
    label: riskDetectRule.name,
  };
}
interface InnerRiskDetectRulesProps {
  riskDetectRules: IRiskDetectRule[];
}
const InnerRiskDetectRules: React.FC<InnerRiskDetectRulesProps> = ({ riskDetectRules = [] }) => {
  const tableRef = useRef(null);
  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [viewDrawerVisible, setViewDrawerVisible] = useState<boolean>(false);
  const [riskDetectRule, setRiskDetectRule] = useState<IRiskDetectRule>(null);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const handleDrawerView = (riskDetectRule: IRiskDetectRule) => {
    setIsEdit(false);
    setRiskDetectRule({ ...riskDetectRule });
    setViewDrawerVisible(true);
  };

  const handleDrawerEdit = (riskDetectRule: IRiskDetectRule) => {
    setIsEdit(true);
    setRiskDetectRule({ ...riskDetectRule });
    setFormModalVisible(true);
  };

  const handleDrawerCreate = () => {
    setIsEdit(false);
    setRiskDetectRule({ ...riskDetectRule });
    setFormModalVisible(true);
  };
  const loadData = async (args: ITableLoadOptions) => {
    const { filters } = args ?? {};
    console.log(args);
  };
  const handleDelete = async (id: number) => {
    const result: boolean = await deleteRiskDetectRule(id);
    if (result) {
      message.success('删除成功');
    } else {
      message.error('删除失败');
    }
    // loadData();
  };

  const columns: ColumnsType<IRiskDetectRule> = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      width: 573,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      width: 120,
      key: 'creator',
      render: (_, record) => record?.creator?.name || '默认创建人',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (value, record) => {
        return (
          <Action.Group size={4}>
            <Action.Link
              key={'view'}
              onClick={() => {
                handleDrawerView(record);
              }}
            >
              查看
            </Action.Link>

            <Action.Link
              key={'edit'}
              onClick={async () => {
                handleDrawerEdit(record);
              }}
            >
              编辑
            </Action.Link>
            <Action.Link
              key={'delete'}
              onClick={async () => {
                handleDelete(record.id);
              }}
            >
              删除
            </Action.Link>
          </Action.Group>
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
    <>
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
        onLoad={loadData}
        onChange={loadData}
        tableProps={{
          columns: columns,
          dataSource: riskDetectRules,
          rowKey: 'id',
          pagination: false,
          scroll: {
            x: 1000,
          },
        }}
      />
      <FormRiskDetectDrawer
        isEdit={isEdit}
        riskDetectRule={riskDetectRule}
        formModalVisible={formModalVisible}
        setFormModalVisible={setFormModalVisible}
      />
      <ViewRiskDetectDrawer
        {...{
          viewDrawerVisible,
          setViewDrawerVisible,
          riskDetectRule,
        }}
      />
    </>
  );
};
const RiskDetectRules: React.FC<{
  secureStore: SecureStore;
}> = ({ secureStore }) => {
  const selectedFlag = 'riskDetectRuleType';
  const [riskDetectRules, setRiskDetectRules] = useState<IRiskDetectRule[]>([]);
  const [filterRiskDetectRules, setFileterRiskDetectRules] = useState<IRiskDetectRule[]>([]);
  const [siderItemList, setSiderItemList] = useState<SiderItem[]>([]);

  const getIDByName = (name: string) => {
    return (
      riskDetectRules.find(
        (riskDetectRule) =>
          riskDetectRule.name === name || riskDetectRuleNameMap[riskDetectRule.name] === name,
      )?.id || -1
    );
  };
  const handleItemClick = (name: string) => {
    secureStore.changeRiskDetectRuleType(name as RiskDetectRuleType);
  };

  const initSiderData = async (riskDetectRules?: IRiskDetectRule[]) => {
    const nameMap = new Map();
    const resData = riskDetectRules.map(getRuleDecetedList).filter((riskDetectRule) => {
      if (!nameMap.has(riskDetectRule.value)) {
        nameMap.set(riskDetectRule.value, riskDetectRule.label);
        return riskDetectRule;
      }
    });
    console.log(resData, resData[0]?.value);
    handleItemClick(resData[0]?.value);
    setSiderItemList(resData);
  };
  const initData = async () => {
    const riskDetectRules = await listRiskDetectRules();
    setRiskDetectRules(riskDetectRules);
    initSiderData(riskDetectRules);
  };

  useEffect(() => {
    initData();
  }, []);
  useLayoutEffect(() => {
    const filterData = riskDetectRules.filter(
      (riskDetectRule) =>
        riskDetectRule.name === secureStore.riskDetectRuleType ||
        riskDetectRuleNameMap[riskDetectRule.name] === secureStore.riskDetectRuleType,
    );
    setFileterRiskDetectRules(filterData);
  }, [riskDetectRules, secureStore.riskDetectRuleType]);
  return (
    <SecureLayout>
      <SecureSider
        siderItemList={siderItemList}
        selectedFlag={selectedFlag}
        handleItemClick={handleItemClick}
        secureStore={secureStore}
      />
      <InnerRiskDetectRules riskDetectRules={filterRiskDetectRules} />
    </SecureLayout>
  );
};
export default inject('secureStore')(observer(RiskDetectRules));
