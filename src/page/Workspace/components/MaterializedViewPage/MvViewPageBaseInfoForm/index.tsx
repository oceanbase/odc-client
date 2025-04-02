import React, { useContext, useMemo } from 'react';
import Toolbar from '@/component/Toolbar';
import { EditOutlined, SyncOutlined } from '@ant-design/icons';
import { formatMessage } from '@/util/intl';
import ObjectInfoView from '@/component/ObjectInfoView';
import MaterializedViewPageContext from '../context';
import { columnGroupsText, refreshMethodText } from '@/constant/label';
import { ColumnStoreType } from '@/d.ts/table';
import { synchronizeText } from '@/page/Workspace/components/DDLResultSet/Sync/constants';
import dayjs from 'dayjs';

interface IProps {
  pageKey?: string;
}

const MvViewPageBaseInfoForm: React.FC<IProps> = (props) => {
  const { materializedView, session, onRefresh } = useContext(MaterializedViewPageContext);

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
    <div>
      <Toolbar>
        <Toolbar.Button icon={<EditOutlined />} text={'暂不支持'} disabled />
        <Toolbar.Button
          icon={<SyncOutlined />}
          text={formatMessage({
            id: 'odc.components.ShowTableBaseInfoForm.Refresh',
            defaultMessage: '刷新',
          })}
          /* 刷新 */ onClick={onRefresh}
        />
      </Toolbar>
      <ObjectInfoView data={objectInfoOptions} />
    </div>
  );
};
export default MvViewPageBaseInfoForm;
