import {
  deleteIntegration,
  getIntegrationDetail,
  getIntegrationList,
  setIntegration,
} from '@/common/network/manager';
import { Acess, systemUpdatePermissions } from '@/component/Acess';
import Action from '@/component/Action';
import CommonTable from '@/component/CommonTable';
import type { ITableInstance, ITableLoadOptions } from '@/component/CommonTable/interface';
import { IOperationOptionType } from '@/component/CommonTable/interface';
import CommonDetailModal from '@/component/Manage/DetailModal';
import StatusSwitch from '@/component/StatusSwitch';
import type { IManagerIntegration, IResponseData } from '@/d.ts';
import { IManagePagesKeys, IManagerResourceType, IntegrationType } from '@/d.ts';
import { IPageType } from '@/d.ts/_index';
import type { SettingStore } from '@/store/setting';
import { getLocalFormatDateTime } from '@/util/utils';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Button, message, Modal, Space } from 'antd';
import { inject, observer } from 'mobx-react';
import type { FixedType } from 'rc-table/lib/interface';
import React, { useRef, useState } from 'react';
import DetailContent from './component/DetailContent';
import FormModal from './component/FormModal';
import { APPROVAL_TEMPLATE, SQL_INTERCEPTOR_TEMPLATE } from './constant';
import styles from './index.less';

const pageMeta = {
  [IPageType.ExternalIntegration_Sql]: {
    title: ' SQL 审核集成',
    type: IntegrationType.SQL_INTERCEPTOR,
    template: SQL_INTERCEPTOR_TEMPLATE,
  },
  [IPageType.ExternalIntegration_Approval]: {
    title: '审批集成',
    type: IntegrationType.APPROVAL,
    template: APPROVAL_TEMPLATE,
  },
};

interface IProps {
  settingStore?: SettingStore;
  pageKey: IManagePagesKeys;
}

