import { formatMessage } from '@/util/intl';
import { Table, Tooltip, Spin } from 'antd';
import { useMount, useRequest } from 'ahooks';
import { ConsoleTextConfig, EDatabaseTableColumnKey } from '../../const';
import Icon from '@ant-design/icons';
import LabelWithIcon from '../../../../component/LabelWithIcon';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import { IDatabaseHistoriesParam, TaskType } from '@/d.ts';
import Action from '@/component/Action';
import AsyncTaskCreateModal from '@/component/Task/modals/AsyncTask';
import ExportTaskCreateModal from '@/component/Task/modals/ExportTask';
import ImportTaskCreateModal from '@/component/Task/modals/ImportTask';
import { renderTool } from '@/util/renderTool';
import { isLogicalDatabase } from '@/util/database';
import { gotoSQLWorkspace } from '@/util/route';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@/store/modal';
import styles from './index.less';
import { getDatabasesHistories } from '@/common/network/task';
import login from '@/store/login';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import ApplyPermission from '@/component/Task/modals/ApplyPermission';
import ApplyDatabasePermission from '@/component/Task/modals/ApplyDatabasePermission';
import RecentlyDatabaseEmpty from '@/component/Empty/RecentlyDatabaseEmpty';
import { getRecentlyDatabaseOperation } from './help';
import LogicDatabaseAsyncTask from '@/component/Task/modals/LogicDatabaseAsyncTask';
import LogicIcon from '@/component/logicIcon';
import HelpDoc from '@/component/helpDoc';
import { IForbiddenSQLConsoleDataSourceType } from '@/d.ts/datasource';

