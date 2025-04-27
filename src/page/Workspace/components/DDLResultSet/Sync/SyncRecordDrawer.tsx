import { formatMessage } from '@/util/intl';
import React, { useMemo, useEffect, useContext } from 'react';
import { Drawer, Descriptions, Spin } from 'antd';
import { getRefreshRecords } from '@/common/network/materializedView';
import SessionStore from '@/store/sessionManager/session';
import { useRequest } from 'ahooks';
import { useColumns } from './columns';
import type { PageStore } from '@/store/page';
import { inject, observer } from 'mobx-react';
import type { SettingStore } from '@/store/setting';
import DDLResultSet from '@/page/Workspace/components/DDLResultSet';
import dayjs from 'dayjs';
import styles from './index.less';
import ObjectInfoView from '@/component/ObjectInfoView';
import { ColumnStoreType } from '@/d.ts/table';
import MaterializedViewPageContext from '@/page/Workspace/components/MaterializedViewPage/context';
import { columnGroupsText, refreshMethodText } from '@/constant/label';
const GLOBAL_HEADER_HEIGHT = 40;
const TABBAR_HEIGHT = 28;

interface IProps {
  open: boolean;
  onClose: () => void;
  session: SessionStore;
  settingStore?: SettingStore;
  pageStore?: PageStore;
}
const SyncRecordDrawer: React.FC<IProps> = (props) => {
  const { open, onClose, session, settingStore, pageStore } = props;
  const { materializedView } = useContext(MaterializedViewPageContext);

  const columns: any = useColumns();

  const {
    data = [],
    loading,
    run: fetchRefreshRecords,
  } = useRequest(getRefreshRecords, {
    manual: true,
  });

  const getRecordList = async () => {
    fetchRefreshRecords({
      dbName: session?.database?.dbName,
      sessionId: session?.sessionId,
      materializedViewName: pageStore?.activePage?.params?.materializedViewName,
      queryLimit: 1000,
    });
  };

  useEffect(() => {
    if (open) {
      getRecordList();
    }
  }, [open]);

  const rows: any = useMemo(() => {
    return data?.map((item, idx) => ({
      ...item,
      startTime: dayjs(item.startTime).format('YYYY-MM-DD HH:mm:ss'),
      endTime: dayjs(item.endTime).format('YYYY-MM-DD HH:mm:ss'),
      key: `${item.refreshId || ''}@@${idx}`,
      _rowIndex: idx,
    }));
  }, [data]);

  const objectInfoOptions = useMemo(() => {
    const options: {
      label: string;
      content: React.ReactNode;
      isHide?: boolean;
    }[] = [
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.DDLResultSet.Sync.37022016',
          defaultMessage: '物化视图名称',
        }),
        content: materializedView?.info?.name,
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.DDLResultSet.Sync.06C6984C',
          defaultMessage: '所属数据库',
        }),
        content: materializedView?.info?.schemaName,
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.DDLResultSet.Sync.D17C87D8',
          defaultMessage: '存储模式',
        }),
        content: materializedView?.info?.columnGroups
          ?.map((item) => {
            return item?.allColumns
              ? columnGroupsText[ColumnStoreType.ROW]
              : columnGroupsText[ColumnStoreType.COLUMN];
          })
          ?.join('+'),
        isHide:
          !materializedView?.info?.columnGroups || !materializedView?.info?.columnGroups?.length,
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.DDLResultSet.Sync.763D7D1D',
          defaultMessage: '刷新方式',
        }),
        content: refreshMethodText[materializedView?.info?.refreshMethod],
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.DDLResultSet.Sync.7EF2E04C',
          defaultMessage: '刷新并行度',
        }),
        content: materializedView?.info?.parallelismDegree,
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.DDLResultSet.Sync.AB4F6A74',
          defaultMessage: '自动刷新',
        }),
        content: !!materializedView?.info?.refreshSchedule
          ? formatMessage({
              id: 'src.page.Workspace.components.DDLResultSet.Sync.77AA80C9',
              defaultMessage: '开启',
            })
          : formatMessage({
              id: 'src.page.Workspace.components.DDLResultSet.Sync.E25CD4CC',
              defaultMessage: '不开启',
            }),
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.DDLResultSet.Sync.896AD8B4',
          defaultMessage: '开始刷新表达式',
        }),
        content: materializedView?.info?.refreshSchedule?.startExpression,
        isHide: !materializedView?.info?.refreshSchedule,
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.DDLResultSet.Sync.E4C45DEC',
          defaultMessage: '下次刷新表达式',
        }),
        content: materializedView?.info?.refreshSchedule?.nextExpression,
        isHide: !materializedView?.info?.refreshSchedule,
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.DDLResultSet.Sync.56F9AF2F',
          defaultMessage: '上一次刷新类型',
        }),
        content: refreshMethodText[materializedView?.info?.lastRefreshType],
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.DDLResultSet.Sync.1709A66E',
          defaultMessage: '上一次刷新开始时间',
        }),
        content:
          materializedView?.info?.lastRefreshStartTime &&
          dayjs(materializedView?.info?.lastRefreshStartTime)?.format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.DDLResultSet.Sync.595C4B1C',
          defaultMessage: '上一次刷新结束时间',
        }),
        content:
          materializedView?.info?.lastRefreshEndTime &&
          dayjs(materializedView?.info?.lastRefreshEndTime)?.format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.DDLResultSet.Sync.F8CC4704',
          defaultMessage: '查询改写',
        }),
        content: materializedView?.info?.enableQueryRewrite
          ? formatMessage({
              id: 'src.page.Workspace.components.DDLResultSet.Sync.162045FD',
              defaultMessage: '开启',
            })
          : formatMessage({
              id: 'src.page.Workspace.components.DDLResultSet.Sync.F17F6386',
              defaultMessage: '不开启',
            }),
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.DDLResultSet.Sync.619DF546',
          defaultMessage: '实时',
        }),
        content: materializedView?.info?.enableQueryComputation
          ? formatMessage({
              id: 'src.page.Workspace.components.DDLResultSet.Sync.FB2B5757',
              defaultMessage: '是',
            })
          : formatMessage({
              id: 'src.page.Workspace.components.DDLResultSet.Sync.A34C9F84',
              defaultMessage: '否',
            }),
      },
    ];

    return options.filter((item) => !item?.isHide);
  }, [JSON.stringify(materializedView?.info)]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={formatMessage({
        id: 'src.page.Workspace.components.DDLResultSet.Sync.144EEF21',
        defaultMessage: '刷新记录',
      })}
      width={1000}
      className={styles.SyncRecordDrawer}
    >
      <ObjectInfoView data={objectInfoOptions} className={styles.SyncRecordDrawerInfo} />
      <Spin spinning={loading}>
        {!!rows?.length && (
          <DDLResultSet
            isShowLimit
            session={null}
            disableEdit={true}
            autoCommit={false}
            isEditing={false}
            onExport={null}
            showPagination={true}
            columns={columns}
            rows={rows}
            sqlId=""
            enableRowId={true}
            resultHeight={`calc(100vh - ${GLOBAL_HEADER_HEIGHT + TABBAR_HEIGHT + 80}px)`}
            onRefresh={(queryLimit) => {
              fetchRefreshRecords({
                dbName: session?.database?.dbName,
                sessionId: session?.sessionId,
                materializedViewName: pageStore?.activePage?.params?.materializedViewName,
                queryLimit,
              });
            }}
          />
        )}
      </Spin>
    </Drawer>
  );
};

export default inject('settingStore', 'pageStore')(observer(SyncRecordDrawer));
