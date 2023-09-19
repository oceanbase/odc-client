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

import { formatMessage } from '@/util/intl';
import { useControllableValue } from 'ahooks';
import { Alert, Spin, Table } from 'antd';
import classNames from 'classnames';
import { throttle } from 'lodash';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ResizeTitle } from './component/ResizeTitle';
import {
  DEFAULT_BIG_ROW_HEIGHT,
  DEFAULT_COLUMN_WIDTH,
  DEFAULT_MIN_TABLE_WIDTH,
  DEFAULT_SMALL_ROW_HEIGHT,
  TABLE_ALERT_INFO_HEIGHT,
  TABLE_BIG_HEAD_HEIGHT,
  TABLE_INFO_BAR_HEIGHT,
  TABLE_PAGINATION_HEIGHT,
  TABLE_SMALL_HEAD_HEIGHT,
  TABLE_TOOLBAR_HEIGHT,
} from './const';
import styles from './index.less';
import type {
  ICascaderContent,
  IFilterContent,
  IOperationContent,
  IRowSelecter,
  ITableInstance,
  ITableLoadOptions,
  ITitleContent,
  TablePaginationConfig,
  TableProps,
} from './interface';
import { CommonTableMode } from './interface';
import { TableInfo } from './TableInfo';
import { Toolbar } from './Toolbar';

interface IProps<RecordType> {
  // 表格支持的2种模式
  mode?: CommonTableMode;
  // 自定义行高
  rowHeight?: number;
  // 子列表总高度
  subTableTotalHeight?: number;
  // 提示信息
  alertInfoContent?: {
    message: React.ReactNode;
  };
  // 是否展示表头 操作栏
  showToolbar?: boolean;
  // 表头操作栏 标题区配置
  titleContent: ITitleContent;
  // 表头操作栏 筛选区配置
  filterContent?: IFilterContent;
  cascaderContent?: ICascaderContent;
  // 是否展示表头 刷新按钮
  enabledReload?: boolean;
  // 表头操作栏 自定义操作区配置
  operationContent?: IOperationContent;
  // 是否展示 操作连 筛选区&自定义操作区 分割标记
  isSplit?: boolean;
  // 行选择 相关配置
  rowSelecter?: IRowSelecter<RecordType>;
  // 行选择状态回调
  rowSelectedCallback?: (selectedRowKeys: any[]) => void;
  // 是否启用 列宽可拖拽
  enableResize?: boolean;
  // 表格 Change 回调（包含 toolbar区的操作，表格区的操作均会触发）
  onChange?: (args: ITableLoadOptions) => void;
  // 取数回调（列表初始化以后，会自动调用一次 & 刷新也会调用）
  onLoad: (args: ITableLoadOptions) => Promise<any>;
  // 其他: antd table 支持的 props
  tableProps: TableProps<RecordType>;
}

