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

import { getTypeCreateSQL } from '@/common/network/type';
import { ITypeForm, TypeCode } from '@/d.ts';
import { openCreateTypePage } from '@/store/helper/page';
import { ModalStore } from '@/store/modal';
import { useDBSession } from '@/store/sessionManager/hooks';
import { formatMessage } from '@/util/intl';
import { Button, Form, Input, Modal, Select, Space } from 'antd';
import { inject, observer } from 'mobx-react';
import { useState } from 'react';

interface IProps {
  modalStore?: ModalStore;
}

export enum CheckOption {
  NONE = 'NONE',
}

const { Option } = Select;

function CreateTypeModal(props: IProps) {
  const { modalStore } = props;
  const [loading, setLoading] = useState(false);
  const [formRef] = Form.useForm();
  const { session } = useDBSession(modalStore?.createTypeModalData?.databaseId);

  const handleSwitchLoading = (loading: boolean) => {
    setLoading(loading);
  };

  const handleCancel = () => {
    handleSwitchLoading(false);
    props.modalStore.changeCreateTypeModalVisible(false);
  };

  const handleConfirm = () => {
    formRef
      .validateFields()
      .then(async (values: ITypeForm) => {
        const { modalStore } = props;
        handleSwitchLoading(true);
        const sql = await getTypeCreateSQL(
          values.typeName,
          values,
          session?.sessionId,
          modalStore.createTypeModalData.dbName,
        );
        openCreateTypePage(sql, session?.odcDatabase?.id, modalStore.createTypeModalData.dbName);
        handleSwitchLoading(false);
        modalStore.changeCreateTypeModalVisible(false);
      })
      .catch((errorInfo) => {
        throw new Error({ ...errorInfo });
      });
  };

  return (
    <Modal
      width={480}
      destroyOnClose
      title={formatMessage({ id: 'odc.component.CreateTypeModal.NewType' })}
      /* 新建类型 */
      open={modalStore.createTypeModalVisible}
      onCancel={handleCancel}
      maskClosable={false}
      centered
      footer={
        <Space>
          <Button onClick={handleCancel}>
            {
              formatMessage({
                id: 'odc.component.CreateTypeModal.Cancel',
              })
              /* 取消 */
            }
          </Button>
          <Button type="primary" loading={loading} onClick={handleConfirm}>
            {
              formatMessage({
                id: 'odc.component.CreateTypeModal.NextConfirmTheSqlStatement',
              })
              /* 下一步: 确认SQL */
            }
          </Button>
        </Space>
      }
    >
      <Form form={formRef} layout="vertical" requiredMark={false} onFinish={handleConfirm}>
        <Form.Item
          name="typeName"
          label={formatMessage({
            id: 'odc.component.CreateTypeModal.Type.1',
          })} /* 类型名称 */
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.component.CreateTypeModal.EnterATypeName',
              }),
              // 请输入类型名称
            },
            {
              max: 128,
              message: formatMessage({
                id: 'odc.component.CreateTypeModal.TheLengthCannotExceedCharacters',
              }),

              // 长度不超过 128 个字符
            },
          ]}
        >
          <Input
            placeholder={formatMessage({
              id: 'odc.component.CreateTypeModal.EnterATypeName',
            })}
          />
        </Form.Item>
        <Form.Item
          name="typeCode"
          label={formatMessage({ id: 'odc.component.CreateTypeModal.Type' })}
          /* 类型 */
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.component.CreateTypeModal.TheTypeMustBeSpecified',
              }),

              // 类型不能为空
            },
          ]}
          initialValue={TypeCode.OBJECT}
          style={{ width: '144px' }}
        >
          <Select
            placeholder={formatMessage({
              id: 'odc.component.CreateTypeModal.EnterAType',
            })}

            /* 请输入类型 */
          >
            <Option value={TypeCode.OBJECT}>
              {
                formatMessage({
                  id: 'odc.component.CreateTypeModal.ObjectType',
                })
                /* 对象类型 */
              }
            </Option>
            <Option value={TypeCode.VARRAY}>
              {
                formatMessage({
                  id: 'odc.component.CreateTypeModal.ArrayType',
                })
                /* 数组类型 */
              }
            </Option>
            <Option value={TypeCode.TABLE}>
              {
                formatMessage({
                  id: 'odc.component.CreateTypeModal.TableType',
                })
                /* 表类型 */
              }
            </Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default inject('modalStore')(observer(CreateTypeModal));
