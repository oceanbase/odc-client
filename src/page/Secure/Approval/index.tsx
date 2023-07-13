import {
  deleteTaskFlow,
  getIntegrationList,
  getResourceRoles,
  getTaskFlowList,
} from '@/common/network/manager';
import { actionTypes, canAcess } from '@/component/Acess';
import Action from '@/component/Action';
import CommonTable from '@/component/CommonTable';
import type { ITableInstance, ITableLoadOptions } from '@/component/CommonTable/interface';
import { IOperationOptionType } from '@/component/CommonTable/interface';
import type { IManagerIntegration, IResponseData, ITaskFlow, ITaskFlowNode } from '@/d.ts';
import { IManagerResourceType } from '@/d.ts';
import { secondsToHour } from '@/util/utils';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { message, Modal, Space } from 'antd';
import type { FixedType } from 'rc-table/es/interface';
import React from 'react';
import FormModal from './component/FormModal';

import styles from './index.less';

const renderTime = (time) => {
  return (
    <Space size={4}>
      <span>{secondsToHour(time)}</span>
      <span>小时</span>
    </Space>
  );
};

const renderNodes = (nodes: ITaskFlowNode[]) => {
  return nodes
    ?.map((item) => {
      if (item.autoApproval) {
        return '自动审批';
      }
      return item.resourceRoleName || item.externalApprovalName;
    })
    ?.join(' -> ');
};

interface IProps {}

interface IState {
  flowList: IResponseData<ITaskFlow>;
  roles: {
    name: string;
    id: number;
  }[];
  integrations: IManagerIntegration[];
  editId: number;
  detailId: number;
  formModalVisible: boolean;
  detailModalVisible: boolean;
}

class Approval extends React.PureComponent<IProps, IState> {
  private tableRef = React.createRef<ITableInstance>();

  readonly state = {
    editId: null,
    detailId: null,
    roles: [],
    integrations: [],
    formModalVisible: false,
    detailModalVisible: false,
    flowList: null,
  };

  private getPageColumns = () => {
    return [
      {
        title: '流程名称',
        width: 200,
        dataIndex: 'name',
        ellipsis: true,
        fixed: 'left' as FixedType,
      },

      {
        title: '审批流程',
        dataIndex: 'nodes',
        className: styles.title,
        ellipsis: true,
        render: renderNodes,
      },
      {
        title: '审批有效期',
        width: 132,
        dataIndex: 'approvalExpirationIntervalSeconds',
        className: styles.title,
        ellipsis: true,
        render: renderTime,
      },
      {
        title: '执行等待有效期',
        width: 132,
        dataIndex: 'waitExecutionExpirationIntervalSeconds',
        className: styles.title,
        ellipsis: true,
        render: renderTime,
      },
      {
        title: '执行有效期',
        width: 132,
        dataIndex: 'executionExpirationIntervalSeconds',
        className: styles.title,
        ellipsis: true,
        render: renderTime,
      },
      {
        title: '使用数量',
        width: 180,
        dataIndex: 'referencedCount',
        className: styles.title,
        key: 'referencedCount',
        ellipsis: true,
      },
      {
        title: '操作',
        width: 200,
        key: 'action',
        fixed: 'right' as FixedType,
        render: (value, record) => (
          <Action.Group>
            <Action.Group>
              <Action.Link
                disabled={record.builtIn}
                onClick={async () => {
                  this.openFormModal(record.id);
                }}
              >
                编辑
              </Action.Link>
              <Action.Link
                disabled={record.builtIn}
                onClick={async () => {
                  this.handleDelete(record.id);
                }}
              >
                删除
              </Action.Link>
            </Action.Group>
          </Action.Group>
        ),
      },
    ];
  };

  private openFormModal = (id: number = null) => {
    this.setState({
      formModalVisible: true,
      editId: id,
    });
  };

  private handleDelete = (param: React.Key | React.Key[]) => {
    Modal.confirm({
      title: '确认要删除审批流程吗？',
      icon: <ExclamationCircleFilled style={{ color: 'var(--icon-orange-color)' }} />,
      cancelText: '取消',
      okText: '确定',
      centered: true,
      onOk: () => {
        this.handleConfirmDelete(param as number);
      },
    });
  };

  private handleConfirmDelete = async (id: number) => {
    const res = await deleteTaskFlow(id);
    if (res) {
      message.success('删除成功');
      this.reloadData();
    }
  };

  private loadData = async (args: ITableLoadOptions) => {
    const { searchValue = '', sorter, pagination, pageSize } = args ?? {};
    const { column, order } = sorter ?? {};
    const { current = 1 } = pagination ?? {};

    const data = {
      name: searchValue,
      sort: column?.dataIndex,
      page: current,
      size: pageSize,
    };

    // sorter
    data.sort = column ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}` : undefined;
    const flowList = await getTaskFlowList(data);
    this.setState({
      flowList,
    });
  };

  loadRoles = async () => {
    const res = await getResourceRoles();
    const roles = res?.contents.map(({ roleName, id }) => ({
      name: roleName,
      id,
    }));
    this.setState({
      roles,
    });
  };

  loadIntegrations = async () => {
    const integrations = await getIntegrationList();
    this.setState({
      integrations: integrations?.contents,
    });
  };

  private reloadData = () => {
    this.tableRef.current.reload();
  };

  private handleCreate = () => {
    this.openFormModal();
  };

  componentDidMount() {
    this.loadRoles();
    this.loadIntegrations();
  }

  render() {
    const { formModalVisible, editId, flowList, roles, integrations } = this.state;
    const canAcessCreate = canAcess({
      resourceIdentifier: IManagerResourceType.resource,
      action: actionTypes.create,
    }).accessible;
    return (
      <>
        <CommonTable
          ref={this.tableRef}
          titleContent={null}
          filterContent={{
            searchPlaceholder: '请输入流程名称',
          }}
          operationContent={
            canAcessCreate
              ? {
                  options: [
                    {
                      type: IOperationOptionType.button,
                      content: '新建审批流程',
                      isPrimary: true,
                      onClick: this.handleCreate,
                    },
                  ],
                }
              : null
          }
          onLoad={this.loadData}
          onChange={this.loadData}
          tableProps={{
            columns: this.getPageColumns(),
            dataSource: flowList?.contents,
            rowKey: 'id',
            pagination: {
              current: flowList?.page?.number,
              total: flowList?.page?.totalElements,
            },
          }}
        />

        <FormModal
          roles={roles}
          integrations={integrations}
          editId={editId}
          visible={formModalVisible}
          reloadData={this.reloadData}
          onClose={() => {
            this.setState({
              formModalVisible: false,
              editId: null,
            });
          }}
        />
      </>
    );
  }
}

export default Approval;
