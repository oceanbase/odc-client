import DisplayTable from '@/component/DisplayTable';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { Descriptions, Divider, Space } from 'antd';
import { isNull } from 'lodash';
import React, { useContext } from 'react';
import { ManageContext } from '../../context';
import Status from '../CommonStatus';
import { operationOptions } from '../FormAutoAuthModal/conditionSelect';
import {
  connectionAccessActionOptions,
  connectionAccessTypeOptions,
} from '../FormAutoAuthModal/index';
import { useRoleListByIds } from '../UserPage/component';

import type { IAutoAuthRule } from '@/d.ts';
import { IManagerResourceType } from '@/d.ts';
import { actionLabelMap } from './';
import styles from './index.less';

const getColumns = (resource) => {
  return [
    {
      dataIndex: 'resourceType',
      title: formatMessage({
        id: 'odc.components.AutoAuthPage.component.ObjectType',
      }), //对象类型
      width: 120,
      ellipsis: true,
      render: (resourceType) => {
        return (
          <span>
            {connectionAccessTypeOptions?.find((item) => item.value === resourceType)?.label}
          </span>
        );
      },
    },
    {
      dataIndex: 'resourceId',
      title: formatMessage({
        id: 'odc.components.AutoAuthPage.component.ObjectName',
      }), //对象名称
      ellipsis: true,
      render: (resourceId, _) => {
        return (
          <span>
            {isNull(resourceId)
              ? formatMessage({
                  id: 'odc.components.AutoAuthPage.component.All',
                }) //全部
              : resource[_?.resourceType]?.find((item) => item.id === resourceId)?.name}
          </span>
        );
      },
    },
    {
      dataIndex: 'actions',
      title: formatMessage({
        id: 'odc.components.AutoAuthPage.component.Permission',
      }), //权限
      width: 110,
      ellipsis: true,
      render: (actions) => {
        return (
          <span>
            {connectionAccessActionOptions?.find((item) => item.value === actions)?.label}
          </span>
        );
      },
    },
  ];
};

export const MaskRuleDetail: React.FC<{
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
  const { publicConnections } = useContext(ManageContext);
  const roleIds = actions
    ?.filter((item) => item.action === 'BindRole')
    ?.map((item) => item?.arguments?.roleId);
  const roles = useRoleListByIds(roleIds);
  const columns = getColumns({
    [IManagerResourceType.public_connection]: publicConnections?.contents,
  });
  const actionsLabel = [];
  const hasRole = actions?.some((item) => item.action === 'BindRole');
  const hasPermission = actions?.some((item) => item.action === 'BindPermission');
  const resource = actions
    ?.filter((item) => item.action === 'BindPermission')
    ?.map((item) => item?.arguments);
  if (hasRole) {
    actionsLabel.push(actionLabelMap.BindRole);
  }
  if (hasPermission) {
    actionsLabel.push(actionLabelMap.BindPermission);
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
              const operationLabel = operationOptions?.find(
                (item) => item.value === operation,
              )?.label;
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
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.AutoAuthPage.component.Remarks',
          })} /*备注*/
        >
          {description || '-'}
        </Descriptions.Item>
      </Descriptions>
      <Divider style={{ margin: '12px 0' }} />
      {!!resource?.length && (
        <Descriptions column={1} layout="vertical">
          <Descriptions.Item
            label={formatMessage({
              id: 'odc.components.AutoAuthPage.component.ConnectionAccess',
            })} /*连接访问权限*/
          >
            <DisplayTable
              rowKey="id"
              columns={columns}
              dataSource={resource}
              scroll={null}
              pageSize={10}
              showSizeChanger={false}
            />
          </Descriptions.Item>
        </Descriptions>
      )}

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
          {getLocalFormatDateTime(createTime)}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.AutoAuthPage.component.UpdateTime',
          })} /*更新时间*/
        >
          {getLocalFormatDateTime(updateTime)}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};
