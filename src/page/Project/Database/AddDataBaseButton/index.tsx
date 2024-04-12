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

import { getConnectionDetail, getConnectionList } from '@/common/network/connection';
import { listDatabases, updateDataBase } from '@/common/network/database';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import ApplyDatabasePermissionButton from '@/component/Task/ApplyDatabasePermission/CreateButton';
import TooltipAction from '@/component/TooltipAction';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { useContext, useMemo, useState } from 'react';
import { Button, Col, Form, message, Modal, Row, Select, Space, Tooltip } from 'antd';
import Icon from '@ant-design/icons';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import ProjectContext from '../../ProjectContext';
import { ProjectRole } from '@/d.ts/project';
import { DefaultOptionType } from 'antd/es/select';
import { DB_OWNER_MAX_COUNT } from '@/page/Project/Database/const';
import { DatabaseOwnerSelect } from '../components/DatabaseOwnerSelect.tsx';
interface IProps {
  projectId: number;
  onSuccess: () => void;
}

export default function AddDataBaseButton({ projectId, onSuccess }: IProps) {
  const [open, setOpen] = useState<boolean>(false);
  const { project } = useContext(ProjectContext);

  const [form] = Form.useForm<{
    databaseIds: number[];
    ownerIds?: number[];
  }>();

  const { run, loading: saveDatabaseLoading } = useRequest(updateDataBase, {
    manual: true,
  });
  const { data: dataSourceList, loading: dataSourceListLoading } = useRequest(getConnectionList, {
    defaultParams: [
      {
        size: 99999,
        page: 1,
      },
    ],
  });
  const {
    data: dataSource,
    loading: dataSourceLoading,
    run: fetchDataSource,
  } = useRequest(getConnectionDetail, {
    manual: true,
  });
  const {
    data: databases,
    loading: databasesListLoading,
    run: fetchDatabases,
  } = useRequest(listDatabases, {
    manual: true,
  });
  const disabledAction =
    project?.currentUserResourceRoles?.filter((roles) =>
      [ProjectRole.DBA, ProjectRole.OWNER]?.includes(roles),
    )?.length === 0;
  function close() {
    setOpen(false);
    form.resetFields();
  }
  async function submit() {
    const formData = await form.validateFields();
    if (!formData) {
      return;
    }
    const isSuccess = await run(formData?.databaseIds, projectId, formData?.ownerIds);
    if (isSuccess) {
      message.success(
        formatMessage({
          id: 'odc.Database.AddDataBaseButton.AddedSuccessfully',
        }), //添加成功
      );
      setOpen(false);
      onSuccess();
      form.resetFields();
    }
  }
  return (
    <>
      <Space size={12}>
        <TooltipAction
          title={
            disabledAction
              ? formatMessage({ id: 'src.page.Project.Database.AddDataBaseButton.5409D916' })
              : ''
          }
        >
          <Button onClick={() => setOpen(true)} type="primary" disabled={disabledAction}>
            {
              formatMessage({
                id: 'odc.Database.AddDataBaseButton.AddDatabase',
              }) /*添加数据库*/
            }
          </Button>
        </TooltipAction>
        <ApplyDatabasePermissionButton
          label={
            formatMessage({
              id: 'src.page.Project.Database.AddDataBaseButton.B54F6D7D',
            }) /*"申请库权限"*/
          }
          projectId={projectId}
        />
      </Space>
      <Modal
        open={open}
        title={formatMessage({
          id: 'odc.Database.AddDataBaseButton.AddDatabase',
        })}
        /*添加数据库*/ onOk={submit}
        onCancel={close}
        confirmLoading={saveDatabaseLoading}
        destroyOnClose
      >
        <Form
          requiredMark={'optional'}
          form={form}
          layout="vertical"
          onValuesChange={(changedValues) => {
            if (changedValues.hasOwnProperty('dataSourceId')) {
              fetchDataSource(changedValues?.dataSourceId);
              fetchDatabases(null, changedValues?.dataSourceId, 1, 999999, null, null, true, true);
            }
          }}
        >
          <Row>
            <Col span={18}>
              <Form.Item
                rules={[
                  {
                    required: true,
                  },
                ]}
                name={'dataSourceId'}
                label={formatMessage({
                  id: 'odc.Database.AddDataBaseButton.DataSource',
                })} /*所属数据源*/
              >
                <Select
                  showSearch
                  optionFilterProp="title"
                  loading={dataSourceListLoading || dataSourceLoading}
                  style={{
                    width: 'calc(100% - 10px)',
                  }}
                  placeholder={formatMessage({
                    id: 'odc.Database.AddDataBaseButton.PleaseSelect',
                  })}
                  /*请选择*/ onChange={() =>
                    form.setFieldsValue({
                      databaseIds: [],
                    })
                  }
                >
                  {dataSourceList?.contents?.map((item) => {
                    const icon = getDataSourceStyleByConnectType(item.type);
                    const isDisabled = !!item?.projectId && projectId !== item?.projectId;
                    return (
                      <Select.Option title={item.name} key={item.id} disabled={isDisabled}>
                        <Tooltip
                          title={
                            isDisabled
                              ? formatMessage(
                                  {
                                    id: 'odc.src.page.Project.Database.AddDataBaseButton.ThisDataSourceHasBeen',
                                  },
                                  {
                                    itemProjectName: item?.projectName,
                                  },
                                ) //`该数据源已绑定项目：${item?.projectName}`
                              : null
                          }
                        >
                          <Icon
                            component={icon?.icon?.component}
                            style={{
                              color: icon?.icon?.color,
                              fontSize: 16,
                              marginRight: 4,
                            }}
                          />

                          {item.name}
                        </Tooltip>
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                requiredMark={false}
                label={formatMessage({
                  id: 'odc.Database.AddDataBaseButton.Environment',
                })} /*环境*/
              >
                <RiskLevelLabel
                  color={dataSource?.environmentStyle}
                  content={dataSource?.environmentName || '-'}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            rules={[
              {
                required: true,
              },
            ]}
            name={'databaseIds'}
            label={formatMessage({
              id: 'odc.Database.AddDataBaseButton.Database',
            })} /*数据库*/
          >
            <Select
              mode="multiple"
              placeholder={formatMessage({
                id: 'odc.Database.AddDataBaseButton.SelectAnUnassignedDatabase',
              })}
              /*请选择未分配项目的数据库*/ style={{
                width: '100%',
              }}
              loading={databasesListLoading}
              optionFilterProp="children"
            >
              {databases?.contents?.map((p) => {
                if (!!p.project?.id) {
                  return (
                    <Select.Option disabled={true} key={p.id}>
                      {p.name}
                      {
                        formatMessage({
                          id: 'odc.Database.AddDataBaseButton.BoundProject',
                        }) /*- 已绑定项目：*/
                      }

                      {p.project?.name}
                    </Select.Option>
                  );
                }
                return <Select.Option key={p.id}>{p.name}</Select.Option>;
              })}
            </Select>
          </Form.Item>
          <DatabaseOwnerSelect
            hasDefaultSet={false}
            ownerIds={form.getFieldValue('ownerIds')}
            setFormOwnerIds={(value) => {
              form.setFieldsValue({
                ownerIds: value,
              });
            }}
          />
        </Form>
      </Modal>
    </>
  );
}
