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
  rollbackDataArchiveSubTask,
  startDataArchiveSubTask,
  stopDataArchiveSubTask,
} from '@/common/network/task';
import Action from '@/component/Action';
import {
  ICycleSubTaskDetailRecord,
  ITaskResult,
  SubTaskStatus,
  SubTaskType,
  TaskDetail,
  TaskRecord,
  TaskRecordParameters,
} from '@/d.ts';
import type { ModalStore } from '@/store/modal';
import type { SettingStore } from '@/store/setting';
import type { TaskStore } from '@/store/task';
import { formatMessage } from '@/util/intl';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { message, Modal, Popconfirm, Tooltip } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
interface IProps {
  taskStore?: TaskStore;
  settingStore?: SettingStore;
  modalStore?: ModalStore;
  isDetailModal?: boolean;
  showRollback?: boolean;
  taskId: number;
  record:
    | TaskRecord<TaskRecordParameters>
    | TaskDetail<TaskRecordParameters>
    | ICycleSubTaskDetailRecord;
  disabledSubmit?: boolean;
  result?: ITaskResult;
  showLog?: boolean;
  onReloadList: () => void;
  onDetailVisible: (record: TaskRecord<TaskRecordParameters>, visible: boolean) => void;
  onLogVisible: (recordId: number, visible: boolean, status: SubTaskStatus) => void;
  onExcecuteDetailVisible: (recordId: number, visible: boolean) => void;
  onClose?: () => void;
}
const ActionBar: React.FC<IProps> = inject(
  'taskStore',
  'settingStore',
  'modalStore',
)(
  observer((props) => {
    const {
      isDetailModal,
      record,
      taskId,
      showRollback,
      showLog,
      onLogVisible,
      onExcecuteDetailVisible,
    } = props;
    const [activeBtnKey, setActiveBtnKey] = useState(null);
    const resetActiveBtnKey = () => {
      setActiveBtnKey(null);
    };
    const _stopTask = async () => {
      setActiveBtnKey('stop');
      const res = await stopDataArchiveSubTask(taskId, record.id);
      if (res) {
        message.success(
          formatMessage({
            id: 'odc.component.CommonDetailModal.TaskTools.CanceledSuccessfully',
            defaultMessage: '取消成功',
          }), //取消成功
        );

        props.onReloadList();
      }
    };
    const confirmRollback = async () => {
      setActiveBtnKey('rollback');
      const res = await rollbackDataArchiveSubTask(taskId, record.id);
      if (res) {
        props.onReloadList();
        message.success(
          formatMessage({
            id: 'odc.component.CommonDetailModal.TaskTools.RollbackSucceeded',
            defaultMessage: '回滚成功',
          }), //回滚成功
        );
      }
    };

    useEffect(() => {
      if (activeBtnKey) {
        resetActiveBtnKey();
      }
    }, [record?.status]);
    const handleRollback = async () => {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.component.CommonDetailModal.TaskTools.AreYouSureYouWant',
          defaultMessage: '是否确定回滚任务？',
        }),
        //确定回滚任务吗？
        icon: <ExclamationCircleOutlined />,
        content: formatMessage({
          id: 'odc.component.CommonDetailModal.TaskTools.TasksThatHaveBeenExecuted',
          defaultMessage: '任务回滚后已执行的任务将重置',
        }),
        //任务回滚后已执行的任务将重置
        okText: formatMessage({
          id: 'odc.component.CommonDetailModal.TaskTools.Confirm',
          defaultMessage: '确认',
        }),
        //确认
        cancelText: formatMessage({
          id: 'odc.component.CommonDetailModal.TaskTools.Cancel',
          defaultMessage: '取消',
        }),
        //取消
        onOk: confirmRollback,
      });
    };
    const handleExecute = async () => {
      Modal.confirm({
        title: '是否确定执行任务?',
        icon: <ExclamationCircleOutlined />,
        okText: formatMessage({
          id: 'odc.component.CommonDetailModal.TaskTools.Confirm',
          defaultMessage: '确认',
        }),
        cancelText: formatMessage({
          id: 'odc.component.CommonDetailModal.TaskTools.Cancel',
          defaultMessage: '取消',
        }),
        onOk: confirmExecute,
      });
    };

    const confirmExecute = async () => {
      const res = await startDataArchiveSubTask(taskId, record.id);
      if (res) {
        message.success('发起执行成功');
        props.onReloadList();
      }
    };

    const handleReTry = async () => {
      const res = await startDataArchiveSubTask(taskId, record.id);
      if (res) {
        message.success(
          formatMessage({
            id: 'odc.component.CommonDetailModal.TaskTools.RetrySucceeded',
            defaultMessage: '重试成功',
          }), //重试成功
        );

        props.onReloadList();
      }
    };
    const handleLogVisible = async () => {
      onLogVisible(record.id, true, record?.status as SubTaskStatus);
    };
    const handleExcuteDetailVisible = () => {
      onExcecuteDetailVisible(record.id, true);
    };

    const getTaskTools = (_task) => {
      let tools = [];
      if (!_task) {
        return [];
      }
      const { status, jobGroup: type } = _task;
      const rollbackBtn = {
        key: 'rollback',
        text: formatMessage({
          id: 'odc.component.CommonDetailModal.TaskTools.Rollback',
          defaultMessage: '回滚',
        }),
        //回滚
        action: handleRollback,
        type: 'button',
      };
      const stopBtn = {
        key: 'stop',
        text: formatMessage({
          id: 'odc.component.CommonDetailModal.TaskTools.Termination',
          defaultMessage: '终止',
        }),
        //终止
        action: _stopTask,
        type: 'button',
      };
      const executeBtn = {
        key: 'execute',
        text: formatMessage({
          id: 'odc.component.CommonDetailModal.TaskTools.Execute',
          defaultMessage: '执行',
        }),
        //执行
        type: 'button',
        action: handleExecute,
        isOpenBtn: true,
        isPrimary: isDetailModal,
        disabled: false,
        tooltip: '',
      };
      const reTryBtn = {
        key: 'reTry',
        text: formatMessage({
          id: 'odc.component.CommonDetailModal.TaskTools.Retry',
          defaultMessage: '重试',
        }),
        //重试
        type: 'button',
        action: handleReTry,
      };
      const logBtn = {
        key: 'log',
        text: formatMessage({
          id: 'odc.src.component.Task.component.CommonDetailModal.ViewLog',
          defaultMessage: '查看日志',
        }), //'查看日志'
        action: handleLogVisible,
        type: 'button',
      };
      const excuteDetailBtn = {
        key: 'excuteDetail',
        text: formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.11BB8886',
          defaultMessage: '执行详情',
        }),
        action: handleExcuteDetailVisible,
        type: 'button',
      };
      switch (status) {
        case SubTaskStatus.PREPARING: {
          tools = [];
          break;
        }
        case SubTaskStatus.RUNNING: {
          tools = [stopBtn, logBtn];
          break;
        }
        case SubTaskStatus.CANCELED: {
          tools = [executeBtn, logBtn];
          break;
        }
        case SubTaskStatus.DONE: {
          tools = [rollbackBtn, logBtn];
          break;
        }
        case SubTaskStatus.FAILED: {
          tools = [reTryBtn, rollbackBtn, logBtn];
          break;
        }
        default:
      }
      if (
        [
          SubTaskType.DATA_ARCHIVE,
          SubTaskType.DATA_DELETE,
          SubTaskType.DATA_ARCHIVE_ROLLBACK,
          SubTaskType.DATA_ARCHIVE_DELETE,
        ].includes(type)
      ) {
        tools.unshift(excuteDetailBtn);
      }
      return tools;
    };
    const btnTools = getTaskTools(record)
      ?.filter((item) => item?.type === 'button')
      ?.filter((item) => (!showRollback ? item.key !== 'rollback' : true))
      ?.filter((item) => (!showLog ? item.key !== 'log' : true));
    const renderTool = (tool) => {
      const ActionButton = isDetailModal ? Action.Button : Action.Link;
      const disabled = activeBtnKey === tool?.key || tool?.disabled;
      if (tool.confirmText) {
        return (
          <Popconfirm title={tool.confirmText} onConfirm={tool.action}>
            <ActionButton disabled={disabled}>{tool.text}</ActionButton>
          </Popconfirm>
        );
      }
      if (tool.download) {
        return (
          <ActionButton disabled={disabled} onClick={tool.download}>
            {tool.text}
          </ActionButton>
        );
      }
      return (
        <ActionButton
          type={tool.isPrimary ? 'primary' : 'default'}
          disabled={disabled}
          onClick={tool.action}
          tooltip={isDetailModal ? tool?.tooltip : null}
        >
          <Tooltip placement="topRight" title={tool?.tooltip}>
            {tool.text}
          </Tooltip>
        </ActionButton>
      );
    };
    if (!btnTools?.length) {
      return <span>-</span>;
    }
    return (
      <Action.Group size={!isDetailModal ? 4 : 6}>
        {btnTools?.map((tool) => {
          return renderTool(tool);
        })}
      </Action.Group>
    );
  }),
);
export default ActionBar;
