import { detailRiskDetectRule } from '@/common/network/riskDetectRule';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { IRiskDetectRule, RiskDetectRuleCondition } from '@/d.ts/riskDetectRule';
import { formatMessage } from '@/util/intl';
import { Descriptions, Drawer } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useRef, useState } from 'react';
import SecureTable from '../../components/SecureTable';
import { CommonTableBodyMode, CommonTableMode } from '../../components/SecureTable/interface';
import { RiskLevelMapProps } from '../interface';

export const ExpressionTypeMap = {
  EnvironmentId: formatMessage({
    id: 'odc.RiskDetectRules.components.ViewRiskDetectDrawer.EnvironmentName',
  }), //环境名称
  ProjectName: formatMessage({
    id: 'odc.RiskDetectRules.components.ViewRiskDetectDrawer.ProjectName',
  }), //项目名称
  DatabaseName: formatMessage({
    id: 'odc.RiskDetectRules.components.ViewRiskDetectDrawer.DatabaseName',
  }), //数据库名称
  TaskType: formatMessage({ id: 'odc.RiskDetectRules.components.ViewRiskDetectDrawer.TaskType' }), //任务类型
  SqlCheckResult: formatMessage({
    id: 'odc.RiskDetectRules.components.ViewRiskDetectDrawer.CheckResult',
  }), //检查结果
};
export const OperationMap = {
  equals: '==',
  contains: formatMessage({ id: 'odc.RiskDetectRules.components.ViewRiskDetectDrawer.Include' }), //包含
};

interface ViewRiskDetectDrawerDrawer {
  viewDrawerVisible: boolean;
  riskLevel: RiskLevelMapProps;
  setViewDrawerVisible: (v: boolean) => void;
  selectedRecord: IRiskDetectRule;
  environmentIdMap: {
    [key in string | number]: string;
  };

  taskTypeIdMap: {
    [key in string | number]: string;
  };

  sqlCheckResultIdMap: {
    [key in string | number]: string;
  };
}
const ViewRiskDetectDrawer: React.FC<ViewRiskDetectDrawerDrawer> = ({
  viewDrawerVisible,
  riskLevel,
  setViewDrawerVisible,
  selectedRecord,
  environmentIdMap,
  taskTypeIdMap,
  sqlCheckResultIdMap,
}) => {
  const [record, setRecord] = useState<IRiskDetectRule>();
  const getDetailRiskDetectRule = async () => {
    const rawData = await detailRiskDetectRule(selectedRecord.id);
    setRecord(rawData);
  };

  const renderByExpressionType = (expression: string, value: string) => {
    switch (expression) {
      case 'EnvironmentId': {
        return environmentIdMap[value];
      }
      case 'TaskType': {
        return taskTypeIdMap[value];
      }
      case 'SqlCheckResult': {
        return sqlCheckResultIdMap[value];
      }
      default: {
        return value;
      }
    }
  };
  useEffect(() => {
    if (viewDrawerVisible && selectedRecord) {
      getDetailRiskDetectRule();
    }
  }, [viewDrawerVisible, selectedRecord]);
  return (
    <Drawer
      title={
        formatMessage({
          id: 'odc.RiskDetectRules.components.ViewRiskDetectDrawer.DetailsOfRiskIdentificationRules',
        }) //风险识别规则详情
      }
      visible={viewDrawerVisible}
      width={960}
      onClose={() => {
        setViewDrawerVisible(false);
      }}
    >
      <Descriptions column={1}>
        <Descriptions.Item
          contentStyle={{ whiteSpace: 'pre' }}
          label={
            formatMessage({ id: 'odc.RiskDetectRules.components.ViewRiskDetectDrawer.Grade' }) //等级
          }
        >
          <RiskLevelLabel level={riskLevel?.level} color={riskLevel?.style} />
        </Descriptions.Item>
        <Descriptions.Item
          contentStyle={{ whiteSpace: 'pre' }}
          label={
            formatMessage({ id: 'odc.RiskDetectRules.components.ViewRiskDetectDrawer.RuleName' }) //规则名称
          }
        >
          {record?.name}
        </Descriptions.Item>
        <Descriptions.Item
          contentStyle={{ whiteSpace: 'pre' }}
          label={
            formatMessage({ id: 'odc.RiskDetectRules.components.ViewRiskDetectDrawer.Condition' }) //条件
          }
        >
          &nbsp;
        </Descriptions.Item>
      </Descriptions>
      <SubTable data={record?.conditions} renderByExpressionType={renderByExpressionType} />
    </Drawer>
  );
};
const getSubTableColumns = (renderByExpressionType): ColumnsType<RiskDetectRuleCondition> => {
  return [
    {
      key: 'config',
      width: 928,
      dataIndex: 'config',
      title: formatMessage({
        id: 'odc.RiskDetectRules.components.ViewRiskDetectDrawer.ConfigurationValue',
      }), //配置值
      render: (_, { expression, operation, value }) =>
        [
          ExpressionTypeMap[expression],
          OperationMap[operation],
          renderByExpressionType(expression, value),
        ].join(' '),
    },
  ];
};
const SubTable = ({ data = [], renderByExpressionType }) => {
  const subTableRef = useRef(null);
  const subTableColumns = getSubTableColumns(renderByExpressionType);
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
