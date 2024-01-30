import { updateEnvironment, createEnvironment } from '@/common/network/env';
import { EnvColorMap } from '@/constant';
import { IEnvironment } from '@/d.ts/environment';
import { message, Modal, Button, Form, Input, Tag, Select, SelectProps } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useState, useEffect } from 'react';
import styles from './index.less';
import { CheckOutlined } from '@ant-design/icons';
import HelpDoc from '@/component/helpDoc';

export const FormEnvironmentModal: React.FC<{
  isEdit?: boolean;
  currentEnvironment: IEnvironment;
  formEnvironmentModalOpen: boolean;
  options: SelectProps['options'];
  handleCancelFormModal: () => void;
  callback: () => void;
}> = ({
  isEdit = false,
  currentEnvironment = null,
  formEnvironmentModalOpen,
  options = [],
  handleCancelFormModal,
  callback,
}) => {
  const [formRef] = useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const handleSubmit = async () => {
    if (isEdit && currentEnvironment?.builtIn) {
      return;
    }
    const formData = await formRef.validateFields()?.catch();
    let successful;
    setLoading(true);
    if (isEdit) {
      successful = await updateEnvironment(currentEnvironment?.id, formData);
    } else {
      formData.enabled = true;
      successful = await createEnvironment(formData);
    }
    setLoading(false);
    if (successful) {
      message.success(currentEnvironment ? '保存成功' : '新建成功');
      currentEnvironment && (await callback?.());
      return;
    }
    message.error(currentEnvironment ? '保存失败' : '新建失败');
  };
  useEffect(() => {
    if (formEnvironmentModalOpen) {
      if (isEdit) {
        formRef.setFieldsValue({
          name: currentEnvironment?.name,
          style: currentEnvironment?.style,
          description: currentEnvironment?.description,
        });
      } else {
        formRef.setFieldsValue({
          copiedRulesetId: options?.[0]?.value,
        });
      }
    } else {
      formRef.resetFields();
    }
  }, [formEnvironmentModalOpen]);
  return (
    <Modal
      destroyOnClose
      title={isEdit ? '编辑环境' : '新建环境'}
      width={580}
      open={formEnvironmentModalOpen}
      onCancel={handleCancelFormModal}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleCancelFormModal}>取消</Button>
          <Button type="primary" loading={loading} disabled={loading} onClick={handleSubmit}>
            {isEdit ? '保存' : '新建'}
          </Button>
        </div>
      }
    >
      <Form form={formRef} layout="vertical" requiredMark="optional">
        <Form.Item
          label="环境名称"
          name="name"
          rules={[
            {
              required: true,
              message: '请输入环境名称',
            },
            {
              max: 8,
              message: '环境名称最大长度为8',
            },
          ]}
        >
          <Input disabled={isEdit} style={{ width: '240px' }} placeholder="请输入环境名称" />
        </Form.Item>
        <Form.Item
          label="标签样式"
          name="style"
          rules={[
            {
              required: true,
              message: '请选择标签样式',
            },
          ]}
        >
          <TagSelector />
        </Form.Item>
        {isEdit ? null : (
          <Form.Item
            shouldUpdate
            label={
              <HelpDoc leftText isTip doc="copiedRulesetId">
                引用环境
              </HelpDoc>
            }
            name="copiedRulesetId"
            rules={[
              {
                required: true,
                message: '请选择引用环境',
              },
            ]}
          >
            <Select style={{ width: '240px' }} options={options} />
          </Form.Item>
        )}
        <Form.Item
          label="描述"
          name="description"
          rules={[
            {
              max: 200,
              message: '最大长度为200',
            },
          ]}
        >
          <Input.TextArea
            placeholder="请输入描述"
            maxLength={200}
            rows={5}
            style={{
              resize: 'none',
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const items = Object.keys(EnvColorMap);
const TagSelector: React.FC<{
  value?: string;
  onChange?: (value: string) => void;
}> = ({ value, onChange }) => {
  const [tag, setTag] = useState<string>(value || items?.[0]);
  const handleTagSelect = (selectedTag: string) => {
    setTag(selectedTag);
    onChange(selectedTag);
  };
  useEffect(() => {
    if (value) {
      setTag(value);
    }
  }, [value]);
  return (
    <div className={styles.tagSelector}>
      {items?.map((item) => {
        return (
          <Tag
            key={item}
            data-color={item}
            onClick={() => handleTagSelect(item?.toUpperCase())}
            style={{
              background: EnvColorMap[item?.toUpperCase()]?.background,
              color: EnvColorMap[item?.toUpperCase()]?.textColor,
              borderColor: EnvColorMap[item?.toUpperCase()]?.borderColor,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            color={item?.toLocaleLowerCase()}
          >
            {item === tag && <CheckOutlined style={{ color: 'var(--text-color-secondary)' }} />}
          </Tag>
        );
      })}
    </div>
  );
};
