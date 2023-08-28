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

import {
  batchDeleteSensitiveColumns,
  listSensitiveColumns,
  setEnabled,
} from '@/common/network/sensitiveColumn';
import CommonTable from '@/component/CommonTable';
import {
  IRowSelecter,
  IOperationOptionType,
  ITableInstance,
  ITableLoadOptions,
} from '@/component/CommonTable/interface';
import StatusSwitch from '@/component/StatusSwitch';
import TooltipContent from '@/component/TooltipContent';
import { IResponseData } from '@/d.ts';
import { ISensitiveColumn } from '@/d.ts/sensitiveColumn';
import { formatMessage } from '@/util/intl';
import { DownOutlined } from '@ant-design/icons';
import { Button, Menu, message, Modal, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { debounce } from 'lodash';
import { useContext, useEffect, useRef, useState } from 'react';
import { AddSensitiveColumnType } from '../../interface';
import SensitiveContext from '../../SensitiveContext';
import EditModal from './components/EditSensitiveColumnModal';
import FormSensitiveColumnDrawer from './components/FormSensitiveColumnDrawer';
import tracert from '@/util/tracert';

const getColumns: ({
  handleStatusSwitch,
  handleEdit,
  handleDelete,
  dataSourceFilters,
  databaseFilters,
  maskingAlgorithmFilters,
  dataSourceIdMap,
  hasRowSelected,
  maskingAlgorithmIdMap,
}) => ColumnsType<ISensitiveColumn> = ({
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
      title: formatMessage({ id: 'odc.components.SensitiveColumn.DataSource' }), //数据源
      width: 170,
      dataIndex: 'datasource',
      key: 'datasource',
      filters: dataSourceFilters,
      onCell: () => {
        return {
          style: {
            maxWidth: '170px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          },
        };
      },
      render: (text, record, index) => (
        <TooltipContent
          content={dataSourceIdMap[record?.database?.dataSource?.id]}
          maxWdith={170}
        />
      ),
    },
    {
      title: formatMessage({ id: 'odc.components.SensitiveColumn.DatabaseSchema' }), //数据库/schema
      width: 170,
      dataIndex: 'database',
      key: 'database',
      filters: databaseFilters,
      onCell: () => {
        return {
          style: {
            maxWidth: '170px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          },
        };
      },
      render: (text, record, index) => (
        <TooltipContent content={record?.database?.name} maxWdith={170} />
      ),
    },
    {
      title: formatMessage({ id: 'odc.components.SensitiveColumn.Table' }), //表
      width: 170,
      dataIndex: 'tableName',
      key: 'tableName',
      onCell: () => {
        return {
          style: {
            maxWidth: '170px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          },
        };
      },
      render: (text, record, index) => <TooltipContent content={text} maxWdith={170} />,
    },
    {
      title: formatMessage({ id: 'odc.components.SensitiveColumn.Column' }), //列
      width: 170,
      dataIndex: 'columnName',
      key: 'columnName',
      onCell: () => {
        return {
          style: {
            maxWidth: '170px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          },
        };
      },
      render: (text, record, index) => <TooltipContent content={text} maxWdith={170} />,
    },
    {
      title: formatMessage({ id: 'odc.components.SensitiveColumn.DesensitizationAlgorithm' }), //脱敏算法
      width: 170,
      dataIndex: 'maskingAlgorithmId',
      key: 'maskingAlgorithmId',
      filters: maskingAlgorithmFilters,
      render: (text, record, index) => (
        <TooltipContent
          content={maskingAlgorithmIdMap[record?.maskingAlgorithmId]}
          maxWdith={170}
        />
      ),
    },
    {
      title: formatMessage({ id: 'odc.components.SensitiveColumn.EnableStatus' }), //启用状态
      width: 120,
      dataIndex: 'enabled',
      key: 'enabled',
      filters: [
        {
          text: formatMessage({ id: 'odc.components.SensitiveColumn.Enable' }), //启用
          value: true,
        },
        {
          text: formatMessage({ id: 'odc.components.SensitiveColumn.Disable' }), //禁用
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
      title: formatMessage({ id: 'odc.components.SensitiveColumn.Operation' }), //操作
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
            {formatMessage({ id: 'odc.components.SensitiveColumn.Edit' }) /*编辑*/}
          </Button>
          <Button
            style={{
              padding: 0,
            }}
            type="link"
            disabled={hasRowSelected}
            onClick={() => handleDelete([record.id])}
          >
            {formatMessage({ id: 'odc.components.SensitiveColumn.Delete' }) /*删除*/}
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
  initSensitiveColumn,
}) => {
  const tableRef = useRef<ITableInstance>();
  const sensitiveContext = useContext(SensitiveContext);
  const {
    dataSourceIdMap,
    maskingAlgorithms,
    maskingAlgorithmIdMap,
    maskingAlgorithmOptions,
  } = sensitiveContext;
  const [sensitiveColumnIds, setSensitiveColumnIds] = useState<number[]>([]);
  const [addSensitiveColumnType, setAddSensitiveColumnType] = useState<AddSensitiveColumnType>(
    AddSensitiveColumnType.Scan,
  );
  const [sensitiveColumn, setSensitiveColumn] = useState<IResponseData<ISensitiveColumn>>(null);
  const [submiting, setSubmiting] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [maskingAlgorithmId, setMaskingAlgorithmId] = useState<number>();
  const [hasRowSelected, setHasRowSelected] = useState<boolean>(false);

  useEffect(() => {
    tracert.expo('a3112.b64002.c330863');
  }, []);

  const rowSelector: IRowSelecter<ISensitiveColumn> = {
    options: [
      {
        okText: formatMessage({ id: 'odc.components.SensitiveColumn.BatchEdit' }), //批量编辑
        onOk: (keys) => {
          handleEdit(maskingAlgorithms?.[0]?.id, keys as number[], true);
        },
      },
      {
        okText: formatMessage({ id: 'odc.components.SensitiveColumn.BatchDeletion' }), //批量删除
        onOk: (keys) => {
          handleDelete(keys as number[], true);
        },
      },
    ],
  };
  const loadData = async (args: ITableLoadOptions) => {
    const { searchValue, filters, sorter, pagination, pageSize } = args ?? {};
    const { enabled, datasource, database, maskingAlgorithmId } = filters ?? {};
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
      datasource: wrapArgs(datasource),
      database: wrapArgs(database),
      maskingAlgorithm: wrapArgs(maskingAlgorithmId),
      sort: column?.dataIndex,
      page: current,
      size: pageSize,
    };
    data.enabled = enabled?.length ? enabled : undefined;
    data.sort = column ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}` : undefined;
    const result = await listSensitiveColumns(projectId, data);
    setSensitiveColumn(result);
    initSensitiveColumn();
  };

  const rowSelectedCallback = (selectedRowKeys: any[]) => {
    setHasRowSelected(selectedRowKeys?.length > 0);
  };

  const onClose = (fn) => {
    return Modal.confirm({
      title: formatMessage({ id: 'odc.components.SensitiveColumn.AreYouSureYouWant' }), //确认要取消新建吗？
      onOk: async () => {
        setVisible(false);
        fn?.();
      },
      onCancel: () => {},
      okText: formatMessage({ id: 'odc.components.SensitiveColumn.Ok' }), //确定
      cancelText: formatMessage({ id: 'odc.components.SensitiveColumn.Cancel' }), //取消
    });
  };
  const onOk = (fn?: () => void) => {
    setVisible(false);
    tableRef.current?.reload?.();
    fn?.();
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
    tableRef.current?.resetSelectedRows();
  };

  const handleStatusSwitch = async (id: number, enabled: boolean) => {
    const result = await setEnabled(projectId, id, enabled);
    if (result) {
      message.success(
        formatMessage({ id: 'odc.components.SensitiveColumn.UpdatedSuccessfully' }), //更新成功
      );
    } else {
      message.error(
        formatMessage({ id: 'odc.components.SensitiveColumn.UpdateFailed' }), //更新失败
      );
    }
    tableRef.current?.reload?.();
  };

  const handleDelete = async (ids: number[] = [], multiClick: boolean = false) => {
    if (hasRowSelected && !multiClick) {
      // 多行选中 且 事件非多选按钮触发
      return;
    }
    return Modal.confirm({
      title: formatMessage({ id: 'odc.components.SensitiveColumn.AreYouSureYouWant.1' }), //确认要删除敏感列吗？
      onOk: debounce(async () => {
        if (!submiting) {
          setSubmiting(true);
          const result = await batchDeleteSensitiveColumns(projectId, ids);
          if (result) {
            message.success(
              formatMessage({ id: 'odc.components.SensitiveColumn.DeletedSuccessfully' }), //删除成功
            );
          } else {
            message.error(
              formatMessage({ id: 'odc.components.SensitiveColumn.FailedToDelete' }), //删除失败
            );
          }
          tableRef.current?.reload?.();
          tableRef.current?.resetSelectedRows();
          setSubmiting(false);
        }
      }),
      onCancel: () => {},
      okText: formatMessage({ id: 'odc.components.SensitiveColumn.Ok' }), //确定
      cancelText: formatMessage({ id: 'odc.components.SensitiveColumn.Cancel' }), //取消
    });
  };
  const columns: ColumnsType<ISensitiveColumn> = getColumns({
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
            {
              formatMessage({
                id: 'odc.components.SensitiveColumn.AddSensitiveColumns',
              }) /*添加敏感列*/
            }

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
            tracert.click('a3112.b64002.c330861.d367388');
          }}
        >
          {formatMessage({ id: 'odc.components.SensitiveColumn.ManuallyAdd' }) /*手动添加*/}
        </Menu.Item>
        <Menu.Item
          key={AddSensitiveColumnType.Scan}
          onClick={() => {
            setAddSensitiveColumnType(AddSensitiveColumnType.Scan);
            handleOpenEditSensitiveColumnDrawer();
            tracert.click('a3112.b64002.c330861.d367389');
          }}
        >
          {formatMessage({ id: 'odc.components.SensitiveColumn.ScanAdd' }) /*扫描添加*/}
        </Menu.Item>
      </Menu>
    ),

    onClick: () => {},
  });
  return (
    <>
      <CommonTable
        ref={tableRef}
        // mode={CommonTableMode.SMALL}
        titleContent={null}
        showToolbar={true}
        filterContent={{
          searchPlaceholder: formatMessage({
            id: 'odc.components.SensitiveColumn.EnterATableNameColumn',
          }), //请输入表名/列名
        }}
        operationContent={{
          options: operationOptions,
        }}
        onLoad={loadData}
        onChange={loadData}
        tableProps={{
          columns,
          dataSource: sensitiveColumn?.contents,
          rowKey: 'id',
          pagination: {
            current: sensitiveColumn?.page?.number,
            total: sensitiveColumn?.page?.totalElements,
          },
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
          initSensitiveColumn,
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
          initSensitiveColumn,
        }}
      />
    </>
  );
};

export default SensitiveColumn;
