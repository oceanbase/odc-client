import { listEnvironments } from '@/common/network/env';
import { listRules, statsRules } from '@/common/network/ruleset';
import { IEnvironment } from '@/d.ts/environment';
import { IRule, RuleType } from '@/d.ts/rule';
import React, { useEffect, useRef, useState } from 'react';
import SecureLayout from '../components/SecureLayout';
import SecureSider, { SiderItem } from '../components/SecureSider';
import { ITableLoadOptions } from '../components/SecureTable/interface';
import InnerEnvironment from './components/InnerEnvironment';

export function getEnvTypeList(env: IEnvironment): {
  value: number;
  label: string;
  envId: number;
  rulesetId: number;
  style: string;
  description: string;
} {
  return {
    value: env.id,
    label: env.name,
    envId: env.id,
    rulesetId: env.rulesetId,
    style: env.style,
    description: env.description,
  };
}

const Environment: React.FC<{}> = ({}) => {
  const [selectedItem, setSelectedItem] = useState<number>();
  const [siderItemList, setSiderItemList] = useState<SiderItem[]>([]);
  const [ruleType, setRuleType] = useState<RuleType>(RuleType.SQL_CHECK);
  const [siderLoading, setSiderLoading] = useState<boolean>(false);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [subTypeFilters, setSubTypeFilters] = useState([]);
  const [listParams, setListParams] = useState(null);
  const loadParams = useRef(null);
  const [supportedDialectTypeFilters, setSupportedDialectTypeFilters] = useState([]);
  const [rules, setRules] = useState<IRule[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<{
    value: number;
    label: string;
    envId: number;
    rulesetId: number;
    style: string;
    description: string;
  }>();

  const handleInitRules = async (id: number, ruleType: RuleType) => {
    setTableLoading(true);
    const rulesets = await listRules(id, { types: ruleType });
    const rawData = await statsRules(id, ruleType);
    setSubTypeFilters(
      rawData?.subTypes?.distinct?.map((d) => ({
        text: d,
        value: d,
      })),
    );
    setSupportedDialectTypeFilters(
      rawData?.supportedDialectTypes?.distinct?.map((d) => ({
        text: d,
        value: d,
      })),
    );
    setRules(rulesets?.contents);
    setTableLoading(false);
  };

  const handleItemClick = (item: {
    value: number;
    label: string;
    envId: number;
    rulesetId: number;
    style: string;
    description: string;
  }) => {
    setSelectedItem(item?.envId);
    setSelectedRecord(item);
    setRuleType(RuleType.SQL_CHECK);
  };

  const initSiderData = async (envs?: IEnvironment[]) => {
    setSiderLoading(true);
    const resData = envs.map(getEnvTypeList).sort((a, b) => a?.envId - b?.envId);
    resData?.length > 0 && handleItemClick(resData[0]);
    resData?.length > 0 && setSiderItemList(resData);
    setSiderLoading(false);
  };

  const onLoad = async (args?: ITableLoadOptions) => {
    const envs = await listEnvironments();
    initSiderData(envs);
  };
  const exSearch = async (args: ITableLoadOptions) => {
    const { filters, sorter, pagination, pageSize } = args ?? {};
    const { subTypes, supportedDialectTypes, level, name = [] } = filters ?? {};
    const { column, order } = sorter ?? {};
    const { current = 1 } = pagination ?? {};
    const params = {
      sort: column?.dataIndex,
      page: current,
      size: pageSize,
    };
    params.sort = column ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}` : undefined;

    setTableLoading(true);
    const rulesets = await listRules(selectedRecord.rulesetId, {
      types: ruleType,
      subTypes,
      supportedDialectTypes,
      level,
      ...params,
    });
    const rawData = await statsRules(selectedRecord.rulesetId, ruleType);
    setSubTypeFilters(
      rawData?.subTypes?.distinct?.map((d) => ({
        text: d,
        value: d,
      })),
    );
    setSupportedDialectTypeFilters(
      rawData?.supportedDialectTypes?.distinct?.map((d) => ({
        text: d,
        value: d,
      })),
    );
    if (Array.isArray(name) && name?.length === 1) {
      setRules(
        rulesets?.contents?.filter((content) =>
          content?.metadata?.name?.toLowerCase()?.includes(name?.[0]?.toLowerCase()),
        ),
      );
    } else {
      setRules(rulesets?.contents);
    }
    setTableLoading(false);
  };
  const resetPartialFilterParams = () => {
    // loadParams.current = null;
    // setListParams(null);
  };
  const exReload = async (args: ITableLoadOptions) => {
    loadParams.current = args;
    const filters = {
      ...args?.filters,
    };
    setListParams({
      ...args,
      filters,
    });
    if (selectedRecord && selectedRecord.value) {
      const { searchValue, filters, sorter, pagination, pageSize } = args ?? {};
      const { subTypes, supportedDialectTypes, level } = filters ?? {};
      const { column, order } = sorter ?? {};
      const { current = 1 } = pagination ?? {};
      const params = {
        sort: column?.dataIndex,
        page: current,
        size: pageSize,
      };
      params.sort = column
        ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}`
        : undefined;

      setTableLoading(true);
      const rulesets = await listRules(selectedRecord?.value, {
        types: ruleType,
        subTypes,
        supportedDialectTypes,
        level,
        ...params,
      });
      const rawData = await statsRules(selectedRecord?.value, ruleType);
      setSubTypeFilters(
        rawData?.subTypes?.distinct?.map((d) => ({
          text: d,
          value: d,
        })),
      );
      setSupportedDialectTypeFilters(
        rawData?.supportedDialectTypes?.distinct?.map((d) => ({
          text: d,
          value: d,
        })),
      );
      setRules(rulesets?.contents);
      setTableLoading(false);
    }
  };
  useEffect(() => {
    onLoad();
  }, []);
  return (
    <SecureLayout>
      <SecureSider
        loading={siderLoading}
        siderItemList={siderItemList}
        selectedItem={selectedItem}
        handleItemClick={handleItemClick}
      />
      <InnerEnvironment
        {...{
          rules,
          listParams,
          resetPartialFilterParams,
          selectedRecord,
          handleInitRules,
          tableLoading,
          onLoad,
          exSearch,
          ruleType,
          setRuleType,
          exReload,
          subTypeFilters,
          supportedDialectTypeFilters,
        }}
      />
    </SecureLayout>
  );
};

export default Environment;