const SqlInterceptor: React.FC<IProps> = (props) => {
  const { settingStore, pageKey } = props;
  const [list, setList] = useState<IResponseData<IManagerIntegration>>(null);
  const [editId, setEditId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const tableRef = useRef<ITableInstance>();
  const { title, type, template } = pageMeta[pageKey];

  const openFormModal = (id: number = null) => {
    setFormModalVisible(true);
    setEditId(id);
  };

  const openDetailModal = (detailId: number) => {
    setDetailModalVisible(true);
    setDetailId(detailId);
  };

  const handleStatusChange = (enabled: boolean, data: IManagerIntegration) => {
    handleEnable({
      enabled,
      data,
    });
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
  };

  const handleEnable = async (param: { data: IManagerIntegration; enabled: boolean }) => {
    const { data, enabled } = param;
    const res = await setIntegration({
      id: data.id,
      enabled,
    });

    if (res) {
      message.success(enabled ? '启用成功' : '停用成功');
      reloadData();
    } else {
      message.error(enabled ? '启用失败' : '停用失败');
    }
  };

  const loadData = async (args: ITableLoadOptions) => {
    const { searchValue = '', filters, sorter, pagination, pageSize } = args ?? {};
    const { enabled } = filters ?? {};
    const { column, order } = sorter ?? {};
    const { current = 1 } = pagination ?? {};

    const data = {
      type,
      enabled,
      name: searchValue,
      sort: column?.dataIndex,
      page: current,
      size: pageSize,
    };

    // enabled filter
    data.enabled = enabled?.length ? enabled : undefined;
    // sorter
    data.sort = column ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}` : undefined;
    const list = await getIntegrationList(data);
    setList(list);
  };

  const handleCloseAndReload = () => {
    handleCloseDetailModal();
    reloadData();
  };

  const reloadData = () => {
    tableRef.current.reload();
  };

  const handleCreate = () => {
    openFormModal();
  };

  const handleConfirmDelete = async (id: number) => {
    const res = await deleteIntegration(id);
    if (res) {
      message.success('删除成功');
      handleCloseAndReload();
    }
  };

  const handleDelete = (param: React.Key | React.Key[]) => {
    Modal.confirm({
      title: `确认要删除${title}吗？`,
      icon: <ExclamationCircleFilled style={{ color: 'var(--icon-orange-color)' }} />,
      cancelText: '取消',
      okText: '确定',
      centered: true,
      onOk: () => {
        handleConfirmDelete(param as number);
      },
    });
  };

  const getPageColumns = () => {
    return [
      {
        title: '配置名称',
        dataIndex: 'name',
        className: styles.title,
        key: 'name',
        ellipsis: true,
        fixed: 'left' as FixedType,
      },

      {
        title: '创建时间',
        width: 190,
        ellipsis: true,
        key: 'updateTime',
        dataIndex: 'updateTime',
        sorter: true,
        render: (updateTime) => getLocalFormatDateTime(updateTime),
      },
      {
        title: '状态',
        width: 115,
        ellipsis: true,
        key: 'enabled',
        dataIndex: 'enabled',
        filters: [
          {
            text: '启用',
            value: true,
          },

          {
            text: '停用',
            value: false,
          },
        ],
        render: (enabled, record) => {
          return (
            <StatusSwitch
              checked={enabled}
              onConfirm={() => {
                handleStatusChange(!enabled, record);
              }}
              onCancel={() => {
                handleStatusChange(!enabled, record);
              }}
            />
          );
        },
      },
      {
        title: '操作',
        width: 124,
        key: 'action',
        fixed: 'right' as FixedType,
        render: (value, record) => (
          <Action.Group>
            <Action.Link
              onClick={async () => {
                openDetailModal(record.id);
              }}
            >
              查看
            </Action.Link>
            <Acess {...systemUpdatePermissions[IManagerResourceType.integration]}>
              <Action.Group>
                <Action.Link
                  onClick={async () => {
                    openFormModal(record.id);
                  }}
                >
                  编辑
                </Action.Link>
                <Action.Link
                  disabled={record.builtIn}
                  onClick={async () => {
                    handleDelete(record.id);
                  }}
                >
                  删除
                </Action.Link>
              </Action.Group>
            </Acess>
          </Action.Group>
        ),
      },
    ];
  };

  return (
    <>
      <CommonTable
        key={pageKey}
        enableResize
        ref={tableRef}
        titleContent={null}
        filterContent={{
          searchPlaceholder: '请输入配置名称',
        }}
        operationContent={{
          options: [
            {
              type: IOperationOptionType.button,
              content: <span>新建{title}</span>,
              isPrimary: true,
              onClick: handleCreate,
            },
          ],
        }}
        onLoad={loadData}
        onChange={loadData}
        tableProps={{
          columns: getPageColumns(),
          dataSource: list?.contents,
          rowKey: 'id',
          pagination: {
            current: list?.page?.number,
            total: list?.page?.totalElements,
          },
        }}
      />

      <FormModal
        type={type}
        title={title}
        template={template}
        editId={editId}
        visible={formModalVisible}
        handleStatusChange={handleStatusChange}
        reloadData={reloadData}
        onClose={() => {
          setFormModalVisible(false);
          setEditId(null);
        }}
      />

      <CommonDetailModal
        visible={detailModalVisible}
        title={title}
        detailId={detailId}
        footer={
          <Space>
            <Button
              onClick={() => {
                handleCloseDetailModal();
                openFormModal(detailId);
              }}
            >
              编辑
            </Button>
            <Button onClick={handleCloseDetailModal}>关闭</Button>
          </Space>
        }
        onClose={handleCloseDetailModal}
        getDetail={() => getIntegrationDetail(detailId)}
        renderContent={(key, data) => (
          <DetailContent
            title={title}
            activeKey={key}
            data={data}
            handleCloseAndReload={handleCloseAndReload}
          />
        )}
      />
    </>
  );
};

export default inject('settingStore')(observer(SqlInterceptor));
