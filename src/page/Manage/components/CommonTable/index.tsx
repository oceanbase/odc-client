import { Acess, actionTypes, systemReadPermissions } from '@/component/Acess';
import { IManagePagesKeys, IManagerResourceType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { SyncOutlined } from '@ant-design/icons';
import { Button, Input, Space, Spin, Table } from 'antd';
import { throttle } from 'lodash';
import React from 'react';
import { ManageContext } from '../../context';
import styles from './index.less';
import ResizeTitle from './ResizeTitle';

const { Search } = Input;
const ROW_HEIGHT = 41;
const WRAPPER_HEADER_HEIGHT = 45;
const TABLE_TOOLBAR_HEIGHT = 37;
const TABLE_FOOTER_HEIGHT = 56;
const DEFAULT_PAGE_SIZE = 10;
const WRAPPER_FOOTER_HEIGHT = 40;
const MIN_TABLE_WIDTH = 900;
interface IProps {
  title: string;
  placeholder: string;
  createText?: string;
  enabledCreate?: boolean;
  columns: any[];
  dataSource: any[];
  rowHeight?: number;
  current?: number;
  total?: number;
  extraContent?: React.ReactNode;
  rowClassName?: any;
  loading?: boolean;
  minWidth?: number;
  enableResize?: boolean;
  handleReloadData: () => void;
  handleCreate?: () => void;
  loadData: (args: ITableLoadOptions) => void;
  handleChange?: (args: ITableLoadOptions) => void;
}

interface IState {
  searchValue: string;
  filters: ITableFilter;
  sorter: ITableSorter;
  defaultPageSize: number;
  wrapperHeight: number;
}

export interface ITableSorter {
  column: {
    dataIndex: string;
  };
  order: string;
}

export interface ITablePagination {
  current: number;
  pageSize: number;
}

export type ITableFilter = Record<string, any>;

export interface ITableLoadOptions {
  searchValue?: string;
  filters?: ITableFilter;
  sorter?: ITableSorter;
  pagination?: ITablePagination;
  defaultPageSize?: number;
}

const resourcePermissionMap = {
  [IManagePagesKeys.USER]: systemReadPermissions[IManagerResourceType.user],
  [IManagePagesKeys.ROLE]: systemReadPermissions[IManagerResourceType.role],
  [IManagePagesKeys.CONNECTION]: systemReadPermissions[IManagerResourceType.public_connection],
  [IManagePagesKeys.RESOURCE]: systemReadPermissions[IManagerResourceType.resource_group],
  [IManagePagesKeys.SYSTEM_CONFIG]: systemReadPermissions[IManagerResourceType.system_config],
};

class CommonTable extends React.PureComponent<IProps, IState> {
  public wrapperRef = React.createRef<HTMLDivElement>();
  static contextType = ManageContext;
  context: React.ContextType<typeof ManageContext>;

  public columnWidthMap = new Map();

  readonly state = {
    wrapperHeight: 0,
    searchValue: '',
    filters: null,
    sorter: null,
    defaultPageSize: DEFAULT_PAGE_SIZE,
  };

  resizeHeight = throttle(() => {
    const wrapperHeight = this.wrapperRef?.current?.offsetHeight;
    this.setState({
      wrapperHeight,
    });
  }, 500);

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeHeight);
  }

  componentDidMount() {
    setTimeout(() => {
      this.computeDefaultPageSize();
    }, 0);
    window.addEventListener('resize', this.resizeHeight);
  }

  private computeDefaultPageSize = () => {
    const { rowHeight = ROW_HEIGHT, loadData } = this.props;
    const defaultPageSize = Math.max(
      Math.floor(
        (this.wrapperRef.current.offsetHeight -
          WRAPPER_HEADER_HEIGHT -
          TABLE_TOOLBAR_HEIGHT -
          TABLE_FOOTER_HEIGHT) /
          rowHeight,
      ),
      1,
    );
    this.setState({
      wrapperHeight: this.wrapperRef.current.offsetHeight,
      defaultPageSize,
    });
    loadData({
      defaultPageSize,
    });
  };

  private computeTableScrollHeight = () => {
    const { dataSource, rowHeight = ROW_HEIGHT } = this.props;
    const { wrapperHeight } = this.state;
    const tableContentHeight = dataSource?.length * rowHeight;
    const wrapperValidHeight = Math.max(wrapperHeight, 500);
    return wrapperHeight < tableContentHeight
      ? wrapperValidHeight - WRAPPER_FOOTER_HEIGHT - TABLE_FOOTER_HEIGHT - TABLE_FOOTER_HEIGHT
      : null;
  };

  private handleChange = (pagination, filters, sorter, { action }) => {
    const { loadData } = this.props;
    const { searchValue, defaultPageSize } = this.state;
    this.setState({
      filters,
      sorter,
    });
    if (action === 'paginate') {
      loadData({
        searchValue,
        filters,
        sorter,
        pagination,
        defaultPageSize,
      });
    } else {
      loadData({
        searchValue,
        filters,
        sorter,
        defaultPageSize,
      });
    }
    this.props?.handleChange?.({ filters, sorter, searchValue });
  };

  private handleSearch = (searchValue: string) => {
    const { loadData } = this.props;
    const { filters, sorter, defaultPageSize } = this.state;
    loadData({
      searchValue,
      filters,
      sorter,
      defaultPageSize,
    });
    this.props?.handleChange?.({ filters, sorter, searchValue });
    this.setState({
      searchValue,
    });
  };

  render() {
    let {
      title,
      placeholder,
      createText = '',
      enabledCreate = true,
      extraContent,
      loading = false,
      minWidth,
      columns,
      enableResize,
      handleReloadData,
      handleCreate,
      ...rest
    } = this.props;
    if (enableResize) {
      columns = columns?.map((oriColumn) => {
        return {
          ...oriColumn,
          width: this.columnWidthMap.get(oriColumn.key) || oriColumn.width,
          onHeaderCell: (column) => {
            return {
              width: this.columnWidthMap.get(column.key) || oriColumn.width,
              onResize: (e, { size }) => {
                if (size?.width < oriColumn.width) {
                  return;
                }
                this.columnWidthMap.set(column.key, size?.width);
                this.forceUpdate();
              },
            };
          },
        };
      });
    }
    const { defaultPageSize } = this.state;
    const { activeMenuKey } = this.context;
    const resource = resourcePermissionMap[activeMenuKey];
    const scrollHeight = this.computeTableScrollHeight();
    return (
      <div ref={this.wrapperRef} className={styles.tableWrapper}>
        <div className={styles.header}>
          <Space className={styles.title}>
            {title}
            <SyncOutlined className={styles.cursor} onClick={handleReloadData} spin={loading} />
          </Space>
          <Space>
            {extraContent}
            <Search
              enterButton={false}
              onSearch={(value: string) => {
                this.handleSearch(value);
              }}
              placeholder={placeholder}
            />
            {enabledCreate && (
              <Acess {...resource} action={actionTypes.create}>
                <Button
                  type="primary"
                  onClick={() => {
                    handleCreate();
                  }}
                >
                  {createText}
                </Button>
              </Acess>
            )}
          </Space>
        </div>
        {
          <Spin spinning={loading}>
            <Table
              {...rest}
              className={styles.commonTable}
              onChange={this.handleChange}
              columns={columns}
              components={
                enableResize
                  ? {
                      header: {
                        cell: ResizeTitle,
                      },
                    }
                  : undefined
              }
              pagination={{
                pageSize: defaultPageSize,
                showSizeChanger: false,
                ...rest,
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
                x: minWidth || MIN_TABLE_WIDTH,
                y: scrollHeight,
              }}
            />
          </Spin>
        }
      </div>
    );
  }
}

export default CommonTable;
