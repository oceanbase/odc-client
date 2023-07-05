import {
  batchDeleteSensitiveColumns,
  listSensitiveColumns,
  setEnabled,
} from '@/common/network/sensitiveColumn';
import {
  CommonTableMode,
  IOperationOptionType,
  ITableLoadOptions,
} from '@/component/CommonTable/interface';
import StatusSwitch from '@/component/StatusSwitch';
import { ISensitiveColumn } from '@/d.ts/sensitiveColumn';
import SecureTable from '@/page/Secure/components/SecureTable';
import {
  CommonTableBodyMode,
  IRowSelecter,
  ITableInstance,
} from '@/page/Secure/components/SecureTable/interface';
import { DownOutlined } from '@ant-design/icons';
import { Button, Menu, message, Modal, Space } from 'antd';
import { useContext, useRef, useState } from 'react';
import { AddSensitiveColumnType } from '../../interface';
import SensitiveContext from '../../SensitiveContext';
import EditModal from './components/EditSensitiveColumnModal';
import FormSensitiveColumnDrawer from './components/FormSensitiveColumnDrawer';

const getColumns = ({
  handleStatusSwitch,
  handleEdit,
  handleDelete,
  dataSourceFilters,
  databaseFilters,
  maskingAlgorithmFilters,
  dataSourceIdMap,
  hasRowSelected,
  maskingAlgorithmIdMap,
}) => {
  return [
    {
      title: '数据源',
      width: 170,
      dataIndex: 'datasource',
      key: 'datasource',
      filters: dataSourceFilters,
      render: (text, record, index) => {
        return (
          record?.database?.dataSource?.name || (
            <>{dataSourceIdMap[record?.database?.dataSource?.id]}</>
          )
        );
      },
    },
    {
      title: '数据库/schema',
      width: 170,
      dataIndex: 'database',
      key: 'database',
      filters: databaseFilters,
      render: (text, record, index) => <>{record?.database?.name}</>,
    },
    {
      title: '表',
      width: 170,
      dataIndex: 'tableName',
      key: 'tableName',
      // filters: [],
    },
    {
      title: '列',
      width: 170,
      dataIndex: 'columnName',
      key: 'columnName',
      // filters: [],
    },
    {
      title: '脱敏算法',
      width: 170,
      dataIndex: 'maskingAlgorithmId',
      key: 'maskingAlgorithmId',
      filters: maskingAlgorithmFilters,
      render: (text, record, index) => <>{maskingAlgorithmIdMap[record?.maskingAlgorithmId]}</>,
    },
    {
      title: '启用状态',
      width: 80,
      dataIndex: 'enabled',
      key: 'enabled',
      filters: [
        {
          text: '启用',
          value: true,
        },
        {
          text: '禁用',
          value: false,
        },
      ],
      render: (text, { id, enabled }, index) => (
        <StatusSwitch
          key={index}
          checked={enabled}
          disabled={hasRowSelected}
          onConfirm={() => handleStatusSwitch(id, !enabled)}
          onCancel={() => handleStatusSwitch(id, !enabled)}
        />
      ),
    },
    {
      title: '操作',
      width: 154,
      key: 'action',
      render: (_, record, index) => (
        <Space>
          <Button
            style={{
              padding: 0,
            }}
            type="link"
            disabled={hasRowSelected}
            onClick={() => handleEdit(record.maskingAlgorithmId, [record.id])}
          >
            编辑
          </Button>
          <Button
            style={{
              padding: 0,
            }}
            type="link"
            disabled={hasRowSelected}
            onClick={() => handleDelete([record.id])}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];
};
const SensitiveColumn = ({
  projectId,
  dataSourceFilters,
  databaseFilters,
  maskingAlgorithmFilters,
}) => {
  const tableRef = useRef<ITableInstance>();
  const sensitiveContext = useContext(SensitiveContext);
  const { dataSourceIdMap, maskingAlgorithms, maskingAlgorithmIdMap, maskingAlgorithmOptions } =
    sensitiveContext;
  const [sensitiveColumnIds, setSensitiveColumnIds] = useState<number[]>([]);
  const [addSensitiveColumnType, setAddSensitiveColumnType] = useState<AddSensitiveColumnType>(
    AddSensitiveColumnType.Scan,
  );
  const [dataSource, setDataSource] = useState([]);
  const [visible, setVisible] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [maskingAlgorithmId, setMaskingAlgorithmId] = useState<number>();
  const [hasRowSelected, setHasRowSelected] = useState<boolean>(false);

  const rowSelector: IRowSelecter<ISensitiveColumn> = {
    options: [
      {
        okText: '批量编辑',
        onOk: (keys) => {
          handleEdit(maskingAlgorithms?.[0]?.id, keys as number[], true);
        },
      },
      {
        okText: '批量删除',
        onOk: (keys) => {
          handleDelete(keys as number[], true);
        },
      },
    ],
  };
  const loadData = async (args: ITableLoadOptions) => {
    const { searchValue, filters, sorter, pagination, pageSize } = args ?? {};
    const { enabled, dataSource, database, maskingAlgorithmId } = filters ?? {};
    const { column, order } = sorter ?? {};
    const { current = 1 } = pagination ?? {};
    const wrapArgs = (args) => {
      if (Array.isArray(args)) {
        return args;
      }
      return [args];
    };
    const data = {
      fuzzyTableColumn: searchValue,
      enabled: wrapArgs(enabled),
      dataSource: wrapArgs(dataSource),
      database: wrapArgs(database),
      maskingAlgorithm: wrapArgs(maskingAlgorithmId),
      sort: column?.dataIndex,
      page: current,
      size: pageSize,
    };
    data.enabled = enabled?.length ? enabled : undefined;
    data.sort = column ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}` : undefined;
    const result = await listSensitiveColumns(projectId, data);
    setDataSource(result);
  };

  const rowSelectedCallback = (v: boolean) => {
    setHasRowSelected(v);
  };

  const onClose = (fn) => {
    return Modal.confirm({
      title: '确认要取消新建吗？',
      onOk: async () => {
        setVisible(false);
        fn?.();
      },
      onCancel: () => {},
      okText: '确定',
      cancelText: '取消',
    });
  };
  const onOk = () => {
    setVisible(false);
    tableRef.current?.reload?.();
  };
  const handleOpenEditSensitiveColumnDrawer = () => {
    setVisible(true);
    setIsEdit(false);
  };

  const handleEdit = async (
    maskingAlgorithmId: number,
    ids: number[] = [],
    multiClick: boolean = false,
  ) => {
    if (hasRowSelected && !multiClick) {
      // 多行选中 且 事件非多选按钮触发
      return;
    }
    setIsEdit(true);
    setMaskingAlgorithmId(maskingAlgorithmId);
    setSensitiveColumnIds(ids);
    setModalVisible(true);
  };

  const handleStatusSwitch = async (id: number, enabled: boolean) => {
    const result = await setEnabled(projectId, id, enabled);
    if (result) {
      message.success('更新成功');
    } else {
      message.error('更新失败');
    }
    tableRef.current?.reload?.();
  };

  const handleDelete = async (ids: number[] = [], multiClick: boolean = false) => {
    if (hasRowSelected && !multiClick) {
      // 多行选中 且 事件非多选按钮触发
      return;
    }
    return Modal.confirm({
      title: '确认要删除敏感列吗？',
      onOk: async () => {
        const result = await batchDeleteSensitiveColumns(projectId, ids);
        if (result) {
          message.success('删除成功');
        } else {
          message.error('删除失败');
        }
        tableRef.current?.reload?.();
        tableRef.current?.resetSelectedRows();
      },
      onCancel: () => {},
      okText: '确定',
      cancelText: '取消',
    });
  };
  const columns = getColumns({
    hasRowSelected,
    handleStatusSwitch,
    handleEdit,
    handleDelete,
    dataSourceFilters,
    databaseFilters,
    maskingAlgorithmFilters,
    dataSourceIdMap: dataSourceIdMap,
    maskingAlgorithmIdMap: maskingAlgorithmIdMap,
  });

  const operationOptions = [];
  operationOptions.push({
    tooltip: '',
    type: IOperationOptionType.dropdown,
    content: (
      <Button type="primary">
        <a onClick={(e) => e.preventDefault()}>
          <Space>
            添加敏感列
            <DownOutlined />
          </Space>
        </a>
      </Button>
    ),
    overlay: (
      <Menu>
        <Menu.Item
          key={AddSensitiveColumnType.Manual}
          onClick={() => {
            setAddSensitiveColumnType(AddSensitiveColumnType.Manual);
            handleOpenEditSensitiveColumnDrawer();
          }}
        >
          手动添加
        </Menu.Item>
        <Menu.Item
          key={AddSensitiveColumnType.Scan}
          onClick={() => {
            setAddSensitiveColumnType(AddSensitiveColumnType.Scan);
            handleOpenEditSensitiveColumnDrawer();
          }}
        >
          扫描添加
        </Menu.Item>
      </Menu>
    ),
    onClick: () => {},
  });
  return (
    <>
      <SecureTable
        ref={tableRef}
        mode={CommonTableMode.SMALL}
        body={CommonTableBodyMode.BIG}
        titleContent={null}
        showToolbar={true}
        showPagination={false}
        filterContent={{
          searchPlaceholder: '请输入表名/列名',
        }}
        operationContent={{
          options: operationOptions,
        }}
        onLoad={loadData}
        onChange={loadData}
        tableProps={{
          columns,
          dataSource,
          rowKey: 'id',
          pagination: false,
        }}
        rowSelecter={rowSelector}
        rowSelectedCallback={rowSelectedCallback}
      />
      <FormSensitiveColumnDrawer
        {...{
          isEdit,
          visible,
          onClose,
          onOk,
          addSensitiveColumnType,
        }}
      />
      <EditModal
        {...{
          tableRef,
          projectId: projectId,
          maskingAlgorithmId,
          sensitiveColumnIds,
          modalVisible,
          setModalVisible,
          maskingAlgorithmOptions,
        }}
      />
    </>
  );
};

export default SensitiveColumn;
