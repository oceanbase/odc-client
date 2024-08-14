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

import { formatMessage } from '@/util/intl';
import { Button } from 'antd';

export const getSqlExplainColumns = ({ handleShowOutputFilter }) => {
  return [
    {
      dataIndex: 'operator',
      title: formatMessage({
        id: 'workspace.window.sql.explain.tab.summary.columns.operator',
        defaultMessage: '算子',
      }), // width: 530,
    },
    {
      dataIndex: 'name',
      title: formatMessage({
        id: 'workspace.window.sql.explain.tab.summary.columns.name',
        defaultMessage: '名称',
      }),
      width: 126,
      fixed: 'right',
      render: (v) => {
        return (
          <div
            style={{
              maxWidth: 110,
              display: 'flex',
              alignItems: 'center',
            }}
            title={v}
          >
            <span
              style={{
                flex: 1,
                display: 'inline-block',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {v}
            </span>
          </div>
        );
      },
    },
    {
      dataIndex: 'rowCount',
      title: formatMessage({
        id: 'workspace.window.sql.explain.tab.summary.columns.rows',
        defaultMessage: '预估行',
      }),
      width: 86,
      fixed: 'right',
    },
    {
      dataIndex: 'cost',
      title: formatMessage({
        id: 'workspace.window.sql.explain.tab.summary.columns.cost',
        defaultMessage: '代价',
      }),
      width: 86,
      fixed: 'right',
    },
    {
      dataIndex: 'outputFilter',
      title: formatMessage({
        id: 'workspace.window.sql.explain.tab.summary.columns.output',
        defaultMessage: '输出过滤',
      }),
      width: 366,
      fixed: 'right',
      render: (v: string) => (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              maxWidth: 350,
            }}
          >
            <span
              style={{
                flex: 1,
                display: 'inline-block',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {v}
            </span>
            <Button
              style={{
                fontSize: 12,
              }}
              type="link"
              size="small"
              onClick={() => handleShowOutputFilter(v)}
            >
              {formatMessage({
                id: 'workspace.window.sql.explain.button.showOutputFilter',
                defaultMessage: '查看',
              })}
            </Button>
          </div>
        </>
      ),
    },
  ];
};

export const getSqlProfileColumns = () => {
  return [
    {
      dataIndex: 'operator',
      title: formatMessage({
        id: 'workspace.window.sql.explain.tab.summary.columns.operator',
        defaultMessage: '算子',
      }),
    },
    {
      dataIndex: 'name',
      title: formatMessage({
        id: 'workspace.window.sql.explain.tab.summary.columns.name',
        defaultMessage: '名称',
      }),
      width: 126,
      fixed: 'right',
      render: (v) => {
        return (
          <div
            style={{
              maxWidth: 110,
              display: 'flex',
              alignItems: 'center',
            }}
            title={v}
          >
            <span
              style={{
                flex: 1,
                display: 'inline-block',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {v}
            </span>
          </div>
        );
      },
    },
    {
      dataIndex: 'rowCount',
      title: formatMessage({
        id: 'workspace.window.sql.explain.tab.summary.columns.rows',
        defaultMessage: '预估行',
      }),
      width: 86,
      fixed: 'right',
    },
    {
      dataIndex: 'cost',
      title: formatMessage({
        id: 'src.page.Workspace.components.SQLExplain.F472322D',
        defaultMessage: '预估代价',
      }),
      width: 86,
      fixed: 'right',
    },
    {
      dataIndex: 'realRowCount',
      title: formatMessage({
        id: 'src.page.Workspace.components.SQLExplain.E0965DAC',
        defaultMessage: '实际行',
      }),
      width: 86,
      fixed: 'right',
    },
    {
      dataIndex: 'realCost',
      title: formatMessage({
        id: 'src.page.Workspace.components.SQLExplain.E0AB0E4C',
        defaultMessage: '实际代价',
      }),
      width: 86,
      fixed: 'right',
    },
  ];
};
