import { getDataSourceGroupByProject } from '@/common/network/connection';
import { listDatabases } from '@/common/network/database';
import { listProjects } from '@/common/network/project';
import { ConnectionMode } from '@/d.ts';
import { SpaceType } from '@/d.ts/_index';
import { UserStore } from '@/store/login';
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
    const isPersonal =
      userStore?.user?.belongedToOrganizations?.find(
        (i) => i.id === userStore?.user?.organizationId,
      )?.type === SpaceType.PRIVATE;
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
          fetchDatasource();
          return;
        }
        if (context?.from === 'datasource') {
          fetchDatasource();
          fetchDatabase(null, sessionDatabase?.dataSource?.id, 1, 9999);
        } else {
          fetchProjects(null, 1, 9999);
          fetchDatabase(sessionDatabase?.project?.id, null, 1, 9999);
        }
      }
    }, [visible]);

    return (
      <Modal
        open={visible}
        title="切换数据库"
        width={520}
        onCancel={close}
        onOk={async () => {
          const value = await form.validateFields();
          await context.selectSession(value.database, value.selectDatasource, value.databaseFrom);
          close();
        }}
      >
        {context?.datasourceMode ? (
          <Form form={form} layout="vertical">
            <Form.Item label="数据源" name={'selectDatasource'}>
              <Select
                loading={datasourceLoading}
                showSearch
                onChange={(value) => {
                  fetchDatabase(null, value, 1, 9999);
                  form.setFieldsValue({
                    database: null,
                  });
                }}
                optionFilterProp="name"
                style={{ width: '320px' }}
              >
                {datasourceList?.contents
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
          <Form form={form} layout="vertical">
            <Form.Item label="类别" name={'databaseFrom'}>
              <Radio.Group
                onChange={(e) => {
                  reset();
                  form.setFieldsValue({
                    database: null,
                  });
                  if (e.target.value === 'project') {
                    fetchProjects(null, 1, 9999, false);
                  } else {
                    fetchDatasource();
                  }
                }}
                optionType="button"
                options={[
                  isPersonal
                    ? null
                    : {
                        label: '项目',
                        value: 'project',
                      },
                  {
                    label: '数据源',
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
                      <Form.Item rules={[{ required: true }]} label="所属项目" name="project">
                        <Select
                          showSearch
                          loading={projectLoading}
                          onChange={(value) => {
                            fetchDatabase(value, null, 1, 9999);
                            form.setFieldsValue({
                              database: null,
                            });
                          }}
                          optionFilterProp="name"
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
                      <Form.Item rules={[{ required: true }]} label="数据库" name="database">
                        <Select
                          showSearch
                          loading={databaseLoading}
                          optionFilterProp="name"
                          style={{ width: '320px' }}
                        >
                          {databases?.contents?.map((item) => {
                            return (
                              <Select.Option value={item.id} key={item.id}>
                                {item.name}
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
                            label="所属数据源"
                            name={'datasource'}
                          >
                            <Select
                              loading={datasourceLoading}
                              showSearch
                              onChange={(value) => {
                                fetchDatabase(null, value, 1, 9999);
                                form.setFieldsValue({
                                  database: null,
                                });
                              }}
                              optionFilterProp="name"
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
                          <Form.Item shouldUpdate label="环境">
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
                      <Form.Item rules={[{ required: true }]} label="数据库" name="database">
                        <Select
                          loading={databaseLoading}
                          optionFilterProp="name"
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
