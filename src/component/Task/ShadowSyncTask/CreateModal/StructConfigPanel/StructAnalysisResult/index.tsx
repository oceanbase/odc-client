import CommonTable from '@/component/CommonTable';
import { CommonTableMode } from '@/component/CommonTable/interface';
import MonacoEditor from '@/component/MonacoEditor';
import { ConnectionMode, SchemaComparingResult } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Tabs } from 'antd';
import { useMemo, useRef, useState } from 'react';
import { IShadowSyncAnalysisResult, ShadowTableSyncTaskResult } from '../../interface';
import RecordSQLView, { IViewRef } from '../RecordSQLView';
import { useColumns } from './column';

enum TabKeys {
  SYNC = 'sync',
  UNSYNC = 'unsync',
  SQL = 'sql',
}

interface IProps {
  data: IShadowSyncAnalysisResult;
  resultData?: ShadowTableSyncTaskResult;
  connectionMode: ConnectionMode;
  skip?: (keys: number[]) => void;
  cancelSkip?: (keys: number[]) => void;
}

export default function ({ data, resultData, connectionMode, skip, cancelSkip }: IProps) {
  const [activeKey, setActiveKey] = useState(TabKeys.SYNC);
  const SQLViewRef = useRef<IViewRef>();
  const isViewMode = !!resultData;
  /**
   * 查看结果
   */
  async function viewResult(record) {
    SQLViewRef.current?.open(record);
    return true;
  }
  const syncColumns = useColumns(
    true,
    {
      skip,
      cancelSkip,
      viewResult,
    },

    resultData,
  );

  const unSyncColumns = useColumns(
    false,
    {
      skip,
      cancelSkip,
      viewResult,
    },

    resultData,
  );

  const [syncTable, unSyncTable] = useMemo(() => {
    const tables = data?.tables;
    if (!tables) {
      return [[], []];
    }
    const _syncTable = [],
      _unSyncTable = [];
    tables.forEach((table) => {
      if (
        [SchemaComparingResult.CREATE, SchemaComparingResult.UPDATE].includes(table.comparingResult)
      ) {
        _syncTable.push(table);
      } else {
        _unSyncTable.push(table);
      }
    });
    return [_syncTable, _unSyncTable];
  }, [data?.tables]);
  return (
    <>
      <Tabs
        size="small"
        type="card"
        activeKey={activeKey}
        onChange={(v: TabKeys) => {
          setActiveKey(v);
        }}
      >
        <Tabs.TabPane
          style={{ paddingBottom: 50 }}
          tab={formatMessage({
            id: 'odc.StructConfigPanel.StructAnalysisResult.SynchronizedTables',
          })}
          /*同步的表*/ key={TabKeys.SYNC}
        >
          <CommonTable
            mode={CommonTableMode.SMALL}
            showToolbar={false}
            titleContent={null}
            rowSelecter={
              isViewMode
                ? null
                : {
                    options: [
                      {
                        okText: formatMessage({
                          id: 'odc.StructConfigPanel.StructAnalysisResult.BatchSkip',
                        }), //批量跳过
                        onOk: async (keys: number[]) => {
                          return await skip(keys);
                        },
                      },
                    ],
                  }
            }
            tableProps={{
              rowKey: 'id',
              pagination: {
                pageSize: 15,
              },

              dataSource: syncTable,
              columns: syncColumns,
            }}
            onLoad={async () => {}}
          />
        </Tabs.TabPane>
        <Tabs.TabPane
          style={{ paddingBottom: 50 }}
          tab={formatMessage({
            id: 'odc.StructConfigPanel.StructAnalysisResult.UnsynchronizedTables',
          })}
          /*不同步的表*/ key={TabKeys.UNSYNC}
        >
          <CommonTable
            mode={CommonTableMode.SMALL}
            showToolbar={false}
            titleContent={null}
            tableProps={{
              pagination: {
                pageSize: 15,
              },

              dataSource: unSyncTable,
              columns: unSyncColumns,
            }}
            onLoad={async () => {}}
          />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={formatMessage({
            id: 'odc.StructConfigPanel.StructAnalysisResult.SqlPreview',
          })}
          /*SQL 预览*/ key={TabKeys.SQL}
        >
          <div
            style={{
              width: '100%',
              height: 400,
              border: '1px solid var(--odc-border-color)',
              position: 'relative',
            }}
          >
            <MonacoEditor value={data?.allDDL} readOnly language={connectionMode} />
          </div>
        </Tabs.TabPane>
      </Tabs>
      <RecordSQLView ref={SQLViewRef} taskId={data?.id} connectionMode={connectionMode} />
    </>
  );
}
