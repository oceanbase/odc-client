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
import { useDBSession } from '@/store/sessionManager/hooks';
import { AutoComplete, Col, Form, Input, message, Modal, Row, Spin } from 'antd';
import { useForm } from 'antd/es/form/Form';
import ExtraOptions from '../ProcedureParam/ExtraOptions';

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
    const dbId = modalStore?.createFunctionModalData?.databaseId;
    const dbName = modalStore?.createFunctionModalData?.dbName;
    const { session, loading } = useDBSession(dbId);
    const dbMode = session?.connection?.dialectType;
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
        await openCreateFunctionPageByRemote(
          func,
          session?.sessionId,
          dbName,
          session?.odcDatabase?.id,
        );
        modalStore.changeCreateFunctionModalVisible(false);
      },
      [modalStore, session, dbName],
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
    }, [visible, session]);
    return (
      <Modal
        centered={true}
        width={760}
        destroyOnClose={true}
        title={formatMessage({
          id: 'workspace.window.createFunction.modal.title',
        })}
        open={visible}
        onOk={save}
        onCancel={onCancel}
      >
        <Spin spinning={loading}>
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
            <ExtraOptions connectType={session?.connection?.type} dbType={DbObjectType.function} />
            <Form.Item
              label={formatMessage({
                id: 'odc.component.CreateFunctionModal.Parameter',
              })}
              /* 参数 */ required
            >
              {session ? (
                <FunctionOrProcedureParams
                  session={session}
                  dbMode={dbMode}
                  mode={DbObjectType.function}
                  paramsRef={paramsRef}
                />
              ) : null}
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    );
  }),
);

export default CreateFunctionModal;
