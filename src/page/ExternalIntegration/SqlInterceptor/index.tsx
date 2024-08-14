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
import { formatMessage } from '@/util/intl';
import tracert from '@/util/tracert';
import { getLocalFormatDateTime } from '@/util/utils';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Button, message, Modal, Space } from 'antd';
import { inject, observer } from 'mobx-react';
import type { FixedType } from 'rc-table/lib/interface';
import React, { useEffect, useRef, useState } from 'react';
import DetailContent from './component/DetailContent';
import FormModal from './component/FormModal';
import { APPROVAL_TEMPLATE, SQL_INTERCEPTOR_TEMPLATE } from './constant';
import styles from './index.less';

const pageMeta = {
  [IPageType.ExternalIntegration_Sql]: {
    title: formatMessage({
      id: 'odc.ExternalIntegration.SqlInterceptor.SqlAuditIntegration',
      defaultMessage: 'SQL 审核集成',
    }), //SQL 审核集成
    type: IntegrationType.SQL_INTERCEPTOR,
    template: SQL_INTERCEPTOR_TEMPLATE,
  },
  [IPageType.ExternalIntegration_Approval]: {
    title: formatMessage({
      id: 'odc.ExternalIntegration.SqlInterceptor.ApprovalIntegration',
      defaultMessage: '审批集成',
    }), //审批集成
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

  useEffect(() => {
    switch (type) {
      case IntegrationType.APPROVAL: {
        tracert.expo('a3112.b64009.c330925');
        break;
      }
      case IntegrationType.SQL_INTERCEPTOR: {
        tracert.expo('a3112.b64009.c330926');
        break;
      }
    }
  }, [type]);

  const openFormModal = (id: number = null) => {
    switch (type) {
      case IntegrationType.APPROVAL: {
        tracert.click('a3112.b64009.c330925.d367480');
        break;
      }
      case IntegrationType.SQL_INTERCEPTOR: {
        tracert.click('a3112.b64009.c330926.d367482');
        break;
      }
    }
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
      message.success(
        enabled
          ? formatMessage({
              id: 'odc.ExternalIntegration.SqlInterceptor.Enabled',
              defaultMessage: '启用成功',
            }) //启用成功
          : formatMessage({
              id: 'odc.ExternalIntegration.SqlInterceptor.DisabledSuccessfully',
              defaultMessage: '停用成功',
            }), //停用成功
      );
      reloadData();
    } else {
      message.error(
        enabled
          ? formatMessage({
              id: 'odc.ExternalIntegration.SqlInterceptor.FailedToEnable',
              defaultMessage: '启用失败',
            }) //启用失败
          : formatMessage({
              id: 'odc.ExternalIntegration.SqlInterceptor.DisableFailed',
              defaultMessage: '停用失败',
            }), //停用失败
      );
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
      message.success(
        formatMessage({
          id: 'odc.ExternalIntegration.SqlInterceptor.DeletedSuccessfully',
          defaultMessage: '删除成功',
        }), //删除成功
      );
      handleCloseAndReload();
    }
  };

  const handleDelete = (param: React.Key | React.Key[]) => {
    Modal.confirm({
      title: formatMessage(
        {
          id: 'odc.ExternalIntegration.SqlInterceptor.AreYouSureYouWant',
          defaultMessage: '是否确认删除{title}？',
        },
        { title },
      ), //`确认要删除${title}吗？`
      icon: <ExclamationCircleFilled style={{ color: 'var(--icon-orange-color)' }} />,
      cancelText: formatMessage({
        id: 'odc.ExternalIntegration.SqlInterceptor.Cancel',
        defaultMessage: '取消',
      }), //取消
      okText: formatMessage({
        id: 'odc.ExternalIntegration.SqlInterceptor.Ok',
        defaultMessage: '确定',
      }), //确定
      centered: true,
      onOk: () => {
        handleConfirmDelete(param as number);
      },
    });
  };

  const getPageColumns = () => {
    return [
      {
        title: formatMessage({
          id: 'odc.ExternalIntegration.SqlInterceptor.ConfigurationName',
          defaultMessage: '配置名称',
        }), //配置名称
        dataIndex: 'name',
        className: styles.title,
        key: 'name',
        ellipsis: true,
        fixed: 'left' as FixedType,
      },

      {
        title: formatMessage({
          id: 'odc.ExternalIntegration.SqlInterceptor.CreationTime',
          defaultMessage: '创建时间',
        }), //创建时间
        width: 190,
        ellipsis: true,
        key: 'updateTime',
        dataIndex: 'updateTime',
        sorter: true,
        render: (updateTime) => getLocalFormatDateTime(updateTime),
      },
      {
        title: formatMessage({
          id: 'odc.ExternalIntegration.SqlInterceptor.Status',
          defaultMessage: '状态',
        }), //状态
        width: 115,
        ellipsis: true,
        key: 'enabled',
        dataIndex: 'enabled',
        filters: [
          {
            text: formatMessage({
              id: 'odc.ExternalIntegration.SqlInterceptor.Enable',
              defaultMessage: '启用',
            }), //启用
            value: true,
          },

          {
            text: formatMessage({
              id: 'odc.ExternalIntegration.SqlInterceptor.Disable',
              defaultMessage: '停用',
            }), //停用
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
        title: formatMessage({
          id: 'odc.ExternalIntegration.SqlInterceptor.Operation',
          defaultMessage: '操作',
        }), //操作
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
              {
                formatMessage({
                  id: 'odc.ExternalIntegration.SqlInterceptor.View',
                  defaultMessage: '查看',
                }) /*查看*/
              }
            </Action.Link>
            <Acess {...systemUpdatePermissions[IManagerResourceType.integration]}>
              <Action.Group>
                <Action.Link
                  onClick={async () => {
                    openFormModal(record.id);
                  }}
                >
                  {
                    formatMessage({
                      id: 'odc.ExternalIntegration.SqlInterceptor.Edit',
                      defaultMessage: '编辑',
                    }) /*编辑*/
                  }
                </Action.Link>
                <Action.Link
                  disabled={record.builtIn}
                  onClick={async () => {
                    handleDelete(record.id);
                  }}
                >
                  {
                    formatMessage({
                      id: 'odc.ExternalIntegration.SqlInterceptor.Delete',
                      defaultMessage: '删除',
                    }) /*删除*/
                  }
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
        alertInfoContent={
          pageKey === IManagePagesKeys.SQL_INTERCEPTOR
            ? {
                message: formatMessage({
                  id: 'odc.ExternalIntegration.SqlInterceptor.FollowTheSecuritySpecificationSql',
                  defaultMessage:
                    '请按照 安全规范 - SQL 开发规范 - SQL 窗口规则 路径，使用您已配置并开启的 SQL 拦截集成',
                }), //请按照 安全规范 - SQL 开发规范 - SQL 窗口规则 路径，使用您已配置并开启的 SQL 拦截集成
              }
            : null
        }
        filterContent={{
          searchPlaceholder: formatMessage({
            id: 'odc.ExternalIntegration.SqlInterceptor.EnterAConfigurationName',
            defaultMessage: '请输入配置名称',
          }), //请输入配置名称
        }}
        operationContent={{
          options: [
            {
              type: IOperationOptionType.button,
              content: (
                <span>
                  {
                    formatMessage(
                      {
                        id: 'odc.ExternalIntegration.SqlInterceptor.CreateTitle',
                        defaultMessage: '新建{title}',
                      },
                      { title },
                    ) /*新建{title}*/
                  }
                </span>
              ),

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
              {
                formatMessage({
                  id: 'odc.ExternalIntegration.SqlInterceptor.Edit',
                  defaultMessage: '编辑',
                }) /*编辑*/
              }
            </Button>
            <Button onClick={handleCloseDetailModal}>
              {
                formatMessage({
                  id: 'odc.ExternalIntegration.SqlInterceptor.Close',
                  defaultMessage: '关闭',
                }) /*关闭*/
              }
            </Button>
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
