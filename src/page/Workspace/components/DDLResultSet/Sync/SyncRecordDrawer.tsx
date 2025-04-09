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
import { synchronizeText } from '@/page/Workspace/components/DDLResultSet/Sync/constants';

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
        label: '物化视图名称',
        content: materializedView?.info?.name,
      },
      {
        label: '所属数据库',
        content: materializedView?.info?.schemaName,
      },
      {
        label: '存储模式',
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
        label: '刷新方式',
        content: refreshMethodText[materializedView?.info?.refreshMethod],
      },
      {
        label: '刷新并行度',
        content: materializedView?.info?.parallelismDegree,
      },
      {
        label: '自动刷新',
        content: !!materializedView?.info?.refreshSchedule ? '开启' : '不开启',
      },
      {
        label: '开始刷新表达式',
        content: materializedView?.info?.refreshSchedule?.startExpression,
        isHide: !materializedView?.info?.refreshSchedule,
      },
      {
        label: '下次刷新表达式',
        content: materializedView?.info?.refreshSchedule?.nextExpression,
        isHide: !materializedView?.info?.refreshSchedule,
      },
      {
        label: '上一次同步类型',
        content: synchronizeText[materializedView?.info?.lastRefreshType]?.label,
      },
      {
        label: '上一次同步开始时间',
        content:
          materializedView?.info?.lastRefreshStartTime &&
          dayjs(materializedView?.info?.lastRefreshStartTime)?.format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        label: '上一次同步结束时间',
        content:
          materializedView?.info?.lastRefreshEndTime &&
          dayjs(materializedView?.info?.lastRefreshEndTime)?.format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        label: '查询改写',
        content: materializedView?.info?.enableQueryRewrite ? '开启' : '不开启',
      },
      {
        label: '实时',
        content: materializedView?.info?.enableQueryComputation ? '是' : '否',
      },
    ];
    return options.filter((item) => !item?.isHide);
  }, [JSON.stringify(materializedView?.info)]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={'同步记录'}
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
