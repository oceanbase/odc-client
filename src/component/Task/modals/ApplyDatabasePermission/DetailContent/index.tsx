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

import DisplayTable from '@/component/DisplayTable';
import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import {
  IConnectionStatus,
  type IApplyDatabasePermissionTaskParams,
  type TaskDetail,
} from '@/d.ts';
import { getFormatDateTime } from '@/util/utils';
import { Descriptions, Divider, Alert, Space } from 'antd';
import { permissionOptionsMap } from '../';
import { getExpireTimeLabel } from '@/component/Task/helper';
import styles from './index.less';
import { DBType, IDatabase } from '@/d.ts/database';
import DatabaseIcon from '@/component/StatusIcon/DatabaseIcon';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import EllipsisText from '@/component/EllipsisText';

const getConnectionColumns = () => {
  return [
    {
      dataIndex: 'name',
      title: formatMessage({
        id: 'src.component.Task.ApplyDatabasePermission.DetailContent.3EE454F2',
        defaultMessage: '数据库',
      }), //'数据库'
      ellipsis: true,
      width: 339,
      render(value, record) {
        const item = {
          type: record?.type,
          dataSource: {
            type: record?.dialectType,
            name: record?.dataSourceName,
            status: { status: IConnectionStatus.ACTIVE },
          },
        };
        return (
          <Space>
            <DatabaseIcon item={item as IDatabase} />
            {value}
          </Space>
        );
      },
    },

    {
      dataIndex: 'dataSourceName',
      title: formatMessage({
        id: 'src.component.Task.ApplyDatabasePermission.DetailContent.CE83F40A',
        defaultMessage: '所属数据源',
      }), //'所属数据源'
      ellipsis: true,
      render(value) {
        return value || '-';
      },
    },
  ];
};

interface IProps {
  task: TaskDetail<IApplyDatabasePermissionTaskParams>;
  hasFlow: boolean;
}
const TaskContent: React.FC<IProps> = (props) => {
  const { task, hasFlow } = props;
  const parameters = task?.parameters;

  return (
    <>
      <Descriptions column={1}>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.component.Task.ApplyDatabasePermission.DetailContent.1FA7FD5C',
              defaultMessage: '任务编号',
            }) /*"任务编号"*/
          }
        >
          {task?.id}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.component.Task.ApplyDatabasePermission.DetailContent.AFAA55EA',
              defaultMessage: '任务类型',
            }) /*"任务类型"*/
          }
        >
          {
            formatMessage({
              id: 'src.component.Task.ApplyDatabasePermission.DetailContent.176A9CCE' /*申请库权限*/,
              defaultMessage: '申请库权限',
            }) /* 申请库权限 */
          }
        </Descriptions.Item>
        {hasFlow && (
          <Descriptions.Item
            label={formatMessage({
              id: 'odc.DataArchiveTask.DetailContent.RiskLevel',
              defaultMessage: '风险等级',
            })} /*风险等级*/
          >
            <RiskLevelLabel level={task?.riskLevel?.level} color={task?.riskLevel?.style} />
          </Descriptions.Item>
        )}
      </Descriptions>
      <Divider
        style={{
          marginTop: 16,
        }}
      />

      {parameters?.databases?.find((_db) => _db?.type === DBType.LOGICAL) && (
        <Alert
          message={formatMessage({
            id: 'src.component.Task.ApplyDatabasePermission.DetailContent.F091144E',
            defaultMessage: '数据库中包含逻辑库，审批通过后将默认获得其关联物理库的权限。',
          })}
          type="info"
          showIcon
          style={{ margin: '4px 0px 8px 0px' }}
        />
      )}
      <Descriptions column={1}>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.component.Task.ApplyDatabasePermission.DetailContent.476FEE55',
              defaultMessage: '申请项目',
            }) /*"申请项目"*/
          }
        >
          <EllipsisText content={parameters?.project?.name} />
        </Descriptions.Item>
      </Descriptions>
      <SimpleTextItem
        label={
          formatMessage({
            id: 'src.component.Task.ApplyDatabasePermission.DetailContent.281F6779',
            defaultMessage: '数据库',
          }) /*"数据库"*/
        }
        content={
          <DisplayTable
            rowKey="id"
            className={styles.table}
            columns={getConnectionColumns()}
            dataSource={parameters?.databases}
            scroll={null}
            showQuickJumper={false}
            showSizeChanger={false}
            pageSize={10}
          />
        }
        direction="column"
      />

      <Divider
        style={{
          marginTop: 16,
        }}
      />

      <Descriptions column={1}>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.component.Task.ApplyDatabasePermission.DetailContent.CF7D0545',
              defaultMessage: '权限类型',
            }) /*"权限类型"*/
          }
        >
          {parameters?.types?.map((key) => permissionOptionsMap[key].text)?.join(', ')}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.component.Task.ApplyDatabasePermission.DetailContent.8AAD2AC1',
              defaultMessage: '权限有效期',
            }) /*"权限有效期"*/
          }
        >
          {getExpireTimeLabel(parameters?.expireTime)}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.component.Task.ApplyDatabasePermission.DetailContent.265A918A',
              defaultMessage: '申请原因',
            }) /*"申请原因"*/
          }
        >
          {parameters?.applyReason}
        </Descriptions.Item>
      </Descriptions>
      <Divider
        style={{
          marginTop: 16,
        }}
      />

      <Descriptions column={1}>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.component.Task.ApplyDatabasePermission.DetailContent.2C812515',
              defaultMessage: '创建人',
            }) /*"创建人"*/
          }
        >
          {task?.creator?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.component.Task.ApplyDatabasePermission.DetailContent.80FC915E',
              defaultMessage: '创建时间',
            }) /*"创建时间"*/
          }
        >
          {getFormatDateTime(task?.createTime)}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};
export default TaskContent;
