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

// @ts-ignore
const ResizeableTitle = (props) => {
  const { onResize, onClick, width, ...restProps } = props;
  const [allowClick, setAllowClick] = useState(true);

  if (!width) {
    // @see https://github.com/ant-design/ant-design/issues/14647#issuecomment-606365370
    return <th {...restProps} onClick={onClick} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      onResize={onResize}
      {...{
        onMouseDown: () => {
          setAllowClick(true);
        },
        onClick: (e: any) => allowClick && onClick(e),
      }}
      onResizeStart={() => {
        setAllowClick(false);
      }}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

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
  },
  {
    defaultPageSize: number;
    columns: ColumnProps<unknown>[];
  }
> {
  public readonly state = {
    defaultPageSize: 10,
    columns: this.props.columns,
  };

  public components = {
    header: {
      cell: ResizeableTitle,
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

  public handleResize =
    (index: number) =>
    (e: any, { size }: { size: { width: number } }) => {
      this.setState(({ columns }) => {
        const nextColumns = [...columns];
        nextColumns[index] = {
          ...nextColumns[index],
          width: size.width,
        };

        return { columns: nextColumns };
      });
    };

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
      ...rest
    } = this.props;
    const { defaultPageSize } = this.state;

    // const resizableColumns = columns.map((col, index) => ({
    //   ...col,
    //   onHeaderCell: (column: ColumnProps<unknown>) => ({
    //     width: column.width,
    //     onResize: this.handleResize(index),
    //   }),
    // }));

    return (
      <div className={`${styles.table} ${className}`}>
        <Table
          {...rest}
          // columns={resizableColumns}
          dataSource={dataSource}
          columns={columns}
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
                      },
                      { total },
                    ); // `共 ${total} 条`
                  }
                : null,
            }
          }

          // components={this.components}
        />
      </div>
    );
  }
}
