import { getIntegrationList } from '@/common/network/manager';
import { updateRule } from '@/common/network/ruleset';
import StatusSwitch from '@/component/StatusSwitch';
import TooltipContent from '@/component/TooltipContent';
import { actionTypes, IManagerResourceType, IntegrationType } from '@/d.ts';
import { IRule, RuleType } from '@/d.ts/rule';
import {
  CommonTableBodyMode,
  CommonTableMode,
  ITableInstance,
  ITableLoadOptions,
} from '@/page/Secure/components/SecureTable/interface';
import { formatMessage } from '@/util/intl';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Descriptions, message, Space, Tabs, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useEffect, useRef, useState } from 'react';
import SecureTable from '../../components/SecureTable';
import EditRuleDrawer from './EditRuleDrawer';

import { Acess, createPermission } from '@/component/Acess';
import RiskLevelLabel from '../../components/RiskLevelLabel';
import { RiskLevelEnum, RiskLevelTextMap } from '../../interface';
import styles from './index.less';

export const RenderLevel: React.FC<{ level: number }> = ({ level }) => {
  const levelMap = {
    [RiskLevelEnum.DEFAULT]: RiskLevelTextMap[RiskLevelEnum.DEFAULT], //无需改进
    [RiskLevelEnum.SUGGEST]: RiskLevelTextMap[RiskLevelEnum.SUGGEST], //建议改进
    [RiskLevelEnum.MUST]: RiskLevelTextMap[RiskLevelEnum.MUST], //必须改进
  };
  const colorMap = {
    [RiskLevelEnum.DEFAULT]: 'green',
    [RiskLevelEnum.SUGGEST]: 'yellow',
    [RiskLevelEnum.MUST]: 'red',
  };
  return <RiskLevelLabel content={levelMap[level]} color={colorMap[level]} />;
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
  integrationsIdMap: { [key in string]: string };
  subTypeFilters: { text: string; value: string }[];
  supportedDialectTypeFilters: { text: string; value: string }[];
  handleOpenEditModal: (record: IRule) => void;
  handleSwtichRuleStatus: (rulesetId: number, rule: IRule) => void;
}) => ColumnsType<IRule> = ({
  selectedRecord,
  integrationsIdMap = {},
  subTypeFilters,
  supportedDialectTypeFilters,
  handleOpenEditModal = () => {},
  handleSwtichRuleStatus = () => {},
}) => {
  return [
    {
      title: formatMessage({ id: 'odc.Env.components.InnerEnvironment.RuleName' }), //规则名称
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
      title: formatMessage({ id: 'odc.Env.components.InnerEnvironment.RuleType' }), //规则类型 // width: 94,
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
      title: formatMessage({ id: 'odc.Env.components.InnerEnvironment.SupportsDataSources' }), //支持数据源 // width: 150,
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
    },
    {
      title: formatMessage({ id: 'odc.Env.components.InnerEnvironment.ConfigurationValue' }), //配置值 // width: 378,
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
        if (
          keys?.[0] ===
          '${com.oceanbase.odc.builtin-resource.regulation.rule.sql-console.external-sql-interceptor.metadata.name}'
        ) {
          return integrationsIdMap?.[properties?.[keys?.[0]]] || '-';
        }
        if (keys.length === 0) {
          content = '-';
        } else if (keys.length === 1) {
          const [pm] = propertyMetadatas;
          if (Array.isArray(properties[pm.name])) {
            content =
              properties[pm.name].length > 0 ? properties[pm.name].join(',').toString() : '-';
          } else {
            content = content = properties?.[pm.name]?.toString() || '-';
          }
        } else {
          content = propertyMetadatas
            .map((pm) => `${pm.displayName}: ${properties[pm.name]}`)
            .join(',');
        }
        return <TooltipContent content={content} />;
      },
    },
    {
      title: formatMessage({ id: 'odc.Env.components.InnerEnvironment.ImprovementLevel' }), //改进等级 // width: 92,
      dataIndex: 'level',
      key: 'level',
      filters: [
        {
          text: RiskLevelTextMap[RiskLevelEnum.DEFAULT],
          value: RiskLevelEnum.DEFAULT,
        },
        {
          text: RiskLevelTextMap[RiskLevelEnum.SUGGEST],
          value: RiskLevelEnum.SUGGEST,
        },
        {
          text: RiskLevelTextMap[RiskLevelEnum.MUST],
          value: RiskLevelEnum.MUST,
        },
      ],
      render: (_, record) => <RenderLevel level={record.level} />,
    },
    {
      title: formatMessage({ id: 'odc.Env.components.InnerEnvironment.Status' }), //状态 // width: 80,
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
      title: formatMessage({ id: 'odc.Env.components.InnerEnvironment.Operation' }), //操作
      width: 80,
      key: 'action',
      // fixed: 'right',
      render: (_, record, index) => (
        <>
          <Space>
            <Acess
              fallback={<span>-</span>}
              {...createPermission(IManagerResourceType.environment, actionTypes.update)}
            >
              <a onClick={() => handleOpenEditModal(record)}>
                {formatMessage({ id: 'odc.Env.components.InnerEnvironment.Edit' }) /*编辑*/}
              </a>
            </Acess>
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
  const [integrations, setIntegrations] = useState([]);
  const [integrationsIdMap, setIntegrationsIdMap] = useState<{ [key in string]: string }>();
  const [editRuleDrawerVisible, setEditRuleDrawerVisible] = useState<boolean>(false);

  const handleCloseModal = (fn?: () => void) => {
    setEditRuleDrawerVisible(false);
    fn?.();
  };
  const handleUpdateEnvironment = async (rule: IRule, fn?: () => void) => {
    const flag = await updateRule(selectedRecord.rulesetId, selectedData.id, rule);
    if (flag) {
      message.success(
        formatMessage({ id: 'odc.Env.components.InnerEnvironment.SubmittedSuccessfully' }), //提交成功
      ); // 刷新列表
      setEditRuleDrawerVisible(false);
      fn?.();
      tableRef?.current?.reload();
    } else {
      message.error(
        formatMessage({ id: 'odc.Env.components.InnerEnvironment.FailedToSubmit' }), //提交失败
      );
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
      message.success(
        formatMessage({ id: 'odc.Env.components.InnerEnvironment.UpdatedSuccessfully' }), //更新成功
      );
      handleRulesReload();
    } else {
      message.success(
        formatMessage({ id: 'odc.Env.components.InnerEnvironment.UpdateFailed' }), //更新失败
      );
    }
  };
  const handleRulesReload = () => {
    handleInitRules(selectedRecord.value, ruleType);
  };

  const loadIntegrations = async () => {
    const integrations = await getIntegrationList({
      type: IntegrationType.SQL_INTERCEPTOR,
    });
    const map = {};
    integrations?.contents?.forEach((content) => {
      map[content.id] = content.name;
    });
    setIntegrationsIdMap(map);
    setIntegrations(integrations?.contents?.filter((content) => content?.enabled));
  };

  const columns: ColumnsType<IRule> = getColumns({
    selectedRecord,
    integrationsIdMap,
    handleOpenEditModal,
    handleSwtichRuleStatus,
    subTypeFilters,
    supportedDialectTypeFilters,
  });
  useEffect(() => {
    if (selectedRecord && ruleType) {
      handleInitRules(selectedRecord?.value, ruleType);
      if (tableRef.current) {
        tableRef.current?.resetPaganition?.();
      }
    }
  }, [selectedRecord, ruleType]);

  useEffect(() => {
    loadIntegrations();
  }, []);

  return (
    <>
      <div className={styles.innerEnv}>
        <Space className={styles.tag}>
          <div className={styles.tagLabel}>
            {formatMessage({ id: 'odc.Env.components.InnerEnvironment.LabelStyle' }) /*标签样式:*/}
          </div>
          <RiskLevelLabel content={selectedRecord?.label} color={selectedRecord?.style} />
        </Space>
        <Descriptions column={1}>
          <Descriptions.Item
            contentStyle={{ whiteSpace: 'pre' }}
            label={
              formatMessage({ id: 'odc.Env.components.InnerEnvironment.Description' }) //描述
            }
          >
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
          <Tabs.TabPane
            tab={formatMessage({ id: 'odc.Env.components.InnerEnvironment.SqlCheckSpecification' })}
            /*SQL 检查规范*/ key={RuleType.SQL_CHECK}
          />
          <Tabs.TabPane
            tab={formatMessage({
              id: 'odc.Env.components.InnerEnvironment.SqlWindowSpecification',
            })}
            /*SQL 窗口规范*/ key={RuleType.SQL_CONSOLE}
          />
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
          integrations,
        }}
      />
    </>
  );
};

export default InnerEnvironment;
