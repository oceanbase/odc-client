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
import { getProcedureCreateSQL } from '@/common/network';
import type { IProcedure } from '@/d.ts';
import { DbObjectType } from '@/d.ts';
import { openCreateProcedurePage } from '@/store/helper/page';
import type { ModalStore } from '@/store/modal';
import { SessionManagerStore } from '@/store/sessionManager';
import { useDBSession } from '@/store/sessionManager/hooks';
import { Form, Input, message, Modal, Spin } from 'antd';
import { useForm } from 'antd/es/form/Form';
import ProcedureParam from '../ProcedureParam';
import ExtraOptions from '../ProcedureParam/ExtraOptions';

interface IProps {
  modalStore?: ModalStore;
  sessionManagerStore?: SessionManagerStore;
  model?: Partial<IProcedure>;
}

const CreateProcedureModal: React.FC<IProps> = inject(
  'modalStore',
  'sessionManagerStore',
)(
  observer((props) => {
    const { modalStore } = props;
    const databaseId = modalStore.createProcedureModalData.databaseId;
    const dbName = modalStore.createProcedureModalData.dbName;
    const { session, loading } = useDBSession(databaseId);
    const sessionId = session?.sessionId;
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
        const sql = await getProcedureCreateSQL(prod.proName, prod, sessionId, dbName);
        if (!sql) {
          return;
        }
        await openCreateProcedurePage(sql, session?.odcDatabase?.id, dbName);
        modalStore.changeCreateProcedureModalVisible(false);
      },
      [modalStore, sessionId, dbName],
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
        open={visible}
        onOk={save}
        onCancel={onCancel}
      >
        <Spin spinning={loading}>
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
            <ExtraOptions dbType={DbObjectType.procedure} connectType={session?.connection?.type} />
            <Form.Item
              label={formatMessage({
                id: 'workspace.window.createFunction.params',
              })}
            >
              {session ? (
                <ProcedureParam
                  session={session}
                  mode={DbObjectType.procedure}
                  dbMode={session?.connection?.dialectType}
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

export default CreateProcedureModal;
