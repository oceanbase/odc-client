import { getAuditDetail, getAuditEventMeta, getAuditList } from '@/common/network/manager';
import Action from '@/component/Action';
import CommonTable from '@/component/CommonTable';
import type { ITableInstance, ITableLoadOptions } from '@/component/CommonTable/interface';
import { IOperationOptionType } from '@/component/CommonTable/interface';
import CommonDetailModal from '@/component/Manage/DetailModal';
import SearchFilter from '@/component/SearchFilter';
import { TimeOptions } from '@/component/TimeSelect';
import TreeFilter from '@/component/TreeFilter';
import UserPopover from '@/component/UserPopover';
import type { IAudit, IAuditEvent, IResponseData } from '@/d.ts';
import { AuditEventActionType, AuditEventResult, AuditEventType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime, getPreTime } from '@/util/utils';
import { ExportOutlined, FilterFilled, SearchOutlined } from '@ant-design/icons';
import { Button, DatePicker } from 'antd';
import type { DataNode } from 'antd/lib/tree';
import type { Moment } from 'moment';
import moment from 'moment';
import React, { useContext, useEffect, useRef, useState } from 'react';
import FormRecordExportModal from '../../components/FormRecordExportModal';
import { ManageContext } from '../../context';
import { RecordContent, Status } from './component';

const { RangePicker } = DatePicker;

export const AuditEventMetaMap = {
  [AuditEventType.PERSONAL_CONFIGURATION]: formatMessage({
    id: 'odc.components.RecordPage.PersonalSettings',
  }),

  //个人设置
  [AuditEventType.MEMBER_MANAGEMENT]: formatMessage({
    id: 'odc.components.RecordPage.MemberManagement',
  }),

  //成员管理
  [AuditEventType.PASSWORD_MANAGEMENT]: formatMessage({
    id: 'odc.components.RecordPage.PasswordManagement',
  }),

  //密码管理
  [AuditEventType.CONNECTION_MANAGEMENT]: formatMessage({
    id: 'odc.components.RecordPage.ConnectionManagement',
  }),

  //连接管理
  [AuditEventType.SCRIPT_MANAGEMENT]: formatMessage({
    id: 'odc.components.RecordPage.ScriptManagement',
  }),

  //脚本管理
  [AuditEventType.DATABASE_OPERATION]: formatMessage({
    id: 'odc.components.RecordPage.DatabaseOperations',
  }),

  //数据库操作
  [AuditEventType.ORGANIZATION_CONFIGURATION]: formatMessage({
    id: 'odc.components.RecordPage.OrganizationConfiguration',
  }),

  //组织配置
  [AuditEventType.RESOURCE_GROUP_MANAGEMENT]: formatMessage({
    id: 'odc.components.RecordPage.ResourceGroupManagement',
  }),

  //资源组管理
  [AuditEventType.ASYNC]: formatMessage({
    id: 'odc.components.RecordPage.DatabaseChanges',
  }),

  //数据库变更
  [AuditEventType.IMPORT]: formatMessage({
    id: 'odc.components.RecordPage.Import',
  }),

  //导入
  [AuditEventType.EXPORT]: formatMessage({
    id: 'odc.components.RecordPage.Export',
  }),

  //导出
  [AuditEventType.MOCKDATA]: formatMessage({
    id: 'odc.components.RecordPage.AnalogData',
  }),

  //模拟数据
  [AuditEventType.AUDIT_EVENT]: formatMessage({
    id: 'odc.components.RecordPage.OperationRecords',
  }),

  [AuditEventType.SHADOWTABLE_SYNC]: formatMessage({
    id: 'odc.components.RecordPage.ShadowTableSynchronization',
  }),
  //影子表同步
  [AuditEventType.PARTITION_PLAN]: formatMessage({
    id: 'odc.components.RecordPage.PartitionPlan',
  }),
  //分区计划 //操作记录
  [AuditEventType.FLOW_CONFIG]: formatMessage({
    id: 'odc.components.RecordPage.TaskFlow',
  }),

  //任务流程
  [AuditEventType.DATA_MASKING_RULE]: formatMessage({
    id: 'odc.components.RecordPage.DesensitizationRules',
  }),

  //脱敏规则
  [AuditEventType.DATA_MASKING_POLICY]: formatMessage({
    id: 'odc.components.RecordPage.DesensitizationStrategy',
  }),

  //脱敏策略
  [AuditEventType.ALTER_SCHEDULE]: formatMessage({
    id: 'odc.components.RecordPage.PlannedChange',
  }), //计划变更
};

