import { getDataSourceStyleByConnectType } from '@/common/datasource';
import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';
import { IDatabase } from '@/d.ts/database';
import { ModalStore } from '@/store/modal';
import { formatMessage } from '@/util/intl';
import { Button, Empty, Tooltip, message, Popover } from 'antd';
import React, { useMemo, useContext, useRef } from 'react';
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
import VirtualList from 'rc-virtual-list';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import ConnectionPopover from '@/component/ConnectionPopover';

interface Iprops {
  modalStore?: ModalStore;
}

const List = ({ modalStore }: Iprops) => {
  const globalSearchContext = useContext(GlobalSearchContext);
  const { reloadDatabaseList } = useContext(ResourceTreeContext);
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
    databaseLoading,
    fetchSyncAll,
    syncAllLoading,
  } = globalSearchContext;
  const { positionResourceTree, positionProjectOrDataSource, openSql, applyPermission } = actions;
  const listRef = useRef<HTMLDivElement>();
  const options = useMemo(() => {
    let options: IDatabase[] | IProject[] | IConnection[] = [];
    switch (status) {
      case SearchStatus.forDataSource: {
        options = datasourceList
          ?.filter((datasource) => {
            return datasource?.name?.toLowerCase().includes(searchKey?.toLowerCase() || '');
          })
          ?.map((datasource) => ({
            ...datasource,
            key: `ds-${datasource?.id}`,
          }));
        break;
      }
      case SearchStatus.forProject: {
        options = projectList
          ?.filter((project) => {
            return project?.name?.toLowerCase().includes(searchKey?.toLowerCase() || '');
          })
          ?.map((project) => ({
            ...project,
            key: `p-${project?.id}`,
          }));
        break;
      }
      case SearchStatus.projectforObject: {
        options = databaseList
          ?.filter((db) => {
            return (
              db?.name?.toLowerCase().includes(searchKey?.toLowerCase() || '') &&
              db?.project?.id === project?.id
            );
          })
          ?.map((db) => ({
            ...db,
            key: `db-${db?.id}`,
          }));
        break;
      }
      case SearchStatus.dataSourceforObject: {
        options = databaseList
          ?.filter((db) => {
            return (
              db?.name?.toLowerCase().includes(searchKey?.toLowerCase() || '') &&
              db?.dataSource?.id === dataSource?.id
            );
          })
          ?.map((db) => ({
            ...db,
            key: `db-${db?.id}`,
          }));
        break;
      }
      default: {
        options = databaseList
          ?.filter((db) => {
            return db?.name?.toLowerCase().includes(searchKey?.toLowerCase() || '');
          })
          ?.map((db) => ({
            ...db,
            key: `db-${db?.id}`,
          }));
        break;
      }
    }
    return options;
  }, [searchKey, status, projectList, databaseList, datasourceList, project, dataSource]);

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
          {formatMessage({
            id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.D28EA9CA',
            defaultMessage: '继续搜索',
          })}
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
          </div>
        );
      } else {
        content = (
          <Empty
            className={styles.center}
            description={
              <div>
                <p>
                  {formatMessage({
                    id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.49EEB88D',
                    defaultMessage: '暂无数据',
                  })}
                </p>
                <p>
                  {formatMessage({
                    id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.7880C5CD',
                    defaultMessage: '请尝试',
                  })}

                  <a
                    className={styles.syncMetadata}
                    onClick={async () => {
                      const data = await fetchSyncAll?.();
                      if (data?.data) {
                        message.success(
                          formatMessage({
                            id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.5D2CB0F6',
                            defaultMessage: '同步发起成功',
                          }),
                        );
                        reloadDatabaseList?.();
                      }
                    }}
                  >
                    同步元数据库
                  </a>
                  {formatMessage({
                    id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.55AB56DF',
                    defaultMessage: '，或联系管理员',
                  })}
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
      <Popover
        showArrow={false}
        placement={'left'}
        content={<ConnectionPopover showRemark database={db} connection={db?.dataSource} />}
      >
        <div
          key={'database' + db.id}
          onClick={(e) => {
            if (!db?.authorizedPermissionTypes?.length) return;
            handlePosition(e, db);
            openSql?.(e, db);
          }}
          className={styles.databaseItem}
        >
          <div className={styles.nameContent}>
            <DataBaseStatusIcon item={db} />
            <span className={styles.nameInfo}>{db?.name}</span>
            <div className={styles.subInfo}>
              {getDataSourceIcon(db?.dataSource?.dialectType)}
              <span className={styles.dataSouceName}>{db?.dataSource?.name}</span>
            </div>
          </div>
          {renderDatabaseItemButton(db)}
        </div>
      </Popover>
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
      <Popover
        showArrow={false}
        placement={'left'}
        content={<ConnectionPopover connection={connection} />}
      >
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
      </Popover>
    );
  };

  const renderItem = (item: IConnection | IProject | IDatabase) => {
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

  return (
    <div className={styles.content} style={{ maxHeight: '100%' }}>
      {options?.length ? (
        <div style={{ height: '100%' }} ref={listRef}>
          <VirtualList
            data={options}
            itemHeight={28}
            height={listRef.current?.clientHeight || 300}
            itemKey="key"
          >
            {(item: IConnection | IProject | IDatabase) => renderItem(item)}
          </VirtualList>
        </div>
      ) : null}
      {emptyContent}
    </div>
  );
};

export default inject('modalStore', 'userStore')(observer(List));
