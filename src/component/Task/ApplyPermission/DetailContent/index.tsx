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

import type { IApplyPermissionTaskParams, TaskDetail } from '@/d.ts';
import { getFormatDateTime } from '@/util/utils';
import { Descriptions, Divider } from 'antd';

interface IProps {
  task: TaskDetail<IApplyPermissionTaskParams>;
}
const ApplyPermissionTaskContent: React.FC<IProps> = (props) => {
  const { task } = props;
  const parameters = task?.parameters;
  const roleLabels = parameters?.resourceRoles?.map(({ name }) => name)?.join(', ');
  return (
    <>
      <Descriptions column={2}>
        <Descriptions.Item label="任务编号">{task?.id}</Descriptions.Item>
        <Descriptions.Item label="任务类型">申请项目权限</Descriptions.Item>
        <Descriptions.Item label="申请项目">{parameters?.project?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="申请项目角色">{roleLabels || '-'}</Descriptions.Item>
        <Descriptions.Item span={2} label="申请原因">
          {parameters?.applyReason}
        </Descriptions.Item>
      </Descriptions>
      <Divider
        style={{
          marginTop: 4,
        }}
      />
      <Descriptions column={2}>
        <Descriptions.Item label="创建人">{task?.creator?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="创建时间">
          {getFormatDateTime(task?.createTime)}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};
export default ApplyPermissionTaskContent;
