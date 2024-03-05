import { formatMessage } from '@/util/intl';
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

import { deleteEnvironment, listEnvironments } from '@/common/network/env';
import { getIntegrationList } from '@/common/network/manager';
import { IManagerIntegration, IntegrationType } from '@/d.ts';
import { IEnvironment } from '@/d.ts/environment';
import { RuleType } from '@/d.ts/rule';
import { useLayoutEffect, useState } from 'react';
import SecureLayout from '../components/SecureLayout';
import SecureSider, { SiderItem } from '../components/SecureSider';
import InnerEnvironment from './components/InnerEnvironment';
import tracert from '@/util/tracert';
import styles from './index.less';
import Icon, { PlusOutlined } from '@ant-design/icons';
import { Modal, SelectProps, message } from 'antd';
import { FormEnvironmentModal } from './components/FormEnvironmentModal';

// 从Environment数组中生成Sider中的Item数据
function genEnv(env: IEnvironment): {
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
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [ruleType, setRuleType] = useState<RuleType>(RuleType.SQL_CHECK);
  const [currentEnvironment, setCurrentEnviroment] = useState<IEnvironment>();
  const [integrations, setIntegrations] = useState<IManagerIntegration[]>([]);
  const [integrationsIdMap, setIntegrationsIdMap] = useState<Record<string, string>>();
  const [formEnvironmentModalOpen, setFormEnvironmentModalOpen] = useState<boolean>(false);
  const [options, setOptions] = useState<SelectProps['options']>(null);

  const handleItemClick = (item: { value: number; origin: IEnvironment; label: string }) => {
    setSelectedItem(item?.value);
    setCurrentEnviroment(item?.origin);
    setRuleType(RuleType.SQL_CHECK);
  };

  const initEnvironment = async (currentEnvironmentId?: number) => {
    setLoading(true);
    const envs = (await listEnvironments()) || [];
    setOptions(
      envs?.map((env) => {
        return {
          label: env?.name,
          value: env?.id,
        };
      }),
    );
    const resData = envs.map(genEnv).sort((a, b) => a?.value - b?.value);
    resData?.length > 0 && setSiderItemList(resData);
    if (currentEnvironmentId) {
      resData?.length > 0 &&
        handleItemClick(resData?.find((item) => item.value === currentEnvironmentId));
    } else {
      resData?.length > 0 && handleItemClick(resData?.[0]);
    }
    setLoading(false);
  };
  const handleCancelFormModal = () => {
    setFormEnvironmentModalOpen(false);
    setIsEdit(false);
  };

  const handleCreateEnvironment = () => {
    setIsEdit(false);
    setFormEnvironmentModalOpen(true);
  };
  const handleUpdateEnvironment = () => {
    setIsEdit(true);
    setFormEnvironmentModalOpen(true);
  };
  const handleDeleteEnvironment = async () => {
    return Modal.confirm({
      title: formatMessage({ id: 'src.page.Secure.Env.65EAAB75' }), //'确认删除该环境么？'
      onCancel: () => {},
      onOk: async () => {
        if (currentEnvironment?.builtIn) {
          return;
        }
        const successful = await deleteEnvironment(currentEnvironment?.id);
        if (successful) {
          await initEnvironment();
          message.success(formatMessage({ id: 'src.page.Secure.Env.9D97D589' /*'删除成功'*/ }));
          setIsEdit(null);
          return;
        }
        message.error(formatMessage({ id: 'src.page.Secure.Env.F0BFC158' /*'删除失败'*/ }));
      },
    });
  };
  const callback = async (environmentId: number = null) => {
    setFormEnvironmentModalOpen(false);
    await initEnvironment(environmentId || currentEnvironment?.id);
    setIsEdit(null);
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
    <SecureLayout
      sider={
        <SecureSider
          extra={
            <div className={styles.extra}>
              <div className={styles.groupTitle}>
                {formatMessage({ id: 'src.page.Secure.Env.48529F6E' /*全部环境*/ }) /* 全部环境 */}
              </div>
              <Icon
                component={PlusOutlined}
                style={{ cursor: 'pointer' }}
                onClick={handleCreateEnvironment}
              />
            </div>
          }
          loading={loading}
          siderItemList={siderItemList}
          selectedItem={selectedItem}
          handleItemClick={handleItemClick}
        />
      }
      content={
        <>
          <FormEnvironmentModal
            options={options}
            isEdit={isEdit}
            currentEnvironment={currentEnvironment}
            formEnvironmentModalOpen={formEnvironmentModalOpen}
            callback={callback}
            handleCancelFormModal={handleCancelFormModal}
          />

          <InnerEnvironment
            integrations={integrations}
            integrationsIdMap={integrationsIdMap}
            currentEnvironment={currentEnvironment}
            ruleType={ruleType}
            setRuleType={setRuleType}
            initEnvironment={initEnvironment}
            handleUpdateEnvironment={handleUpdateEnvironment}
            handleDeleteEnvironment={handleDeleteEnvironment}
          />
        </>
      }
    />
  );
};
export default Environment;
