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
import { Table } from 'antd';
import type { ColumnProps } from 'antd/lib/table';
import type { ExpandableConfig } from 'antd/lib/table/interface';
import React, { useState } from 'react';
// @ts-ignore
import {
  TABLE_FOOTER_HEIGHT,
  TABLE_ROW_HEIGHT,
  TABLE_TOOLBAR_HEIGHT,
  TAB_HEADER_HEIGHT,
  WORKSPACE_HEADER_HEIGHT,
} from '@/constant';
import { TableRowSelection } from 'antd/es/table/interface';
import { Resizable } from 'react-resizable';
import styles from './index.less';
import { DEFAULT_COLUMN_WIDTH } from '../CommonTable/const';
import { ResizeTitle } from '@/component/CommonTable/component/ResizeTitle';

/**
 * 包含：
 * - resizable 的表头
 * - 斑马线
 * - 分页
 */
export default class DisplayTable extends React.Component<
  {
    columns: any[];
    pageSize?: number;
    pageTotal?: number;
    fullSize?: boolean;
    disablePagination?: boolean;
    rowKey?: any;
    className?: string;
    bordered?: any;
    dataSource?: any;
    scroll?: any;
    showHeader?: boolean;
    defaultExpandAllRows?: boolean;
    rowSelection?: TableRowSelection<any>;
    tableLayout?: any;
    title?: any;
    showTotal?: boolean;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    expandable?: ExpandableConfig<any>;
    onChange?: (pagination: any) => void;
    enableResize?: boolean;
  },
  {
    defaultPageSize: number;
    columns: ColumnProps<unknown>[];
    columnWidthMap?: { [key: string]: string };
  }
> {
  public readonly state = {
    defaultPageSize: 10,
    columns: this.props.columns,
    columnWidthMap: null,
  };

  public components = {
    header: {
      cell: ResizeTitle,
    },
  };

  public componentDidMount() {
    const { fullSize = true } = this.props;
    // 默认需要计算每页条数
    const defaultPageSize = fullSize
      ? Math.floor(
          (window.innerHeight -
            WORKSPACE_HEADER_HEIGHT -
            TAB_HEADER_HEIGHT -
            TABLE_TOOLBAR_HEIGHT -
            TABLE_FOOTER_HEIGHT || 0) / TABLE_ROW_HEIGHT,
        ) - 1
      : 10;
    this.setState({
      defaultPageSize,
    });
  }

  public handleResize = (oriColumn) => {
    return (e, { size }) => {
      if (size?.width < oriColumn?.width) {
        return;
      }

      this.setState(({ columnWidthMap }) => {
        const newColumnWidthMap = {
          ...columnWidthMap,
          [oriColumn.key]: size?.width,
        };
        return { columnWidthMap: newColumnWidthMap };
      });
    };
  };

  public getResizableColumns() {
    const { columnWidthMap } = this.state;
    return this.props?.columns?.map((oriColumn) => {
      return {
        ...oriColumn,
        width: columnWidthMap?.[oriColumn?.key] || oriColumn.width || DEFAULT_COLUMN_WIDTH,
        onHeaderCell: (column) =>
          ({
            width: columnWidthMap?.[oriColumn?.key] || oriColumn.width || DEFAULT_COLUMN_WIDTH,
            onResize: this.handleResize(oriColumn),
          } as React.HTMLAttributes<HTMLElement>),
      };
    });
  }

  public render() {
    const {
      columns,
      disablePagination,
      pageSize,
      pageTotal,
      dataSource,
      showTotal,
      className,
      showSizeChanger = true,
      showQuickJumper = true,
      enableResize,
      scroll,
      ...rest
    } = this.props;
    const { defaultPageSize, columnWidthMap } = this.state;

    const resizableColumns = this.getResizableColumns();

    return (
      <div className={`${styles.table} ${className}`}>
        <Table
          {...rest}
          columns={enableResize ? resizableColumns : columns}
          dataSource={dataSource}
          rowClassName={(record, i) => (i % 2 === 0 ? styles.even : styles.odd)}
          pagination={
            !disablePagination && {
              size: 'small',
              pageSize: pageSize || defaultPageSize,
              showSizeChanger,
              showQuickJumper,
              onShowSizeChange: (_, size) => this.setState({ defaultPageSize: size }),
              showTotal: showTotal
                ? (total) => {
                    return formatMessage(
                      {
                        id: 'odc.component.DisplayTable.TotalTotal',
                        defaultMessage: '共 {total} 条',
                      },
                      { total },
                    ); // `共 ${total} 条`
                  }
                : null,
            }
          }
          components={enableResize ? this.components : null}
          scroll={scroll ? scroll : { x: 'max-content' }}
        />
      </div>
    );
  }
}
