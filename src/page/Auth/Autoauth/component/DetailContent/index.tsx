import { useRoleListByIds } from '@/component/Manage/RoleList';
import Status from '@/component/Manage/Status';
import type { IAutoAuthRule } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import { Descriptions, Divider, Space } from 'antd';
import React, { useContext } from 'react';
import { actionLabelMap } from '../..';
import { ResourceContext } from '../../../context';
import styles from '../../index.less';
import { operationOptions } from '../FormModal/conditionSelect';

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
  const { roles: _roles, resource: _resource } = useContext(ResourceContext);

  const roleIds = actions
    ?.filter((item) => item.action === 'BindRole')
    ?.map((item) => item?.arguments?.roleId);
  const roles = useRoleListByIds(_roles, roleIds);
  const actionsLabel = [];
  const hasRole = actions?.some((item) => item.action === 'BindRole');
  const hasPermission = actions?.some((item) => item.action === 'BindPermission');
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
