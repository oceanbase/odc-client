import { batchUpdateSensitiveColumn } from '@/common/network/sensitiveColumn';
import { formatMessage } from '@/util/intl';
import { Form, message, Modal, Select } from 'antd';
import { useForm } from 'antd/es/form/Form';
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
      message.success(
        formatMessage({
          id: 'odc.SensitiveColumn.components.EditSensitiveColumnModal.UpdatedSuccessfully',
        }), //更新成功
      );
      setModalVisible(false);
      tableRef.current?.reload();
      initSensitiveColumn();
    } else {
      message.success(
        formatMessage({
          id: 'odc.SensitiveColumn.components.EditSensitiveColumnModal.UpdateFailed',
        }), //更新失败
      );
    }
  };
  return (
    <Modal
      width={400}
      title={formatMessage({
        id: 'odc.SensitiveColumn.components.EditSensitiveColumnModal.EditSensitiveColumns',
      })} /*编辑敏感列*/
      open={modalVisible}
      onCancel={onCancel}
      afterClose={afterClose}
      className={styles.modal}
      onOk={onOk}
    >
      <Form form={formRef} requiredMark="optional" layout="vertical">
        <Form.Item
          required
          label={
            formatMessage({
              id:
                'odc.SensitiveColumn.components.EditSensitiveColumnModal.DesensitizationAlgorithm',
            }) //脱敏算法
          }
          name="maskingAlgorithmId"
          rules={[
            {
              required: true,
              message: formatMessage({
                id:
                  'odc.SensitiveColumn.components.EditSensitiveColumnModal.SelectADesensitizationAlgorithm',
              }), //请选择脱敏算法
            },
          ]}
        >
          <Select
            placeholder={
              formatMessage({
                id: 'odc.SensitiveColumn.components.EditSensitiveColumnModal.PleaseSelect',
              }) //请选择
            }
            style={{ width: '368px' }}
            options={maskingAlgorithmOptions}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditModal;