interface IProps {
  modalStore?: ModalStore;
}
enum ETootipType {
  DATABASE = 'database',
  PROJECT = 'project',
}
const RecentlyDatabase: React.FC<IProps> = ({ modalStore }) => {
  const {
    data: databaseList,
    run: runGetDatabasesHistories,
    loading,
  } = useRequest((params: IDatabaseHistoriesParam) => getDatabasesHistories(params), {
    manual: true,
  });
  const { columnNames, columnKeys, columnDataIndex, columnWidth } = ConsoleTextConfig.recently;

  useMount(() => {
    runGetDatabasesHistories({
      currentOrganizationId: login.organizationId,
      limit: 10,
    });
  });

  const handleApply = (type: TaskType, projectId) => {
    switch (type) {
      case TaskType.APPLY_DATABASE_PERMISSION:
        modalStore.changeApplyDatabasePermissionModal(true, { projectId });
        break;
      case TaskType.APPLY_PROJECT_PERMISSION:
        modalStore.changeApplyPermissionModal(true, { projectId });
        break;
      default:
    }
  };

  const renderTooltipContent = ({ type, record }) => {
    switch (type) {
      case ETootipType.PROJECT:
        return (
          <div>
            {formatMessage(
              {
                id: 'src.page.Console.components.RecentlyDatabase.CA6BD899',
                defaultMessage: '未加入项目【{LogicalExpression0}】请先',
              },
              { LogicalExpression0: record?.project?.name || '-' },
            )}
            <a
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#40a9ff', marginLeft: 4 }}
              onClick={() => {
                handleApply(TaskType.APPLY_PROJECT_PERMISSION, record?.project?.id);
              }}
            >
              {formatMessage({
                id: 'src.page.Console.components.RecentlyDatabase.825A345D',
                defaultMessage: '申请项目权限',
              })}
            </a>
          </div>
        );

      case ETootipType.DATABASE:
        return (
          <div>
            {formatMessage({
              id: 'src.page.Console.components.RecentlyDatabase.67205237',
              defaultMessage: '暂无该数据库权限，请先',
            })}

            <a
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#40a9ff' }}
              onClick={() => {
                handleApply(TaskType.APPLY_DATABASE_PERMISSION, record?.project?.id);
              }}
            >
              {formatMessage({
                id: 'src.page.Console.components.RecentlyDatabase.CEF9CB7E',
                defaultMessage: '申请库权限',
              })}
            </a>
          </div>
        );

      default:
        return '';
    }
  };

  const columns = columnNames.map((columnName, index) => {
    const key = columnKeys[index];
    const config = {
      title: columnName,
      dataIndex: columnDataIndex[index],
      key: key,
      ellipsis: true,
      width: columnWidth[index],
      render: (value, record) => {
        const needToApplyProjectAuth = !record?.project?.currentUserResourceRoles?.length;
        const needToApplyDatabaseAuth = !record?.authorizedPermissionTypes?.length;

        const forbiddenAccessSQLConsole = [
          IForbiddenSQLConsoleDataSourceType.OSS,
          IForbiddenSQLConsoleDataSourceType.COS,
          IForbiddenSQLConsoleDataSourceType.AWS,
          IForbiddenSQLConsoleDataSourceType.OBS,
        ].includes(record?.dataSource?.type);

        const disabledAllOperations = needToApplyProjectAuth || forbiddenAccessSQLConsole;

        const recordWithActionClassName = disabledAllOperations
          ? styles.disabledAction
          : styles.action;

        const recordWithoutActionClassName = disabledAllOperations ? styles.disabledAction : '';

        switch (key) {
          case EDatabaseTableColumnKey.Operation:
            const operation = getRecentlyDatabaseOperation({ record, project: record?.project });
            return (
              <div
                className={recordWithActionClassName}
                style={
                  needToApplyDatabaseAuth ? { filter: 'grayscale(1)', color: '#00000040' } : {}
                }
              >
                <Action.Group size={3}>
                  {operation.map((item, index) => {
                    if (disabledAllOperations || needToApplyDatabaseAuth) {
                      item.disable = true;
                    }
                    return renderTool(item, index);
                  })}
                </Action.Group>
              </div>
            );

          case EDatabaseTableColumnKey.Recently:
            const databaseStyle = getDataSourceStyleByConnectType(record?.dataSource?.type);
            const existed = record?.existed;
            return (
              <Tooltip
                title={
                  forbiddenAccessSQLConsole
                    ? formatMessage({
                        id: 'src.page.Console.components.RecentlyDatabase.806E294C',
                        defaultMessage: '对象存储暂不支持打开 SQL 控制台',
                      })
                    : ''
                }
              >
                <div
                  className={existed ? recordWithActionClassName : ''}
                  style={
                    needToApplyDatabaseAuth ? { filter: 'grayScale(1)', color: '#00000040' } : {}
                  }
                >
                  <LabelWithIcon
                    gap={4}
                    label={
                      <Tooltip
                        styles={{ body: { whiteSpace: 'nowrap', width: 'fit-content' } }}
                        title={renderTooltipContent({
                          type: needToApplyProjectAuth
                            ? ETootipType.PROJECT
                            : needToApplyDatabaseAuth
                            ? ETootipType.DATABASE
                            : '',

                          record,
                        })}
                      >
                        <span
                          onClick={() => {
                            if (!existed || disabledAllOperations || needToApplyDatabaseAuth) {
                              return;
                            }
                            gotoSQLWorkspace(
                              record?.project?.id,
                              record?.dataSource?.id,
                              record?.id,
                              null,
                              '',
                              isLogicalDatabase(record),
                            );
                          }}
                        >
                          {value}
                          {!existed && (
                            <HelpDoc
                              leftText
                              isTip={false}
                              title={formatMessage({
                                id: 'odc.Datasource.Info.TheCurrentDatabaseDoesNot',
                                defaultMessage: '当前数据库不存在',
                              })} /*当前数据库不存在*/
                            />
                          )}
                        </span>
                      </Tooltip>
                    }
                    icon={
                      record?.type === 'LOGICAL' ? (
                        <div className={styles.logicIcon}>
                          <LogicIcon />
                        </div>
                      ) : (
                        <Icon
                          component={databaseStyle?.dbIcon?.component}
                          style={{
                            color: databaseStyle?.icon?.color,
                            fontSize: 16,
                            marginRight: 4,
                          }}
                        />
                      )
                    }
                  />
                </div>
              </Tooltip>
            );

          case EDatabaseTableColumnKey.DataSource:
            const style = getDataSourceStyleByConnectType(record.dataSource?.type);
            if (!value) {
              return (
                <Tooltip
                  styles={{ body: { whiteSpace: 'nowrap', width: 'fit-content' } }}
                  title={renderTooltipContent({
                    type: needToApplyDatabaseAuth ? ETootipType.PROJECT : '',
                    record,
                  })}
                >
                  <span>-</span>
                </Tooltip>
              );
            }

            return (
              <div className={recordWithoutActionClassName}>
                <LabelWithIcon
                  gap={6}
                  label={
                    <Tooltip
                      styles={{ body: { whiteSpace: 'nowrap', width: 'fit-content' } }}
                      title={renderTooltipContent({
                        type: needToApplyProjectAuth
                          ? ETootipType.PROJECT
                          : needToApplyDatabaseAuth
                          ? ETootipType.DATABASE
                          : '',
                        record,
                      })}
                    >
                      <span>{value}</span>
                    </Tooltip>
                  }
                  icon={
                    <Icon
                      component={style?.icon?.component}
                      style={{
                        color: style?.icon?.color,
                        fontSize: 16,
                        marginRight: 4,
                      }}
                    />
                  }
                />
              </div>
            );

          case EDatabaseTableColumnKey.Project:
            return (
              <div
                className={recordWithActionClassName}
                onClick={() => {
                  if (disabledAllOperations) {
                    return;
                  }
                  window.open(`#/project/${value.id}/database`);
                }}
              >
                {value?.name || '-'}
              </div>
            );

          case EDatabaseTableColumnKey.Environment:
            return (
              <div className={styles.environment}>
                <RiskLevelLabel
                  color={record?.environment?.style}
                  content={record?.environment?.name}
                />
              </div>
            );

          default:
            return <>-</>;
        }
      },
    };
    return config;
  });

  return (
    <Spin spinning={loading}>
      {databaseList?.length > 0 ? (
        <Table
          className={styles.recentlyTable}
          columns={columns}
          dataSource={databaseList}
          size="small"
          pagination={false}
        />
      ) : (
        <RecentlyDatabaseEmpty height={391} color="var(--text-color-secondary)" />
      )}

      <ExportTaskCreateModal />
      <ImportTaskCreateModal />
      <AsyncTaskCreateModal theme="white" />
      <ApplyPermission />
      <ApplyDatabasePermission />
      <LogicDatabaseAsyncTask theme="white" />
    </Spin>
  );
};

export default inject('modalStore')(observer(RecentlyDatabase));
