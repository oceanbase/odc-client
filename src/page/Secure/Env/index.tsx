import { listEnvironments } from '@/common/network/env';
import { getRuleset, updateRule } from '@/common/network/ruleset';
import { EmptyLabel } from '@/component/CommonFilter';
import StatusSwitch from '@/component/StatusSwitch';
import { EnvPageType } from '@/d.ts';
import { IEnvironment, TagType } from '@/d.ts/environment';
import { IRule, IRuleSet, RuleType } from '@/d.ts/rule';
import { SecureStore } from '@/store/secure';
import { Button, Descriptions, message, Space, Tabs } from 'antd';
import { ColumnsType } from 'antd/es/table';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import SecureLayout from '../components/SecureLayout';
import SecureSider, { SiderItem } from '../components/SecureSider';
import SecureTable from '../components/SecureTable';
import { CommonTableBodyMode, CommonTableMode } from '../components/SecureTable/interface';
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
export const envNameMap = {
  开发: 'DEV',
  测试: 'TEST',
  生产: 'PROD',
};
const EnvTag: React.FC<TagType> = ({ tabStyle, tabContent }) => (
  <div className={tabStyle}>{tabContent}</div>
);
const envTagMap = {
  DEV: <EnvTag tabContent={'开发'} tabStyle={classNames(styles.tab, styles.dev)} />,
  TEST: <EnvTag tabContent={'测试'} tabStyle={classNames(styles.tab, styles.test)} />,
  PROD: <EnvTag tabContent={'生产'} tabStyle={classNames(styles.tab, styles.prod)} />,
};
interface InnerEnvProps {
  envPageType: EnvPageType;
  environment: IEnvironment;
}
const InnerEnv: React.FC<InnerEnvProps> = ({ envPageType, environment }) => {
  const tableRef = useRef<any>(null);
  const [selectedData, setSelectedData] = useState<IRule>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [ruleSetData, setRuleSetData] = useState<IRuleSet>(null);
  const [rules, setRules] = useState<IRule[]>([]);
  const [ruleType, setRuleType] = useState<RuleType>(RuleType.SQL_CHECK);

  const handleCloseModal = () => {
    setModalVisible(false);
  };
  const handleUpdateEnvironment = async (rule: IRule) => {
    setModalVisible(false);
    const flag = await updateRule(ruleSetData.id, selectedData.id, rule);
    if (flag) {
      message.success('提交成功');
    } else {
      message.error('提交失败');
    }
    // 刷新列表
    tableRef.current.reload();
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
  const getColumns: (columnsFunction: {
    handleSwtichRuleStatus: (rulesetId: number, rule: IRule) => void;
  }) => ColumnsType<IRule> = ({ handleSwtichRuleStatus = () => {} }) => {
    return [
      {
        title: '规则名称',
        width: 218,
        dataIndex: 'name',
        key: 'name',
        render: (text, record, index) => <>{record?.metadata?.name}</>,
      },
      {
        title: '规则类型',
        width: 94,
        dataIndex: 'subTypes',
        key: 'subTypes',
        filters: [{ name: <EmptyLabel />, id: 0 }].concat([]).map(({ name, id }) => {
          return {
            text: name,
            value: id,
          };
        }),
        render: (text, record) => record?.metadata?.subTypes?.join(','),
      },
      {
        title: '支持数据源',
        width: 150,
        dataIndex: 'appliedDialectTypes',
        key: 'appliedDialectTypes',
        filters: [
          { text: 'OB_MYSQL', value: 'OB_MYSQL' },
          { text: 'OB_ORACLE', value: 'OB_ORACLE' },
          { text: 'ORACLE', value: 'ORACLE' },
          { text: 'MYSQL', value: 'MYSQL' },
          { text: 'UNKNOWN', value: 'UNKNOWN' },
        ],
      },
      {
        title: '配置值',
        width: 378,
        dataIndex: 'metadata',
        key: 'metadata',
        render: (_, record, index) => {
          return '' + record.properties[record.metadata.propertyMetadatas?.[0]?.name];
        },
        // <PropertyComponentMap propertyMetadata={record.metadata?.propertyMetadatas?.[0]}/>,
      },
      {
        title: '改进等级',
        width: 92,
        dataIndex: 'level',
        key: 'level',
        render: (_, record) => <RenderLevel level={record.level} />,
      },
      {
        title: '状态',
        width: 80,
        dataIndex: 'status',
        key: 'status',
        render: (_, record, index) => {
          return (
            <StatusSwitch
              key={index}
              checked={record.enabled}
              onConfirm={() => handleSwtichRuleStatus(ruleSetData.id, record)}
              onCancel={() => handleSwtichRuleStatus(ruleSetData.id, record)}
            />
          );
        },
      },
      {
        title: '操作',
        width: 80,
        key: 'action',
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
  const handleInitRules = async (id: number) => {
    const rulesets = await getRuleset(id);
    setRuleSetData(rulesets);
    setRules(rulesets?.rules || []);
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
    handleInitRules(environment.id);
  };
  const columns: ColumnsType<IRule> = getColumns({
    handleSwtichRuleStatus,
  });
  useEffect(() => {
    environment && handleInitRules(environment.id);
  }, [environment]);
  return (
    <>
      <div className={styles.envDrawer}>
        <Descriptions column={1}>
          <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'标签样式'}>
            {envTagMap[envPageType]}
          </Descriptions.Item>
          <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={'描述'}>
            {ruleSetData?.description}
          </Descriptions.Item>
        </Descriptions>
        <div style={{ position: 'relative' }}>
          <Tabs activeKey={ruleType} onTabClick={handleTabClick}>
            <Tabs.TabPane tab="SQL 检查规范" key={RuleType.SQL_CHECK} />
            <Tabs.TabPane tab="SQL 窗口规范" key={RuleType.SQL_CONSOLE} />
          </Tabs>
          <Button
            style={{
              position: 'absolute',
              right: '0px',
              top: '0px',
              borderBottom: 'none',
            }}
          >
            恢复默认信息
          </Button>
        </div>
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
          onLoad={null}
          tableProps={{
            columns:
              ruleType === RuleType.SQL_CHECK
                ? columns
                : columns.filter((column) => column.key !== 'level'),
            dataSource: rules,
            rowKey: 'id',
            pagination: false,
            scroll: {
              x: 1000,
            },
          }}
        />
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
      {/* <SetApprovalDrawer visible={visible} onClose={onClose} {...selectedData} /> */}
    </>
  );
};
export function getEnvTypeList(env: IEnvironment): {
  value: EnvPageType;
  label: string;
} {
  return {
    value: envNameMap[env.name] || env.name,
    label: env.name,
  };
}

const Env: React.FC<{
  secureStore: SecureStore;
}> = ({ secureStore }) => {
  const selectedFlag = 'envPageType';
  const [environments, setEnvironments] = useState<IEnvironment[]>([]);
  const [siderItemList, setSiderItemList] = useState<SiderItem[]>([]);

  const [filterEnv, setFilterEnv] = useState<IEnvironment[]>([]);

  const handleItemClick = (name: string) => {
    secureStore.changeEnvPageType(name as EnvPageType);
  };

  const initSiderData = async (environments?: IEnvironment[]) => {
    const nameMap = new Map();
    const resData = environments.map(getEnvTypeList).filter((environment) => {
      if (!nameMap.has(environment.value)) {
        nameMap.set(environment.value, environment.label);
        return environment;
      }
    });
    handleItemClick(resData[0]?.value);
    setSiderItemList(resData);
  };
  const initData = async () => {
    const envs = await listEnvironments();
    setEnvironments(envs);
    initSiderData(envs);
  };

  useEffect(() => {
    initData();
  }, []);
  useLayoutEffect(() => {
    const filterData = environments.filter(
      (environment) =>
        environment.name === secureStore.envPageType ||
        envNameMap[environment.name] === secureStore.envPageType,
    );
    setFilterEnv(filterData);
  }, [environments, secureStore.envPageType]);
  return (
    <SecureLayout>
      <SecureSider
        siderItemList={siderItemList}
        selectedFlag={selectedFlag}
        handleItemClick={handleItemClick}
        secureStore={secureStore}
      />
      <InnerEnv envPageType={secureStore.envPageType} environment={filterEnv?.[0]} />
    </SecureLayout>
  );
};

export default inject('secureStore')(observer(Env));
