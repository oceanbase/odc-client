import {
  IUnauthorizedDBResources,
  TablePermissionType,
  UnauthorizedPermissionTypeInSQLExecute,
} from '@/d.ts/table';
import { DatabasePermissionType } from '@/d.ts/database';
import { ColumnType } from 'antd/es/table';
import { formatMessage } from '@/util/intl';
import { permissionOptionsMap } from '@/component/Task/modals/ApplyDatabasePermission';
import Action from '@/component/Action';
import DisplayTable from '@/component/DisplayTable';
import { ModalStore } from '@/store/modal';
import { inject, observer } from 'mobx-react';

interface IContentProps {
  dataSource: IUnauthorizedDBResources[];
  showAction?: boolean;
  modalStore?: ModalStore;
  pageSize?: number;
  applyDataBaseTask?: (
    projectId: number,
    databaseId: number,
    types: DatabasePermissionType[],
  ) => void;
  applyTableTask?: (
    projectId: number,
    databaseId: number,
    tableName: string,
    tableId: number,
    types: TablePermissionType[],
  ) => void;
}

const getColumns = (
  applyDataBaseTask: IContentProps['applyDataBaseTask'],
  applyTableTask: IContentProps['applyTableTask'],
) => {
  const columns: ColumnType<IUnauthorizedDBResources>[] = [
    {
      dataIndex: 'index',
      title: formatMessage({
        id: 'src.page.Workspace.components.SQLResultSet.AE76C8AD',
        defaultMessage: '序号',
      }), //'序号'
      width: '60px',
      ellipsis: true,
      render: (action, _, i) => i + 1,
    },
    {
      dataIndex: 'databaseName',
      title: formatMessage({
        id: 'src.page.Workspace.components.SQLResultSet.5008F988',
        defaultMessage: '数据库名称',
      }), //'数据库名称'
      ellipsis: true,
    },
    {
      dataIndex: 'tableName',
      title: formatMessage({
        id: 'src.page.Workspace.components.DBPermissionTableContent.04E65667',
        defaultMessage: '表/视图',
      }),
      ellipsis: true,
    },
    {
      dataIndex: 'dataSourceName',
      title: formatMessage({
        id: 'src.page.Workspace.components.SQLResultSet.47AAE96F',
        defaultMessage: '所属数据源',
      }), //'所属数据源'
      ellipsis: true,
    },
    {
      dataIndex: 'unauthorizedPermissionTypes',
      title: formatMessage({
        id: 'src.page.Workspace.components.SQLResultSet.ADFA9F27',
        defaultMessage: '缺少权限',
      }), //'缺少权限'
      width: '200px',
      ellipsis: true,
      render: (types) => types?.map((item) => permissionOptionsMap[item]?.text)?.join(', '),
    },
    {
      dataIndex: 'action',
      title: formatMessage({
        id: 'src.page.Workspace.components.SQLResultSet.F84FA469',
        defaultMessage: '操作',
      }), //'操作'
      width: '164px',
      ellipsis: true,
      render: (action, _) => {
        const dbDisabled = !_.applicable;
        const isTablePermissionError = _.type === UnauthorizedPermissionTypeInSQLExecute.ODC_TABLE;
        let dbTooltip = null,
          tableTooltip = null;
        if (dbDisabled) {
          dbTooltip = _.projectId
            ? formatMessage({
                id: 'src.page.Workspace.components.SQLResultSet.C9A2993D',
                defaultMessage: '无法申请数据库权限：没有加入数据库所属项目',
              }) /* 无法申请数据库权限：没有加入数据库所属项目 */
            : formatMessage({
                id: 'src.page.Workspace.components.SQLResultSet.E87F786C',
                defaultMessage: '无法申请数据库权限：数据库没有归属项目',
              }); /* 无法申请数据库权限：数据库没有归属项目 */
          tableTooltip = _.projectId
            ? formatMessage({
                id: 'src.page.Workspace.components.DBPermissionTableContent.3F2FBE3A',
                defaultMessage: '无法申请表/视图权限：没有加入数据库所属项目',
              })
            : formatMessage({
                id: 'src.page.Workspace.components.DBPermissionTableContent.610249E6',
                defaultMessage: '无法申请表/视图权限：表所属数据库没有归属项目',
              });
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
              {formatMessage({
                id: 'src.page.Workspace.components.SQLResultSet.6CF6ACD1',
                defaultMessage: '申请库权限',
              })}
            </Action.Link>
            {
              <Action.Link
                key="applyTable"
                disabled={dbDisabled || !isTablePermissionError}
                tooltip={tableTooltip}
                onClick={async () => {
                  applyTableTask?.(
                    _?.projectId,
                    _?.databaseId,
                    _?.tableName,
                    _?.tableId,
                    _?.unauthorizedPermissionTypes,
                  );
                }}
              >
                {formatMessage({
                  id: 'src.page.Workspace.components.DBPermissionTableContent.66D27AFB',
                  defaultMessage: '申请表/视图权限',
                })}
              </Action.Link>
            }
          </Action.Group>
        );
      },
    },
  ];

  return columns;
};

const DBPermissionTableContent: React.FC<IContentProps> = (props) => {
  const { showAction = false, dataSource, modalStore, pageSize } = props;
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
    tableName: string,
    tableId: number,
    types: TablePermissionType[],
  ) => {
    modalStore.changeApplyTablePermissionModal(true, {
      projectId,
      databaseId,
      tableName,
      tableId,
      types,
    });
  };
  const columns = getColumns(applyDataBaseTask, applyTableTask);

  const handleRowKey = ({
    databaseId,
    tableName,
    unauthorizedPermissionTypes,
  }: IUnauthorizedDBResources) =>
    `${databaseId}-${tableName}-${unauthorizedPermissionTypes.join('-')}`;
  return (
    <DisplayTable
      rowKey={handleRowKey}
      columns={columns?.filter((item) => (!showAction ? item.dataIndex !== 'action' : true))}
      dataSource={dataSource}
      scroll={null}
      showSizeChanger={false}
      pageSize={pageSize || 5}
    />
  );
};

export default inject('modalStore')(observer(DBPermissionTableContent));
