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

import { listRules, statsRules, updateRule } from '@/common/network/ruleset';
import CommonTable from '@/component/CommonTable';
import {
  ITableFilter,
  ITableInstance,
  ITableLoadOptions,
  ITablePagination,
} from '@/component/CommonTable/interface';
import { IRule, RuleType } from '@/d.ts/rule';
import { message, Spin } from 'antd';
import React, { useRef, useState } from 'react';
import { getColumns } from './column';
import EditRuleDrawer from './EditRuleDrawer';
import styles from './index.less';
import tracert from '@/util/tracert';
import { IEnvironment } from '@/d.ts/environment';
import { IManagerIntegration } from '@/d.ts';
import modal from 'antd/lib/modal';

interface IEnvironmentProps {
  currentEnvironment: IEnvironment;
  integrations: IManagerIntegration[];
  integrationsIdMap: Record<string, string>;
  ruleType: RuleType;
}
const EnvironmentTable: React.FC<IEnvironmentProps> = ({
  currentEnvironment,
  integrations,
  integrationsIdMap,
  ruleType,
}) => {
  const tableRef = useRef<ITableInstance>();
  const argsRef = useRef<ITableFilter>();
  const originRules = useRef<IRule[]>(null);
  const [subTypeFilters, setSubTypeFilters] = useState<
    {
      text: string;
      value: string;
    }[]
  >([]);
  const [supportedDialectTypeFilters, setSupportedDialectTypeFilters] = useState([]);
  const [rules, setRules] = useState<IRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<IRule>();
  const [pagination, setPagination] = useState<ITablePagination>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [editRuleDrawerVisible, setEditRuleDrawerVisible] = useState<boolean>(false);
  /**
   * 获取不同规范规则类型以及支持的数据源类型，用于筛选。
   */
  const handleStatsRule = async () => {
    const rawData = await statsRules(currentEnvironment?.rulesetId, ruleType);
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
  };
  const getRules = async (args?: ITableLoadOptions) => {
    if (!currentEnvironment?.id) {
      return;
    }
    setLoading(true);
    const { pagination = null, filters = null } = args ?? {};
    const { subTypes, supportedDialectTypes, level, name } = filters ?? {};
    handleStatsRule();
    const rulesets = await listRules(currentEnvironment?.rulesetId, {
      types: ruleType,
    });
    let filteredRules: IRule[] = rulesets?.contents;
    originRules.current = rulesets?.contents;
    if (name && name?.length === 1) {
      filteredRules = filteredRules?.filter((item) =>
        item?.metadata?.name?.toLowerCase()?.includes(name?.[0]?.toLowerCase()),
      );
    }
    if (subTypes) {
      filteredRules = filteredRules?.filter((item) =>
        item?.metadata?.subTypes?.some((subType) => subTypes?.includes(subType)),
      );
    }
    if (supportedDialectTypes) {
      filteredRules = filteredRules?.filter((item) =>
        item?.appliedDialectTypes?.some((supportedDialectType) =>
          supportedDialectTypes?.includes(supportedDialectType),
        ),
      );
    }
    if (level) {
      filteredRules = filteredRules?.filter((item) => level?.includes(item?.level));
    }
    setRules(filteredRules);
    if (pagination) {
      setPagination(pagination);
    }
    setLoading(false);
  };
  const getLocalRules = async (args: ITableLoadOptions) => {
    setLoading(true);
    const { pageSize = 0, pagination = null, filters = null } = args;
    const { subTypes, supportedDialectTypes, level, name } = filters ?? {};
    let filteredRules: IRule[] = originRules.current;
    argsRef.current = {
      filters,
    };
    if (name && name?.length === 1) {
      filteredRules = filteredRules?.filter((item) =>
        item?.metadata?.name?.toLowerCase()?.includes(name?.[0]?.toLowerCase()),
      );
    }
    if (subTypes) {
      filteredRules = filteredRules?.filter((item) =>
        item?.metadata?.subTypes?.some((subType) => subTypes?.includes(subType)),
      );
    }
    if (supportedDialectTypes) {
      filteredRules = filteredRules?.filter((item) =>
        item?.appliedDialectTypes?.some((supportedDialectType) =>
          supportedDialectTypes?.includes(supportedDialectType),
        ),
      );
    }
    if (level) {
      filteredRules = filteredRules?.filter((item) => level?.includes(item?.level));
    }
    setRules(filteredRules);
    if (pagination) {
      setPagination(pagination);
    }
    setLoading(false);
  };
  const handleOpenEditModal = async (record: IRule) => {
    setSelectedRule(record);
    setEditRuleDrawerVisible(true);
  };
  const handleCloseModal = async () => {
    setEditRuleDrawerVisible(false);
  };
  const handleUpdateEnvironment = async (rule: IRule, fn?: () => void) => {
    const flag = await updateRule(currentEnvironment?.rulesetId, selectedRule?.id, rule);
    if (flag) {
      message.success(
        formatMessage({
          id: 'odc.src.page.Secure.Env.components.SubmittedSuccessfully',
        }), //'提交成功'
      );
      setEditRuleDrawerVisible(false);
      tableRef.current?.reload?.(argsRef.current || {});
    } else {
      message.error(
        formatMessage({
          id: 'odc.src.page.Secure.Env.components.SubmissionFailed',
        }), //'提交失败'
      );
    }
  };
  const handleSwtichRuleStatus = async (rulesetId: number, rule: IRule) => {
    tracert.click(!rule.enabled ? 'a3112.b64008.c330923.d367476' : 'a3112.b64008.c330923.d367477', {
      ruleId: rule.id,
    });
    const isCloseDisabledPLDebug =
      rule?.metadata?.type === RuleType.SQL_CONSOLE && rule?.metadata?.id === 6 && rule?.enabled;
    const switchRuleStatus = async () => {
      const successful =
        (await updateRule(rulesetId, rule.id, {
          ...rule,
          enabled: !rule.enabled,
        })) || false;
      if (successful) {
        message.success(rule.enabled ? '禁用成功' : '启用成功');
        tableRef.current?.reload(argsRef.current || {});
      } else {
        message.error(rule.enabled ? '禁用失败' : '启用失败');
      }
    };
    if (isCloseDisabledPLDebug) {
      return modal.confirm({
        title: '确认禁用？',
        centered: true,
        content: rule?.metadata?.description,
        cancelText: '取消',
        okText: '确认',
        onCancel: () => {},
        onOk: switchRuleStatus,
      });
    }
    switchRuleStatus();
  };
  const rawColumns = getColumns({
    subTypeFilters,
    supportedDialectTypeFilters,
    integrationsIdMap: integrationsIdMap,
    handleSwtichRuleStatus,
    handleOpenEditModal,
  });
  const columns =
    ruleType === RuleType.SQL_CHECK
      ? rawColumns
      : rawColumns.filter((column) => column?.key !== 'level');
  return (
    <>
      <div className={styles.spin}>
        <Spin spinning={loading}>
          <CommonTable
            ref={tableRef}
            showToolbar={false}
            titleContent={null}
            operationContent={null}
            onLoad={getRules}
            onChange={getLocalRules}
            tableProps={{
              columns: columns,
              dataSource: rules,
              rowKey: 'id',
              pagination: pagination || false,
            }}
          />
        </Spin>
      </div>
      <EditRuleDrawer
        rule={selectedRule}
        ruleType={ruleType}
        editRuleDrawerVisible={editRuleDrawerVisible}
        integrations={integrations}
        handleCloseModal={handleCloseModal}
        handleUpdateEnvironment={handleUpdateEnvironment}
      />
    </>
  );
};
export default EnvironmentTable;
