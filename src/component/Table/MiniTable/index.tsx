import { Table, TablePaginationConfig } from 'antd';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { TableProps } from 'antd/es/table';
import styles from './index.less';

interface IProps<T> extends TableProps<T> {
  loadData: (page: TablePaginationConfig) => void;
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
      loadData?.({
        pageSize,
        current: 1,
      });
    }
  }, [pageSize]);

  const cloneProps = { ...restProps };
  cloneProps.pagination = {
    ...cloneProps.pagination,
    pageSize: pageSize,
  };

  cloneProps.onChange = function (page) {
    loadData(page);
  };

  return (
    <div ref={domRef} style={{ height: '100%' }}>
      <Table<T> size="small" className={styles.table} {...cloneProps} />
    </div>
  );
}
