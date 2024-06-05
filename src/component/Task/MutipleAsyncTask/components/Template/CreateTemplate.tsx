import { createTemplate, existsTemplateName } from '@/common/network/databaseChange';
import login from '@/store/login';
import { FormInstance, Form, message, Modal, Input } from 'antd';
import { useContext } from 'react';
import { MultipleAsyncContext } from '../../CreateModal/MultipleAsyncContext';
import styles from './index.less';

const CreateTemplate: React.FC<{
  form: FormInstance<any>;
  createTemplateModalOpen: boolean;
  setCreateTemplateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ form, createTemplateModalOpen, setCreateTemplateModalOpen }) => {
  const { projectId } = useContext(MultipleAsyncContext);
  const [formRef] = Form.useForm();
  const handleSubmit = async () => {
    const orders = await form.getFieldValue(['orders']);
    const { name } = await formRef.validateFields().catch();
    const response = await createTemplate(
      {
        projectId,
        orders,
        name,
      },
      login.organizationId?.toString(),
    );
    if (response) {
      message.success('模版保存成功');
      setCreateTemplateModalOpen(false);
      formRef.resetFields();
    } else {
      message.error('模版保存失败');
    }
  };

  const checkNameRepeat = async (ruler, value) => {
    const name = value?.trim();
    if (!name) {
      return;
    }
    const isRepeat = await existsTemplateName(name, projectId, login.organizationId?.toString());
    if (isRepeat) {
      throw new Error();
    }
  };
  return (
    <Modal
      open={createTemplateModalOpen}
      title="保存模版"
      width={480}
      destroyOnClose
      closable
      okText="确定"
      cancelText="取消"
      onCancel={() => {
        setCreateTemplateModalOpen(false);
      }}
      onOk={handleSubmit}
    >
      <div className={styles.createTemplate}>
        <div className={styles.tip}>
          将当前数据库配置保存为模版，可用于当前项目内快速发起多库变更
        </div>
        <Form requiredMark="optional" layout="vertical" form={formRef}>
          <Form.Item
            required
            label="模版名称"
            name="name"
            validateTrigger="onBlur"
            rules={[
              {
                required: true,
                message: '请输入模版名称',
              },
              {
                message: '模版名称已存在',
                required: true,
                validator: checkNameRepeat,
              },
            ]}
          >
            <Input placeholder="请输入" style={{ width: '320px' }} />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateTemplate;
