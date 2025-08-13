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

const Message = {
  task: {
    title: '提交工单',
    label: '工单名称',
    rulesMessage: '请输入工单名称',
  },
  schedule: {
    title: '提交作业',
    label: '作业名称',
    rulesMessage: '请输入作业名称',
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
      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item
          rules={[{ required: true, message: info?.rulesMessage }]}
          name={'Name'}
          label={info?.label}
        >
          <Input maxLength={200} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default inject('modalStore')(observer(CreateTaskConfirmModal));
