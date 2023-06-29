import { updateRule } from '@/common/network/ruleset';
import StatusSwitch from '@/component/StatusSwitch';
import { IRule, RuleType } from '@/d.ts/rule';
import { Descriptions, message, Space, Tabs, Tag, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useEffect, useRef, useState } from 'react';
import SecureTable from '../components/SecureTable';
import {
  CommonTableBodyMode,
  CommonTableMode,
  ITableLoadOptions,
} from '../components/SecureTable/interface';
import EditModal from './EditModal';
import styles from './index.less';

const RenderLevel: React.FC<{ level: number }> = ({ level }) => {
  const levelMap = {
    0: '无需改进',
    1: '建议改进',
    2: '必须改进',
  };
  return <>{levelMap[level]}</>;
};
interface InnerEnvProps {
  selectedRecord: {
    value: number;
    label: string;
    envId: number;
    rulesetId: number;
    style: string;
    description: string;
  };
  onLoad: () => void;
  tableLoading: boolean;
  exSearch: (args: ITableLoadOptions) => Promise<any>;
  exReload: (args: ITableLoadOptions) => Promise<any>;
  rules: IRule[];
  ruleType: RuleType;
  setRuleType: (value: any) => void;

  subTypeFilters: { text: string; value: string }[];
  supportedDialectTypeFilters: { text: string; value: string }[];
  handleInitRules: (id: number, ruleType: RuleType) => void;
}

