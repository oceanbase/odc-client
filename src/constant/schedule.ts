import { ApprovalStatus } from '@/component/Schedule/interface';
import {
  SchedulePageType,
  ScheduleStatus,
  ScheduleType,
  ScheduleActionsEnum,
} from '@/d.ts/schedule';
import { formatMessage } from '@/util/intl';

export const SchedulePageTextMap = {
  [SchedulePageType.ALL]: '所有作业',
  [SchedulePageType.DATA_ARCHIVE]: formatMessage({
    id: 'odc.component.Task.helper.DataArchiving',
    defaultMessage: '数据归档',
  }),
  [SchedulePageType.DATA_DELETE]: formatMessage({
    id: 'odc.component.Task.helper.DataCleansing',
    defaultMessage: '数据清理',
  }),
  [SchedulePageType.SQL_PLAN]: formatMessage({
    id: 'odc.TaskManagePage.component.helper.SqlPlan',
    defaultMessage: 'SQL 计划',
  }),
  [SchedulePageType.PARTITION_PLAN]: formatMessage({
    id: 'odc.TaskManagePage.component.TaskTable.PartitionPlan',
    defaultMessage: '分区计划',
  }),
};

export const ScheduleTextMap = {
  [ScheduleType.DATA_ARCHIVE]: formatMessage({
    id: 'odc.component.Task.helper.DataArchiving',
    defaultMessage: '数据归档',
  }),
  [ScheduleType.DATA_DELETE]: formatMessage({
    id: 'odc.component.Task.helper.DataCleansing',
    defaultMessage: '数据清理',
  }),
  [ScheduleType.SQL_PLAN]: formatMessage({
    id: 'odc.TaskManagePage.component.helper.SqlPlan',
    defaultMessage: 'SQL 计划',
  }),
  [ScheduleType.PARTITION_PLAN]: formatMessage({
    id: 'odc.TaskManagePage.component.TaskTable.PartitionPlan',
    defaultMessage: '分区计划',
  }),
};

export const ScheduleStatusTextMap = {
  [ScheduleStatus.CREATING]: '创建中',
  [ScheduleStatus.PAUSE]: '已禁用',
  [ScheduleStatus.ENABLED]: '已启用',
  [ScheduleStatus.TERMINATED]: '已终止',
  [ScheduleStatus.COMPLETED]: '已完成',
  [ScheduleStatus.EXECUTION_FAILED]: '执行超时',
  [ScheduleStatus.DELETED]: '已删除',
  [ScheduleStatus.CANCELED]: '已取消',
};

export const ScheduleActionsTextMap = {
  [ScheduleActionsEnum.VIEW]: '查看',
  [ScheduleActionsEnum.CLONE]: '克隆',
  [ScheduleActionsEnum.SHARE]: '分享',
  [ScheduleActionsEnum.STOP]: '终止',
  [ScheduleActionsEnum.DISABLE]: '禁用',
  [ScheduleActionsEnum.ENABLE]: '启用',
  [ScheduleActionsEnum.EDIT]: '编辑',
  [ScheduleActionsEnum.DELETE]: '删除',
  [ScheduleActionsEnum.PASS]: '同意',
  [ScheduleActionsEnum.REVOKE]: '撤销审批',
  [ScheduleActionsEnum.REFUSE]: '拒绝',
};

export const ApprovalStatusTextMap = {
  [ApprovalStatus.APPROVING]: '审批中',
  [ApprovalStatus.APPROVE_FAILED]: '审批失败',
};
