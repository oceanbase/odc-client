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

import DisplayTable from '@/component/DisplayTable';
import { PLType } from '@/constant/plType';
import { Debug } from '@/store/debug';
import { formatMessage } from '@/util/intl';
import { Button, Divider, Empty } from 'antd';
import React, { useState } from 'react';

import { IDebugBreakpoint, IDebugStackItem } from '@/store/debug/type';
import styles from './index.less';

interface IProps {
  debug: Debug;
  removeBreakPoints: (
    points: { line: number; plName: string; plType: PLType; packageName: string }[],
  ) => Promise<boolean>;
  gotoBreakPoint: (lineNum: number, plName: string, plType: PLType, packageName: string) => void;
}

const Breakpoints: React.FC<IProps> = (props) => {
  const { debug, removeBreakPoints, gotoBreakPoint } = props;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const breakpoints: Array<IDebugBreakpoint & { pl: IDebugStackItem }> = debug?.plInfo
    .map((pl) => {
      return pl.breakpoints?.map((p) => {
        return {
          ...p,
          pl,
        };
      });
    })
    ?.reduce((prev, current) => {
      return current.concat(prev);
    }, []);
  const isDebugEnd = debug?.isDebugEnd();
  let executeRecordColumns = [
    {
      dataIndex: 'plName',
      title: formatMessage({
        id: 'odc.components.PLDebugResultSet.PlObjectName',
      }),
      render(t, _) {
        return (
          <span style={{ wordBreak: 'break-all' }}>
            {[_.pl.packageName, _.pl.plName].filter(Boolean).join('.')}
          </span>
        );
      },
    },

    {
      dataIndex: 'line',
      title: formatMessage({
        id: 'odc.components.PLDebugResultSet.LineNumber',
      }),
      width: 80,
    },

    !isDebugEnd
      ? {
          dataIndex: 'action',
          title: formatMessage({
            id: 'odc.components.PLDebugResultSet.Operation',
          }),
          width: 100,
          render: (_, point) => {
            if (isDebugEnd) {
              return null;
            }
            return (
              <span>
                <a
                  onClick={async () => {
                    if (
                      await removeBreakPoints([
                        {
                          line: point.line,
                          plName: point.pl.plName,
                          plType: point.pl.plType,
                          packageName: point.pl.packageName,
                        },
                      ])
                    ) {
                      setSelectedRowKeys(selectedRowKeys.filter((key) => key !== point.num));
                    }
                  }}
                >
                  {formatMessage({
                    id: 'odc.components.PLDebugResultSet.Cancel',
                  })}
                </a>
                <Divider type="vertical" />
                <a
                  onClick={() => {
                    gotoBreakPoint(
                      point.line,
                      point.pl.plName,
                      point.pl.plType,
                      point.pl.packageName,
                    );
                  }}
                >
                  {formatMessage({
                    id: 'odc.components.PLDebugResultSet.See',
                  })}
                </a>
              </span>
            );
          },
        }
      : null,
  ].filter(Boolean);

  if (!breakpoints?.length) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    <>
      {selectedRowKeys?.length && !isDebugEnd ? (
        <div className={styles.breakpointHead}>
          {formatMessage({ id: 'odc.components.PLDebugResultSet.Selected' })}&nbsp;&nbsp;
          {selectedRowKeys?.length}&nbsp;&nbsp;
          {formatMessage({ id: 'odc.components.PLDebugResultSet.Item' })}{' '}
          <Button
            type="primary"
            onClick={async () => {
              if (
                await removeBreakPoints(
                  breakpoints
                    .map((point) => {
                      if (selectedRowKeys.includes(point.num)) {
                        return {
                          line: point.line,
                          plName: point.pl.plName,
                          plType: point.pl.plType,
                          packageName: point.pl.packageName,
                        };
                      }
                    })
                    .filter(Boolean),
                )
              ) {
                setSelectedRowKeys([]);
              }
            }}
          >
            {formatMessage({ id: 'odc.components.PLDebugResultSet.BatchCancel' })}
          </Button>
        </div>
      ) : null}
      <DisplayTable
        rowKey="num"
        bordered={true}
        columns={executeRecordColumns}
        dataSource={breakpoints}
        rowSelection={
          !isDebugEnd
            ? {
                selectedRowKeys: selectedRowKeys,
                onChange: (selectedRowKeys, selectedRows) => {
                  setSelectedRowKeys(selectedRowKeys);
                },
              }
            : null
        }
        disablePagination={true}
      />
    </>
  );
};

export default Breakpoints;
