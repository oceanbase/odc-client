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

interface IProps<T> extends TableProps<T> {
  loadData: (page: TablePaginationConfig, filters: Record<string, FilterValue>) => void;
}

export default function MiniTable<T extends object>({ loadData, ...restProps }: IProps<T>) {
  const [pageSize, setPageSize] = useState(0);

  const domRef = useRef<HTMLDivElement>();

  useLayoutEffect(() => {
    if (domRef.current) {
      function resize() {
        const height = domRef.current.clientHeight - 24 - 60;
        setPageSize(Math.floor(height / 40));
      }
      const height = domRef.current.clientHeight - 24 - 60;
      setPageSize(Math.floor(height / 40));
      domRef.current.addEventListener('resize', resize);
      return () => {
        domRef.current.removeEventListener('resize', resize);
      };
    }
  }, [domRef.current]);

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
  cloneProps.pagination = {
    ...cloneProps.pagination,
    pageSize: pageSize,
    showSizeChanger: false,
  };

  cloneProps.onChange = function (page, filters, s, e) {
    loadData(page, filters);
  };

  return (
    <div ref={domRef} style={{ height: '100%' }}>
      <Table<T> size="small" className={styles.table} {...cloneProps} />
    </div>
  );
}
