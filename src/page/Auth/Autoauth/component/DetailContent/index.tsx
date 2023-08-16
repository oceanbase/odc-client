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

import DisplayTable from '@/component/DisplayTable';
import { useRoleListByIds } from '@/component/Manage/RoleList';
import Status from '@/component/Manage/Status';
import type { IAutoAuthRule } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import { Descriptions, Divider, Space } from 'antd';
import React, { useContext } from 'react';
import { actionLabelMap } from '../..';
import { ResourceContext } from '../../../context';
import { getProjectName, getProjectRoleNameByIds } from '../../../index';
import styles from '../../index.less';
import { operationOptions } from '../FormModal/conditionSelect';
const getResourceColumns = () => {
  return [
    {
      dataIndex: 'project',
      title: formatMessage({
        id: 'odc.src.page.Auth.Autoauth.component.DetailContent.Project',
      }), //'项目'
      ellipsis: true,
      width: 160,
    },
    {
      dataIndex: 'roles',
      title: formatMessage({
        id: 'odc.src.page.Auth.Autoauth.component.DetailContent.Role',
      }), //'角色'
      ellipsis: true,
      width: 108,
      render: (roles) => {
        return roles?.join(', ');
      },
    },
  ];
};
const DetailContent: React.FC<{
  data: IAutoAuthRule;
}> = ({ data }) => {
  const {
    name,
    actions,
    creatorName,
    createTime,
    updateTime,
    enabled,
    eventName,
    conditions,
    description,
  } = data;
  const { roles: _roles, projectRoles, projects } = useContext(ResourceContext);
  const roleIds = actions
    ?.filter((item) => item.action === 'BindRole')
    ?.map((item) => item?.arguments?.roleId);
  const roles = useRoleListByIds(_roles, roleIds);
  const resource = actions
    ?.filter((item) => item.action === 'BindProjectRole')
    ?.map((item) => ({
      project: getProjectName(projects, item.arguments.projectId),
      roles: getProjectRoleNameByIds(projectRoles, item.arguments.roles),
    }));
  const actionsLabel = [];
  const hasRole = actions?.some((item) => item.action === 'BindRole');
  const hasProjectRole = actions?.some((item) => item.action === 'BindProjectRole');
  if (hasRole) {
    actionsLabel.push(actionLabelMap.BindRole);
  }
  if (hasProjectRole) {
    actionsLabel.push(actionLabelMap.BindProjectRole);
  }
  return (
    <>
      <div className={styles.header}>
        <Space>
          <span>
            {
              formatMessage({
                id: 'odc.components.AutoAuthPage.component.RuleName',
              }) /*规则名称:*/
            }
          </span>
          <span>{name}</span>
        </Space>
        <Status enabled={enabled} />
      </div>
      <Descriptions column={1}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.AutoAuthPage.component.TriggerEvent',
          })} /*触发事件*/
        >
          {eventName}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.AutoAuthPage.component.MatchingCondition',
          })} /*匹配条件*/
        >
          <Space direction="vertical" size={4}>
            {conditions?.map(({ object, expression, operation, value }) => {
              const operationLabel = operationOptions?.find((item) => item.value === operation)
                ?.label;
              return <div>{`${object}, ${expression}, ${operationLabel}, ${value}`}</div>;
            }) || '-'}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.AutoAuthPage.component.PerformAnAction',
          })} /*执行动作*/
        >
          {actionsLabel?.join(', ') || '-'}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.AutoAuthPage.component.Role',
          })} /*角色*/
        >
          {roles?.map((item) => item?.name)?.join(', ') || '-'}
        </Descriptions.Item>
      </Descriptions>
      {hasProjectRole && (
        <Descriptions column={2}>
          <Descriptions.Item
            span={2}
            style={{
              paddingTop: '12px',
            }}
          >
            {
              formatMessage({
                id: 'odc.src.page.Auth.Autoauth.component.DetailContent.AwardedProjectRole',
              }) /* 
            授予项目角色
           */
            }
          </Descriptions.Item>
          <Descriptions.Item span={2}>
            <DisplayTable
              rowKey="id"
              columns={getResourceColumns()}
              dataSource={resource || []}
              disablePagination
              scroll={null}
            />
          </Descriptions.Item>
        </Descriptions>
      )}
      <Descriptions column={1}>
        <Descriptions.Item
          style={{
            paddingTop: '12px',
          }}
          label={formatMessage({
            id: 'odc.components.AutoAuthPage.component.Remarks',
          })} /*备注*/
        >
          {description || '-'}
        </Descriptions.Item>
      </Descriptions>
      <Divider
        style={{
          margin: '12px 0',
        }}
      />
      <Descriptions column={1}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.AutoAuthPage.component.Founder',
          })} /*创建人*/
        >
          {creatorName}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.AutoAuthPage.component.CreationTime',
          })} /*创建时间*/
        >
          {getFormatDateTime(createTime)}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.AutoAuthPage.component.UpdateTime',
          })} /*更新时间*/
        >
          {getFormatDateTime(updateTime)}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};
export default DetailContent;
