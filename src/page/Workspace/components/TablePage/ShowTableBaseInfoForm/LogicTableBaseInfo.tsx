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

import ObjectInfoView from '@/component/ObjectInfoView';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/data/dateTime';
import HelpDoc from '@/component/helpDoc';
import { columnGroupsText } from '@/constant/label';
import CommonTable from '@/component/CommonTable';
import { columns as LogicDBColumns } from '../../CreateTable/BaseInfo/LogicTableBaseInfo';
import { Empty } from 'antd';

const LogicTableBaseInfo = ({ table }) => {
  return (
    <>
      <ObjectInfoView
        data={[
          {
            label: formatMessage({
              id: 'src.page.Workspace.components.TablePage.ShowTableBaseInfoForm.56FAF24C',
              defaultMessage: '逻辑表名称',
            }),

            content: table?.info?.tableName,
            span: 8,
          },

          {
            label: formatMessage({
              id: 'workspace.window.createTable.baseInfo.character',
              defaultMessage: '默认字符集',
            }),

            content: table?.info?.character || 'utf8mb4',
            span: 8,
          },

          {
            label: formatMessage({
              id: 'workspace.window.createTable.baseInfo.collation',
              defaultMessage: '默认排序规则',
            }),

            content: table?.info?.collation || 'utf8mb4',
            span: 8,
          },

          {
            label: formatMessage({
              id: 'workspace.window.createTable.baseInfo.comment',
              defaultMessage: '描述',
            }),

            content:
              table?.info?.comment ||
              formatMessage({
                id: 'odc.components.ShowTableBaseInfoForm.Empty',
                defaultMessage: '空',
              }),
            // 空
            span: 8,
          },
          {
            label: formatMessage({
              id: 'odc.TablePage.ShowTableBaseInfoForm.LastModifiedDate',
              defaultMessage: '最近修改日期',
            }), //最近修改日期
            content:
              getLocalFormatDateTime(table?.info?.updateTime) ||
              formatMessage({
                id: 'odc.components.ShowTableBaseInfoForm.Empty',
                defaultMessage: '空',
              }),
            // 空
            span: 8,
          },
          !!table?.info?.columnGroups?.length && {
            label: formatMessage({
              id: 'src.page.Workspace.components.TablePage.ShowTableBaseInfoForm.FC24F422',
              defaultMessage: '存储模式',
            }),
            content: table?.info?.columnGroups?.map((c) => columnGroupsText[c]).join(', '),
          },
          {
            label: formatMessage({
              id: 'src.page.Workspace.components.TablePage.ShowTableBaseInfoForm.C1C0A345',
              defaultMessage: '逻辑表表达式',
            }),
            content: table?.expression,
            span: 8,
          },
          {
            label: formatMessage({
              id: 'src.page.Workspace.components.TablePage.ShowTableBaseInfoForm.200BCB34',
              defaultMessage: '表拓扑',
            }),
            content: '',
            span: 24,
          },
          {
            label: '',
            content: (
              <CommonTable
                key="CompareTable"
                titleContent={null}
                showToolbar={false}
                operationContent={null}
                tableProps={{
                  rowKey: 'structureComparisonId',
                  columns: LogicDBColumns,
                  dataSource: table?.topologies,
                  pagination: {
                    pageSize: 10,
                  },
                  locale: {
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          <div>
                            {formatMessage({
                              id: 'src.page.Workspace.components.TablePage.ShowTableBaseInfoForm.378BAC1A',
                              defaultMessage: '暂无数据',
                            })}
                          </div>
                        }
                      ></Empty>
                    ),
                  },
                  scroll: {
                    y: 450,
                  },
                }}
                onLoad={async () => {}}
              />
            ),

            span: 20,
          },
        ].filter(Boolean)}
      />
    </>
  );
};
export default LogicTableBaseInfo;
