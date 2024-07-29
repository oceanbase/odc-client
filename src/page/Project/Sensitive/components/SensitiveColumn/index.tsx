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
  IOperationOption,
  IOperationOptionType,
  IRowSelecter,
  ITableInstance,
  ITableLoadOptions,
} from '@/component/CommonTable/interface';
import StatusSwitch from '@/component/StatusSwitch';
import TooltipContent from '@/component/TooltipContent';
import { IResponseData } from '@/d.ts';
import { ESensitiveColumnType, ISensitiveColumn } from '@/d.ts/sensitiveColumn';
import { maskRuleTypeMap } from '@/page/Secure/MaskingAlgorithm';
import { ReactComponent as TableOutlined } from '@/svgr/menuTable.svg';
import { ReactComponent as ViewSvg } from '@/svgr/menuView.svg';
import { formatMessage } from '@/util/intl';
import tracert from '@/util/tracert';
import Icon, { DownOutlined } from '@ant-design/icons';
import { Button, Descriptions, Menu, message, Modal, Popover, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { debounce } from 'lodash';
import { useContext, useEffect, useRef, useState } from 'react';
import { AddSensitiveColumnType } from '../../interface';
import SensitiveContext from '../../SensitiveContext';
import EditSensitiveColumnModal from './components/EditSensitiveColumnModal';
import FormSensitiveColumnDrawer from './components/FormSensitiveColumnDrawer';
import ManualForm from './components/ManualForm';
import styles from './index.less';

export const PopoverContainer: React.FC<{
  title: string;
  descriptionsData: {
    label: string;
    value: string;
  }[];
  children: () => JSX.Element;
}> = ({ title, descriptionsData, children }) => {
  return (
    <Popover
      placement="left"
      title={title}
      overlayClassName={styles.selectPopover}
      content={
        <Descriptions
          column={1}
          style={{
            width: '250px',
          }}
        >
          {descriptionsData?.map((description, index) => {
            return (
              <Descriptions.Item key={index} label={description?.label}>
                {description?.value}
              </Descriptions.Item>
            );
          })}
        </Descriptions>
      }
    >
      {children?.()}
    </Popover>
  );
};
const getColumns: ({
  handleStatusSwitch,
  handleEdit,
  handleDelete,
  maskingAlgorithmFilters,
  maskingAlgorithms,
  dataSourceIdMap,
  hasRowSelected,
  maskingAlgorithmIdMap,
}) => ColumnsType<ISensitiveColumn> = ({
  handleStatusSwitch,
  handleEdit,
  handleDelete,
  maskingAlgorithmFilters,
  maskingAlgorithms,
  dataSourceIdMap,
  hasRowSelected,
  maskingAlgorithmIdMap,
}) => {
  return [
    {
      title: formatMessage({
        id: 'odc.components.SensitiveColumn.DataSource',
        defaultMessage: '数据源',
      }),
      //数据源
      width: 170,
      dataIndex: 'datasource',
      key: 'datasource',
      ellipsis: true,
      render: (text, record, index) => dataSourceIdMap[record?.database?.dataSource?.id],
    },
    {
      title: formatMessage({
        id: 'odc.components.SensitiveColumn.DatabaseSchema',
        defaultMessage: '数据库/schema',
      }),
      //数据库/schema
      width: 170,
      dataIndex: 'database',
      key: 'database',
      ellipsis: true,
      render: (text, record, index) => record?.database?.name,
    },
    {
      title: formatMessage({
        id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.TableView',
        defaultMessage: '表/视图',
      }), //'表/视图'
      //表
      width: 170,
      dataIndex: 'tableName',
      key: 'tableName',
      ellipsis: true,
      render: (text, record, index) => (
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              display: 'flex',
              lineHeight: 1,
              fontSize: 14,
              color: 'var(--icon-color-disable)',
            }}
          >
            <Icon
              component={
                record?.type === ESensitiveColumnType.TABLE_COLUMN ? TableOutlined : ViewSvg
              }
            />
          </span>
          <TooltipContent content={text} maxWdith={170} />
        </span>
      ),
    },
    {
      title: formatMessage({
        id: 'odc.components.SensitiveColumn.Column',
        defaultMessage: '列',
      }),
      //列
      width: 170,
      dataIndex: 'columnName',
      key: 'columnName',
      ellipsis: true,
      render: (text, record, index) => text, //<TooltipContent content={text} maxWdith={170} />,
    },
    {
      title: formatMessage({
        id: 'odc.components.SensitiveColumn.DesensitizationAlgorithm',
        defaultMessage: '脱敏算法',
      }),
      //脱敏算法
      width: 170,
      dataIndex: 'maskingAlgorithmId',
      key: 'maskingAlgorithmId',
      filters: maskingAlgorithmFilters,
      ellipsis: true,
      render: (text, record, index) => {
        const target = maskingAlgorithms?.find(
          (maskingAlgorithm) => maskingAlgorithm?.id === record?.maskingAlgorithmId,
        );
        return (
          <PopoverContainer
            key={index}
            title={maskingAlgorithmIdMap?.[record?.maskingAlgorithmId]}
            descriptionsData={[
              {
                label: formatMessage({
                  id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.DesensitizationMethod',
                  defaultMessage: '脱敏方式',
                }) /* 脱敏方式 */,
                value: maskRuleTypeMap?.[target?.type],
              },
              {
                label: formatMessage({
                  id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.TestData',
                  defaultMessage: '测试数据',
                }) /* 测试数据 */,
                value: target?.sampleContent,
              },
              {
                label: formatMessage({
                  id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.Preview',
                  defaultMessage: '结果预览',
                }) /* 结果预览 */,
                value: target?.maskedContent,
              },
            ]}
            children={() => (
              <div className={styles.hover}>
                {maskingAlgorithmIdMap?.[record?.maskingAlgorithmId]}
              </div>
            )}
          />
        );
      },
    },
    {
      title: formatMessage({
        id: 'odc.components.SensitiveColumn.EnableStatus',
        defaultMessage: '启用状态',
      }),
      //启用状态
      width: 120,
      dataIndex: 'enabled',
      key: 'enabled',
      filters: [
        {
          text: formatMessage({
            id: 'odc.components.SensitiveColumn.Enable',
            defaultMessage: '启用',
          }),
          //启用
          value: true,
        },
        {
          text: formatMessage({
            id: 'odc.components.SensitiveColumn.Disable',
            defaultMessage: '禁用',
          }),
          //禁用
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
      title: formatMessage({
        id: 'odc.components.SensitiveColumn.Operation',
        defaultMessage: '操作',
      }),
      //操作
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
            {
              formatMessage({
                id: 'odc.components.SensitiveColumn.Edit',
                defaultMessage: '编辑',
              }) /*编辑*/
            }
          </Button>
          <Button
            style={{
              padding: 0,
            }}
            type="link"
            disabled={hasRowSelected}
            onClick={() => handleDelete([record.id])}
          >
            {
              formatMessage({
                id: 'odc.components.SensitiveColumn.Delete',
                defaultMessage: '删除',
              }) /*删除*/
            }
          </Button>
        </Space>
      ),
    },
  ];
};
const SensitiveColumn = ({
  projectId,
  maskingAlgorithmFilters,
  cascaderOptions,
  initSensitiveColumn,
}) => {
  const tableRef = useRef<ITableInstance>();
  const sensitiveContext = useContext(SensitiveContext);
  const { dataSourceIdMap, maskingAlgorithms, maskingAlgorithmIdMap, maskingAlgorithmOptions } =
    sensitiveContext;
  const [sensitiveColumnIds, setSensitiveColumnIds] = useState<number[]>([]);
  const [addSensitiveColumnType, setAddSensitiveColumnType] = useState<AddSensitiveColumnType>(
    AddSensitiveColumnType.Scan,
  );
  const [modalOpen, setModalOpen] = useState<boolean>(false);
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
        okText: formatMessage({
          id: 'odc.components.SensitiveColumn.BatchEdit',
          defaultMessage: '批量编辑',
        }),
        //批量编辑
        onOk: (keys) => {
          handleEdit(maskingAlgorithms?.[0]?.id, keys as number[], true);
        },
      },
      {
        okText: formatMessage({
          id: 'odc.components.SensitiveColumn.BatchDeletion',
          defaultMessage: '批量删除',
        }),
        //批量删除
        onOk: (keys) => {
          handleDelete(keys as number[], true);
        },
      },
    ],
  };
  const loadData = async (args: ITableLoadOptions) => {
    const {
      searchValue,
      filters,
      sorter,
      pagination,
      pageSize,
      cascaderValue = [undefined, undefined],
    } = args ?? {};
    const datasource = [];
    const database = [];
    const { enabled, maskingAlgorithmId } = filters ?? {};
    const { column, order } = sorter ?? {};
    const { current = 1 } = pagination ?? {};
    cascaderValue?.forEach((cv) => {
      if (Array.isArray(cv) && cv.length === 1) {
        datasource.push(cv?.[0]);
      }
      if (Array.isArray(cv) && cv.length === 2) {
        database.push(cv?.[1]);
      }
    });
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
      title: formatMessage({
        id: 'odc.components.SensitiveColumn.AreYouSureYouWant',
        defaultMessage: '是否确认取消新建？',
      }),
      //确认要取消新建吗？
      onOk: async () => {
        setVisible(false);
        await fn?.();
      },
      onCancel: () => {},
      okText: formatMessage({
        id: 'odc.components.SensitiveColumn.Ok',
        defaultMessage: '确定',
      }),
      //确定
      cancelText: formatMessage({
        id: 'odc.components.SensitiveColumn.Cancel',
        defaultMessage: '取消',
      }), //取消
    });
  };

  const onOk = async (fn?: () => void) => {
    setVisible(false);
    tableRef.current?.reload?.();
    await fn?.();
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
      message.success(
        formatMessage({
          id: 'odc.components.SensitiveColumn.UpdatedSuccessfully',
          defaultMessage: '更新成功',
        }), //更新成功
      );

      tableRef.current?.resetSelectedRows();
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.SensitiveColumn.UpdateFailed',
          defaultMessage: '更新失败',
        }), //更新失败
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
      title: formatMessage({
        id: 'odc.components.SensitiveColumn.AreYouSureYouWant.1',
        defaultMessage: '确认要删除敏感列吗？',
      }),
      //确认要删除敏感列吗？
      onOk: debounce(async () => {
        if (!submiting) {
          setSubmiting(true);
          const result = await batchDeleteSensitiveColumns(projectId, ids);
          if (result) {
            message.success(
              formatMessage({
                id: 'odc.components.SensitiveColumn.DeletedSuccessfully',
                defaultMessage: '删除成功',
              }), //删除成功
            );
          } else {
            message.error(
              formatMessage({
                id: 'odc.components.SensitiveColumn.FailedToDelete',
                defaultMessage: '删除失败',
              }), //删除失败
            );
          }

          const { page } = sensitiveColumn;
          const newCurrent = Math.ceil((page?.totalElements - ids?.length) / page?.size);
          tableRef.current?.reload?.({
            pagination: {
              current: newCurrent >= page?.number ? page?.number : newCurrent,
              pageSize: page?.size,
            },
            pageSize: page?.size,
          });
          tableRef.current?.resetSelectedRows();
          setSubmiting(false);
        }
      }),
      onCancel: () => {},
      okText: formatMessage({
        id: 'odc.components.SensitiveColumn.Ok',
        defaultMessage: '确定',
      }),
      //确定
      cancelText: formatMessage({
        id: 'odc.components.SensitiveColumn.Cancel',
        defaultMessage: '取消',
      }), //取消
    });
  };

  const columns: ColumnsType<ISensitiveColumn> = getColumns({
    hasRowSelected,
    handleStatusSwitch,
    handleEdit,
    handleDelete,
    maskingAlgorithmFilters,
    maskingAlgorithms,
    dataSourceIdMap: dataSourceIdMap,
    maskingAlgorithmIdMap: maskingAlgorithmIdMap,
  });
  const operationOptions: IOperationOption[] = [];
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
                defaultMessage: '添加敏感列',
              }) /*添加敏感列*/
            }

            <DownOutlined />
          </Space>
        </a>
      </Button>
    ),

    menu: {
      items: [
        {
          key: AddSensitiveColumnType.Manual,
          label: formatMessage({
            id: 'odc.components.SensitiveColumn.ManuallyAdd',
            defaultMessage: '手动添加',
          }),
          onClick: () => {
            setAddSensitiveColumnType(AddSensitiveColumnType.Manual);
            // handleOpenEditSensitiveColumnDrawer();
            setModalOpen(true);
            tracert.click('a3112.b64002.c330861.d367388');
          },
        },
        {
          key: AddSensitiveColumnType.Scan,
          label: formatMessage({
            id: 'odc.components.SensitiveColumn.ScanAdd',
            defaultMessage: '扫描添加',
          }),
          onClick: () => {
            setAddSensitiveColumnType(AddSensitiveColumnType.Scan);
            handleOpenEditSensitiveColumnDrawer();
            tracert.click('a3112.b64002.c330861.d367389');
          },
        },
      ],
    },
    onClick: () => {},
  });
  return (
    <>
      <CommonTable
        ref={tableRef}
        titleContent={null}
        showToolbar={true}
        filterContent={{
          searchPlaceholder: formatMessage({
            id: 'odc.components.SensitiveColumn.EnterATableNameColumn',
            defaultMessage: '请输入表名/列名',
          }), //请输入表名/列名
        }}
        cascaderContent={{
          options: cascaderOptions,
          placeholder: formatMessage({
            id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.PleaseSelectTheDataSource',
            defaultMessage: '请选择数据源和库',
          }), //'请选择数据源和库'
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
          projectId,
          onClose,
          onOk,
          addSensitiveColumnType,
          initSensitiveColumn,
        }}
      />

      <EditSensitiveColumnModal
        {...{
          tableRef,
          projectId: projectId,
          maskingAlgorithmId,
          sensitiveColumnIds,
          modalVisible,
          setModalVisible,
          maskingAlgorithms,
          maskingAlgorithmOptions,
          initSensitiveColumn,
        }}
      />

      {modalOpen && (
        <ManualForm
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          callback={() => {
            tableRef.current?.reload?.();
          }}
        />
      )}
    </>
  );
};
export default SensitiveColumn;
