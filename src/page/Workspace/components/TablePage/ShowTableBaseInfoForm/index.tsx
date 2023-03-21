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
import type { ConnectionStore } from '@/store/connection';
import page from '@/store/page';
import type { SchemaStore } from '@/store/schema';
import schema from '@/store/schema';
import { getLocalFormatDateTime } from '@/util/utils';
import type { FormInstance } from 'antd/es/form';
import { cloneDeep } from 'lodash';
import { inject, observer } from 'mobx-react';
import { ITableModel } from '../../CreateTable/interface';
import TableContext from '../../CreateTable/TableContext';
import TablePageContext from '../context';

interface IProps {
  schemaStore?: SchemaStore;
  connectionStore?: ConnectionStore;
  pageKey?: string;
}

const ShowTableBaseInfoForm: React.FC<IProps> = ({ pageKey }) => {
  const [editInfo, setEditInfo] = useState<ITableModel['info']>(null);
  const tableContext = useContext(TablePageContext);
  const table = tableContext?.table;
  const tableName = table?.info.tableName;
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
                  const updateTableDML = await generateUpdateTableDDL(newData, table);
                  if (!updateTableDML) {
                    return;
                  }
                  await tableContext.showExecuteModal?.(
                    updateTableDML,
                    tableContext?.table?.info?.tableName,
                    async () => {
                      if (newData.info.tableName !== table.info?.tableName) {
                        const newTableName = newData.info.tableName;
                        await schema.getTableList();
                        await page.updatePage(
                          pageKey,
                          {
                            title: newTableName,
                            updateKey: true,
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

export default inject('schemaStore')(observer(ShowTableBaseInfoForm));
