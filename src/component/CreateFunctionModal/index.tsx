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
import React, { useCallback, useEffect, useRef, useState } from 'react';
import FunctionOrProcedureParams from '@/component/ProcedureParam';
import type { IFunction } from '@/d.ts';
import { ConnectionMode, DbObjectType } from '@/d.ts';
import { openCreateFunctionPageByRemote } from '@/store/helper/page';
import type { ModalStore } from '@/store/modal';
import { SessionManagerStore } from '@/store/sessionManager';
import { useDBSession } from '@/store/sessionManager/hooks';
import { AutoComplete, Col, Form, Input, message, Modal, Radio, Row, Select, Spin } from 'antd';
import { useForm } from 'antd/es/form/Form';
import ExtraOptions from '../ProcedureParam/ExtraOptions';
import styles from './index.less';
import { PlusOutlined } from '@@node_modules/@ant-design/icons/lib';
import { IExternalResource } from '@/d.ts/externalResoruce';

interface IProps {
  modalStore?: ModalStore;
  sessionManagerStore?: SessionManagerStore;
  model?: Partial<IFunction>;
}

export enum CheckOption {
  NONE = 'NONE',
}

export enum FunctionType {
  CUSTOM = 'custom',
  EXTERNAL = 'external',
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
    const supportExternalResource = session?.supports.find(
      (item) => item.supportType === 'support_external_resource',
    )?.support;

    const fromExternalResource = modalStore?.createFunctionModalData?.fromExternalResource;
    const externalResourceName = modalStore?.createFunctionModalData?.externalResourceName;
    const [functionType, setFunctionType] = useState<FunctionType>(
      fromExternalResource && supportExternalResource ? FunctionType.EXTERNAL : FunctionType.CUSTOM,
    );
    const [resourceSource, setResourceSource] = useState<string>('external_resource');
    const [externalResources, setExternalResources] = useState<Partial<IExternalResource>[]>([]);
    const [loadingResources, setLoadingResources] = useState<boolean>(false);
    const paramsRef = useRef<{
      getRows: () => any[];
    }>();

    // 加载外部资源列表
    const loadExternalResources = useCallback(async () => {
      if (!session?.database?.getExternalResourceList) {
        return;
      }
      setLoadingResources(true);
      try {
        await session.database.getExternalResourceList();
        setExternalResources(session.database.externalResources || []);
      } catch (error) {
        console.error('加载外部资源列表失败:', error);
        message.error('加载外部资源列表失败');
      } finally {
        setLoadingResources(false);
      }
    }, [session]);

