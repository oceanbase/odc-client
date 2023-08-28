/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { listEnvironments } from '@/common/network/env';
import { getIntegrationList } from '@/common/network/manager';
import { IManagerIntegration, IntegrationType } from '@/d.ts';
import { IEnvironment } from '@/d.ts/environment';
import { RuleType } from '@/d.ts/rule';
import { useLayoutEffect, useState } from 'react';
import SecureLayout from '../components/SecureLayout';
import SecureSider, { SiderItem } from '../components/SecureSider';
import InnerEnvironment from './components/InnerEnvironment';
import { EnvironmentContext } from './EnvironmentContext';
import tracert from '@/util/tracert';

// 从Environment数组中生成Sider中的Item数据
function genEnv(
  env: IEnvironment,
): {
  value: number;
  origin: IEnvironment;
  label: string;
} {
  return {
    value: env.id,
    origin: env,
    label: env.name,
  };
}

const Environment = () => {
  const [selectedItem, setSelectedItem] = useState<number>();
  const [siderItemList, setSiderItemList] = useState<SiderItem[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [ruleType, setRuleType] = useState<RuleType>(RuleType.SQL_CHECK);
  const [currentEnvironment, setCurrentEnviroment] = useState<IEnvironment>();
  const [integrations, setIntegrations] = useState<IManagerIntegration[]>([]);
  const [integrationsIdMap, setIntegrationsIdMap] = useState<{ [key in string]: string }>();

  const handleItemClick = (item: { value: number; origin: IEnvironment; label: string }) => {
    setSelectedItem(item?.value);
    setCurrentEnviroment(item?.origin);
    setRuleType(RuleType.SQL_CHECK);
  };

  const initEnvironment = async () => {
    setLoading(true);
    const envs = await listEnvironments();
    const resData = envs.map(genEnv).sort((a, b) => a?.value - b?.value);
    resData?.length > 0 && setSiderItemList(resData);
    resData?.length > 0 && handleItemClick(resData?.[0]);
    setLoading(false);
  };

  const loadIntegrations = async () => {
    const integrations = await getIntegrationList({
      type: IntegrationType.SQL_INTERCEPTOR,
    });
    const map = {};
    integrations?.contents?.forEach((content) => {
      map[content?.id] = content?.name;
    });
    setIntegrationsIdMap(map);
    setIntegrations(integrations?.contents?.filter((content) => content?.enabled));
  };

  useLayoutEffect(() => {
    initEnvironment();
    loadIntegrations();
    tracert.expo('a3112.b64008.c330923');
  }, []);

  return (
    <SecureLayout>
      <SecureSider
        loading={loading}
        siderItemList={siderItemList}
        selectedItem={selectedItem}
        handleItemClick={handleItemClick}
      />
      <EnvironmentContext.Provider
        value={{
          currentEnvironment,
          integrations,
          integrationsIdMap,
        }}
      >
        <InnerEnvironment ruleType={ruleType} setRuleType={setRuleType} />
      </EnvironmentContext.Provider>
    </SecureLayout>
  );
};
export default Environment;
