import { formatMessage } from '@/util/intl';
import { inject, observer } from 'mobx-react';
import React, { useCallback, useEffect, useRef } from 'react';
// compatible
import type { IProcedure } from '@/d.ts';
import { DbObjectType } from '@/d.ts';
import type { ConnectionStore } from '@/store/connection';
import { openCreateProcedurePage } from '@/store/helper/page';
import type { ModalStore } from '@/store/modal';
import type { SchemaStore } from '@/store/schema';
import { Form, Input, message, Modal } from 'antd';
import { useForm } from 'antd/es/form/Form';
import ProcedureParam from '../ProcedureParam';

interface IProps {
  schemaStore?: SchemaStore;
  connectionStore?: ConnectionStore;
  modalStore?: ModalStore;
  model?: Partial<IProcedure>;
}

const CreateProcedureModal: React.FC<IProps> = inject(
  'schemaStore',
  'connectionStore',
  'modalStore',
)(
  observer((props) => {
    const { connectionStore, modalStore, schemaStore } = props;
    const [form] = useForm();
    const visible = modalStore.createProcedureModalVisible;
    const paramsRef = useRef<{
      getRows: () => any[];
    }>();

    const onCancel = useCallback(() => {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.component.CreateProcedureModal.ConfirmToClose',
        }), // 确认关闭
        content: formatMessage({
          id: 'odc.component.CreateProcedureModal.CurrentPopUpDataWill',
        }), // 当前弹窗数据将清空
        onOk: () => {
          modalStore.changeCreateProcedureModalVisible(false);
        },
      });
    }, [modalStore]);

    const onSave = useCallback(
      async (prod: IProcedure) => {
        const sql = await schemaStore!.getProcedureCreateSQL(prod.proName, prod);
        if (!sql) {
          return;
        }
        await openCreateProcedurePage(sql);
        modalStore.changeCreateProcedureModalVisible(false);
      },
      [modalStore],
    );

    const save = useCallback(async () => {
      const data = await form.validateFields();
      if (!data) {
        return;
      }
      data.params = paramsRef.current.getRows();
      // 有空的字段
      if (data.params.filter((p: any) => !p.paramName).length > 0) {
        message.error(
          formatMessage({
            id: 'workspace.window.createFunction.params.validation',
          }),
        );
        return;
      }

      // 有空的数据类型
      if (data.params.filter((p: any) => !p.dataType).length > 0) {
        message.error(
          formatMessage({
            id: 'workspace.window.createFunction.dataType.validation',
          }),
        );
        return;
      }

      onSave(data);
    }, [onSave, form]);
    useEffect(() => {
      if (visible) {
        form.resetFields();
      }
    }, [visible]);
    return (
      <Modal
        centered={true}
        width={760}
        destroyOnClose={true}
        title={formatMessage({
          id: 'workspace.window.createProcedure.modal.title',
        })}
        visible={visible}
        onOk={save}
        onCancel={onCancel}
      >
        <Form form={form} requiredMark="optional" layout="vertical">
          <Form.Item
            name="proName"
            label={formatMessage({
              id: 'workspace.window.createProcedure.proName',
            })}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'workspace.window.createProcedure.proName.validation',
                }),
              },
            ]}
          >
            <Input
              style={{
                width: 320,
              }}
              placeholder={formatMessage({
                id: 'workspace.window.createProcedure.proName.placeholder',
              })}
            />
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'workspace.window.createFunction.params',
            })}
          >
            <ProcedureParam
              mode={DbObjectType.procedure}
              dbMode={connectionStore.connection?.dbMode}
              paramsRef={paramsRef}
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }),
);

export default CreateProcedureModal;
