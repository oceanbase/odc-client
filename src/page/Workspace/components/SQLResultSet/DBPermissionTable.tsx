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
import { IUnauthorizedDatabase } from '@/d.ts/database';
import Action from '@/component/Action';
import { permissionOptionsMap } from '@/component/Task/ApplyDatabasePermission';
import MultiLineOverflowText from '@/component/MultiLineOverflowText';
import styles from './index.less';

const { Text } = Typography;

const PERMISSION_TAB_KEY = 'LOG';

const getColumns = (applyTask: (projectId: number, databaseId: number) => void) => {
  return [
    {
      dataIndex: 'index',
      title: formatMessage({ id: 'src.page.Workspace.components.SQLResultSet.AE76C8AD' }), //'序号'
      width: '60px',
      ellipsis: true,
      render: (action, _, i) => i + 1,
    },
    {
      dataIndex: 'name',
      title: formatMessage({ id: 'src.page.Workspace.components.SQLResultSet.5008F988' }), //'数据库名称'
      ellipsis: true,
    },
    {
      dataIndex: 'dataSource',
      title: formatMessage({ id: 'src.page.Workspace.components.SQLResultSet.47AAE96F' }), //'所属数据源'
      ellipsis: true,
      render: (dataSource) => dataSource?.name,
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
      render: (action, _) => (
        <Action.Link
          onClick={async () => {
            applyTask?.(_?.project?.id, _?.id);
          }}
        >
          {
            formatMessage({
              id: 'src.page.Workspace.components.SQLResultSet.0B7D4FBE' /*申请*/,
            }) /* 申请 */
          }
        </Action.Link>
      ),
    },
  ];
};

interface IContentProps {
  dataSource: IUnauthorizedDatabase[];
  showAction?: boolean;
  applyTask?: (projectId: number, databaseId: number) => void;
}

export const DBPermissionTableContent: React.FC<IContentProps> = (props) => {
  const { showAction = false, dataSource } = props;
  const columns = getColumns(props?.applyTask);
  return (
    <DisplayTable
      rowKey="id"
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
  dataSource: IUnauthorizedDatabase[];
}
const DBPermissionTable: React.FC<IProps> = (props) => {
  const { modalStore, sql, dataSource } = props;
  const applyTask = (projectId: number, databaseId: number) => {
    modalStore.changeApplyDatabasePermissionModal(true, {
      projectId,
      databaseId,
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
                <Text type="secondary">
                  {
                    formatMessage({
                      id: 'src.page.Workspace.components.SQLResultSet.52CCC188' /*缺少以下数据库对应权限，请先申请库权限*/,
                    }) /* 缺少以下数据库对应权限，请先申请库权限 */
                  }
                </Text>
              </Space>
              <div className={styles.track}>
                <DBPermissionTableContent
                  showAction
                  applyTask={applyTask}
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
