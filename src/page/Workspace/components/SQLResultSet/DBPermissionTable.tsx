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
import { inject, observer } from 'mobx-react';
import { Tabs, Space, Typography } from 'antd';
import { CloseCircleFilled } from '@ant-design/icons';
import { ModalStore } from '@/store/modal';
import DisplayTable from '@/component/DisplayTable';
import { DatabasePermissionType } from '@/d.ts/database';
import { IUnauthorizedResource, TablePermissionType } from '@/d.ts/table';
import Action from '@/component/Action';
import { permissionOptionsMap } from '@/component/Task/ApplyDatabasePermission';
import MultiLineOverflowText from '@/component/MultiLineOverflowText';
import styles from './index.less';
import { ColumnType } from 'antd/es/table';
import { join } from 'path';

const { Text } = Typography;

const PERMISSION_TAB_KEY = 'LOG';

const getColumns = (
  applyDataBaseTask: IContentProps['applyDataBaseTask'],
  applyTableTask: IContentProps['applyTableTask'],
) => {
  const columns: ColumnType<IUnauthorizedResource>[] = [
    {
      dataIndex: 'index',
      title: formatMessage({ id: 'src.page.Workspace.components.SQLResultSet.AE76C8AD' }), //'序号'
      width: '60px',
      ellipsis: true,
      render: (action, _, i) => i + 1,
    },
    {
      dataIndex: 'databaseName',
      title: formatMessage({ id: 'src.page.Workspace.components.SQLResultSet.5008F988' }), //'数据库名称'
      ellipsis: true,
    },
    {
      dataIndex: 'tableName',
      title: '表',
      ellipsis: true,
    },
    {
      dataIndex: 'dataSourceName',
      title: formatMessage({ id: 'src.page.Workspace.components.SQLResultSet.47AAE96F' }), //'所属数据源'
      ellipsis: true,
    },
    {
      dataIndex: 'unauthorizedPermissionTypes',
      title: formatMessage({ id: 'src.page.Workspace.components.SQLResultSet.ADFA9F27' }), //'缺少权限'
      width: '200px',
      ellipsis: true,
      render: (types) => types?.map((item) => permissionOptionsMap[item]?.text)?.join(', '),
    },
    {
      dataIndex: 'action',
      title: formatMessage({ id: 'src.page.Workspace.components.SQLResultSet.F84FA469' }), //'操作'
      width: '164px',
      ellipsis: true,
      render: (action, _) => {
        const dbDisabled = !_.applicable;
        let dbTooltip = null,
          tableTooltip = null;
        if (dbDisabled) {
          dbTooltip = _.projectId
            ? formatMessage({
                id: 'src.page.Workspace.components.SQLResultSet.C9A2993D',
              }) /* 无法申请数据库权限：没有加入数据库所属项目 */
            : formatMessage({
                id: 'src.page.Workspace.components.SQLResultSet.E87F786C',
              }); /* 无法申请数据库权限：数据库没有归属项目 */
          tableTooltip = _.projectId
            ? '无法申请表权限：没有加入数据库所属项目'
            : '无法申请表权限：表所属数据库没有归属项目';
        }
        return (
          <Action.Group size={2}>
            <Action.Link
              disabled={dbDisabled}
              tooltip={dbTooltip}
              key="applyDatabase"
              onClick={async () => {
                applyDataBaseTask?.(_?.projectId, _?.databaseId, _?.unauthorizedPermissionTypes);
              }}
            >
              申请库权限
            </Action.Link>
            {
              <Action.Link
                key="applyTable"
                disabled={dbDisabled || !_?.tableName}
                tooltip={tableTooltip}
                onClick={async () => {
                  applyTableTask?.(
                    _?.projectId,
                    _?.databaseId,
                    [_?.tableName],
                    _?.unauthorizedPermissionTypes,
                  );
                }}
              >
                申请表权限
              </Action.Link>
            }
          </Action.Group>
        );
      },
    },
  ];
  return columns;
};

interface IContentProps {
  dataSource: IUnauthorizedResource[];
  showAction?: boolean;
  applyDataBaseTask?: (
    projectId: number,
    databaseId: number,
    types: DatabasePermissionType[],
  ) => void;
  applyTableTask?: (
    projectId: number,
    databaseId: number,
    tableNames: string[],
    types: TablePermissionType[],
  ) => void;
}

export const DBPermissionTableContent: React.FC<IContentProps> = (props) => {
  const { showAction = false, dataSource } = props;
  const columns = getColumns(props?.applyDataBaseTask, props?.applyTableTask);
  const handleRowKey = ({
    databaseId,
    tableName,
    unauthorizedPermissionTypes,
  }: IUnauthorizedResource) =>
    `${databaseId}-${tableName}-${unauthorizedPermissionTypes.join('-')}`;
  return (
    <DisplayTable
      rowKey={handleRowKey}
      columns={columns?.filter((item) => (!showAction ? item.dataIndex !== 'action' : true))}
      dataSource={dataSource}
      scroll={null}
      showSizeChanger={false}
    />
  );
};

interface IProps {
  modalStore?: ModalStore;
  sql?: string;
  dataSource: IUnauthorizedResource[];
}
const DBPermissionTable: React.FC<IProps> = (props) => {
  const { modalStore, sql, dataSource } = props;
  const applyDataBaseTask: IContentProps['applyDataBaseTask'] = (
    projectId: number,
    databaseId: number,
    types: DatabasePermissionType[],
  ) => {
    modalStore.changeApplyDatabasePermissionModal(true, {
      projectId,
      databaseId,
      types,
    });
  };
  const applyTableTask: IContentProps['applyTableTask'] = (
    projectId: number,
    databaseId: number,
    tableNames: string[],
    types: TablePermissionType[],
  ) => {
    modalStore.changeApplyTablePermissionModal(true, {
      projectId,
      databaseId,
      tableNames,
      types,
    });
  };

  return (
    <Tabs
      className={styles.tabs}
      activeKey={PERMISSION_TAB_KEY}
      tabBarGutter={0}
      animated={false}
      items={[
        {
          label: formatMessage({ id: 'src.page.Workspace.components.SQLResultSet.D12A3FE9' }), //'日志'
          key: PERMISSION_TAB_KEY,
          children: (
            <div className={styles.result}>
              <Space>
                <CloseCircleFilled style={{ color: '#F5222D' }} />
                {formatMessage({
                  id: 'src.page.Workspace.components.SQLResultSet.7A8EC0AB' /*执行以下 SQL 失败*/,
                })}
              </Space>
              <MultiLineOverflowText className={styles.executedSQL} content={sql} />
              <Space direction="vertical">
                <span>
                  {
                    formatMessage({
                      id: 'src.page.Workspace.components.SQLResultSet.BDAE252A' /*失败原因：*/,
                    }) /* 失败原因： */
                  }
                </span>
                <Text type="secondary">缺少以下数据库表对应权限，请先申请权限</Text>
              </Space>
              <div className={styles.track}>
                <DBPermissionTableContent
                  showAction
                  applyDataBaseTask={applyDataBaseTask}
                  applyTableTask={applyTableTask}
                  dataSource={dataSource}
                />
              </div>
            </div>
          ),
        },
      ]}
    />
  );
};

export default inject('modalStore')(observer(DBPermissionTable));
