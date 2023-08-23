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

import { getConnectionList, getDataSourceGroupByProject } from '@/common/network/connection';
import { listDatabases } from '@/common/network/database';
import { listProjects } from '@/common/network/project';
import { ConnectionMode } from '@/d.ts';
import login, { UserStore } from '@/store/login';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { Col, Form, Modal, Radio, Row, Select, Tag } from 'antd';
import { inject, observer } from 'mobx-react';
import { useContext, useEffect } from 'react';
import SessionContext from '../context';

interface IProps {
  visible: boolean;
  dialectTypes?: ConnectionMode[];
  userStore?: UserStore;
  close: () => void;
}

export default inject('userStore')(
  observer(function SelectModal({ visible, dialectTypes, userStore, close }: IProps) {
    const context = useContext(SessionContext);
    const [form] = Form.useForm();
    const isPersonal = userStore?.isPrivateSpace();
    const {
      data: project,
      loading: projectLoading,
      run: fetchProjects,
    } = useRequest(listProjects, {
      manual: true,
    });

    const {
      data: datasourceList,
      loading: datasourceLoading,
      run: fetchDatasource,
    } = useRequest(getDataSourceGroupByProject, {
      manual: true,
    });

    const {
      data: allDatasourceList,
      loading: allDatasourceLoading,
      run: fetchAllDatasource,
    } = useRequest(getConnectionList, {
      manual: true,
    });

    const {
      data: databases,
      loading: databaseLoading,
      run: fetchDatabase,
      reset,
    } = useRequest(listDatabases, {
      manual: true,
    });

    useEffect(() => {
      if (visible) {
        const sessionDatabase = context?.session?.odcDatabase;
        form.setFieldsValue({
          databaseFrom: context?.from,
          project: context?.from === 'project' ? sessionDatabase?.project?.id : null,
          datasource: context?.from === 'project' ? null : sessionDatabase?.dataSource?.id,
          database: context?.databaseId,
          selectDatasource: context?.datasourceId,
        });
        if (context?.datasourceMode) {
          fetchAllDatasource({
            size: 9999,
            page: 1,
            minPrivilege: 'update',
          });
          return;
        }
        if (context?.from === 'datasource') {
          fetchDatasource(login.isPrivateSpace());
          fetchDatabase(null, sessionDatabase?.dataSource?.id, 1, 9999, null, null, null, true);
        } else {
          fetchProjects(null, 1, 9999);
          fetchDatabase(sessionDatabase?.project?.id, null, 1, 9999, null, null, null, true);
        }
      }
    }, [visible]);

    return (
      <Modal
        open={visible}
        title={formatMessage({
          id: 'odc.SessionContextWrap.SessionSelect.modal.SwitchDatabases',
        })} /*切换数据库*/
        width={520}
        onCancel={close}
        onOk={async () => {
          const value = await form.validateFields();
          await context.selectSession(value.database, value.selectDatasource, value.databaseFrom);
          close();
        }}
      >
        {context?.datasourceMode ? (
          <Form requiredMark={false} form={form} layout="vertical">
            <Form.Item
              label={formatMessage({ id: 'odc.SessionContextWrap.SessionSelect.modal.DataSource' })}
              /*数据源*/ name={'selectDatasource'}
            >
              <Select
                loading={allDatasourceLoading}
                showSearch
                onChange={(value) => {
                  fetchDatabase(null, value, 1, 9999, null, null, null, true);
                  form.setFieldsValue({
                    database: null,
                  });
                }}
                optionFilterProp="children"
                style={{ width: '320px' }}
              >
                {allDatasourceList?.contents
                  ?.map((item) => {
                    if (dialectTypes?.length && !dialectTypes.includes(item.dialectType)) {
                      return null;
                    }
                    return (
                      <Select.Option value={item.id} key={item.id}>
                        {item.name}
                      </Select.Option>
                    );
                  })
                  .filter(Boolean)}
              </Select>
            </Form.Item>
          </Form>
        ) : (
          <Form requiredMark={false} form={form} layout="vertical">
            <Form.Item
              label={formatMessage({ id: 'odc.SessionContextWrap.SessionSelect.modal.Category' })}
              /*类别*/ name={'databaseFrom'}
            >
              <Radio.Group
                onChange={(e) => {
                  reset();
                  form.setFieldsValue({
                    database: null,
                  });
                  if (e.target.value === 'project') {
                    fetchProjects(null, 1, 9999, false);

                    form.getFieldValue('project') &&
                      fetchDatabase(
                        form.getFieldValue('project'),
                        null,
                        1,
                        9999,
                        null,
                        null,
                        null,
                        true,
                      );
                  } else {
                    fetchDatasource(login.isPrivateSpace());
                    form.getFieldValue('datasource') &&
                      fetchDatabase(
                        null,
                        form.getFieldValue('datasource'),
                        1,
                        9999,
                        null,
                        null,
                        null,
                        true,
                      );
                  }
                }}
                optionType="button"
                options={[
                  isPersonal
                    ? null
                    : {
                        label: formatMessage({
                          id: 'odc.SessionContextWrap.SessionSelect.modal.Project',
                        }), //项目
                        value: 'project',
                      },
                  {
                    label: formatMessage({
                      id: 'odc.SessionContextWrap.SessionSelect.modal.DataSource',
                    }), //数据源
                    value: 'datasource',
                  },
                ].filter(Boolean)}
              />
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                const databaseFrom = getFieldValue('databaseFrom');
                if (databaseFrom === 'project') {
                  return (
                    <>
                      <Form.Item
                        rules={[{ required: true }]}
                        label={formatMessage({
                          id: 'odc.SessionContextWrap.SessionSelect.modal.Project.1',
                        })}
                        /*所属项目*/ name="project"
                      >
                        <Select
                          showSearch
                          loading={projectLoading}
                          onChange={(value) => {
                            fetchDatabase(value, null, 1, 9999, null, null, null, true);
                            form.setFieldsValue({
                              database: null,
                            });
                          }}
                          optionFilterProp="children"
                          style={{ width: '320px' }}
                        >
                          {project?.contents?.map((item) => {
                            return (
                              <Select.Option value={item.id} key={item.id}>
                                {item.name}
                              </Select.Option>
                            );
                          })}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        rules={[{ required: true }]}
                        label={formatMessage({
                          id: 'odc.SessionContextWrap.SessionSelect.modal.Database',
                        })}
                        /*数据库*/ name="database"
                      >
                        <Select
                          showSearch
                          loading={databaseLoading}
                          optionFilterProp="children"
                          style={{ width: '320px' }}
                        >
                          {databases?.contents?.map((item) => {
                            return (
                              <Select.Option value={item.id} key={item.id}>
                                {item.name}
                                <span
                                  style={{ color: 'var(--text-color-placeholder)', marginLeft: 5 }}
                                >
                                  {item.dataSource?.name}
                                </span>
                              </Select.Option>
                            );
                          })}
                        </Select>
                      </Form.Item>
                    </>
                  );
                } else {
                  return (
                    <>
                      <Row>
                        <Col span={18}>
                          <Form.Item
                            rules={[{ required: true }]}
                            label={formatMessage({
                              id: 'odc.SessionContextWrap.SessionSelect.modal.DataSource.1',
                            })} /*所属数据源*/
                            name={'datasource'}
                          >
                            <Select
                              loading={datasourceLoading}
                              showSearch
                              onChange={(value) => {
                                fetchDatabase(null, value, 1, 9999, null, null, null, true);
                                form.setFieldsValue({
                                  database: null,
                                });
                              }}
                              optionFilterProp="children"
                              style={{ width: '320px' }}
                            >
                              {datasourceList?.contents
                                ?.map((item) => {
                                  if (
                                    dialectTypes?.length &&
                                    !dialectTypes.includes(item.dialectType)
                                  ) {
                                    return null;
                                  }
                                  return (
                                    <Select.Option value={item.id} key={item.id}>
                                      {item.name}
                                    </Select.Option>
                                  );
                                })
                                .filter(Boolean)}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            shouldUpdate
                            label={formatMessage({
                              id: 'odc.SessionContextWrap.SessionSelect.modal.Environment',
                            })} /*环境*/
                          >
                            {({ getFieldValue }) => {
                              const dsId = getFieldValue('datasource');
                              const ds = datasourceList?.contents?.find((item) => item.id == dsId);
                              if (!ds) {
                                return '-';
                              }
                              return (
                                <Tag color={ds?.environmentStyle?.toLowerCase()}>
                                  {ds?.environmentName}
                                </Tag>
                              );
                            }}
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item
                        rules={[{ required: true }]}
                        label={formatMessage({
                          id: 'odc.SessionContextWrap.SessionSelect.modal.Database',
                        })}
                        /*数据库*/ name="database"
                      >
                        <Select
                          loading={databaseLoading}
                          optionFilterProp="children"
                          style={{ width: '320px' }}
                          showSearch
                        >
                          {databases?.contents
                            ?.map((item) => {
                              if (
                                dialectTypes?.length &&
                                !dialectTypes.includes(item.dataSource?.dialectType)
                              ) {
                                return null;
                              }
                              return (
                                <Select.Option value={item.id} key={item.id}>
                                  {item.name}
                                </Select.Option>
                              );
                            })
                            .filter(Boolean)}
                        </Select>
                      </Form.Item>
                    </>
                  );
                }
              }}
            </Form.Item>
          </Form>
        )}
      </Modal>
    );
  }),
);
