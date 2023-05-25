import {
  createTaskFlow,
  getTaskFlowDetail,
  getTaskFlowExists,
  updateTaskFlow,
} from '@/common/network/manager';
import { IManagerIntegration, IManagerRole } from '@/d.ts';
import { validTrimEmptyWithWarn } from '@/util/valid';
import { Button, Drawer, Form, Input, message, Modal, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import React, { useEffect, useState } from 'react';
import { AuthNode } from '../AuthNode';
import styles from './index.less';

interface IProps {
  visible: boolean;
  editId: number;
  roles: IManagerRole[];
  integrations: IManagerIntegration[];
  onClose: () => void;
  reloadData: () => void;
}

const FormModal: React.FC<IProps> = (props) => {
  const [hasChange, setHasChange] = useState(false);
  const [builtIn, setBuiltIn] = useState(false);
  const [originName, setOriginName] = useState('');
  const [form] = useForm();
  const { visible, editId, roles, integrations } = props;
  const isEdit = !!editId;
  const submitText = isEdit ? '保存' : '新建';

  useEffect(() => {
    if (editId) {
      loadEditData(editId);
    } else {
      setBuiltIn(false);
    }
  }, [editId]);

  async function loadEditData(_editId: number) {
    const data = await getTaskFlowDetail(_editId);
    const formData = {
      ...data,
    };
    form.setFieldsValue(formData);
    setBuiltIn(formData.builtIn);
  }

  async function handleSubmit() {
    const configValues = await form.validateFields().catch();
    const formData = {
      ...configValues,
    };

    if (editId) {
      handleEdit({ ...formData, id: editId });
    } else {
      handleCreate(formData);
    }
  }

  async function handleCreate(values: any) {
    const data = await createTaskFlow(values);
    if (data) {
      message.success('流程创建成功');
      props.reloadData();
      handleClose();
    } else {
      message.error('流程创建失败');
    }
  }

  async function handleEdit(values) {
    const data = await updateTaskFlow(values);
    if (data) {
      message.success('流程保存成功');
      props.reloadData();
      props.onClose();
    } else {
      message.error('流程保存失败');
    }
  }

  function handleCancel(_isEdit: boolean) {
    if (hasChange) {
      Modal.confirm({
        title: _isEdit ? '确定要取消编辑吗？取消保存后，所编辑的内容将不生效' : '确定要取消新建吗?',
        cancelText: '取消',
        okText: '确定',
        centered: true,
        onOk: () => {
          setHasChange(false);
          handleClose();
        },
      });
    } else {
      handleClose();
    }
  }

  function handleClose() {
    props.onClose();
  }

  const checkNameRepeat = async (ruler, value) => {
    const name = value?.trim();
    if (!name || (isEdit && originName === name)) {
      return;
    }
    const isRepeat = await getTaskFlowExists(name);
    if (isRepeat) {
      throw new Error();
    }
  };

  return (
    <Drawer
      width={720}
      title={isEdit ? '编辑审批流程' : '新建审批流程'}
      className={styles.taskModal}
      footer={
        <Space>
          <Button
            onClick={() => {
              handleCancel(isEdit);
            }}
          >
            取消
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            {submitText}
          </Button>
        </Space>
      }
      destroyOnClose
      visible={visible}
      onClose={() => {
        handleCancel(isEdit);
      }}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        initialValues={
          !isEdit
            ? {
                approvalNodes: [{}],
              }
            : null
        }
      >
        <Form.Item
          label="流程名称"
          name="name"
          validateTrigger="onBlur"
          rules={[
            {
              required: true,
              message: '请输入流程名称',
            },
            {
              max: 128,
              message: '流程名称不超过 128 个字符',
            },
            {
              validator: validTrimEmptyWithWarn('流程名称首尾包含空格'),
            },
            {
              message: '流程名称已存在',
              validator: checkNameRepeat,
            },
          ]}
        >
          <Input placeholder="请输入任务流程名称" />
        </Form.Item>
        <Form.Item className={styles.taskProcess} label="设置审批节点" required>
          <AuthNode roles={roles} integrations={integrations} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default FormModal;
