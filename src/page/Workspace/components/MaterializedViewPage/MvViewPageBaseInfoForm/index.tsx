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

import React, { useContext, useMemo } from 'react';
import Toolbar from '@/component/Toolbar';
import { EditOutlined, SyncOutlined } from '@ant-design/icons';
import { formatMessage } from '@/util/intl';
import ObjectInfoView from '@/component/ObjectInfoView';
import MaterializedViewPageContext from '../context';
import { columnGroupsText, refreshMethodText } from '@/constant/label';
import { ColumnStoreType } from '@/d.ts/table';
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
        label: formatMessage({
          id: 'src.page.Workspace.components.MaterializedViewPage.MvViewPageBaseInfoForm.806488CC',
          defaultMessage: '物化视图名称',
        }),
        content: materializedView?.info?.name,
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.MaterializedViewPage.MvViewPageBaseInfoForm.407144F2',
          defaultMessage: '所属数据库',
        }),
        content: materializedView?.info?.schemaName,
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.MaterializedViewPage.MvViewPageBaseInfoForm.1951E05E',
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
          id: 'src.page.Workspace.components.MaterializedViewPage.MvViewPageBaseInfoForm.72453407',
          defaultMessage: '刷新方式',
        }),
        content: refreshMethodText[materializedView?.info?.refreshMethod],
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.MaterializedViewPage.MvViewPageBaseInfoForm.1DB4653B',
          defaultMessage: '刷新并行度',
        }),
        content: materializedView?.info?.parallelismDegree,
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.MaterializedViewPage.MvViewPageBaseInfoForm.E5131CB2',
          defaultMessage: '自动刷新',
        }),
        content: !!materializedView?.info?.refreshSchedule
          ? formatMessage({
              id: 'src.page.Workspace.components.MaterializedViewPage.MvViewPageBaseInfoForm.8E0B8797',
              defaultMessage: '开启',
            })
          : formatMessage({
              id: 'src.page.Workspace.components.MaterializedViewPage.MvViewPageBaseInfoForm.68CFAC8D',
              defaultMessage: '不开启',
            }),
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.MaterializedViewPage.MvViewPageBaseInfoForm.05379449',
          defaultMessage: '开始刷新表达式',
        }),
        content: materializedView?.info?.refreshSchedule?.startExpression,
        isHide: !materializedView?.info?.refreshSchedule,
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.MaterializedViewPage.MvViewPageBaseInfoForm.BFC1243E',
          defaultMessage: '下次刷新表达式',
        }),
        content: materializedView?.info?.refreshSchedule?.nextExpression,
        isHide: !materializedView?.info?.refreshSchedule,
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.MaterializedViewPage.MvViewPageBaseInfoForm.22EE88C0',
          defaultMessage: '上一次刷新类型',
        }),
        content: refreshMethodText[materializedView?.info?.lastRefreshType],
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.MaterializedViewPage.MvViewPageBaseInfoForm.11CE7264',
          defaultMessage: '上一次刷新开始时间',
        }),
        content:
          materializedView?.info?.lastRefreshStartTime &&
          dayjs(materializedView?.info?.lastRefreshStartTime)?.format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.MaterializedViewPage.MvViewPageBaseInfoForm.965A5DB0',
          defaultMessage: '上一次刷新结束时间',
        }),
        content:
          materializedView?.info?.lastRefreshEndTime &&
          dayjs(materializedView?.info?.lastRefreshEndTime)?.format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.MaterializedViewPage.MvViewPageBaseInfoForm.1B0A55F2',
          defaultMessage: '查询改写',
        }),
        content: materializedView?.info?.enableQueryRewrite
          ? formatMessage({
              id: 'src.page.Workspace.components.MaterializedViewPage.MvViewPageBaseInfoForm.65F965D9',
              defaultMessage: '开启',
            })
          : formatMessage({
              id: 'src.page.Workspace.components.MaterializedViewPage.MvViewPageBaseInfoForm.60B45085',
              defaultMessage: '不开启',
            }),
      },
      {
        label: formatMessage({
          id: 'src.page.Workspace.components.MaterializedViewPage.MvViewPageBaseInfoForm.5DE715C0',
          defaultMessage: '实时',
        }),
        content: materializedView?.info?.enableQueryComputation
          ? formatMessage({
              id: 'src.page.Workspace.components.MaterializedViewPage.MvViewPageBaseInfoForm.FF231509',
              defaultMessage: '是',
            })
          : formatMessage({
              id: 'src.page.Workspace.components.MaterializedViewPage.MvViewPageBaseInfoForm.8FDE6F1A',
              defaultMessage: '否',
            }),
      },
    ];

    return options.filter((item) => !item?.isHide);
  }, [JSON.stringify(materializedView?.info)]);

  return (
    <div>
      <Toolbar>
        <Toolbar.Button
          icon={<EditOutlined />}
          text={formatMessage({
            id: 'src.page.Workspace.components.MaterializedViewPage.MvViewPageBaseInfoForm.C00D04B5',
            defaultMessage: '暂不支持',
          })}
          disabled
        />
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