const CommonTable: <RecordType extends object = any>(
  props: IProps<RecordType>,
  ref: React.Ref<ITableInstance>,
) => React.ReactElement = (props, ref) => {
  const tableRef = useRef(null);
  const {
    mode = CommonTableMode.BIG,
    showToolbar = true,
    enabledReload = true,
    subTableTotalHeight = 0,
    alertInfoContent,
    titleContent,
    filterContent,
    operationContent,
    cascaderContent,
    isSplit = false,
    rowSelecter,
    rowSelectedCallback = (selectedRowKeys: any[]) => {},
    rowHeight = mode === CommonTableMode.BIG ? DEFAULT_BIG_ROW_HEIGHT : DEFAULT_SMALL_ROW_HEIGHT,
    tableProps,
    enableResize = false,
    onLoad,
    onChange,
  } = props;
  const { columns, dataSource, scroll, ...rest } = tableProps;
  const [wrapperHeight, setWrapperHeight] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useControllableValue(filterContent, {
    valuePropName: 'filterValue',
    trigger: 'onChange',
  });
  const [cascaderValue, setCascaderValue] = useState<string[]>([]);
  const [sorter, setSorter] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [alertInfoVisible, setAlertInfoVisible] = useState(!!alertInfoContent?.message);
  const [loading, setLoading] = useControllableValue(tableProps, {
    valuePropName: 'loading',
  });
  const [pageSize, setPageSize] = useState(0);
  const [columnWidthMap, setColumnWidthMap] = useState(null);
  const tableColumns = getFilteredColumns();
  const showInfoBar = rowSelecter && !!selectedRowKeys?.length;
  const TOOLBAR_HEIGHT = showToolbar ? TABLE_TOOLBAR_HEIGHT : 0;
  const INFO_BAR_HEIGHT = showInfoBar ? TABLE_INFO_BAR_HEIGHT : 0;
  const ALERT_INFO_HEIGHT = alertInfoVisible ? TABLE_ALERT_INFO_HEIGHT : 0;
  const TABLE_HEAD_HEIGHT =
    mode === CommonTableMode.BIG ? TABLE_BIG_HEAD_HEIGHT : TABLE_SMALL_HEAD_HEIGHT;
  const wrapperValidHeight = Math.max(
    wrapperHeight -
      TOOLBAR_HEIGHT -
      INFO_BAR_HEIGHT -
      ALERT_INFO_HEIGHT -
      TABLE_HEAD_HEIGHT -
      TABLE_PAGINATION_HEIGHT,
    100,
  );
  const scrollHeight = (tableProps?.pagination as TablePaginationConfig)?.pageSize
    ? null
    : computeTableScrollHeight();

  const resizeHeight = throttle(() => {
    setWrapperHeight(tableRef?.current?.offsetHeight);
  }, 500);

  useEffect(() => {
    if (pageSize) {
      handleReload({
        pageSize,
      });
    }
  }, [pageSize]);

  useEffect(() => {
    rowSelectedCallback(selectedRowKeys);
  }, [selectedRowKeys]);

  useImperativeHandle(ref, () => ({
    reload: (args?: ITableLoadOptions) => {
      handleReload(args);
    },
    resetSelectedRows: () => {
      setSelectedRowKeys([]);
    },
  }));

  useEffect(() => {
    const id = setTimeout(() => {
      computePageSize();
    }, 0);
    window.addEventListener('resize', resizeHeight);
    return () => {
      clearTimeout(id);
      window.removeEventListener('resize', resizeHeight);
    };
  }, []);

  async function computePageSize() {
    const computedPageSize =
      (tableProps?.pagination as TablePaginationConfig)?.pageSize ??
      Math.max(
        Math.floor(
          (tableRef.current.offsetHeight -
            TOOLBAR_HEIGHT -
            TABLE_HEAD_HEIGHT -
            INFO_BAR_HEIGHT -
            ALERT_INFO_HEIGHT -
            TABLE_PAGINATION_HEIGHT) /
            rowHeight,
        ),
        1,
      );
    setPageSize(computedPageSize);
    setWrapperHeight(tableRef.current.offsetHeight);
  }

  function computeTableScrollHeight() {
    const tableContentHeight = dataSource?.length * rowHeight + subTableTotalHeight;
    return tableContentHeight > wrapperValidHeight ? wrapperValidHeight : null;
  }

  function handleTabChange(value: string) {
    titleContent.tabs?.onChange?.(value);
  }
  // Toolbar filters change
  function handleFilterChange(name: string, value: string | number) {
    const _filter = {
      ...filters,
      [name]: value,
    };
    setFilters(_filter);
    setPagination(null);
    onChange?.({
      searchValue,
      cascaderValue,
      filters: _filter,
      sorter,
      pagination: null,
      pageSize,
    });
  }

  function handleSearch(value: string) {
    setSearchValue(value);
    setPagination(null);
    onChange?.({
      searchValue: value,
      cascaderValue,
      filters,
      sorter,
      pagination: null,
      pageSize,
    });
  }
  function handleCascaderValueChangee(value: string[]) {
    setCascaderValue(value);
    setPagination(null);
    onChange?.({
      searchValue,
      cascaderValue: value,
      filters,
      sorter,
      pagination: null,
      pageSize,
    });
  }
  // Table 主体的 change
  function handleChange(_pagination, filter, _sorter, { action }) {
    const paginationValue = action === 'paginate' ? _pagination : null;
    const _filter = {
      ...filters,
      ...filter,
    };
    setFilters(_filter);
    setSorter(_sorter);
    setPagination(paginationValue);
    onChange?.({
      searchValue,
      cascaderValue,
      filters: _filter,
      sorter: _sorter,
      pagination: paginationValue,
      pageSize,
    });
  }

  function handleRowKeyChange(selected: boolean, changeKeys: number[]) {
    const keys = [...selectedRowKeys];
    if (selected) {
      keys.push(...changeKeys);
    } else {
      const firstKeyIndex = keys.indexOf(changeKeys[0]);
      keys.splice(firstKeyIndex, changeKeys.length);
    }
    setSelectedRowKeys(keys);
  }

  function handleRowKeySelect(record, selected) {
    handleRowKeyChange(selected, [record.id]);
  }

  function handleSelectAll(selected, selectedRows, changeRows) {
    const changeKeys = changeRows?.map((item) => item.id);
    handleRowKeyChange(selected, changeKeys);
  }

  function handleSelectAllRows() {
    const changeKeys = dataSource?.map((item) => item[tableProps.rowKey as string]);
    setSelectedRowKeys(changeKeys);
  }

  async function handleReload(
    args: ITableLoadOptions = {
      searchValue,
      filters,
      sorter,
      pagination,
      pageSize,
    },
  ) {
    setLoading(true);
    await onLoad?.(args);
    setLoading(false);
  }

  function handleCancelSelect() {
    setSelectedRowKeys([]);
  }

  function handleOperationClick(fn: (args?: ITableLoadOptions) => void) {
    fn?.({
      searchValue,
      filters,
      sorter,
      pageSize,
    });
  }

  function getFilteredColumns() {
    return columns.map((item) => {
      if (item?.filteredValue) {
        item.filteredValue = filters[(item as any).dataIndex];
      }
      return item;
    });
  }

  function handleCloseAlert() {
    setAlertInfoVisible(false);
  }

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
    <div
      ref={tableRef}
      className={classNames(
        styles.tableWrapper,
        {
          [styles.infoVisible]: showInfoBar,
          [styles.showToolbar]: showToolbar,
          [styles.showAlertInfo]: alertInfoVisible,
        },
        tableProps?.className,
        mode === CommonTableMode.BIG ? null : styles.smallCommonTable,
      )}
    >
      {showToolbar && (
        <Toolbar
          loading={loading}
          titleContent={titleContent}
          filterContent={filterContent}
          cascaderContent={
            cascaderContent
              ? {
                  ...cascaderContent,
                  onChange: (value, selectedOptions) => {
                    handleCascaderValueChangee(value);
                  },
                }
              : null
          }
          operationContent={operationContent}
          isSplit={isSplit}
          params={{
            searchValue,
            filters,
            sorter,
            pageSize,
          }}
          enabledReload={enabledReload}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearch}
          onTabChange={handleTabChange}
          onReload={handleReload}
          onOperationClick={handleOperationClick}
        />
      )}
      {alertInfoVisible && (
        <Alert
          className={styles.alertInfo}
          type="info"
          message={alertInfoContent?.message}
          showIcon
          closable
          onClose={handleCloseAlert}
        />
      )}
      {showInfoBar && (
        <TableInfo
          {...rowSelecter}
          selectedRowKeys={selectedRowKeys}
          onCancelSelect={handleCancelSelect}
          onSelectAllRows={handleSelectAllRows}
        />
      )}
      {
        <Spin spinning={loading}>
          <Table
            {...rest}
            className={classNames(
              styles.tableSpin,
              mode === CommonTableMode.BIG ? styles.bigTable : styles.smallTable,
              {
                [styles.scrollAble]: !!scrollHeight,
              },
            )}
            rowClassName={(record, i) =>
              `${tableProps?.rowClassName} ${i % 2 === 0 ? styles.even : styles.odd}`
            }
            dataSource={dataSource}
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
                            columnWidthMap?.[column?.key] ||
                            oriColumn.width ||
                            DEFAULT_COLUMN_WIDTH,
                          onResize: handleResize(oriColumn),
                        } as React.HTMLAttributes<HTMLElement>),
                    };
                  })
                : tableColumns
            }
            components={
              enableResize
                ? {
                    header: {
                      cell: ResizeTitle,
                    },
                  }
                : undefined
            }
            onChange={handleChange}
            rowSelection={
              rowSelecter && {
                ...rowSelecter,
                selectedRowKeys,
                onSelect: handleRowKeySelect,
                onSelectAll: handleSelectAll,
              }
            }
            pagination={{
              ...tableProps?.pagination,
              /**
               * 这里需要给pageSize一个默认值
               * 在pageSize为0的时候，会导致table渲染所有数据，从而引发性能问题，最好的处理是computeSize之后再渲染
               */
              pageSize: pageSize || 1,
              showSizeChanger: false,
              showTotal: (totals) => {
                return formatMessage(
                  {
                    id: 'odc.components.CommonTable.TotalTotals',
                  },
                  { totals },
                ); // `共 ${totals} 条`
              },
            }}
            scroll={{
              x: scroll?.x ?? DEFAULT_MIN_TABLE_WIDTH,
              y: wrapperValidHeight,
            }}
          />
        </Spin>
      }
    </div>
  );
};

export default React.forwardRef(CommonTable);
