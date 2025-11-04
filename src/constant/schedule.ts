import { ScheduleApprovalStatus } from '@/component/Schedule/interface';
import {
  SchedulePageType,
  ScheduleStatus,
  ScheduleType,
  ScheduleActionsEnum,
} from '@/d.ts/schedule';
import { formatMessage } from '@/util/intl';

export const SchedulePageTextMap = {
  [SchedulePageType.ALL]: formatMessage({
    id: 'src.constant.5BBA513F',
    defaultMessage: '所有作业',
  }),
  [SchedulePageType.DATA_ARCHIVE]: formatMessage({
    id: 'odc.component.Task.helper.DataArchiving',
    defaultMessage: '数据归档',
  }),
  [SchedulePageType.DATA_DELETE]: formatMessage({
    id: 'odc.component.Task.helper.DataCleansing',
    defaultMessage: '数据清理',
  }),
  [SchedulePageType.SQL_PLAN]: formatMessage({
    id: 'src.constant.F25E4F32',
    defaultMessage: ' SQL 计划',
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
    id: 'src.constant.64BEEA94',
    defaultMessage: ' SQL 计划',
  }),
  [ScheduleType.PARTITION_PLAN]: formatMessage({
    id: 'odc.TaskManagePage.component.TaskTable.PartitionPlan',
    defaultMessage: '分区计划',
  }),
};

export const ScheduleStatusTextMap = {
  [ScheduleStatus.CREATING]: formatMessage({
    id: 'src.constant.18C4500A',
    defaultMessage: '已创建',
  }),
  [ScheduleStatus.PAUSE]: formatMessage({ id: 'src.constant.8B8F7EC7', defaultMessage: '已禁用' }),
  [ScheduleStatus.ENABLED]: formatMessage({
    id: 'src.constant.2A474D87',
    defaultMessage: '已启用',
  }),
  [ScheduleStatus.TERMINATED]: formatMessage({
    id: 'src.constant.3A6D8681',
    defaultMessage: '已终止',
  }),
  [ScheduleStatus.COMPLETED]: formatMessage({
    id: 'src.constant.D5F6AAE8',
    defaultMessage: '已完成',
  }),
  [ScheduleStatus.DELETED]: formatMessage({
    id: 'src.constant.24E1F8CF',
    defaultMessage: '已删除',
  }),
};

export const ScheduleActionsTextMap = {
  [ScheduleActionsEnum.VIEW]: formatMessage({
    id: 'src.constant.1DFF24BC',
    defaultMessage: '查看',
  }),
  [ScheduleActionsEnum.CLONE]: formatMessage({
    id: 'src.constant.0BA9BC54',
    defaultMessage: '克隆',
  }),
  [ScheduleActionsEnum.SHARE]: formatMessage({
    id: 'src.constant.D876107C',
    defaultMessage: '分享',
  }),
  [ScheduleActionsEnum.STOP]: formatMessage({
    id: 'src.constant.8C94C19D',
    defaultMessage: '终止',
  }),
  [ScheduleActionsEnum.DISABLE]: formatMessage({
    id: 'src.constant.2B7F81B4',
    defaultMessage: '禁用',
  }),
  [ScheduleActionsEnum.ENABLE]: formatMessage({
    id: 'src.constant.A4934117',
    defaultMessage: '启用',
  }),
  [ScheduleActionsEnum.EDIT]: formatMessage({
    id: 'src.constant.CB122B19',
    defaultMessage: '编辑',
  }),
  [ScheduleActionsEnum.DELETE]: formatMessage({
    id: 'src.constant.D1666869',
    defaultMessage: '删除',
  }),
  [ScheduleActionsEnum.PASS]: formatMessage({
    id: 'src.constant.2B8F903E',
    defaultMessage: '同意',
  }),
  [ScheduleActionsEnum.REVOKE]: formatMessage({
    id: 'src.constant.8B64E9AF',
    defaultMessage: '撤销审批',
  }),
  [ScheduleActionsEnum.REFUSE]: formatMessage({
    id: 'src.constant.AE35DD22',
    defaultMessage: '拒绝',
  }),
};

export const ApprovalStatusTextMap = {
  [ScheduleApprovalStatus.APPROVING]: formatMessage({
    id: 'src.constant.E27A4AAF',
    defaultMessage: '审批中',
  }),
  [ScheduleApprovalStatus.APPROVE_EXPIRED]: formatMessage({
    id: 'odc.component.TaskStatus.ApprovalExpired.1',
    defaultMessage: '审批过期',
  }),
  [ScheduleApprovalStatus.APPROVE_CANCELED]: formatMessage({
    id: 'src.constant.823D3295',
    defaultMessage: '审批撤销',
  }),
  [ScheduleApprovalStatus.APPROVE_REJECTED]: formatMessage({
    id: 'odc.component.TaskStatus.ApprovalFailed',
    defaultMessage: '审批不通过',
  }),
};
