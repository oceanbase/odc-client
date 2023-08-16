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

import { Acess, createPermission } from '@/component/Acess';
import SearchFilter from '@/component/SearchFilter';
import TooltipContent from '@/component/TooltipContent';
import { actionTypes, IManagerResourceType } from '@/d.ts';
import { IRule } from '@/d.ts/rule';
import { formatMessage } from '@/util/intl';
import { QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Space, Switch, Tooltip } from 'antd';
import { useState } from 'react';
import { RiskLevelEnum, RiskLevelTextMap } from '../../interface';
import { SqlInterceptorKey } from './EditRuleDrawer';
import { RenderLevel } from './InnerEnvironment';

function getConfig(
  rule: IRule,
  integrationsIdMap: {
    [key in string | number]: string;
  },
): string {
  const { metadata, properties } = rule;
  const { propertyMetadatas } = metadata;
  const keys = Object.keys(properties) || [];
  let content = '';
  if (keys?.[0] === SqlInterceptorKey) {
    return integrationsIdMap?.[properties?.[keys?.[0]]] || '-';
  }
  if (keys.length === 0) {
    content = '-';
  } else if (keys.length === 1) {
    const [pm] = propertyMetadatas;
    if (Array.isArray(properties?.[pm?.name])) {
      content =
        properties?.[pm?.name]?.length > 0 ? properties?.[pm?.name]?.join(',').toString() : '-';
    } else {
      content = properties?.[pm?.name]?.toString() || '-';
    }
  } else {
    content = propertyMetadatas
      .map((pm) => `${pm?.displayName}: ${properties?.[pm?.name]}`)
      .join(',');
  }
  return content;
}

export const RuleSwitch = ({ disabled = false, checked, onChange }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const wrapOnChange = async () => {
    setLoading(true);
    await onChange();
    setLoading(false);
  };
  return (
    <Switch
      size="small"
      loading={loading}
      disabled={disabled}
      checked={checked}
      onChange={wrapOnChange}
    />
  );
};

export const getColumns = ({
  subTypeFilters,
  supportedDialectTypeFilters,
  integrationsIdMap,
  handleSwtichRuleStatus,
  handleOpenEditModal,
}) => {
  return [
    {
      title: formatMessage({ id: 'odc.Env.components.InnerEnvironment.RuleName' }), //规则名称
      width: 218,
      dataIndex: 'name',
      key: 'name',
      filters: [],

      ellipsis: true,
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            selectedKeys={null}
            placeholder={formatMessage({ id: 'odc.Env.components.InnerEnvironment.RuleName' })} //规则名称
          />
        );
      },

      filterIcon: (filtered) => (
        <SearchOutlined
          style={{
            color: filtered ? 'var(--icon-color-focus)' : undefined,
          }}
        />
      ),
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
      title: formatMessage({ id: 'odc.Env.components.InnerEnvironment.RuleType' }), //规则类型
      dataIndex: 'subTypes',
      key: 'subTypes',
      filters: subTypeFilters,
      ellipsis: true,
      render: (text, record) => <TooltipContent content={record?.metadata?.subTypes?.join(',')} />,
    },
    {
      title: formatMessage({ id: 'odc.Env.components.InnerEnvironment.SupportsDataSources' }), //支持数据源
      dataIndex: 'supportedDialectTypes',
      key: 'supportedDialectTypes',
      filters: supportedDialectTypeFilters,
      ellipsis: true,
      render: (text, record) => <TooltipContent content={record?.appliedDialectTypes?.join(',')} />,
    },
    {
      title: formatMessage({ id: 'odc.Env.components.InnerEnvironment.ConfigurationValue' }), //配置值
      dataIndex: 'metadata',
      key: 'metadata',
      ellipsis: true,
      render: (_, record, index) => {
        const content = getConfig(record, integrationsIdMap);
        return <TooltipContent content={content} />;
      },
    },
    {
      title: formatMessage({ id: 'odc.Env.components.InnerEnvironment.ImprovementLevel' }), //改进等级
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
      title: formatMessage({ id: 'odc.Env.components.InnerEnvironment.WhetherToEnable' }), //是否启用
      dataIndex: 'status',
      key: 'status',
      render: (_, record, index) => {
        return (
          <Acess
            fallback={<Switch size="small" checked={record?.enabled} disabled />}
            {...createPermission(IManagerResourceType.ruleset, actionTypes.update)}
          >
            <RuleSwitch
              key={index}
              checked={record?.enabled}
              onChange={() => handleSwtichRuleStatus(record?.rulesetId, record)}
            />
          </Acess>
        );
      },
    },
    {
      title: formatMessage({ id: 'odc.Env.components.InnerEnvironment.Operation' }), //操作
      width: 80,
      key: 'action',
      render: (_, record, index) => (
        <>
          <Space>
            <Acess
              fallback={<span>-</span>}
              {...createPermission(IManagerResourceType.ruleset, actionTypes.update)}
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
