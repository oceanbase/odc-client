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
import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Input } from 'antd';
import { inject, observer } from 'mobx-react';
import { IDatabase } from '@/d.ts/database';
import { getDefaultName } from './helper';

interface IProps {
  onOk?: (Name: string) => void;
  open: boolean;
  setOpen: (data: boolean) => void;
  database: IDatabase;
  initName?: string;
  isSchedule?: boolean;
}

export const MaximumCharacterLength = 200;

const Message = {
  task: {
    title: formatMessage({
      id: 'src.component.Task.component.CreateTaskConfirmModal.A2EA4CF7',
      defaultMessage: '提交工单',
    }),
    label: formatMessage({
      id: 'src.component.Task.component.CreateTaskConfirmModal.88AFCCBD',
      defaultMessage: '工单名称',
    }),
    rulesMessage: formatMessage({
      id: 'src.component.Task.component.CreateTaskConfirmModal.F47AB23A',
      defaultMessage: '请输入工单名称',
    }),
  },
  schedule: {
    title: formatMessage({
      id: 'src.component.Task.component.CreateTaskConfirmModal.2C060F14',
      defaultMessage: '提交作业',
    }),
    label: formatMessage({
      id: 'src.component.Task.component.CreateTaskConfirmModal.A0B19F05',
      defaultMessage: '作业名称',
    }),
    rulesMessage: formatMessage({
      id: 'src.component.Task.component.CreateTaskConfirmModal.3E0F7267',
      defaultMessage: '请输入作业名称',
    }),
  },
};
const CreateTaskConfirmModal: React.FC<IProps> = ({
  onOk,
  open,
  setOpen,
  database,
  initName,
  isSchedule = false,
}) => {
  const [form] = Form.useForm();
  const info = isSchedule ? Message.schedule : Message.task;

  useEffect(() => {
    if (initName) {
      form.setFieldValue('Name', initName);
    } else if (open && database) {
      form.setFieldValue('Name', getDefaultName(database));
    }
  }, [open, database]);

  return (
    <Modal
      title={info?.title}
      onOk={async () => {
        const value = await form.validateFields();
        onOk?.(value.Name);
        setOpen(false);
      }}
      open={open}
      onCancel={async () => {
        setOpen(false);
      }}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          rules={[
            {
              validator: (_, value) => {
                if (!value || value.trim() === '') {
                  return Promise.reject(
                    new Error(
                      formatMessage({
                        id: 'src.component.Task.component.CreateTaskConfirmModal.686F0604',
                        defaultMessage: '请输入作业名称',
                      }),
                    ),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
          name={'Name'}
          label={info?.label}
        >
          <Input maxLength={MaximumCharacterLength} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default inject('modalStore')(observer(CreateTaskConfirmModal));
