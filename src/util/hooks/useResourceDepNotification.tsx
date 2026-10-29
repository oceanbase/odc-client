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

import { formatMessage } from '@/util/intl';
import {
  CheckCircleFilled,
  CheckOutlined,
  CloseCircleFilled,
  Loading3QuartersOutlined,
} from '@ant-design/icons';
import { notification, Typography } from 'antd';
import React from 'react';

export enum EStatus {
  LOADING = 'loading',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum EResourceType {
  DATASOURCE = 'datasource',
  USER = 'user',
  DATABASE = 'database',
}

const getTitle = (name: string) => ({
  [EResourceType.DATASOURCE]: {
    [EStatus.LOADING]: formatMessage(
      { id: 'src.util.hooks.E5AF2BD7', defaultMessage: '数据源 {name} 删除中' },
      { name },
    ),
    [EStatus.SUCCESS]: formatMessage(
      { id: 'src.util.hooks.4E4607F8', defaultMessage: '数据源 {name} 删除成功' },
      { name },
    ),
    [EStatus.FAILED]: formatMessage(
      { id: 'src.util.hooks.8B84C1F1', defaultMessage: '数据源 {name} 删除失败' },
      { name },
    ),
  },
  [EResourceType.DATABASE]: {
    [EStatus.LOADING]: formatMessage(
      { id: 'src.util.hooks.6AA58176', defaultMessage: '数据库 {name} 修改项目中' },
      { name },
    ),
    [EStatus.SUCCESS]: formatMessage(
      { id: 'src.util.hooks.B6AABB48', defaultMessage: '数据库 {name} 修改项目成功' },
      { name },
    ),
    [EStatus.FAILED]: formatMessage(
      { id: 'src.util.hooks.EF794F25', defaultMessage: '数据库 {name} 修改项目失败' },
      { name },
    ),
  },
  [EResourceType.USER]: {
    [EStatus.LOADING]: formatMessage(
      { id: 'src.util.hooks.BCC27C44', defaultMessage: '用户 {name} 删除中' },
      { name },
    ),
    [EStatus.SUCCESS]: formatMessage(
      { id: 'src.util.hooks.E4864996', defaultMessage: '用户 {name} 删除成功' },
      { name },
    ),
    [EStatus.FAILED]: formatMessage(
      { id: 'src.util.hooks.DABCD68E', defaultMessage: '用户 {name} 删除失败' },
      { name },
    ),
  },
});

const getContent = (projectName?: string) => ({
  [EResourceType.DATASOURCE]: {
    [EStatus.LOADING]: formatMessage({
      id: 'src.util.hooks.62E2A858',
      defaultMessage: '删除前将终止所有相关未完成的工单和作业，请等待。',
    }),
    [EStatus.SUCCESS]: formatMessage({
      id: 'src.util.hooks.45D9E0CB',
      defaultMessage: '数据源已删除，未完成的工单和作业已终止。',
    }),
    [EStatus.FAILED]: formatMessage({
      id: 'src.util.hooks.93AFAA74',
      defaultMessage: '部分未完成的工单和作业未被终止，请检查。',
    }),
  },
  [EResourceType.DATABASE]: {
    [EStatus.LOADING]: formatMessage({
      id: 'src.util.hooks.F23C7B0E',
      defaultMessage: '修改前将终止相关未完成的工单和作业，请等待。',
    }),
    [EStatus.SUCCESS]: projectName
      ? formatMessage(
          {
            id: 'src.util.hooks.2F01E7F2',
            defaultMessage:
              '数据库已移出当前项目，并迁移至项目 {projectName} 中，未完成的工单和作业已终止。',
          },
          { projectName },
        )
      : formatMessage({
          id: 'src.util.hooks.ECDBEDF1',
          defaultMessage: '数据库已移出当前项目，并未分配项目，未完成的工单和作业已终止',
        }),

    [EStatus.FAILED]: formatMessage({
      id: 'src.util.hooks.CB6FE7A9',
      defaultMessage: '部分未完成的工单和作业未被终止，请检查。',
    }),
  },
  [EResourceType.USER]: {
    [EStatus.LOADING]: formatMessage({
      id: 'src.util.hooks.A289AFBB',
      defaultMessage: '删除前将终止该用户个人空间中所有未完成的工单和作业，请等待。',
    }),
    [EStatus.SUCCESS]: formatMessage({
      id: 'src.util.hooks.E8F6EE4D',
      defaultMessage: '用户已删除，该用户个人空间中所有未完成的工单和作业已被终止。',
    }),
    [EStatus.FAILED]: formatMessage({
      id: 'src.util.hooks.AA405D53',
      defaultMessage: '该用户个人空间中部分未完成的工单和作业未被终止，请检查。',
    }),
  },
});

const iconConfig = {
  [EStatus.LOADING]: (
    <Loading3QuartersOutlined style={{ color: 'var(--icon-blue-color)', fontSize: 20 }} />
  ),

  [EStatus.SUCCESS]: <CheckCircleFilled style={{ color: 'var(--icon-color-2)', fontSize: 20 }} />,
  [EStatus.FAILED]: <CloseCircleFilled style={{ color: 'var(--code-red-color)', fontSize: 20 }} />,
};

export interface IOpenNotificationProps {
  name: string;
  type: EResourceType;
  status: EStatus;
  projectName?: string;
}

const useResourceDepNotification = () => {
  const [api, contextHolder] = notification.useNotification({
    getContainer: () => document.body,
  });
  const openNotification = ({ name, type, status, projectName }: IOpenNotificationProps) => {
    api.open({
      message: <Typography.Title level={5}>{getTitle(name)[type][status]}</Typography.Title>,
      description: getContent(projectName)[type][status],
      icon: iconConfig[status],
      duration: 0, // 不自动关闭
    });
  };
  return { contextHolder, openNotification };
};

export const openResourceDepNotification = ({
  name,
  type,
  status,
  projectName,
}: IOpenNotificationProps) => {
  notification.open({
    message: <Typography.Title level={5}>{getTitle(name)[type][status]}</Typography.Title>,
    description: getContent(projectName)[type][status],
    icon: iconConfig[status],
    duration: 0, // 不自动关闭
  });
};

export default useResourceDepNotification;
