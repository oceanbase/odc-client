import ObjectInfoView from '@/component/ObjectInfoView';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
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
            label: '逻辑表名称',

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
              id: 'odc.TablePage.ShowTableBaseInfoForm.Owner',
              defaultMessage: '所有者',
            }), //所有者
            content:
              table?.info?.owner ||
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
          {
            label: formatMessage({
              id: 'odc.TablePage.ShowTableBaseInfoForm.RowDataVolume',
              defaultMessage: '行数据量',
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
                    defaultMessage: '空',
                  })}
              </HelpDoc>
            ),
            // 空
            span: 8,
          },
          {
            label: formatMessage({
              id: 'odc.TablePage.ShowTableBaseInfoForm.Size',
              defaultMessage: '大小',
            }), //大小 //大小
            content: (
              <HelpDoc
                {...{
                  doc: 'tableSizeToolTip',
                  leftText: true,
                  isTip: true,
                }}
              >
                {table?.info?.tableSize ||
                  formatMessage({
                    id: 'odc.components.ShowTableBaseInfoForm.Empty',
                    defaultMessage: '空',
                  })}
              </HelpDoc>
            ),
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
            label: '逻辑表表达式',
            content: table?.expression,
            span: 8,
          },
          {
            label: '表拓扑',
            content: '',
            span: 8,
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
                        description={<div>暂无数据</div>}
                      ></Empty>
                    ),
                  },
                  scroll: {
                    y: 200,
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
