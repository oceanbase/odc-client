import { listEnvironments } from '@/common/network/env';
import { getRuleset, listRules, statsRules } from '@/common/network/ruleset';
import { IEnvironment } from '@/d.ts/environment';
import { IRule, RuleType } from '@/d.ts/rule';
import React, { useEffect, useState } from 'react';
import SecureLayout from '../components/SecureLayout';
import SecureSider, { SiderItem } from '../components/SecureSider';
import { ITableLoadOptions } from '../components/SecureTable/interface';
import InnerEnvironment from './InnerEnvironment';

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
    setRules(rulesets || []);
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
    setSelectedItem(item.envId);
    setSelectedRecord(item);
  };

  const initSiderData = async (envs?: IEnvironment[]) => {
    setSiderLoading(true);
    const resData = envs.map(getEnvTypeList);
    handleItemClick(resData[0]);
    setSiderItemList(resData);
    setSiderLoading(false);
  };

  const onLoad = async () => {
    const envs = await listEnvironments();
    initSiderData(envs);
  };
  const exSearch = async (args: ITableLoadOptions) => {
    const { filters } = args ?? {};
    const { subTypes, supportedDialectTypes } = filters ?? {};

    setTableLoading(true);
    const rulesets = await listRules(selectedRecord.rulesetId, {
      types: ruleType,
      subTypes,
      supportedDialectTypes,
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
    setRules(rulesets || []);
    setTableLoading(false);
  };
  const exReload = async (args: ITableLoadOptions) => {
    const { searchValue } = args ?? {};
    setTableLoading(true);
    const rulesets = await getRuleset(selectedRecord.value, RuleType.SQL_CHECK);
    const rawData = await statsRules(selectedRecord.value, RuleType.SQL_CHECK);
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
    setRules(rulesets?.rules || []);
    setTableLoading(false);
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
