import { getDataSourceStyleByConnectType } from '@/common/datasource';
import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';
import { IDatabase } from '@/d.ts/database';
import { ModalStore } from '@/store/modal';
import { formatMessage } from '@/util/intl';
import { Button, Empty, Space, Tooltip, message } from 'antd';
import React, { useMemo, useContext } from 'react';
import styles from '../index.less';
import { SearchStatus } from '../constant';
import { IProject } from '@/d.ts/project';
import { IConnection } from '@/d.ts';
import { ReactComponent as ProjectSvg } from '@/svgr/project_space.svg';
import { DbObjectType } from '@/d.ts';
import Icon from '@ant-design/icons';
import StatusIcon from '@/component/StatusIcon/DataSourceIcon';
import { LoadingOutlined } from '@ant-design/icons';
import GlobalSearchContext from '@/page/Workspace/context/GlobalSearchContext';
import { inject, observer } from 'mobx-react';

interface Iprops {
  modalStore?: ModalStore;
}

const List = ({ modalStore }: Iprops) => {
  const globalSearchContext = useContext(GlobalSearchContext);
  const {
    databaseList,
    searchKey,
    next,
    datasourceList,
    projectList,
    status,
    project,
    dataSource,
    actions,
    reloadDatabaseList,
    databaseLoading,
    fetchSyncAll,
    syncAllLoading,
  } = globalSearchContext;
  const { positionResourceTree, positionProjectOrDataSource, openSql, applyPermission } = actions;
  const options = useMemo(() => {
    let options: IDatabase[] | IProject[] | IConnection[] = [];
    switch (status) {
      case SearchStatus.forDataSource: {
        options = datasourceList?.filter((datasource) => {
          return datasource?.name?.toLowerCase().includes(searchKey?.toLowerCase() || '');
        });
        break;
      }
      case SearchStatus.forProject: {
        options = projectList?.filter((project) => {
          return project?.name?.toLowerCase().includes(searchKey?.toLowerCase() || '');
        });
        break;
      }
      case SearchStatus.projectforObject: {
        options = databaseList?.filter((db) => {
          return (
            db?.name?.toLowerCase().includes(searchKey?.toLowerCase() || '') &&
            db?.project?.id === project?.id
          );
        });
        break;
      }
      case SearchStatus.dataSourceforObject: {
        options = databaseList?.filter((db) => {
          return (
            db?.name?.toLowerCase().includes(searchKey?.toLowerCase() || '') &&
            db?.dataSource?.id === dataSource?.id
          );
        });
        break;
      }
      default: {
        options = databaseList?.filter((db) => {
          return db?.name?.toLowerCase().includes(searchKey?.toLowerCase() || '');
        });
        break;
      }
    }
    return options;
  }, [searchKey, status, projectList, databaseList, datasourceList]);

  const getDataSourceIcon = (type) => {
    const DBIcon = getDataSourceStyleByConnectType(type)?.icon;
    return (
      <Icon
        style={{
          color: 'var(--icon-color-disable)',
          filter: 'grayscale(1) opacity(0.6)',
          fontSize: 14,
        }}
        component={DBIcon?.component}
      />
    );
  };

  const ContinueSearchButton = (item: IDatabase | IConnection | IProject) => {
    return (
      <div className={styles.itemButton}>
        <span
          style={{ color: 'var(--brand-blue6-color)' }}
          onClick={(e) => {
            e.stopPropagation();
            switch (status) {
              case SearchStatus.forDataSource: {
                next?.({ dataSource: item as IConnection });
                break;
              }
              case SearchStatus.forProject: {
                next?.({ project: item as IProject });
                break;
              }
              default: {
                if (!(item as IDatabase)?.authorizedPermissionTypes?.length) return;
                next?.({ database: item as IDatabase });
                break;
              }
            }
          }}
        >
          继续搜索
        </span>
      </div>
    );
  };

  const handlePosition = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    object: IDatabase | IProject | IConnection,
  ) => {
    e.stopPropagation();
    switch (status) {
      case SearchStatus.forDataSource:
      case SearchStatus.forProject: {
        positionProjectOrDataSource?.({
          status,
          object: object as IProject | IConnection,
        });
        break;
      }
      default: {
        positionResourceTree?.({
          type: DbObjectType.database,
          database: object as IDatabase,
        });
        break;
      }
    }
  };

  const emptyContent = useMemo(() => {
    let content;
    if (!options?.length && !databaseLoading) {
      if (syncAllLoading) {
        content = (
          <div className={styles.asyncingContent}>
            <LoadingOutlined className={styles.asycLoading} />
            <div className={styles.asyncText}>同步元数据中...</div>
          </div>
        );
      } else {
        content = (
          <Empty
            className={styles.center}
            description={
              <div>
                <p>暂无数据</p>
                <p>
                  请尝试
                  <a
                    onClick={async () => {
                      const data = await fetchSyncAll?.();
                      if (data?.data) {
                        message.success('同步成功');
                      }
                    }}
                  >
                    同步数据库
                  </a>
                  ，或联系管理员
                </p>
              </div>
            }
          />
        );
      }
    }
    return content;
  }, [options, status, syncAllLoading]);

  const renderDatabaseItemButton = (db: IDatabase) => {
    if (!db?.authorizedPermissionTypes?.length) {
      return (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={(e) => applyPermission?.(e, db)}
          className={styles.itemButton}
        >
          {formatMessage({
            id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.DC41DDB8',
            defaultMessage: '申请库权限',
          })}
        </Button>
      );
    }
    return ContinueSearchButton(db);
  };

  const renderDatabaseItem = (db: IDatabase) => {
    return (
      <div
        key={'database' + db.id}
        onClick={(e) => {
          handlePosition(e, db);
          openSql?.(e, db);
        }}
        className={styles.databaseItem}
      >
        <div className={styles.nameContent}>
          <DataBaseStatusIcon item={db} />
          <Tooltip title={db?.name}>
            <span className={styles.nameInfo}>{db?.name}</span>
          </Tooltip>
          {status === SearchStatus.defalut && (
            <Tooltip title={db?.dataSource?.name} placement="topLeft">
              <div className={styles.subInfo}>
                {getDataSourceIcon(db?.dataSource?.dialectType)}
                <span className={styles.dataSouceName}>{db?.dataSource?.name}</span>
              </div>
            </Tooltip>
          )}
          {status !== SearchStatus.defalut && (
            <Tooltip title={db?.remark} placement="topLeft">
              <div className={styles.subInfo}>
                <span className={styles.dataSouceName}>{db?.remark}</span>
              </div>
            </Tooltip>
          )}
        </div>
        {renderDatabaseItemButton(db)}
      </div>
    );
  };

  const renderProjectItem = (project: IProject) => {
    return (
      <div
        key={'project' + project.id}
        className={styles.databaseItem}
        onClick={(e) => handlePosition(e, project)}
      >
        <div className={styles.nameContent}>
          <Icon component={ProjectSvg} style={{ color: 'var(--icon-blue-color)', fontSize: 16 }} />
          <div style={{ padding: '0 4px' }}>{project?.name}</div>
        </div>
        {ContinueSearchButton(project)}
      </div>
    );
  };

  const renderDataSourceItem = (connection: IConnection) => {
    return (
      <div
        key={'dataSource' + connection.id}
        className={styles.databaseItem}
        onClick={(e) => handlePosition(e, connection)}
      >
        <div className={styles.nameContent}>
          <StatusIcon item={connection} />
          <div style={{ padding: '0 4px' }}>{connection?.name}</div>
        </div>
        {ContinueSearchButton(connection)}
      </div>
    );
  };

  const renderItem = (item) => {
    switch (status) {
      case SearchStatus.forDataSource: {
        return renderDataSourceItem(item as IConnection);
      }
      case SearchStatus.forProject: {
        return renderProjectItem(item as IProject);
      }
      default: {
        return renderDatabaseItem(item as IDatabase);
      }
    }
  };

  const searchInfo = useMemo(() => {
    switch (status) {
      case SearchStatus.forDataSource: {
        return '数据源';
      }
      case SearchStatus.forProject: {
        return '项目';
      }
      default: {
        return '数据库';
      }
    }
  }, [status]);

  return (
    <div className={styles.content} style={{ maxHeight: '100%' }}>
      <div className={styles.searchInfo}>{searchInfo}</div>
      {options?.length ? options.map((item) => renderItem(item)) : null}
      {emptyContent}
    </div>
  );
};

export default inject('modalStore', 'userStore')(observer(List));
