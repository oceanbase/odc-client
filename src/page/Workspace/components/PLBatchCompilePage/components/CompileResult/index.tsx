/*
 * Copyright 2024 OceanBase
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

import Action from '@/component/Action';
import DisplayTable from '@/component/DisplayTable/virtual';
import { ResourceTabKey } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { LoadingOutlined } from '@ant-design/icons';
import { Space, Tabs } from 'antd';
import React from 'react';
import { CompileStatus } from '../../index';
import { Status } from '../Status';
import styles from './index.less';

const TabPane = Tabs.TabPane;

const getPageColumns = (openEditPage: (title: string, type?: string) => void) => {
  return [
    {
      width: 40,
      key: 'status',
      dataIndex: 'status',
      render: (text, _, index) => {
        return index + 1;
      },
    },

    {
      title: formatMessage({ id: 'odc.components.CompileResult.Status' }), //状态
      width: 64,
      key: 'status',
      dataIndex: 'status',
      filters: [
        {
          value: 'VALID',
          text: formatMessage({ id: 'odc.components.CompileResult.Effective' }), //有效
        },
        {
          value: 'INVALID',
          text: formatMessage({ id: 'odc.components.CompileResult.Invalid' }), //无效
        },
      ],

      onFilter: (value: string, record) => {
        return value === record.status;
      },
      render: (status) => <Status status={status} isShowErrorTooltip={false} />,
    },

    {
      title: formatMessage({ id: 'odc.components.CompileResult.ObjectName' }), //对象名称
      width: 275,
      ellipsis: true,
      key: 'name',
      dataIndex: 'name',
    },

    {
      title: formatMessage({
        id: 'odc.components.CompileResult.CompilationResults',
      }),
      //编译结果
      ellipsis: true,
      key: 'result',
      dataIndex: 'result',
    },

    {
      title: formatMessage({ id: 'odc.components.CompileResult.Operation' }), //操作
      width: 120,
      key: 'type',
      dataIndex: 'type',
      render: (type, record) => {
        return (
          <Action.Link
            disabled={type === ResourceTabKey.TYPE}
            onClick={async () => {
              openEditPage(record.name, type);
            }}
          >
            {
              formatMessage({
                id: 'odc.components.CompileResult.Edit',
              })
              /*编辑*/
            }
          </Action.Link>
        );
      },
    },
  ];
};

interface IProps {
  data: {
    completedCount: number;
    results: {
      errorMessage: string;
      plidentity: {
        obDbObjectType: ResourceTabKey;
        plName: string;
      };

      successful: boolean;
    }[];

    status: CompileStatus;
    totalCount: number;
  };

  label: string;
  status: CompileStatus;
  tableHeight: number;
  openEditPage: (title: string, type?: string) => void;
}

const CompileResult: React.FC<IProps> = (props) => {
  const { data, status, tableHeight, openEditPage } = props;
  const { completedCount = 0, totalCount = 0, results } = data ?? {};

  const dataSource =
    results?.map((item) => {
      return {
        status: item.successful ? 'VALID' : 'INVALID',
        name: item.plidentity.plName,
        result: item.errorMessage,
        type: item.plidentity.obDbObjectType,
      };
    }) ?? [];

  return (
    <Tabs className={styles.tabs}>
      <TabPane
        tab={formatMessage({
          id: 'odc.components.CompileResult.CompilationResults',
        })}
        /*编译结果*/ key="result"
      >
        {status === CompileStatus.RUNNING ? (
          <Space className={styles.loading}>
            <LoadingOutlined />
            <span>
              {
                formatMessage(
                  {
                    id: 'odc.components.CompileResult.CompilingCompletedcountTotalcount',
                  },

                  { completedCount: completedCount, totalCount: totalCount },
                )
                //`编译中 (${completedCount}/${totalCount})...`
              }
            </span>
          </Space>
        ) : (
          <DisplayTable
            rowKey="id"
            bordered={true}
            columns={getPageColumns(openEditPage)}
            dataSource={dataSource}
            disablePagination={true}
            scroll={{
              y: tableHeight,
            }}
          />
        )}
      </TabPane>
    </Tabs>
  );
};

export default CompileResult;
