import { updateRule } from '@/common/network/ruleset';
import StatusSwitch from '@/component/StatusSwitch';
import TooltipContent from '@/component/TooltipContent';
import { IRule, RuleType } from '@/d.ts/rule';
import {
  CommonTableBodyMode,
  CommonTableMode,
  ITableInstance,
  ITableLoadOptions,
} from '@/page/Secure/components/SecureTable/interface';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Descriptions, message, Space, Tabs, Tag, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useEffect, useRef, useState } from 'react';
import SecureTable from '../../components/SecureTable';
import EditRuleDrawer from './EditRuleDrawer';

import styles from './index.less';

const RenderLevel: React.FC<{ level: number }> = ({ level }) => {
  const levelMap = {
    0: '无需改进',
    1: '建议改进',
    2: '必须改进',
  };
  const colorMap = {
    0: 'green',
    1: 'yellow',
    2: 'red',
  };
  return <Tag color={colorMap[level]}>{levelMap[level]}</Tag>;
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
  tableLoading: boolean;
  exSearch: (args?: ITableLoadOptions) => Promise<any>;
  exReload: (args?: ITableLoadOptions) => Promise<any>;
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
      onCell: () => {
        return {
          style: {
            maxWidth: '180px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          },
        };
      },
      render: (text, record, index) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TooltipContent content={record?.metadata?.name} maxWdith={180} />
          <Tooltip title={record?.metadata?.description}>
            <QuestionCircleOutlined style={{ marginLeft: '8px' }} />
          </Tooltip>
        </div>
      ),
    },
    {
      title: '规则类型',
      // width: 94,
      dataIndex: 'subTypes',
      key: 'subTypes',
      filters: subTypeFilters,
      onCell: () => {
        return {
          style: {
            maxWidth: '94px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          },
        };
      },
      render: (text, record) => <TooltipContent content={record?.metadata?.subTypes?.join(',')} />,
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
      render: (text, record) => <TooltipContent content={record?.appliedDialectTypes?.join(',')} />,
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
      render: (_, record, index) => {
        const { metadata, properties } = record;
        const { propertyMetadatas } = metadata;
        const keys = Object.keys(properties) || [];
        let content;
        if (keys.length === 0) {
          content = '-';
        } else if (keys.length === 1) {
          const [pm] = propertyMetadatas;
          if (Array.isArray(properties[pm.name])) {
            content = properties[pm.name].length > 0 ? properties[pm.name].join(',').toString() : '-';
          } else {
            content = content = properties[pm.name] ? properties[pm.name].toString() : '-';
          }
        } else {
          content = propertyMetadatas.map((pm) => `${pm.displayName}: ${properties[pm.name]}`).join(',');
        }
        return <TooltipContent content={content} />;
      },
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
  const tableRef = useRef<ITableInstance>();
  const [selectedData, setSelectedData] = useState<IRule>(null);
  const [editRuleDrawerVisible, setEditRuleDrawerVisible] = useState<boolean>(false);

  const handleCloseModal = (fn?: () => void) => {
    setEditRuleDrawerVisible(false);
    fn?.();
  };
  const handleUpdateEnvironment = async (rule: IRule, fn?: () => void) => {
    const flag = await updateRule(selectedRecord.rulesetId, selectedData.id, rule);
    if (flag) {
      message.success('提交成功');
      // 刷新列表
      setEditRuleDrawerVisible(false);
      fn?.();
      tableRef?.current?.reload();
    } else {
      message.error('提交失败');
    }
  };
  const handleOpenEditModal = async (record: IRule) => {
    setSelectedData(record);
    setEditRuleDrawerVisible(true);
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
    if(selectedRecord && ruleType) {
      handleInitRules(selectedRecord?.value, ruleType);
      if(tableRef.current) {
        tableRef?.current?.resetPaganition();
      }
    }
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
              showPagination={true}
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
              showPagination={true}
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
      <EditRuleDrawer
        {...{
          editRuleDrawerVisible,
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