export const AuditEventActionMap = {
  // 个人配置
  [AuditEventActionType.UPDATE_PERSONAL_CONFIGURATION]: formatMessage({
    id: 'odc.components.RecordPage.Modify',
  }),

  //修改 // 密码管理
  [AuditEventActionType.CHANGE_PASSWORD]: formatMessage({
    id: 'odc.components.RecordPage.ChangePassword',
  }),

  //修改密码

  [AuditEventActionType.RESET_PASSWORD]: formatMessage({
    id: 'odc.components.RecordPage.SetPassword',
  }),

  //设置密码 // 连接管理
  [AuditEventActionType.CREATE_CONNECTION]: formatMessage({
    id: 'odc.components.RecordPage.CreateConnection',
  }),

  //新建连接
  [AuditEventActionType.DELETE_CONNECTION]: formatMessage({
    id: 'odc.components.RecordPage.DeleteAConnection',
  }),

  //删除连接
  [AuditEventActionType.UPDATE_CONNECTION]: formatMessage({
    id: 'odc.components.RecordPage.ModifyAConnection',
  }),

  //修改连接
  [AuditEventActionType.USE_CONNECTION]: formatMessage({
    id: 'odc.components.RecordPage.CreateASession',
  }),

  //创建会话
  [AuditEventActionType.QUIT_CONNECTION]: formatMessage({
    id: 'odc.components.RecordPage.CloseSession',
  }),

  //关闭会话
  [AuditEventActionType.ENABLE_CONNECTION]: formatMessage({
    id: 'odc.components.RecordPage.Enable',
  }),

  //启用
  [AuditEventActionType.DISABLE_CONNECTION]: formatMessage({
    id: 'odc.components.RecordPage.Disable',
  }),

  //停用 // 脚本管理
  [AuditEventActionType.CREATE_SCRIPT]: formatMessage({
    id: 'odc.components.RecordPage.Create',
  }),

  //新建
  [AuditEventActionType.UPDATE_SCRIPT]: formatMessage({
    id: 'odc.components.RecordPage.Modify',
  }),

  //修改
  [AuditEventActionType.DELETE_SCRIPT]: formatMessage({
    id: 'odc.components.RecordPage.Delete',
  }),

  //删除
  [AuditEventActionType.DOWNLOAD_SCRIPT]: formatMessage({
    id: 'odc.components.RecordPage.Download',
  }),

  //下载
  [AuditEventActionType.UPLOAD_SCRIPT]: formatMessage({
    id: 'odc.components.RecordPage.Upload',
  }),

  //上传 // 组织配置
  [AuditEventActionType.UPDATE_ORGANIZATION_CONFIGURATION]: formatMessage({
    id: 'odc.components.RecordPage.Modify',
  }),

  //修改 // 成员管理
  [AuditEventActionType.ADD_USER]: formatMessage({
    id: 'odc.components.RecordPage.AddUser',
  }),

  //新增用户
  [AuditEventActionType.UPDATE_USER]: formatMessage({
    id: 'odc.components.RecordPage.ModifyUser',
  }),

  //修改用户
  [AuditEventActionType.DELETE_USER]: formatMessage({
    id: 'odc.components.RecordPage.DeleteAUser',
  }),

  //删除用户
  [AuditEventActionType.ADD_ROLE]: formatMessage({
    id: 'odc.components.RecordPage.AddRole',
  }),

  //新增角色
  [AuditEventActionType.UPDATE_ROLE]: formatMessage({
    id: 'odc.components.RecordPage.ModifyARole',
  }),

  //修改角色
  [AuditEventActionType.DELETE_ROLE]: formatMessage({
    id: 'odc.components.RecordPage.DeleteARole',
  }),

  //删除角色
  [AuditEventActionType.ENABLE_USER]: formatMessage({
    id: 'odc.components.RecordPage.EnableUsers',
  }),

  //启用用户
  [AuditEventActionType.DISABLE_USER]: formatMessage({
    id: 'odc.components.RecordPage.DisableUser',
  }),

  //停用用户
  [AuditEventActionType.ENABLE_ROLE]: formatMessage({
    id: 'odc.components.RecordPage.EnableRole',
  }),

  //启用角色
  [AuditEventActionType.DISABLE_ROLE]: formatMessage({
    id: 'odc.components.RecordPage.DisableARole',
  }),

  //停用角色 // 资源组管理
  [AuditEventActionType.ADD_RESOURCE_GROUP]: formatMessage({
    id: 'odc.components.RecordPage.AddResourceGroup',
  }),

  //新增资源组
  [AuditEventActionType.UPDATE_RESOURCE_GROUP]: formatMessage({
    id: 'odc.components.RecordPage.ModifyAResourceGroup',
  }),

  //修改资源组
  [AuditEventActionType.DELETE_RESOURCE_GROUP]: formatMessage({
    id: 'odc.components.RecordPage.DeleteAResourceGroup',
  }),

  //删除资源组
  [AuditEventActionType.ENABLE_RESOURCE_GROUP]: formatMessage({
    id: 'odc.components.RecordPage.EnableResourceGroups',
  }),

  //启用资源组
  [AuditEventActionType.DISABLE_RESOURCE_GROUP]: formatMessage({
    id: 'odc.components.RecordPage.DisableAResourceGroup',
  }),

  //停用资源组 // 数据库操作
  [AuditEventActionType.SELECT]: 'SELECT',
  [AuditEventActionType.DELETE]: 'DELETE',
  [AuditEventActionType.INSERT]: 'INSERT',
  [AuditEventActionType.REPLACE]: 'REPLACE',
  [AuditEventActionType.UPDATE]: 'UPDATE',
  [AuditEventActionType.SET]: 'SET',
  [AuditEventActionType.DROP]: 'DROP',
  [AuditEventActionType.ALTER]: 'ALTER',
  [AuditEventActionType.TRUNCATE]: 'TRUNCATE',
  [AuditEventActionType.CREATE]: 'CREATE',
  [AuditEventActionType.OTHERS]: 'OTHERS',
  // 任务流程
  [AuditEventActionType.CREATE_ASYNC_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Create',
  }),

  //新建
  [AuditEventActionType.CREATE_MOCKDATA_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Create',
  }),

  //新建
  [AuditEventActionType.CREATE_IMPORT_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Create',
  }),

  //新建
  [AuditEventActionType.CREATE_EXPORT_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Create',
  }),

  //新建
  [AuditEventActionType.APPROVE_ASYNC_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Pass',
  }),

  //通过
  [AuditEventActionType.APPROVE_MOCKDATA_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Pass',
  }),

  //通过
  [AuditEventActionType.APPROVE_IMPORT_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Pass',
  }),

  //通过
  [AuditEventActionType.APPROVE_EXPORT_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Pass',
  }),

  //通过
  [AuditEventActionType.REJECT_ASYNC_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Reject',
  }),

  //拒绝
  [AuditEventActionType.REJECT_MOCKDATA_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Reject',
  }),

  //拒绝
  [AuditEventActionType.REJECT_IMPORT_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Reject',
  }),

  //拒绝
  [AuditEventActionType.REJECT_EXPORT_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Reject',
  }),

  //拒绝
  [AuditEventActionType.EXECUTE_ASYNC_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Run',
  }),

  //执行
  [AuditEventActionType.EXECUTE_MOCKDATA_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Run',
  }),

  //执行
  [AuditEventActionType.EXECUTE_IMPORT_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Run',
  }),

  //执行
  [AuditEventActionType.EXECUTE_EXPORT_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Run',
  }),

  //执行
  [AuditEventActionType.STOP_ASYNC_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Terminate',
  }),

  //终止
  [AuditEventActionType.STOP_MOCKDATA_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Terminate',
  }),

  //终止
  [AuditEventActionType.STOP_IMPORT_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Terminate',
  }),

  //终止
  [AuditEventActionType.STOP_EXPORT_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Terminate',
  }),

  //终止
  [AuditEventActionType.ROLLBACK_TASK]: formatMessage({
    id: 'odc.components.RecordPage.RollBack',
  }),

  //回滚 // 操作记录
  [AuditEventActionType.EXPORT_AUDIT_EVENT]: formatMessage({
    id: 'odc.components.RecordPage.ExportOperationRecords',
  }),

  //导出操作记录 // 流程管理
  [AuditEventActionType.CREATE_FLOW_CONFIG]: formatMessage({
    id: 'odc.components.RecordPage.CreateProcess',
  }),

  //新建流程
  [AuditEventActionType.UPDATE_FLOW_CONFIG]: formatMessage({
    id: 'odc.components.RecordPage.ChangeProcess',
  }),

  //修改流程
  [AuditEventActionType.ENABLE_FLOW_CONFIG]: formatMessage({
    id: 'odc.components.RecordPage.Process',
  }),

  //启用流程
  [AuditEventActionType.DISABLE_FLOW_CONFIG]: formatMessage({
    id: 'odc.components.RecordPage.DeactivateProcess',
  }),

  //停用流程
  [AuditEventActionType.DELETE_FLOW_CONFIG]: formatMessage({
    id: 'odc.components.RecordPage.DeleteProcess',
  }),

  //删除流程
  [AuditEventActionType.BATCH_DELETE_FLOW_CONFIG]: formatMessage({
    id: 'odc.components.RecordPage.BatchDelete',
  }),

  //批量删除
  [AuditEventActionType.CREATE_DATA_MASKING_RULE]: formatMessage({
    id: 'odc.components.RecordPage.Create',
  }),

  //新建
  [AuditEventActionType.UPDATE_DATA_MASKING_RULE]: formatMessage({
    id: 'odc.components.RecordPage.Modify',
  }),

  //修改
  [AuditEventActionType.ENABLE_DATA_MASKING_RULE]: formatMessage({
    id: 'odc.components.RecordPage.Enable',
  }),

  //启用
  [AuditEventActionType.DISABLE_DATA_MASKING_RULE]: formatMessage({
    id: 'odc.components.RecordPage.Disable',
  }),

  //停用
  [AuditEventActionType.DELETE_DATA_MASKING_RULE]: formatMessage({
    id: 'odc.components.RecordPage.Delete',
  }),

  //删除
  [AuditEventActionType.CREATE_DATA_MASKING_POLICY]: formatMessage({
    id: 'odc.components.RecordPage.Create',
  }),

  //新建
  [AuditEventActionType.UPDATE_DATA_MASKING_POLICY]: formatMessage({
    id: 'odc.components.RecordPage.Modify',
  }),

  //修改
  [AuditEventActionType.DELETE_DATA_MASKING_POLICY]: formatMessage({
    id: 'odc.components.RecordPage.Delete',
  }),

  //删除

  [AuditEventActionType.CREATE_SHADOWTABLE_SYNC_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Create',
  }),
  //新建
  [AuditEventActionType.EXECUTE_SHADOWTABLE_SYNC_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Execute',
  }),
  //执行
  [AuditEventActionType.APPROVE_SHADOWTABLE_SYNC_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Pass',
  }),
  //通过
  [AuditEventActionType.REJECT_SHADOWTABLE_SYNC_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Reject',
  }),
  //拒绝
  [AuditEventActionType.STOP_SHADOWTABLE_SYNC_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Termination',
  }),
  //终止
  [AuditEventActionType.CREATE_PARTITION_PLAN_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Create',
  }),
  //新建
  [AuditEventActionType.EXECUTE_PARTITION_PLAN_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Execute',
  }),
  //执行
  [AuditEventActionType.APPROVE_PARTITION_PLAN_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Pass',
  }),
  //通过
  [AuditEventActionType.REJECT_PARTITION_PLAN_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Reject',
  }),
  //拒绝
  [AuditEventActionType.STOP_PARTITION_PLAN_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Termination',
  }),
  //终止

  [AuditEventActionType.CREATE_ALTER_SCHEDULE_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Create',
  }), //新建
  [AuditEventActionType.STOP_ALTER_SCHEDULE_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Termination',
  }), //终止
  [AuditEventActionType.EXECUTE_ALTER_SCHEDULE_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Execute',
  }), //执行
  [AuditEventActionType.APPROVE_ALTER_SCHEDULE_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Pass',
  }), //通过
  [AuditEventActionType.REJECT_ALTER_SCHEDULE_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Reject',
  }), //拒绝
};

