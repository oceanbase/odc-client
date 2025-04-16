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

import { getDataSourceModeConfig, getDataSourceStyleByConnectType } from '@/common/datasource';
import { getDatabase, batchUpdateRemarks } from '@/common/network/database';
import Action from '@/component/Action';
import HelpDoc from '@/component/helpDoc';
import LogicIcon from '@/component/logicIcon';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import MiniTable from '@/component/Table/MiniTable';
import TableCard from '@/component/Table/TableCard';
import AsyncTaskCreateModal from '@/component/Task/AsyncTask';
import ExportTaskCreateModal from '@/component/Task/ExportTask';
import ImportTaskCreateModal from '@/component/Task/ImportTask';
import LogicDatabaseAsyncTask from '@/component/Task/LogicDatabaseAsyncTask';
import MutipleAsyncTask from '@/component/Task/MutipleAsyncTask';
import { IConnectionStatus, TaskType } from '@/d.ts';
import { DatabasePermissionType, IDatabase } from '@/d.ts/database';
import ChangeProjectModal from '@/page/Datasource/Info/ChangeProjectModal';
import datasourceStatus from '@/store/datasourceStatus';
import { ModalStore } from '@/store/modal';
import { isLogicalDatabase } from '@/util/database';
import { formatMessage } from '@/util/intl';
import { gotoSQLWorkspace } from '@/util/route';
import tracert from '@/util/tracert';
import { getLocalFormatDateTime } from '@/util/utils';
import Icon from '@ant-design/icons';
import { Space, Tooltip, Typography, message } from 'antd';
import { toInteger } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useContext } from 'react';
import ProjectContext from '../ProjectContext';
import AddDataBaseButton from './components/AddDataBaseButton';
import ChangeOwnerModal from './components/ChangeOwnerModal';
import { CreateLogicialDatabase, ManageLogicDatabase } from './components/LogicDatabase';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';
import AddObjectStorage from './components/AddObjectStorage';
import Header from './Header';
import styles from './index.less';
import ParamContext, { IFilterParams } from './ParamContext';
import StatusName from './StatusName';
import { isProjectArchived } from '@/page/Project/helper';
import { renderTool } from '@/util/renderTool';
import { DatabaseGroup, DBType } from '@/d.ts/database';
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';

import { getOperation, GroupKey, isGroupColumn } from './help';
import useData from './hooks/useData';
interface IProps {
  id: string;
  modalStore?: ModalStore;
}