    const onCancel = useCallback(() => {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.component.CreateFunctionModal.ConfirmToClose',
          defaultMessage: '确认关闭',
        }), // 确认关闭
        content: formatMessage({
          id: 'odc.component.CreateFunctionModal.CurrentPopUpDataWill',
          defaultMessage: '当前弹窗数据将清空',
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
            defaultMessage: '请填写参数名称',
          }),
        );

        return;
      }

      // 有空的数据类型
      if (data.params.filter((p: { dataType: any }) => !p.dataType).length > 0) {
        message.error(
          formatMessage({
            id: 'workspace.window.createFunction.dataType.validation',
            defaultMessage: '请填写数据类型',
          }),
        );

        return;
      }

      onSave(data);
    }, [onSave, form, paramsRef]);
    useEffect(() => {
      if (visible) {
        form.resetFields();
        const defaultFunctionType =
          fromExternalResource && supportExternalResource
            ? FunctionType.EXTERNAL
            : FunctionType.CUSTOM;
        setFunctionType(defaultFunctionType);
        setResourceSource('external_resource');

        // 设置表单的初始值
        const initialValues = {
          functionType: defaultFunctionType,
          resourceSource: 'external_resource',
        };

        // 如果从外部资源节点打开且有指定的资源名称，设置外部资源选择
        if (fromExternalResource && externalResourceName) {
          initialValues['externalResourceProperties'] = {
            file: externalResourceName,
          };
        }

        form.setFieldsValue(initialValues);
      }
    }, [visible, session, fromExternalResource, supportExternalResource, externalResourceName]);

    // 当弹窗打开且选择外部函数时，加载外部资源列表
    useEffect(() => {
      if (
        visible &&
        functionType === FunctionType.EXTERNAL &&
        resourceSource === 'external_resource'
      ) {
        loadExternalResources();
      }
    }, [visible, functionType, resourceSource, loadExternalResources]);
    return (
      <Modal
        centered={true}
        width={720}
        destroyOnHidden={true}
        title={formatMessage({
          id: 'workspace.window.createFunction.modal.title',
          defaultMessage: '新建函数',
        })}
        open={visible}
        onOk={save}
        onCancel={onCancel}
      >
        <Spin spinning={loading}>
          <Form
            requiredMark="optional"
            layout="vertical"
            form={form}
            initialValues={{
              ...model,
              functionType: 'custom',
              resourceSource: 'external_resource',
            }}
          >
            <Row>
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: '请输入函数类型',
                  },
                ]}
                name="functionType"
                label="函数类型"
              >
                <Radio.Group
                  optionType="button"
                  value={functionType}
                  onChange={(e) => {
                    setFunctionType(e.target.value);
                    // 清除除了函数类型之外的所有字段
                    const currentFunctionType = e.target.value;
                    form.resetFields();
                    form.setFieldsValue({ functionType: currentFunctionType });
                  }}
                  options={
                    supportExternalResource
                      ? [
                          { label: '自定义函数', value: FunctionType.CUSTOM },
                          { label: '外部自定义函数', value: FunctionType.EXTERNAL },
                        ]
                      : [{ label: '自定义函数', value: FunctionType.CUSTOM }]
                  }
                />
              </Form.Item>
            </Row>

            {functionType === FunctionType.CUSTOM ? (
              <>
                <Row>
                  <Col span={12}>
                    <Form.Item
                      name="funName"
                      label={formatMessage({
                        id: 'workspace.window.createFunction.funName',
                        defaultMessage: '函数名称',
                      })}
                      rules={[
                        {
                          required: true,
                          message: formatMessage({
                            id: 'workspace.window.createFunction.funName.validation',
                            defaultMessage: '请输入函数名称',
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
                          defaultMessage: '请输入函数名称',
                        })}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="returnType"
                      label={formatMessage({
                        id: 'workspace.window.createFunction.returnType',
                        defaultMessage: '返回类型',
                      })}
                      rules={[
                        {
                          required: true,
                          message: formatMessage({
                            id: 'workspace.window.createFunction.returnType.validation',
                            defaultMessage: '请输入函数返回值',
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
                <ExtraOptions
                  connectType={session?.connection?.type}
                  dbType={DbObjectType.function}
                />
                <Form.Item
                  label={formatMessage({
                    id: 'odc.component.CreateFunctionModal.Parameter',
                    defaultMessage: '参数',
                  })}
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
              </>
            ) : (
              <>
                <Row>
                  <Col span={18}>
                    <Form.Item
                      name="funName"
                      label="函数名称"
                      className={styles.funName}
                      rules={[
                        {
                          required: true,
                          message: '请输入函数名称',
                        },
                      ]}
                    >
                      <Input placeholder="请输入" />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name="returnType"
                      label="返回类型"
                      className={styles.returnType}
                      rules={[
                        {
                          required: true,
                          message: '请输入返回类型',
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
                <Row>
                  <Col span={6}>
                    <Form.Item
                      label="资源来源"
                      name="resourceSource"
                      rules={[{ required: true, message: '请选择资源来源' }]}
                      className={styles.resourceSource}
                    >
                      <Select
                        placeholder="已添加的外部资源"
                        className={styles.type}
                        value={resourceSource}
                        onChange={(value) => {
                          setResourceSource(value);
                          // 清空资源选择字段
                          form.setFieldValue('resourceSelection', undefined);
                          // 如果选择了已添加的外部资源，加载资源列表
                          if (value === 'external_resource') {
                            loadExternalResources();
                          }
                        }}
                        options={[
                          { label: '已添加的外部资源', value: 'external_resource' },
                          { label: '自定义 URL', value: 'custom_url' },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={18}>
                    <Form.Item
                      name={['externalResourceProperties', 'file']}
                      rules={[
                        {
                          required: true,
                          message:
                            resourceSource === 'external_resource' ? '请选择外部资源' : '请输入URL',
                        },
                      ]}
                      className={styles.source}
                    >
                      {resourceSource === 'external_resource' ? (
                        <Select
                          placeholder="外部资源对象名"
                          showSearch
                          loading={loadingResources}
                          filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          popupRender={(menu) => (
                            <div>
                              {menu}
                              <div className={styles.createExternalResource}>
                                <div
                                  className={styles.operator}
                                  onClick={(e) => {
                                    e.stopPropagation(); // 阻止事件冒泡
                                    modalStore.changeCreateExternalResourceModalVisible(
                                      true,
                                      session?.odcDatabase?.id,
                                      session?.database?.dbName,
                                    );
                                  }}
                                >
                                  <PlusOutlined /> 新建
                                </div>
                              </div>
                            </div>
                          )}
                          options={externalResources
                            .filter((resource) => resource.name) // 过滤掉没有name的资源
                            .map((resource) => ({
                              label: resource.name!,
                              value: resource.name!,
                              title: `${resource.name} (${resource.type || 'Unknown'})`,
                            }))}
                        />
                      ) : (
                        <Input placeholder="请输入外部资源URL" allowClear />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={16}>
                    <Form.Item
                      name={['externalResourceProperties', 'symbol']}
                      label="入口类"
                      className={styles.entryClass}
                      rules={[{ required: true, message: '请输入入口类' }]}
                    >
                      <Input placeholder="请输入外部资源或 URL 中的类名" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="类型"
                      className={styles.externalType}
                      required
                      name={['externalResourceProperties', 'createType']}
                      rules={[{ required: true, message: '请选择类型' }]}
                    >
                      <AutoComplete
                        placeholder="请输入或选择"
                        options={[
                          { value: 'ODPSJAR', label: 'ODPSJAR' },
                          { value: 'UDAFJAR', label: 'UDAFJAR' },
                          { value: 'UDTFJAR', label: 'UDTFJAR' },
                          { value: 'PYTHON', label: 'PYTHON' },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item className={styles.params} label="参数">
                  {session ? (
                    <FunctionOrProcedureParams
                      session={session}
                      dbMode={dbMode}
                      mode={DbObjectType.function}
                      paramsRef={paramsRef}
                    />
                  ) : null}
                </Form.Item>
              </>
            )}
          </Form>
        </Spin>
      </Modal>
    );
  }),
);

export default CreateFunctionModal;
