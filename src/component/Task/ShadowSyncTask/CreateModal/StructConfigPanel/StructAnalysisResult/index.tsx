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
import { getDataSourceModeConfigByConnectionMode } from '@/common/datasource';

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
  const config = getDataSourceModeConfigByConnectionMode(connectionMode);
  return (
    <>
      <Tabs
        size="small"
        type="card"
        activeKey={activeKey}
        onChange={(v: TabKeys) => {
          setActiveKey(v);
        }}
        items={[
          {
            key: TabKeys.SYNC,
            label: formatMessage({
              id: 'odc.StructConfigPanel.StructAnalysisResult.SynchronizedTables',
            }),
            style: { paddingBottom: 50 },
            children: (
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
                  scroll: {
                    x: 650,
                  },
                  dataSource: syncTable,
                  columns: syncColumns,
                }}
                onLoad={async () => {}}
              />
            ),
          },
          {
            key: TabKeys.UNSYNC,
            label: formatMessage({
              id: 'odc.StructConfigPanel.StructAnalysisResult.UnsynchronizedTables',
            }),
            style: { paddingBottom: 50 },
            children: (
              <CommonTable
                mode={CommonTableMode.SMALL}
                showToolbar={false}
                titleContent={null}
                tableProps={{
                  pagination: {
                    pageSize: 15,
                  },
                  scroll: {
                    x: 650,
                  },
                  dataSource: unSyncTable,
                  columns: unSyncColumns,
                }}
                onLoad={async () => {}}
              />
            ),
          },
          {
            key: TabKeys.SQL,
            label: formatMessage({
              id: 'odc.StructConfigPanel.StructAnalysisResult.SqlPreview',
            }),
            children: (
              <div
                style={{
                  width: '100%',
                  height: 400,
                  border: '1px solid var(--odc-border-color)',
                  position: 'relative',
                }}
              >
                <MonacoEditor
                  defaultValue={data?.allDDL}
                  readOnly
                  language={config?.sql?.language}
                />
              </div>
            ),
          },
        ]}
      />
      <RecordSQLView ref={SQLViewRef} taskId={data?.id} connectionMode={connectionMode} />
    </>
  );
}