const Database: React.FC<IProps> = ({ id, modalStore }) => {
  const statusMap = datasourceStatus.statusMap;
  const { project } = useContext(ProjectContext);
  const projectArchived = isProjectArchived(project);
  const {
    envList,
    fetchEnvLoading,
    loading,
    searchValue,
    setSearchValue,
    filterParams,
    setFilterParams,
    treeData,
    groupMode,
    setGroupMode,
    selectedRowKeys,
    selectedTempRowKeys,
    setSelectedTempRowKeys,
    visible,
    setVisible,
    changeOwnerModalVisible,
    setChangeOwnerModalVisible,
    openLogicialDatabase,
    setOpenLogicialDatabase,
    openObjectStorage,
    setOpenObjectStorage,
    openManageLogicDatabase,
    setOpenManageLogicDatabase,
    database,
    setDatabase,
    reload,
    disabledMultiDBChanges,
    isOwner,
    clearSelectedRowKeys,
    haveOperationPermission,
  } = useData(id);

  const getCheckbox = (record: IDatabase) => {
    const hasChangeAuth = record.authorizedPermissionTypes?.includes(DatabasePermissionType.CHANGE);
    const hasQueryAuth = record.authorizedPermissionTypes?.includes(DatabasePermissionType.QUERY);
    const disabled = !hasChangeAuth && !hasQueryAuth && !record?.authorizedPermissionTypes?.length;
    const status = statusMap.get(record?.dataSource?.id) || record?.dataSource?.status;
    const config = getDataSourceModeConfig(record?.dataSource?.type);
    return {
      disabled:
        disabled ||
        !record.existed ||
        ![IConnectionStatus.ACTIVE, IConnectionStatus.TESTING]?.includes(status?.status) ||
        !config?.features?.task?.includes(TaskType.MULTIPLE_ASYNC),
      name: record.name,
    };
  };

  const rowSelection = {
    columnWidth: 48,
    selectedRowKeys: selectedTempRowKeys,
    preserveSelectedRowKeys: true,
    checkStrictly: false,
    onChange: (selectedRowKeys: React.Key[] | string[], selectedRows: IDatabase[]) => {
      if (selectedRowKeys.length === 0) {
        setSelectedTempRowKeys([]);
      } else {
        setSelectedTempRowKeys(selectedRowKeys);
      }
    },
    getCheckboxProps: (record: IDatabase & { children?: IDatabase[] }) => {
      if (isGroupColumn(record.id)) {
        const canSelect = record.children.some((db) => !getCheckbox(db).disabled);
        return { disabled: !canSelect };
      }
      return getCheckbox(record);
    },
  };

  const renderNoPermissionDBWithTip = (
    name: React.ReactNode,
    showTip = true,
    databaseStyle,
    type: DBType,
  ) => {
    return (
      <span className={styles.disable}>
        <Tooltip
          title={
            showTip
              ? formatMessage({
                  id: 'src.page.Project.Database.B4A5A6AC',
                  defaultMessage: '当前账号的项目成员角色没有该库的操作权限，请先申请库权限',
                })
              : ''
          }
        >
          {type === 'LOGICAL' ? (
            <LogicIcon />
          ) : (
            <Icon
              component={databaseStyle?.dbIcon?.component}
              style={{
                color: databaseStyle?.icon?.color,
                fontSize: 16,
                marginRight: 4,
              }}
            />
          )}
          {name}
        </Tooltip>
      </span>
    );
  };

  const tablrCardTitle = (
    <AddDataBaseButton
      orderedDatabaseIds={selectedRowKeys?.length ? [selectedRowKeys as number[]] : [[undefined]]}
      disabledMultiDBChanges={disabledMultiDBChanges}
      clearSelectedRowKeys={clearSelectedRowKeys}
      modalStore={modalStore}
      onSuccess={() => reload()}
      projectId={parseInt(id)}
      onOpenLogicialDatabase={() => setOpenLogicialDatabase(true)}
      onOpenObjectStorage={() => setOpenObjectStorage(true)}
      onOpenDatabaseAdmin={() => {
        setChangeOwnerModalVisible(true);
        setDatabase(null);
      }}
    />
  );

  return (
    <TableCard
      title={projectArchived ? null : tablrCardTitle}
      extra={
        <ParamContext.Provider
          value={{
            searchValue: searchValue,
            setSearchvalue(v, type) {
              setSearchValue({ value: v, type });
            },
            filterParams,
            setFilterParams,
            groupMode,
            setGroupMode,
            reload: () => {
              reload();
            },
            envList,
          }}
        >
          <Space>
            <Header />
          </Space>
        </ParamContext.Provider>
      }
    >
      <MiniTable<IDatabase>
        rowKey={'id'}
        rowSelection={!projectArchived ? rowSelection : null}
        loading={loading || fetchEnvLoading}
        virtual
        isScroll
        expandable={{
          indentSize: 20,
          defaultExpandedRowKeys: [
            `${GroupKey}_${DatabaseGroup.cluster}_0`,
            `${GroupKey}_${DatabaseGroup.dataSource}_0`,
            `${GroupKey}_${DatabaseGroup.connectType}_0`,
            `${GroupKey}_${DatabaseGroup.tenant}_0`,
            `${GroupKey}_${DatabaseGroup.environment}_0`,
          ],
          fixed: true,
          expandIcon: ({ expanded, onExpand, record }) => {
            if (!isGroupColumn(record.id)) {
              return undefined;
            }
            return expanded ? (
              <CaretDownOutlined className={styles.mr6} onClick={(e) => onExpand(record, e)} />
            ) : (
              <CaretRightOutlined className={styles.mr6} onClick={(e) => onExpand(record, e)} />
            );
          },
        }}
        rowClassName={(record) => {
          if (isGroupColumn(record.id)) {
            return styles.groupColumn;
          }
          return undefined;
        }}
        columns={[
          {
            title: formatMessage({
              id: 'odc.Project.Database.DatabaseName',
              defaultMessage: '数据库名称',
            }),
            //数据库名称
            className: styles.databaseName,
            dataIndex: 'name',
            key: 'name',
            fixed: 'left',
            ellipsis: true,
            width: 250,
            render: (name, record) => {
              if (isGroupColumn(record.id)) {
                return (
                  <span className={styles.groupColumnCell}>
                    {name}
                    <span className={styles.tip}>{(record as any)?.tip}</span>
                  </span>
                );
              }
              const hasChangeAuth = record.authorizedPermissionTypes?.includes(
                DatabasePermissionType.CHANGE,
              );
              const hasQueryAuth = record.authorizedPermissionTypes?.includes(
                DatabasePermissionType.QUERY,
              );
              const disabled =
                (!hasChangeAuth && !hasQueryAuth && !record?.authorizedPermissionTypes?.length) ||
                projectArchived;
              const databaseStyle = getDataSourceStyleByConnectType(record?.dataSource?.type);
              if (!record.existed) {
                return disabled ? (
                  <>
                    <Icon
                      component={databaseStyle?.dbIcon?.component}
                      style={{
                        color: databaseStyle?.icon?.color,
                        fontSize: 16,
                        marginRight: 4,
                      }}
                    />
                    <HelpDoc
                      leftText
                      isTip={false}
                      title={formatMessage({
                        id: 'odc.Datasource.Info.TheCurrentDatabaseDoesNot',
                        defaultMessage: '当前数据库不存在',
                      })} /*当前数据库不存在*/
                    >
                      {renderNoPermissionDBWithTip(
                        name,
                        !projectArchived,
                        databaseStyle,
                        record?.type,
                      )}
                    </HelpDoc>
                  </>
                ) : (
                  <>
                    <Icon
                      component={databaseStyle?.dbIcon?.component}
                      style={{
                        color: databaseStyle?.icon?.color,
                        fontSize: 16,
                        marginRight: 4,
                      }}
                    />
                    <HelpDoc
                      leftText
                      isTip={false}
                      title={formatMessage({
                        id: 'odc.Datasource.Info.TheCurrentDatabaseDoesNot',
                        defaultMessage: '当前数据库不存在',
                      })} /*当前数据库不存在*/
                    >
                      {name}
                    </HelpDoc>
                  </>
                );
              }

              return disabled ? (
                renderNoPermissionDBWithTip(name, !projectArchived, databaseStyle, record?.type)
              ) : (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {record?.type === 'LOGICAL' ? (
                    <LogicIcon />
                  ) : (
                    <Icon
                      component={databaseStyle?.dbIcon?.component}
                      style={{
                        color: databaseStyle?.icon?.color,
                        fontSize: 16,
                        marginRight: 4,
                      }}
                    />
                  )}
                  <Space>
                    <StatusName
                      item={record}
                      onClick={() => {
                        tracert.click('a3112.b64002.c330858.d367382');
                        gotoSQLWorkspace(
                          toInteger(id),
                          null,
                          record.id,
                          null,
                          '',
                          isLogicalDatabase(record),
                        );
                      }}
                    />

                    <Typography.Text type="secondary" title={record?.alias}>
                      {record?.alias}
                    </Typography.Text>
                  </Space>
                </div>
              );
            },
          },
          {
            title: formatMessage({
              id: 'odc.Project.Database.DataSource',
              defaultMessage: '所属数据源',
            }),
            //所属数据源
            dataIndex: ['dataSource', 'name'],
            key: 'dataSource-name',
            width: 160,
            hide: groupMode === DatabaseGroup.dataSource,
            ellipsis: {
              showTitle: false,
            },
            render(value, record, index) {
              if (isGroupColumn(record.id)) {
                return undefined;
              }
              /**
               * return datasource icon + label
               */
              const style = getDataSourceStyleByConnectType(record.dataSource?.type);
              if (!value) {
                return '-';
              }
              return (
                <>
                  <Icon
                    component={style?.icon?.component}
                    style={{
                      color: style?.icon?.color,
                      fontSize: 16,
                      marginRight: 4,
                    }}
                  />

                  <Tooltip title={value}>{value}</Tooltip>
                </>
              );
            },
          },
          {
            title: formatMessage({
              id: 'odc.Project.Database.Environment',
              defaultMessage: '环境',
            }),
            //环境
            dataIndex: 'environmentId',
            key: 'environmentId',
            width: 80,
            render(value, record, index) {
              if (isGroupColumn(record.id)) {
                return undefined;
              }
              return (
                <RiskLevelLabel
                  color={record?.environment?.style}
                  content={record?.environment?.name}
                />
              );
            },
          },
          {
            title: formatMessage({
              id: 'src.page.Project.Database.A31E6BDF',
              defaultMessage: '管理员',
            }),
            //项目角色
            dataIndex: 'owners',
            key: 'owners',
            ellipsis: true,
            width: 160,
            render(v, record) {
              if (isGroupColumn(record.id)) {
                return undefined;
              }
              return v?.length > 0 ? (
                v.map(({ name }) => name)?.join(' | ')
              ) : (
                <span style={{ color: 'var(--text-color-hint)' }}>
                  {formatMessage({
                    id: 'odc.Project.Database.OwnerEmptyText',
                    defaultMessage: '未设置',
                  })}
                </span>
              );
            },
          },
          {
            title: '备注',
            dataIndex: 'remark',
            ellipsis: {
              showTitle: true,
            },
            width: 160,
            render(value, record) {
              if (isGroupColumn(record.id)) {
                return undefined;
              }
              return value ?? '-';
            },
            onCell: haveOperationPermission
              ? (record) => ({
                  record,
                  editable: true,
                  dataIndex: 'remark',
                  title: '备注',
                  width: '160',
                  handleSave: async (value, callback) => {
                    if (value?.remark?.trim() !== record?.remark) {
                      const isSuccess = await batchUpdateRemarks(
                        [record?.id],
                        value?.remark?.trim(),
                      );
                      if (isSuccess) {
                        message.success(
                          formatMessage({
                            id: 'src.component.ODCSetting.E6DD81BF' /*'保存成功'*/,
                            defaultMessage: '保存成功',
                          }),
                        );
                        reload?.();
                      }
                      callback?.();
                    }
                  },
                })
              : undefined,
          },
          {
            title: formatMessage({
              id: 'odc.Project.Database.CharacterEncoding',
              defaultMessage: '字符编码',
            }),
            //字符编码
            dataIndex: 'charsetName',
            key: 'charsetName',
            width: 120,
            render: (value, record) => {
              if (isGroupColumn(record.id)) {
                return undefined;
              }
              return value || '-';
            },
          },
          {
            title: formatMessage({
              id: 'odc.Project.Database.SortingRules',
              defaultMessage: '排序规则',
            }),
            //排序规则
            dataIndex: 'collationName',
            key: 'collationName',
            width: 120,
            ellipsis: true,
            render: (collationName, record) => {
              if (isGroupColumn(record.id)) {
                return undefined;
              }
              return collationName || '-';
            },
          },
          {
            title: formatMessage({
              id: 'odc.Project.Database.LastSynchronizationTime',
              defaultMessage: '上一次同步时间',
            }),
            //上一次同步时间
            dataIndex: 'objectLastSyncTime',
            key: 'objectLastSyncTime',
            width: 170,
            render(v, record) {
              if (isGroupColumn(record.id)) {
                return undefined;
              }
              const time = record?.objectLastSyncTime || record?.lastSyncTime;
              return getLocalFormatDateTime(time);
            },
          },
          {
            title: formatMessage({
              id: 'odc.Project.Database.Operation',
              defaultMessage: '操作',
            }),
            //操作
            dataIndex: 'actions',
            key: 'actions',
            width: 210,
            hide: projectArchived,
            render(_, record) {
              if (isGroupColumn(record.id)) {
                return undefined;
              }
              const operation = getOperation({
                id,
                record,
                project,
                setDatabase,
                setChangeOwnerModalVisible,
                setVisible,
                setOpenManageLogicDatabase,
                reload,
              });
              return (
                <Action.Group size={3}>
                  {operation.map((item, index) => {
                    return renderTool(item, index);
                  })}
                </Action.Group>
              );
            },
          },
        ]}
        scroll={{ x: 1400 }}
        dataSource={treeData}
        pagination={false}
        enableResize
        enableEditTable
      />
      <ChangeProjectModal
        visible={visible}
        database={database}
        close={() => setVisible(false)}
        onSuccess={() => reload()}
      />

      <ChangeOwnerModal
        visible={changeOwnerModalVisible}
        database={database}
        databaseList={selectedRowKeys?.length ? (selectedRowKeys as number[]) : null}
        close={() => setChangeOwnerModalVisible(false)}
        onSuccess={() => {
          reload();
          setDatabase(null);
        }}
        projectId={project?.id}
      />

      <CreateLogicialDatabase
        projectId={project?.id}
        reload={reload}
        openLogicialDatabase={openLogicialDatabase}
        setOpenLogicialDatabase={setOpenLogicialDatabase}
        openLogicDatabaseManageModal={async (id) => {
          const res = await getDatabase(id);
          setDatabase(res?.data);
          setOpenManageLogicDatabase(true);
        }}
      />

      <AddObjectStorage
        open={openObjectStorage}
        setOpen={setOpenObjectStorage}
        onSuccess={() => reload()}
        projectId={parseInt(id)}
      />

      <ManageLogicDatabase
        database={database}
        openManageLogicDatabase={openManageLogicDatabase}
        setOpenManageLogicDatabase={setOpenManageLogicDatabase}
        isOwner={isOwner}
      />

      <ExportTaskCreateModal />
      <ImportTaskCreateModal />
      <AsyncTaskCreateModal theme="white" />
      <MutipleAsyncTask theme="white" />
      <LogicDatabaseAsyncTask theme="white" />
    </TableCard>
  );
};
export default inject('modalStore')(observer(Database));
