import { formatMessage } from '@/util/intl';
import { inject, observer } from 'mobx-react';
import React, { useCallback, useEffect, useRef } from 'react';
// compatible
import FunctionOrProcedureParams from '@/component/ProcedureParam';
import type { IFunction } from '@/d.ts';
import { ConnectionMode, DbObjectType } from '@/d.ts';
import { openCreateFunctionPageByRemote } from '@/store/helper/page';
import type { ModalStore } from '@/store/modal';
import { SessionManagerStore } from '@/store/sessionManager';
import { AutoComplete, Col, Form, Input, message, Modal, Row } from 'antd';
import { useForm } from 'antd/es/form/Form';

interface IProps {
  modalStore?: ModalStore;
  sessionManagerStore?: SessionManagerStore;
  model?: Partial<IFunction>;
}

export enum CheckOption {
  NONE = 'NONE',
}

const CreateFunctionModal: React.FC<IProps> = inject(
  'modalStore',
  'sessionManagerStore',
)(
  observer((props: IProps) => {
    const { modalStore, model, sessionManagerStore } = props;
    const sessionId = modalStore?.createFunctionModalData?.sessionId;
    const dbName = modalStore?.createFunctionModalData?.dbName;
    const session = sessionManagerStore.sessionMap.get(sessionId);
    const dbMode = session?.connection?.dialectType || ConnectionMode.OB_MYSQL;
    const [form] = useForm();
    const visible = modalStore.createFunctionModalVisible;
    const paramsRef = useRef<{
      getRows: () => any[];
    }>();

    const onCancel = useCallback(() => {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.component.CreateFunctionModal.ConfirmToClose',
        }), // 确认关闭
        content: formatMessage({
          id: 'odc.component.CreateFunctionModal.CurrentPopUpDataWill',
        }), // 当前弹窗数据将清空
        onOk: () => {
          modalStore.changeCreateFunctionModalVisible(false);
        },
      });
    }, [modalStore]);

    const onSave = useCallback(
      async (func: IFunction) => {
        await openCreateFunctionPageByRemote(func, sessionId, dbName);
        modalStore.changeCreateFunctionModalVisible(false);
      },
      [modalStore, sessionId, dbName],
    );

    const save = useCallback(async () => {
      const data = await form.validateFields();
      if (!data) {
        return;
      }
      data.params = paramsRef.current?.getRows();
      // // 校验函数参数
      // if (!data.params || data.params.length === 0) {
      //   return;
      // }

      // 有空的字段
      if (data.params.filter((p: { paramName: any }) => !p.paramName).length > 0) {
        message.error(
          formatMessage({
            id: 'workspace.window.createFunction.params.validation',
          }),
        );

        return;
      }

      // 有空的数据类型
      if (data.params.filter((p: { dataType: any }) => !p.dataType).length > 0) {
        message.error(
          formatMessage({
            id: 'workspace.window.createFunction.dataType.validation',
          }),
        );

        return;
      }

      onSave(data);
    }, [onSave, form, paramsRef]);
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
          id: 'workspace.window.createFunction.modal.title',
        })}
        visible={visible}
        onOk={save}
        onCancel={onCancel}
      >
        <Form requiredMark="optional" layout="vertical" form={form} initialValues={{ ...model }}>
          <Row>
            <Col span={12}>
              <Form.Item
                name="funName"
                label={formatMessage({
                  id: 'workspace.window.createFunction.funName',
                })}
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'workspace.window.createFunction.funName.validation',
                    }),
                  },
                ]}
              >
                <Input
                  style={{
                    width: 320,
                  }}
                  placeholder={formatMessage({
                    id: 'workspace.window.createFunction.funName.placeholder',
                  })}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="returnType"
                label={formatMessage({
                  id: 'workspace.window.createFunction.returnType',
                })}
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'workspace.window.createFunction.returnType.validation',
                    }),
                  },
                ]}
              >
                <AutoComplete
                  style={{
                    width: 160,
                  }}
                  options={session?.dataTypes
                    ?.map((d) =>
                      dbMode === ConnectionMode.OB_ORACLE
                        ? d.databaseType.replace('(', '').replace(')', '')
                        : d.databaseType,
                    )
                    .map((a) => ({ value: a }))}
                  filterOption={(inputValue, option) =>
                    // @ts-ignore
                    option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={formatMessage({
              id: 'odc.component.CreateFunctionModal.Parameter',
            })}
            /* 参数 */ required
          >
            <FunctionOrProcedureParams
              session={session}
              dbMode={dbMode}
              mode={DbObjectType.function}
              paramsRef={paramsRef}
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }),
);

export default CreateFunctionModal;
