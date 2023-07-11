import { batchUpdateSensitiveColumn } from '@/common/network/sensitiveColumn';
import { Form, message, Modal, Select } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect } from 'react';
import styles from './index.less';

const EditModal = ({
  projectId,
  tableRef,
  maskingAlgorithmId = 1,
  sensitiveColumnIds = [],
  maskingAlgorithmOptions = [],
  modalVisible,
  setModalVisible,
  initSensitiveColumn,
}) => {
  const [formRef] = useForm();
  const onCancel = () => {
    setModalVisible(false);
  };
  const afterClose = () => {
    formRef.resetFields();
  };
  const onOk = async () => {
    const rawData = await formRef.validateFields().catch();
    const successful = await batchUpdateSensitiveColumn(projectId, {
      sensitiveColumnIds,
      maskingAlgorithmId: rawData.maskingAlgorithmId,
    });
    if (successful) {
      message.success('更新成功');
      setModalVisible(false);
      tableRef.current?.reload();
      tableRef.current?.resetSelectedRows();
      initSensitiveColumn();
    } else {
      message.success('更新失败');
    }
  };
  useEffect(() => {
    if (modalVisible) {
      formRef.setFieldsValue({
        maskingAlgorithmId,
      });
    }
  }, [modalVisible]);
  return (
    <Modal
      width={400}
      title="编辑敏感列"
      open={modalVisible}
      onCancel={onCancel}
      afterClose={afterClose}
      className={styles.modal}
      onOk={onOk}
    >
      <Form form={formRef} requiredMark="optional" layout="vertical">
        <Form.Item
          required
          label={'脱敏算法'}
          name="maskingAlgorithmId"
          rules={[
            {
              required: true,
              message: '请选择脱敏算法',
            },
          ]}
        >
          <Select
            placeholder={'请选择'}
            style={{ width: '368px' }}
            options={maskingAlgorithmOptions}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditModal;