export function getEventFilterAndOptions(eventMeta: IAuditEvent[]) {
  const metas =
    eventMeta?.reduce((meta, { type, action }) => {
      if (meta[type]) {
        meta[type].push(action);
      } else {
        meta[type] = [action];
      }
      return meta;
    }, {}) ?? {};

  const filter = [];
  const options =
    Object.keys(metas)?.map((type) => {
      const children =
        metas[type]?.map((value) => {
          return {
            title: AuditEventActionMap[value],
            key: value,
            value,
          };
        }) ?? [];

      filter.push({
        text: AuditEventMetaMap[type],
        value: type,
      });

      return {
        title: AuditEventMetaMap[type],
        key: type,
        value: type,
        children: children,
      };
    }) ?? [];

  return {
    filter,
    options,
  };
}

interface IState {
  event: string[];
  eventMeta: IAuditEvent[];
  detailId: number;
  auditList: IResponseData<IAudit>;
  detailModalVisible: boolean;
  executeDate: [Moment, Moment];
  recordExportVisible: boolean;
  startIndex: number;
}

export interface IUserMap {
  [key: string]: {
    name: string;
    accountName: string;
    roleNames?: string[];
  };
}

export const getPageColumns = (params: {
  openDetailModal: (args: { id: number; [key: string]: any }) => void;
  reload: () => void;
  startIndex: number;
  eventfilter: {
    text: string;
    value: string;
  }[];

  eventOptions: DataNode[];
  userMap: IUserMap;
}) => {
  const { startIndex, eventfilter, eventOptions, userMap } = params;

  return [
    {
      title: formatMessage({ id: 'odc.components.RecordPage.No' }), //序号
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
      width: 62,
      render: (text, record, index) => {
        return startIndex + index + 1;
      },
    },

    {
      title: formatMessage({ id: 'odc.components.RecordPage.EventType' }), //事件类型
      width: 120,
      ellipsis: true,
      key: 'type',
      dataIndex: 'type',
      filters: eventfilter,
      render: (type) => AuditEventMetaMap[type],
    },

    {
      title: formatMessage({ id: 'odc.components.RecordPage.EventAction' }), //事件操作
      width: 160,
      ellipsis: true,
      key: 'action',
      filterDropdown: (props) => {
        return <TreeFilter {...props} treeData={eventOptions} />;
      },
      filterIcon: (filtered) => (
        <FilterFilled style={{ color: filtered ? 'var(--icon-color-focus)' : undefined }} />
      ),

      dataIndex: 'action',
      render: (action) => {
        return AuditEventActionMap[action];
      },
    },

    {
      title: formatMessage({
        id: 'odc.components.RecordPage.PublicConnection',
      }),

      //所属公共连接
      ellipsis: true,
      key: 'connectionName',
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            placeholder={formatMessage({
              id: 'odc.components.RecordPage.EnterAPublicConnection',
            })}

            /*请输入所属公共连接*/
          />
        );
      },
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? 'var(--icon-color-focus)' : undefined }} />
      ),

      dataIndex: 'connectionName',
      render: (connectionName) => connectionName || '-',
    },

    {
      title: formatMessage({ id: 'odc.components.RecordPage.IpSource' }), //IP来源
      width: 132,
      ellipsis: true,
      key: 'clientIpAddress',
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            placeholder={formatMessage({
              id: 'odc.components.RecordPage.EnterAnIpSource',
            })}

            /*请输入IP来源*/
          />
        );
      },
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? 'var(--icon-color-focus)' : undefined }} />
      ),

      dataIndex: 'clientIpAddress',
      render: (clientIpAddress) => clientIpAddress || '-',
    },

    {
      title: formatMessage({ id: 'odc.components.RecordPage.Executor' }), //执行人
      width: 120,
      ellipsis: true,
      key: 'username',
      dataIndex: 'username',
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            placeholder={formatMessage({
              id: 'odc.components.RecordPage.EnterTheExecutor',
            })}

            /*请输入执行人*/
          />
        );
      },
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? 'var(--icon-color-focus)' : undefined }} />
      ),

      filters: [],
      render: (username) => {
        const { name, accountName, roleNames = [] } = userMap?.[username] ?? {};
        return (
          <UserPopover name={name ?? '-'} accountName={accountName ?? '-'} roles={roleNames} />
        );
      },
    },

    {
      title: formatMessage({ id: 'odc.components.RecordPage.ExecutionTime' }), //执行时间
      width: 190,
      ellipsis: true,
      key: 'startTime',
      dataIndex: 'startTime',
      sorter: true,
      render: (startTime) => getLocalFormatDateTime(startTime),
    },

    {
      title: formatMessage({ id: 'odc.components.RecordPage.ExecutionResult' }), //执行结果
      width: 100,
      ellipsis: true,
      key: 'result',
      dataIndex: 'result',
      filters: [
        {
          text: formatMessage({ id: 'odc.components.RecordPage.Successful' }), //成功
          value: AuditEventResult.SUCCESS,
        },

        {
          text: formatMessage({ id: 'odc.components.RecordPage.Failed' }), //失败
          value: AuditEventResult.FAILED,
        },
      ],

      render: (result) => <Status result={result} />,
    },

    {
      title: formatMessage({ id: 'odc.components.RecordPage.Actions' }), //操作
      width: 60,
      key: 'action',
      render: (value, record) => (
        <Action.Link
          onClick={async () => {
            params.openDetailModal(record);
          }}
        >
          {formatMessage({ id: 'odc.components.RecordPage.View' }) /*查看*/}
        </Action.Link>
      ),
    },
  ];
};
const RecordPage: React.FC<any> = () => {
  const { users, getPublicConnectionList, getUserList } = useContext(ManageContext);
  const tableRef = useRef<ITableInstance>();
  const [event, setEvent] = useState(null);
  const [eventMeta, setEventMeta] = useState([]);
  const [detailId, setDetailId] = useState(null);
  const [auditList, setAuditList] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [executeDate, setExecuteDate] = useState<[Moment, Moment]>([, moment()]);
  const [recordExportVisible, setRecordExportVisible] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const userMap = users?.contents?.reduce((total, { name, accountName }) => {
    total[name] = {
      name,
      accountName,
    };

    return total;
  }, {});

  const { options: eventOptions, filter: eventfilter } = getEventFilterAndOptions(eventMeta);

  const openDetailModal = (auditList: IAudit) => {
    setDetailModalVisible(true);
    setDetailId(auditList.id);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
  };

  const loadEventMeta = async () => {
    const eventMeta = await getAuditEventMeta();
    setEventMeta(eventMeta);
  };

  const loadData = async (args: ITableLoadOptions) => {
    const { filters, sorter, pagination, pageSize } = args ?? {};
    if (!pageSize) {
      return;
    }
    const {
      type,
      executeTime = 7,
      action,
      connectionName,
      clientIpAddress,
      username = '',
      result,
    } = filters ?? {};
    const { column, order } = sorter ?? {};
    const { current = 1 } = pagination ?? {};
    const eventMetaKeys = Object.keys(AuditEventMetaMap);
    const eventAction = action?.filter((item) => !eventMetaKeys.includes(item));
    const data = {
      type,
      action: eventAction,
      fuzzyConnectionName: connectionName,
      fuzzyClientIPAddress: clientIpAddress,
      fuzzyUsername: username,
      result,
      startTime: executeDate?.[0]?.valueOf() ?? getPreTime(7),
      endTime: executeDate?.[1]?.valueOf() ?? getPreTime(0),
      sort: column?.dataIndex,
      page: current,
      size: pageSize,
    };

    if (executeTime !== 'custom' && typeof executeTime === 'number') {
      data.startTime = getPreTime(executeTime);
      data.endTime = getPreTime(0);
    }

    // sorter
    data.sort = column ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}` : undefined;
    const startIndex = pageSize * (current - 1);
    const auditList = await getAuditList(data);

    setAuditList(auditList);
    setStartIndex(startIndex);
    setEvent(eventAction);
  };

  const reloadData = () => {
    tableRef.current.reload();
  };

  const handleExecuteDateChange = (value: [Moment, Moment]) => {
    setExecuteDate(value);
  };

  const handleTableChange = (args: ITableLoadOptions) => {
    loadData(args);
  };

  const handleRecordExportVisible = (visible: boolean = false) => {
    setRecordExportVisible(visible);
  };

  useEffect(() => {
    loadEventMeta();
    getPublicConnectionList();
    getUserList();
  }, []);

  useEffect(() => {
    reloadData();
  }, [executeDate]);

  return (
    <>
      <CommonTable
        ref={tableRef}
        titleContent={{
          title: formatMessage({
            id: 'odc.components.RecordPage.OperationRecords',
          }),

          //操作记录
        }}
        filterContent={{
          enabledSearch: false,
          filters: [
            {
              name: 'executeTime',
              title: formatMessage({
                id: 'odc.components.RecordPage.ExecutionTime.1',
              }),

              //执行时间：
              defaultValue: 7,
              dropdownWidth: 160,
              options: TimeOptions,
            },

            {
              render: (props: ITableLoadOptions) => {
                const content = props?.filters?.executeTime === 'custom' && (
                  <RangePicker
                    defaultValue={executeDate}
                    bordered={false}
                    showTime={{ format: 'HH:mm:ss' }}
                    format="YYYY-MM-DD HH:mm:ss"
                    onChange={(value) => {
                      handleExecuteDateChange(value);
                    }}
                  />
                );

                return content;
              },
            },
          ],
        }}
        operationContent={{
          options: [
            {
              type: IOperationOptionType.button,
              icon: <ExportOutlined />,
              content: formatMessage({
                id: 'odc.components.RecordPage.Export',
              }),

              //导出
              tooltip: formatMessage({
                id: 'odc.components.RecordPage.ExportOperationRecords',
              }),

              //导出操作记录
              onClick: () => {
                handleRecordExportVisible(true);
              },
            },
          ],
        }}
        onLoad={loadData}
        onChange={handleTableChange}
        tableProps={{
          columns: getPageColumns({
            openDetailModal: openDetailModal,
            reload: reloadData,
            startIndex,
            eventfilter,
            eventOptions,
            userMap,
          }),

          dataSource: auditList?.contents,
          rowKey: 'id',
          pagination: {
            current: auditList?.page?.number,
            total: auditList?.page?.totalElements,
          },
        }}
      />

      <CommonDetailModal
        visible={detailModalVisible}
        title={formatMessage({
          id: 'odc.components.RecordPage.RecordDetails',
        })}
        /*记录详情*/
        detailId={detailId}
        footer={
          <Button onClick={handleCloseDetailModal}>
            {formatMessage({ id: 'odc.components.RecordPage.Close' }) /*关闭*/}
          </Button>
        }
        onClose={handleCloseDetailModal}
        getDetail={getAuditDetail}
        renderContent={(key, data) => <RecordContent data={data} userMap={userMap} />}
      />

      <FormRecordExportModal
        visible={recordExportVisible}
        eventOptions={eventOptions}
        event={event}
        onClose={handleRecordExportVisible}
      />
    </>
  );
};

export default RecordPage;
