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

import { formatMessage } from '@/util/intl';
import { Button, Modal, Table, Checkbox, Space, Tooltip, message } from 'antd';
import useAsyncTaskTable from './hooks/useTaskTable';
import type { AsyncTaskModalConfig } from './hooks/useTaskTable';
import React, { useState, useEffect, useMemo } from 'react';
import styles from './index.less';
import SubmitTripartiteTaskButton from './SubmitTripartiteTaskButton';
import { getExportListView } from '@/common/network/task';
import { ScheduleExportListView } from '@/d.ts/migrateTask';
import { TaskType } from '@/d.ts';
import datasourceStatus from '@/store/datasourceStatus';
import { isScheduleMigrateTask } from './helper';
import { ScheduleType } from '@/d.ts/schedule';

export interface IAsyncTaskOperationConfig extends AsyncTaskModalConfig {
  buttonText: string;
  buttonDisabledText: string;
  buttonType: 'primary' | 'default' | 'text';
}

export function AsyncTaskOperationButton(props: IAsyncTaskOperationConfig) {
  const {
    visible,
    setVisible,
    riskConfirmed,
    setRiskConfirmed,
    confirmRiskUnFinished,
    setConfirmRiskUnFinished,
    showModal,
    hideModal,
    exportSpaceScopes,
    handleExportSpaceScopesChange,
  } = useAsyncTaskTable();

  const [isSubmitButtonLoading, setIsSubmitButtonLoading] = useState(false);
  const [taskList, setTaskList] = useState<ScheduleExportListView[]>();

  useEffect(() => {
    if (visible && props.dataSource) {
      updateTaskList();
    }
  }, [props.dataSource, visible]);

  const updateTaskList = async () => {
    if (!props.dataSource?.length) {
      return;
    }
    const scheduleType = props?.dataSource?.[0]?.type as unknown as ScheduleType;
    if (isScheduleMigrateTask(scheduleType)) {
      const res = await getExportListView({
        ids: props?.dataSource?.map((i) => i?.id),
        scheduleType,
      });
      setTaskList(
        scheduleType === ScheduleType.PARTITION_PLAN
          ? res?.map((i) => {
              return {
                ...i,
                scheduleStatus: props?.dataSource?.find((_t) => _t?.id === i?.id)?.status,
                creator: props?.dataSource?.find((_t) => _t?.id === i?.id)?.creator,
              };
            })
          : res?.map((i) => {
              return {
                ...i,
                creator: props?.dataSource?.find((_t) => _t?.id === i?.id)?.creator,
              };
            }),
      );
      datasourceStatus.asyncUpdateStatus(
        res?.map((a) => a.database?.dataSource?.id)?.filter(Boolean),
      );
    } else {
      setTaskList(
        props?.dataSource?.map((i) => {
          return {
            ...i,
            scheduleStatus: i?.status,
            scheduleType: i?.type,
            id: i?.id,
            databaseId: i?.database?.id,
            database: i?.database,
            description: i?.description,
            creatorId: i?.creator?.id,
            creator: i?.creator,
            createTime: i?.createTime,
          } as ScheduleExportListView;
        }),
      );
    }
  };

  const taskListThatCanBeAction = useMemo(() => {
    return taskList?.filter((i) => !!i?.database);
  }, [taskList]);

  const onOpenModal = async () => {
    if (!props?.dataSource?.length) {
      message.info(
        formatMessage({
          id: 'src.component.Task.component.AsyncTaskOperationButton.D9D9A882',
          defaultMessage: '请先选择工单',
        }),
      );
      return;
    }
    if (props?.dataSource?.find((d) => !props?.checkStatus?.(d))) {
      message.info(props?.checkStatusFailed);
      return;
    }

    await updateTaskList();
    showModal();
  };

  const cancel = () => {
    setVisible(false);
    setRiskConfirmed(false);
    setConfirmRiskUnFinished(false);
  };

  return (
    <>
      <Tooltip title={isSubmitButtonLoading ? props.buttonDisabledText : ''}>
        <Button type={props.buttonType} onClick={onOpenModal} disabled={isSubmitButtonLoading}>
          {props.buttonText}
        </Button>
      </Tooltip>

      <Modal
        visible={visible}
        onCancel={hideModal}
        title={props.modalTitle}
        width={960}
        cancelText={formatMessage({
          id: 'src.component.Task.component.AsyncTaskOperationButton.683E8B65',
          defaultMessage: '取消',
        })}
        okText={props.confirmButtonText}
        className={styles.modal}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {props.needRiskConfirm ? (
              <Checkbox
                checked={riskConfirmed}
                onChange={(e) => {
                  setRiskConfirmed(e.target.checked);
                  if (e.target.checked) {
                    setConfirmRiskUnFinished(false);
                  }
                }}
                style={{
                  color: confirmRiskUnFinished ? 'red' : 'inherit',
                }}
                className={confirmRiskUnFinished ? styles.checkboxError : null}
              >
                {formatMessage({
                  id: 'src.component.Task.component.AsyncTaskOperationButton.2D7C7380',
                  defaultMessage: '我已确认相关业务风险',
                })}
              </Checkbox>
            ) : (
              <span />
            )}
            <Space>
              <Button onClick={cancel}>
                {formatMessage({
                  id: 'src.component.Task.component.AsyncTaskOperationButton.77F8A0C3',
                  defaultMessage: '取消',
                })}
              </Button>
              <SubmitTripartiteTaskButton
                closeModal={cancel}
                disabled={taskListThatCanBeAction?.length === 0}
                tasks={taskListThatCanBeAction}
                asyncTaskType={props.asyncTaskType}
                config={props}
                riskConfirmed={riskConfirmed}
                setConfirmRiskUnFinished={setConfirmRiskUnFinished}
                setIsSubmitButtonLoading={setIsSubmitButtonLoading}
                onReload={props.onReload}
              />
            </Space>
          </div>
        }
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {props.modalExtra(
            taskListThatCanBeAction?.length,
            taskList?.filter((i) => !i?.database)?.map((i) => i?.id),
          )}
          <Table
            size="small"
            dataSource={taskListThatCanBeAction}
            columns={props.columns}
            locale={{
              emptyText:
                exportSpaceScopes.length === 0
                  ? formatMessage({
                      id: 'src.component.Task.component.AsyncTaskOperationButton.0CF28A22',
                      defaultMessage: '请选择导出范围',
                    })
                  : formatMessage({
                      id: 'src.component.Task.component.AsyncTaskOperationButton.4FFB45A0',
                      defaultMessage: '暂无数据',
                    }),
            }}
          />
        </Space>
      </Modal>
    </>
  );
}