const getColumns: (columnsFunction: {
  selectedRecord: any;
  subTypeFilters: { text: string; value: string }[];
  supportedDialectTypeFilters: { text: string; value: string }[];
  handleOpenEditModal: (record: IRule) => void;
  handleSwtichRuleStatus: (rulesetId: number, rule: IRule) => void;
}) => ColumnsType<IRule> = ({
  selectedRecord,
  subTypeFilters,
  supportedDialectTypeFilters,
  handleOpenEditModal = () => {},
  handleSwtichRuleStatus = () => {},
}) => {
  return [
    {
      title: '规则名称',
      width: 218,
      dataIndex: 'name',
      key: 'name',
      // fixed: 'left',
      render: (text, record, index) => <>{record?.metadata?.name}</>,
    },
    {
      title: '规则类型',
      // width: 94,
      dataIndex: 'subTypes',
      key: 'subTypes',
      filters: subTypeFilters,
      render: (text, record) => record?.metadata?.subTypes?.join(','),
    },
    {
      title: '支持数据源',
      // width: 150,
      dataIndex: 'supportedDialectTypes',
      key: 'supportedDialectTypes',
      filters: supportedDialectTypeFilters,
      onCell: () => {
        return {
          style: {
            maxWidth: '150px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          },
        };
      },
      render: (text, record) => (
        <Tooltip title={record?.appliedDialectTypes?.join(',')} placement="top" arrowPointAtCenter>
          {record?.appliedDialectTypes?.join(',')}
        </Tooltip>
      ),
      //record.metadata?.supportedDialectTypes?.join(','), // 这个的值是固定的，应该是appliedDialectTypes才对
    },
    {
      title: '配置值',
      // width: 378,
      dataIndex: 'metadata',
      key: 'metadata',
      onCell: () => {
        return {
          style: {
            maxWidth: '378px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          },
        };
      },
      render: (_, record, index) => (
        <Tooltip
          title={'' + record.properties[record.metadata.propertyMetadatas?.[0]?.name]}
          placement="top"
          arrowPointAtCenter
        >
          {'' + record.properties[record.metadata.propertyMetadatas?.[0]?.name]}
        </Tooltip>
      ),
    },
    {
      title: '改进等级',
      // width: 92,
      dataIndex: 'level',
      key: 'level',
      render: (_, record) => <RenderLevel level={record.level} />,
    },
    {
      title: '状态',
      // width: 80,
      dataIndex: 'status',
      key: 'status',
      render: (_, record, index) => {
        return (
          <StatusSwitch
            key={index}
            checked={record.enabled}
            onConfirm={() => handleSwtichRuleStatus(selectedRecord.rulesetId, record)}
            onCancel={() => handleSwtichRuleStatus(selectedRecord.rulesetId, record)}
          />
        );
      },
    },
    {
      title: '操作',
      width: 80,
      key: 'action',
      // fixed: 'right',
      render: (_, record, index) => (
        <>
          <Space>
            <a onClick={() => handleOpenEditModal(record)}>编辑</a>
          </Space>
        </>
      ),
    },
  ];
};
const InnerEnvironment: React.FC<InnerEnvProps> = ({
  onLoad,
  tableLoading,
  selectedRecord,
  subTypeFilters,
  supportedDialectTypeFilters,
  rules,
  handleInitRules,
  ruleType,
  setRuleType,
  exReload,
  exSearch,
}) => {
  const tableRef = useRef<any>(null);
  const [selectedData, setSelectedData] = useState<IRule>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const handleCloseModal = () => {
    setModalVisible(false);
  };
  const handleUpdateEnvironment = async (rule: IRule) => {
    setModalVisible(false);
    const flag = await updateRule(selectedRecord.rulesetId, selectedData.id, rule);
    if (flag) {
      message.success('提交成功');
    } else {
      message.error('提交失败');
    }
    // 刷新列表
    onLoad();
  };
  const handleOpenEditModal = async (record: IRule) => {
    setSelectedData(record);
    setModalVisible(true);
  };

  const handleTabClick = (
    key: string,
    event: React.KeyboardEvent<Element> | React.MouseEvent<Element, MouseEvent>,
  ) => {
    setRuleType(key as RuleType);
  };

  const handleSwtichRuleStatus = async (rulesetId: number, rule: IRule) => {
    const updateResult =
      (await updateRule(rulesetId, rule.id, {
        ...rule,
        enabled: !rule.enabled,
      })) || false;
    if (updateResult) {
      message.success('更新成功');
      handleRulesReload();
    } else {
      message.success('更新失败');
    }
  };
  const handleRulesReload = () => {
    handleInitRules(selectedRecord.value, ruleType);
  };
  const columns: ColumnsType<IRule> = getColumns({
    selectedRecord,
    handleOpenEditModal,
    handleSwtichRuleStatus,
    subTypeFilters,
    supportedDialectTypeFilters,
  });
  useEffect(() => {
    selectedRecord && ruleType && handleInitRules(selectedRecord?.value, ruleType);
  }, [selectedRecord, ruleType]);
  return (
    <>
      <div className={styles.innerEnv}>
        <Space className={styles.tag}>
          <div className={styles.tagLabel}>标签样式: </div>
          <Tag color={selectedRecord?.style?.toLowerCase()}>{selectedRecord?.label}</Tag>
        </Space>
        <Descriptions column={1}>
          <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'描述'}>
            {selectedRecord?.description}
          </Descriptions.Item>
        </Descriptions>
        <Tabs
          type="card"
          size="small"
          className={styles.tabs}
          activeKey={ruleType}
          onTabClick={handleTabClick}
        >
          <Tabs.TabPane tab="SQL 检查规范" key={RuleType.SQL_CHECK} />
          <Tabs.TabPane tab="SQL 窗口规范" key={RuleType.SQL_CONSOLE} />
        </Tabs>
        <div style={{ height: '100%', flexGrow: 1, marginTop: '12px' }}>
          {ruleType === RuleType.SQL_CHECK ? (
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
              exReload={exReload}
              exSearch={exSearch}
              onLoad={null}
              tableProps={{
                columns: columns,
                dataSource: rules,
                rowKey: 'id',
                pagination: false,
                loading: tableLoading,
              }}
            />
          ) : (
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
              exReload={exReload}
              exSearch={exSearch}
              onLoad={null}
              tableProps={{
                columns: columns.filter((column) => column.key !== 'level'),
                dataSource: rules,
                rowKey: 'id',
                pagination: false,
                loading: tableLoading,
              }}
            />
          )}
        </div>
      </div>
      <EditModal
        {...{
          modalVisible,
          ruleType,
          rule: selectedData,
          handleCloseModal,
          handleUpdateEnvironment,
        }}
      />
    </>
  );
};

export default InnerEnvironment;
