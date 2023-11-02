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

import InputBigNumber from '@/component/InputBigNumber';
import type { ModalStore } from '@/store/modal';
import { compareNumber } from '@/util/bigNumber';
import { formatMessage } from '@/util/intl';
import { Col, Form, Input, InputNumber, Modal, Radio, Row, Space } from 'antd';
import { isNil } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';

import { getSequenceCreateSQL, getSequenceUpdateSQL } from '@/common/network/sequence';
import SQLExecuteModal from '@/component/SQLExecuteModal';
import type { ISequence } from '@/d.ts';
import { openCreateSequencePage } from '@/store/helper/page';
import { SessionManagerStore } from '@/store/sessionManager';
import { useDBSession } from '@/store/sessionManager/hooks';
import styles from './index.less';

interface IProps {
  modalStore?: ModalStore;
  sessionManagerStore?: SessionManagerStore;
}

const CreateSequenceModal: React.FC<IProps> = function (props) {
  const { modalStore } = props;
  const { createSequenceModalData } = modalStore;
  const [executeSQL, setExecuteSQL] = useState();
  const [haveChanged, setHaveChanged] = useState(false);
  const [executeModalVisible, setExecuteModalVisible] = useState(false);
  const [form] = Form.useForm();
  const isEditMode = !!createSequenceModalData?.isEdit;
  const { databaseId, dbName } = modalStore.createSequenceModalData || {};
  const { session, loading } = useDBSession(databaseId);
  const sessionId = session?.sessionId;
  useEffect(() => {
    if (modalStore.createSequenceModalVisible) {
      form.resetFields();
    }
  }, [modalStore.createSequenceModalVisible]);

  function handleValidateMinValue(rule: any, value: string) {
    const { getFieldValue } = form;
    const maxValue = getFieldValue('maxValue');
    const startValue = getFieldValue('startValue');
    const increament = getFieldValue('increament');

    if (isNil(maxValue) && isNil(value)) {
      return Promise.resolve();
    }

    if (!isNil(maxValue) && !isNil(value)) {
      if (compareNumber(value, maxValue) === 1) {
        return Promise.reject(
          formatMessage({
            id: 'workspace.window.createSequence.params.minValue.validation',
          }),
        );
      }

      if (startValue !== null && compareNumber(value, startValue) === 1) {
        return Promise.reject(
          formatMessage({
            id: 'workspace.window.createSequence.params.minValue.validation2',
          }),
        );
      }
    }

    return Promise.resolve();
  }

  function handleValidateMaxValue(rule: any, value: string) {
    const { getFieldValue } = form;
    const minValue = getFieldValue('minValue');
    const startValue = getFieldValue('startValue');
    const increament = getFieldValue('increament');

    if (isNil(minValue) && isNil(value)) {
      return Promise.resolve();
    }

    if (!isNil(minValue) && !isNil(value)) {
      if (compareNumber(value, minValue) === -1) {
        return Promise.reject(
          formatMessage({
            id: 'workspace.window.createSequence.params.maxValue.validation',
          }),
        );
      }

      if (startValue !== null && compareNumber(value, startValue) === -1) {
        return Promise.reject(
          formatMessage({
            id: 'workspace.window.createSequence.params.maxValue.validation2',
          }),
        );
      }
    }

    return Promise.resolve();
  }

  async function hanldleCreateSql(sequence: ISequence) {
    const sql = await getSequenceCreateSQL(sequence.name, sequence, sessionId, dbName);
    if (sql) {
      openCreateSequencePage(sql, session?.odcDatabase?.id, dbName);
      modalStore.changeCreateSequenceModalVisible(false);
    }
  }

  async function hanldleUpdateSql(sequence: ISequence) {
    const sql = await getSequenceUpdateSQL(sequence.name, sequence, sessionId, dbName);
    if (sql) {
      setExecuteModalVisible(true);
      setExecuteSQL(sql);
    }
  }

  useEffect(() => {
    if (modalStore.createSequenceModalVisible) {
      setHaveChanged(false);
    }
  }, [modalStore.createSequenceModalVisible]);

  return (
    <>
      <Modal
        width={760}
        title={
          isEditMode
            ? `${
                formatMessage({
                  id: 'odc.components.CreateSequenceModal.EditSequence',
                }) // 编辑序列
              }(${createSequenceModalData?.data?.name})`
            : formatMessage({
                id: 'odc.components.CreateSequenceModal.CreateASequence',
              }) // 新建序列
        }
        visible={modalStore.createSequenceModalVisible}
        okText={formatMessage({
          id: 'odc.components.CreateSequenceModal.NextConfirmTheSqlStatement',
        })} /* 下一步：确认 SQL */
        onCancel={() => {
          modalStore.changeCreateSequenceModalVisible(false);
        }}
        okButtonProps={{
          disabled: (isEditMode && !haveChanged) || loading,
        }}
        onOk={async () => {
          try {
            const sequence = await form.validateFields();
            isEditMode ? await hanldleUpdateSql(sequence) : await hanldleCreateSql(sequence);
          } catch (e) {
            console.error(e);
          }
        }}
      >
        <Form
          form={form}
          onValuesChange={(changedValues) => {
            if (!haveChanged) {
              setHaveChanged(true);
            }
            const keys = Object.keys(changedValues);
            const observerKeys = ['startValue', 'increament', 'minValue', 'maxValue'];
            if (new Set(observerKeys.concat(keys)).size != observerKeys.length + keys.length) {
              /**
               * 有变动，需要重新校验
               */
              form.validateFields(['minValue', 'maxValue']);
            }
          }}
          layout="vertical"
          initialValues={{
            user: dbName,
            startValue: 1,
            increament: 1,
            orderd: false,
            cycled: false,
            cached: true,
            cacheSize: 20,
            ...createSequenceModalData?.data,
          }}
          requiredMark="optional"
        >
          <Row gutter={12}>
            <Col span={16}>
              <Form.Item
                name="name"
                label={formatMessage({
                  id: 'workspace.window.createSequence.baseInfo.name',
                })}
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'workspace.window.createSequence.baseInfo.name.validation',
                    }),
                  },
                ]}
              >
                <Input
                  size="small"
                  disabled={isEditMode}
                  placeholder={formatMessage({
                    id: 'workspace.window.createSequence.baseInfo.name.placeholder',
                  })}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={16}>
              <Form.Item
                name="user"
                label={formatMessage({
                  id: 'workspace.window.createSequence.baseInfo.user',
                })}
              >
                <Input
                  readOnly={true}
                  disabled={true}
                  size="small"
                  placeholder={formatMessage({
                    id: 'workspace.window.createSequence.baseInfo.user.placeholder',
                  })}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            {isEditMode ? null : (
              <Col span={8}>
                <Form.Item
                  name="startValue"
                  label={formatMessage({
                    id: 'workspace.window.createSequence.params.startValue',
                  })}
                >
                  <InputBigNumber
                    style={{ width: '100%' }}
                    size="small"
                    placeholder={formatMessage({
                      id: 'workspace.window.createSequence.params.startValue.placeholder',
                    })}
                  />
                </Form.Item>
              </Col>
            )}

            <Col span={isEditMode ? 16 : 8}>
              <Form.Item
                name="increament"
                label={formatMessage({
                  id: 'workspace.window.createSequence.params.increament',
                })}
                rules={[
                  {
                    type: 'integer',
                    message: formatMessage({
                      id: 'workspace.window.createSequence.params.validation.integer',
                    }),
                  },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  size="small"
                  placeholder={formatMessage({
                    id: 'workspace.window.createSequence.params.increament.placeholder',
                  })}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                shouldUpdate
                label={
                  formatMessage({
                    id: 'odc.components.CreateSequenceModal.ValidValues',
                  }) // 取值范围
                }
              >
                {({ getFieldValue }) => {
                  const minValue = getFieldValue('minValue');
                  const maxValue = getFieldValue('maxValue');
                  const maxAndMinValueRequired = !isNil(minValue) || !isNil(maxValue);

                  return (
                    <Input.Group compact>
                      <Form.Item
                        className={styles.groupInput}
                        shouldUpdate
                        name="minValue"
                        rules={[
                          maxAndMinValueRequired
                            ? {
                                required: true,
                                message: formatMessage({
                                  id:
                                    'workspace.window.createSequence.params.minValue.validation.required',
                                }),
                              }
                            : null,
                          {
                            validator: handleValidateMinValue,
                          },
                        ].filter(Boolean)}
                      >
                        <InputBigNumber
                          style={{ width: 95, borderRight: 'none' }}
                          placeholder={formatMessage({
                            id: 'odc.components.CreateSequenceModal.MinimumValue',
                          })} /* 最小值 */
                        />
                      </Form.Item>
                      <Input
                        className="site-input-split"
                        style={{
                          width: 30,
                          borderLeft: 0,
                          borderRight: 0,
                          pointerEvents: 'none',
                          background: 'transparent',
                        }}
                        placeholder="~"
                        disabled
                      />

                      <Form.Item
                        shouldUpdate
                        className={styles.groupInput}
                        name="maxValue"
                        rules={[
                          maxAndMinValueRequired
                            ? {
                                required: true,
                                message: formatMessage({
                                  id:
                                    'workspace.window.createSequence.params.maxValue.validation.required',
                                }),
                              }
                            : null,
                          {
                            validator: handleValidateMaxValue,
                          },
                        ].filter(Boolean)}
                      >
                        <InputBigNumber
                          style={{ width: 95, borderLeft: 'none' }}
                          placeholder={formatMessage({
                            id: 'odc.components.CreateSequenceModal.MaximumValue',
                          })} /* 最大值 */
                        />
                      </Form.Item>
                    </Input.Group>
                  );
                }}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item
                shouldUpdate
                label={formatMessage({
                  id: 'workspace.window.createSequence.params.cached',
                })}
              >
                {({ getFieldValue }) => {
                  const cached = getFieldValue('cached');
                  return (
                    <Space>
                      <Form.Item name="cached">
                        <Radio.Group
                          options={[
                            {
                              label: formatMessage({
                                id: 'workspace.window.createSequence.params.cached.no',
                              }),

                              value: false,
                            },

                            {
                              label: formatMessage({
                                id: 'workspace.window.createSequence.params.cached.yes',
                              }),

                              value: true,
                            },
                          ]}
                        />
                      </Form.Item>
                      {cached ? (
                        <Form.Item name="cacheSize">
                          <InputNumber
                            size="small"
                            style={{ width: 70 }}
                            placeholder={formatMessage({
                              id: 'workspace.window.createSequence.params.cacheSize.placeholder',
                            })}
                          />
                        </Form.Item>
                      ) : null}
                    </Space>
                  );
                }}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Space>
                <Form.Item
                  name="orderd"
                  label={
                    formatMessage({
                      id: 'odc.components.CreateSequenceModal.Sort',
                    }) // 排序
                  }
                >
                  <Radio.Group
                    options={[
                      {
                        label: formatMessage({
                          id: 'workspace.window.createSequence.params.ordered.yes',
                        }),

                        value: true,
                      },

                      {
                        label: formatMessage({
                          id: 'workspace.window.createSequence.params.ordered.no',
                        }),

                        value: false,
                      },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  name="cycled"
                  label={
                    formatMessage({
                      id: 'odc.components.CreateSequenceModal.Circulating',
                    }) // 循环
                  }
                >
                  <Radio.Group
                    options={[
                      {
                        label: formatMessage({
                          id: 'workspace.window.createSequence.params.cycled.yes',
                        }),

                        value: true,
                      },

                      {
                        label: formatMessage({
                          id: 'workspace.window.createSequence.params.cycled.no',
                        }),

                        value: false,
                      },
                    ]}
                  />
                </Form.Item>
              </Space>
            </Col>
          </Row>
        </Form>
      </Modal>
      <SQLExecuteModal
        session={session}
        sql={executeSQL}
        visible={executeModalVisible}
        onClose={() => {
          setExecuteModalVisible(false);
          setExecuteSQL(null);
        }}
        onSuccess={() => {
          setExecuteModalVisible(false);
          setExecuteSQL(null);
          session.database.getSequenceList();
          modalStore.changeCreateSequenceModalVisible(false);
        }}
      />
    </>
  );
};

export default inject('modalStore', 'sessionManagerStore')(observer(CreateSequenceModal));
