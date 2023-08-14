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

import React, { useContext, useRef, useState } from 'react';
// compatible
import { formatMessage } from '@/util/intl';
import { EditOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
// @ts-ignore
import { generateUpdateTableDDL } from '@/common/network/table';
import HelpDoc from '@/component/helpDoc';
import ObjectInfoView from '@/component/ObjectInfoView';
import Toolbar from '@/component/Toolbar';
import CreateTableBaseInfoForm from '@/page/Workspace/components/CreateTable/BaseInfo';
import { TablePage } from '@/store/helper/page/pages';
import page from '@/store/page';
import { getLocalFormatDateTime } from '@/util/utils';
import type { FormInstance } from 'antd/es/form';
import { cloneDeep } from 'lodash';
import TableContext from '../../CreateTable/TableContext';
import TablePageContext from '../context';

interface IProps {
  pageKey?: string;
}

const ShowTableBaseInfoForm: React.FC<IProps> = ({ pageKey }) => {
  const tableContext = useContext(TablePageContext);
  const session = tableContext.session;
  const table = tableContext?.table;
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<FormInstance<any>>();

  return (
    <div>
      {isEditing ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            lineHeight: '38px',
            height: 38,
            borderBottom: '1px solid var(--divider-color)',
            padding: '0px 12px',
          }}
        >
          <span>
            {
              formatMessage({
                id: 'odc.components.ShowTableBaseInfoForm.Editing',
              })
              /* 编辑 */
            }
          </span>
          <Space>
            <Button onClick={() => setIsEditing(false)}>
              {
                formatMessage({
                  id: 'odc.components.ShowTableBaseInfoForm.Cancel',
                })
                /* 取消 */
              }
            </Button>
            <Button
              type="primary"
              onClick={async () => {
                const data = await formRef.current.validateFields();
                if (data) {
                  // 字符集和排序不允许修改
                  const { collation, character, ...rest } = data;
                  const newData = cloneDeep(table);
                  Object.assign(newData.info, rest);
                  const updateTableDML = await generateUpdateTableDDL(
                    newData,
                    table,
                    session.sessionId,
                    session.database.dbName,
                  );
                  if (!updateTableDML) {
                    return;
                  }
                  await tableContext.showExecuteModal?.(
                    updateTableDML,
                    tableContext?.table?.info?.tableName,
                    async () => {
                      if (newData.info.tableName !== table.info?.tableName) {
                        const newTableName = newData.info.tableName;
                        await session.database.getTableList();
                        const params = page.pages.find((p) => p.key === pageKey)
                          ?.params as TablePage['pageParams'];
                        const tablePage = new TablePage(params?.databaseId, newTableName);
                        await page.updatePage(
                          pageKey,
                          {
                            title: newTableName,
                            updateKey: tablePage?.pageKey,
                          },

                          {
                            tableName: newTableName,
                          },
                        );
                      } else {
                        /**
                         * 名字改的时候不需要手动调用，外面的effect会自动刷新
                         */
                        await tableContext.onRefresh();
                      }
                      setIsEditing(false);
                    },
                  );
                }
              }}
            >
              {
                formatMessage({
                  id: 'odc.components.ShowTableBaseInfoForm.Determine',
                })
                /* 确定 */
              }
            </Button>
          </Space>
        </div>
      ) : (
        <Toolbar>
          <Toolbar.Button
            icon={<EditOutlined />}
            text={formatMessage({
              id: 'odc.components.ShowTableBaseInfoForm.Editing',
            })}
            /* 编辑 */ onClick={() => setIsEditing(true)}
          />

          <Toolbar.Button
            icon={<SyncOutlined />}
            text={formatMessage({
              id: 'odc.components.ShowTableBaseInfoForm.Refresh',
            })}
            /* 刷新 */ onClick={tableContext.onRefresh}
          />
        </Toolbar>
      )}

      {isEditing ? (
        <div style={{ padding: 12 }}>
          <TableContext.Provider
            value={{
              info: table?.info,
              session,
            }}
          >
            <CreateTableBaseInfoForm formRef={formRef} isEdit={true} />
          </TableContext.Provider>
        </div>
      ) : (
        <ObjectInfoView
          data={[
            {
              label: formatMessage({
                id: 'workspace.window.createTable.baseInfo.tableName',
              }),

              content: table?.info.tableName,
            },

            {
              label: formatMessage({
                id: 'workspace.window.createTable.baseInfo.character',
              }),

              content: table?.info.character || 'utf8mb4',
            },

            {
              label: formatMessage({
                id: 'workspace.window.createTable.baseInfo.collation',
              }),

              content: table?.info?.collation || 'utf8mb4',
            },

            {
              label: formatMessage({
                id: 'workspace.window.createTable.baseInfo.comment',
              }),

              content:
                table?.info?.comment ||
                formatMessage({
                  id: 'odc.components.ShowTableBaseInfoForm.Empty',
                }),
              // 空
            },
            {
              label: formatMessage({
                id: 'odc.TablePage.ShowTableBaseInfoForm.Owner',
              }), //所有者
              content:
                table?.info?.owner ||
                formatMessage({
                  id: 'odc.components.ShowTableBaseInfoForm.Empty',
                }),
              // 空
            },
            {
              label: formatMessage({
                id: 'odc.TablePage.ShowTableBaseInfoForm.LastModifiedDate',
              }), //最近修改日期
              content:
                getLocalFormatDateTime(table?.info?.updateTime) ||
                formatMessage({
                  id: 'odc.components.ShowTableBaseInfoForm.Empty',
                }),
              // 空
            },
            {
              label: formatMessage({
                id: 'odc.TablePage.ShowTableBaseInfoForm.RowDataVolume',
              }), //行数据量 //行数据量
              content: (
                <HelpDoc
                  {...{
                    doc: 'tableRowcountToolTip',
                    leftText: true,
                    isTip: true,
                  }}
                >
                  {table?.info?.rowCount ||
                    formatMessage({
                      id: 'odc.components.ShowTableBaseInfoForm.Empty',
                    })}
                </HelpDoc>
              ),

              // 空
            },
            {
              label: formatMessage({
                id: 'odc.TablePage.ShowTableBaseInfoForm.Size',
              }), //大小 //大小
              content:
                table?.info?.tableSize ||
                formatMessage({
                  id: 'odc.components.ShowTableBaseInfoForm.Empty',
                }),
              // 空
            },
          ]}
        />
      )}
    </div>
  );
};

export default ShowTableBaseInfoForm;
