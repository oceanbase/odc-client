import { TaskStatus, TaskType } from '@/d.ts';
import modalStore from '@/store/modal';
import { formatMessage } from '@/util/intl';

export const actions = {
  [TaskType.DATA_ARCHIVE]: (args) => modalStore.changeDataArchiveModal(true, args),
  [TaskType.DATA_DELETE]: (args) => modalStore.changeDataClearModal(true, args),
  [TaskType.SQL_PLAN]: (args) => modalStore.changeCreateSQLPlanTaskModal(true, args),
  [TaskType.LOGICAL_DATABASE_CHANGE]: (args) => modalStore.changeLogicialDatabaseModal(true, args),
  [TaskType.ASYNC]: (args) => modalStore.changeCreateAsyncTaskModal(true, args),
  [TaskType.DATAMOCK]: (args) => modalStore.changeDataMockerModal(true, args),
  [TaskType.APPLY_DATABASE_PERMISSION]: (args) =>
    modalStore.changeApplyDatabasePermissionModal(true, args),
  [TaskType.APPLY_TABLE_PERMISSION]: (args) =>
    modalStore.changeApplyTablePermissionModal(true, args),
  [TaskType.MULTIPLE_ASYNC]: (args) => modalStore.changeMultiDatabaseChangeModal(true, args),
  [TaskType.SHADOW]: (args) => modalStore.changeShadowSyncVisible(true, args),
  [TaskType.STRUCTURE_COMPARISON]: (args) => modalStore.changeStructureComparisonModal(true, args),
  [TaskType.EXPORT]: (args) => modalStore.changeExportModal(true, args),
  [TaskType.IMPORT]: (args) => modalStore.changeImportModal(true, args),
  [TaskType.EXPORT_RESULT_SET]: (args) =>
    modalStore.changeCreateResultSetExportTaskModal(true, args),
  [TaskType.ONLINE_SCHEMA_CHANGE]: (args) => modalStore.changeCreateDDLAlterTaskModal(true, args),
  [TaskType.PARTITION_PLAN]: (args) => modalStore.changePartitionModal(true, args),
};
/** 周期任务 */

export const SCHEDULE_TASKS = [TaskType.DATA_ARCHIVE, TaskType.DATA_DELETE, TaskType.SQL_PLAN];

/** 作业调度任务 */
export const JOB_SCHEDULE_TASKS = [TaskType.DATA_ARCHIVE, TaskType.DATA_DELETE];

export const actionInfo = {
  reTryBtn: {
    key: 'reTry',
    text: formatMessage({
      id: 'src.component.Task.component.ActionBar.C324AD20',
      defaultMessage: '再次发起',
    }), //'再次发起'
    type: 'button',
  },
  editBtn: {
    key: 'edit',
    text: formatMessage({
      id: 'odc.TaskManagePage.component.TaskTools.Edit',
      defaultMessage: '编辑',
    }), //编辑
    type: 'button',
  },
  stopBtn: {
    key: 'stop',
    text: formatMessage({
      id: 'odc.TaskManagePage.component.TaskTools.Termination',
      defaultMessage: '终止',
    }), //终止
    type: 'button',
  },
  disableBtn: {
    key: 'disable',
    text: formatMessage({
      id: 'odc.TaskManagePage.component.TaskTools.Disable',
      defaultMessage: '禁用',
    }), //禁用
    type: 'button',
  },
  stopScheduleTaskBtn: {
    key: 'stopLogicalChangeTask',
    text: formatMessage({
      id: 'odc.TaskManagePage.component.TaskTools.Termination',
      defaultMessage: '终止',
    }), //终止
    type: 'button',
  },
  enableBtn: {
    key: 'enable',
    text: formatMessage({
      id: 'odc.TaskManagePage.component.TaskTools.Enable',
      defaultMessage: '启用',
    }), //启用
    type: 'button',
  },
  deleteBtn: {
    key: 'delete',
    text: formatMessage({
      id: 'src.component.Task.component.ActionBar.E16B982C',
      defaultMessage: '删除',
    }),
    type: 'button',
  },
  closeBtn: {
    key: 'close',
    text: formatMessage({
      id: 'odc.TaskManagePage.component.TaskTools.Close',
      defaultMessage: '关闭',
    }),
    type: 'button',
  },
  copyBtn: {
    key: 'copy',
    text: formatMessage({
      id: 'odc.TaskManagePage.component.TaskTools.Copy',
      defaultMessage: '复制',
    }),
    type: 'button',
  },
  rollbackBtn: {
    key: 'rollback',
    text: formatMessage({
      id: 'odc.TaskManagePage.component.TaskTools.RollBack',
      defaultMessage: '回滚',
    }),
    type: 'button',
  },
  executeBtn: {
    key: 'execute',
    text: formatMessage({
      id: 'odc.TaskManagePage.component.TaskTools.Run',
      defaultMessage: '执行',
    }),
    type: 'button',
  },
  approvalBtn: {
    key: 'approval',
    text: formatMessage({
      id: 'odc.TaskManagePage.component.TaskTools.Pass',
      defaultMessage: '通过',
    }),
    type: 'button',
  },
  againBtn: {
    key: 'again',
    text: formatMessage({
      id: 'src.component.Task.component.ActionBar.57DBF8A7',
      defaultMessage: '重试',
    }),
    type: 'button',
  },
  downloadBtn: {
    key: 'download',
    text: formatMessage({
      id: 'odc.TaskManagePage.component.TaskTools.Download',
      defaultMessage: '下载',
    }),
    type: 'button',
  },
  downloadSQLBtn: {
    key: 'downloadSQL',
    text: formatMessage({
      id: 'src.component.Task.component.ActionBar.DBA6CB6E',
      defaultMessage: '下载 SQL',
    }), //'下载 SQL'
    type: 'button',
  },
  structrueComparisonBySQL: {
    key: 'structrueComparisonBySQL',
    text: formatMessage({
      id: 'src.component.Task.component.ActionBar.46F2F0ED',
      defaultMessage: '发起结构同步',
    }), //'发起结构同步'
    type: 'button',
  },
  openLocalFolder: {
    key: 'openLocalFolder',
    text: formatMessage({
      id: 'odc.TaskManagePage.component.TaskTools.OpenFolder',
      defaultMessage: '打开文件夹',
    }),
    type: 'button',
  },
  downloadViewResultBtn: {
    key: 'downloadViewResult',
    text: formatMessage({
      id: 'odc.TaskManagePage.component.TaskTools.DownloadQueryResults',
      defaultMessage: '下载查询结果',
    }),
    type: 'button',
  },
};
