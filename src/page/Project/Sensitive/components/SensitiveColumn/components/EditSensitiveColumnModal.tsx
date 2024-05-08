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

import { batchUpdateSensitiveColumn } from '@/common/network/sensitiveColumn';
import { maskRuleTypeMap } from '@/page/Secure/MaskingAlgorithm';
import { formatMessage } from '@/util/intl';
import { Form, message, Modal, Select } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { PopoverContainer } from '..';
import styles from './index.less';
const EditSensitiveColumnModal = ({
  projectId,
  tableRef,
  maskingAlgorithmId = 1,
  sensitiveColumnIds = [],
  maskingAlgorithmOptions = [],
  maskingAlgorithms,
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
      tableRef.current?.resetSelectedRows();
      initSensitiveColumn();
    } else {
      message.error(
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
      })}
      /*编辑敏感列*/ open={modalVisible}
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
              id: 'odc.SensitiveColumn.components.EditSensitiveColumnModal.DesensitizationAlgorithm',
            }) //脱敏算法
          }
          name="maskingAlgorithmId"
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.SensitiveColumn.components.EditSensitiveColumnModal.SelectADesensitizationAlgorithm',
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
            optionLabelProp="label"
          >
            {maskingAlgorithmOptions?.map((option, index) => {
              const target = maskingAlgorithms?.find(
                (maskingAlgorithm) => maskingAlgorithm?.id === option?.value,
              );
              return (
                <Select.Option value={option?.value} key={index} label={option?.label}>
                  <PopoverContainer
                    key={index}
                    title={option?.label}
                    descriptionsData={[
                      {
                        label: formatMessage({
                          id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.DesensitizationMethod.1',
                        }), //'脱敏方式'
                        value: maskRuleTypeMap?.[target?.type],
                      },
                      {
                        label: formatMessage({
                          id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.TestData.1',
                        }), //'测试数据'
                        value: target?.sampleContent,
                      },
                      {
                        label: formatMessage({
                          id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.Preview.1',
                        }), //'结果预览'
                        value: target?.maskedContent,
                      },
                    ]}
                    children={() => <div>{option?.label}</div>}
                  />
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default EditSensitiveColumnModal;
