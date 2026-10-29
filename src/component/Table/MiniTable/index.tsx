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

import { Table, TablePaginationConfig } from 'antd';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { TableProps } from 'antd/es/table';
import { FilterValue } from 'antd/lib/table/interface';
import styles from './index.less';
import classNames from 'classnames';
import { ResizeTitle } from '@/component/CommonTable/component/ResizeTitle';
import { DEFAULT_COLUMN_WIDTH } from '@/component/CommonTable/const';
import type { ColumnGroupType, ColumnType } from 'antd/es/table';

type IColumnsType<RecordType = unknown> = ((
  | ColumnGroupType<RecordType>
  | ColumnType<RecordType>
) & { hide?: boolean })[];

interface IProps<T> extends TableProps<T> {
  isExpandedRowRender?: boolean;
  loadData: (page: TablePaginationConfig, filters: Record<string, FilterValue>) => void;
  // 是否启用 列宽可拖拽
  enableResize?: boolean;
  columns: IColumnsType<T>;
}

export default function MiniTable<T extends object>({
  loadData,
  isExpandedRowRender = false,
  enableResize = false,
  columns: PropColumns = [],
  ...restProps
}: IProps<T>) {
  const [pageSize, setPageSize] = useState(0);
  const [columnWidthMap, setColumnWidthMap] = useState(null);

  const domRef = useRef<HTMLDivElement>();
  const columns = PropColumns.filter((item) => !item.hide);

  useLayoutEffect(() => {
    if (domRef.current) {
      function resize() {
        const height = domRef.current.clientHeight - 24 - 60;
        console.log('resize', height);
        setPageSize(Math.floor(height / 40));
      }
      const height = domRef.current.clientHeight - 24 - 60;
      setPageSize(Math.floor(height / 40));
      const obsever = new ResizeObserver(() => {
        resize();
      });
      obsever.observe(domRef.current);
      return () => {
        obsever.disconnect();
      };
    }
  });

  useEffect(() => {
    if (pageSize > 0) {
      loadData?.(
        {
          pageSize,
          current: 1,
        },
        {},
      );
    }
  }, [pageSize]);

  const cloneProps = { ...restProps };
  cloneProps.pagination = cloneProps.pagination && {
    ...cloneProps.pagination,
    pageSize: pageSize,
    showSizeChanger: false,
  };
  cloneProps.onChange = function (page, filters, s, e) {
    loadData(page, filters);
  };

  function handleResize(oriColumn) {
    return (e, { size }) => {
      if (size?.width < oriColumn?.width) {
        return;
      }
      setColumnWidthMap({
        ...columnWidthMap,
        [oriColumn.key]: size?.width,
      });
    };
  }

  return (
    <div ref={domRef} style={{ height: '100%' }}>
      <Table<T>
        size="small"
        className={classNames(styles.table, {
          [styles.expandedRowRender]: isExpandedRowRender,
        })}
        {...cloneProps}
        components={
          enableResize
            ? {
                header: {
                  cell: ResizeTitle,
                },
              }
            : undefined
        }
        columns={
          enableResize
            ? columns?.map((oriColumn) => {
                return {
                  ...oriColumn,
                  width:
                    columnWidthMap?.[oriColumn?.key] || oriColumn.width || DEFAULT_COLUMN_WIDTH,
                  onHeaderCell: (column) =>
                    ({
                      width:
                        columnWidthMap?.[column?.key] || oriColumn.width || DEFAULT_COLUMN_WIDTH,
                      onResize: handleResize(oriColumn),
                    } as React.HTMLAttributes<HTMLElement>),
                };
              })
            : columns || []
        }
      />
    </div>
  );
}
