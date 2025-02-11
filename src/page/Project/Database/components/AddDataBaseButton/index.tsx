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

import { getDataSourceStyleByConnectType } from '@/common/datasource';
import { getConnectionDetail, getConnectionList } from '@/common/network/connection';
import { listDatabases, updateDataBase } from '@/common/network/database';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import ApplyDatabasePermissionButton from '@/component/Task/ApplyDatabasePermission/CreateButton';
import TooltipAction from '@/component/TooltipAction';
import { ModalStore } from '@/store/modal';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import Icon, { DownOutlined } from '@ant-design/icons';
import ProjectContext from '../../../ProjectContext';
import { ProjectRole } from '@/d.ts/project';
import { DatabaseOwnerSelect } from '../DatabaseOwnerSelect';
import {
  Button,
  Col,
  Form,
  message,
  Modal,
  Row,
  Select,
  Space,
  Tooltip,
  MenuProps,
  Dropdown,
} from 'antd';
import { useContext, useState } from 'react';
import { IConnection } from '@/d.ts';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';
import settingStore from '@/store/setting';
interface IProps {
  projectId: number;
  orderedDatabaseIds: number[][];
  modalStore?: ModalStore;
  onSuccess: () => void;
  clearSelectedRowKeys: () => void;
  onOpenLogicialDatabase: () => void;
  onOpenObjectStorage: () => void;
  disabledMultiDBChanges?: boolean;
}
const AddDataBaseButton: React.FC<IProps> = ({
  projectId,
  orderedDatabaseIds,
  modalStore,
  onSuccess,
  clearSelectedRowKeys,
  onOpenLogicialDatabase,
  onOpenObjectStorage,
  disabledMultiDBChanges,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const { project } = useContext(ProjectContext);
  const [dataSourceListWithoutFileSystem, setDataSourceListWithoutFileSystem] = useState<
    IConnection[]
  >([]);

  const [form] = Form.useForm<{
    databaseIds: number[];
    ownerIds?: number[];
  }>();

  const { run, loading: saveDatabaseLoading } = useRequest(updateDataBase, {
    manual: true,
  });
  const { loading: dataSourceListLoading } = useRequest(getConnectionList, {
    onSuccess: (e) => {
      // 过滤掉对象存储的数据源
      setDataSourceListWithoutFileSystem(
        e.contents.filter((item) => !isConnectTypeBeFileSystemGroup(item.type)),
      );
    },
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
          defaultMessage: '添加成功',
        }), //添加成功
      );
      setOpen(false);
      onSuccess();
      form.resetFields();
    }
  }

  const items: MenuProps['items'] = [
    {
      label: formatMessage({
        id: 'src.page.Project.Database.components.AddDataBaseButton.BCE1BC95',
        defaultMessage: '配置逻辑库',
      }),
      key: '1',
      onClick: onOpenLogicialDatabase,
    },
    {
      label: formatMessage({
        id: 'src.page.Project.Database.components.AddDataBaseButton.201B0791',
        defaultMessage: '添加对象存储',
      }),
      key: '2',
      onClick: onOpenObjectStorage,
    },
  ];

  return (
    <>
      <Space size={12}>
        <TooltipAction
          title={
            disabledAction
              ? formatMessage({
                  id: 'src.page.Project.Database.AddDataBaseButton.5409D916',
                  defaultMessage: '暂无权限，请先申请数据库权限',
                })
              : ''
          }
        >
          {!settingStore?.enableLogicaldatabase ? (
            <Button type="primary" onClick={() => setOpen(true)} disabled={disabledAction}>
              {formatMessage({
                id: 'src.page.Project.Database.components.AddDataBaseButton.EE4B77AC',
                defaultMessage: '添加数据库',
              })}
            </Button>
          ) : (
            <Dropdown.Button
              type="primary"
              icon={<DownOutlined />}
              menu={{ items }}
              onClick={() => setOpen(true)}
              disabled={disabledAction}
            >
              {formatMessage({
                id: 'src.page.Project.Database.components.AddDataBaseButton.EE4B77AC',
                defaultMessage: '添加数据库',
              })}
            </Dropdown.Button>
          )}
        </TooltipAction>
        <Tooltip
          title={
            disabledMultiDBChanges
              ? formatMessage({
                  id: 'src.page.Project.Database.components.AddDataBaseButton.11CC7812',
                  defaultMessage: '仅支持选择相同类型的数据源的数据库发起多库变更任务',
                })
              : null
          }
        >
          <Button
            disabled={disabledMultiDBChanges}
            onClick={() => {
              modalStore?.changeMultiDatabaseChangeModal(true, {
                projectId,
                orderedDatabaseIds,
              });
              clearSelectedRowKeys?.();
            }}
          >
            {formatMessage({
              id: 'src.page.Project.Database.AddDataBaseButton.693C4817',
              defaultMessage: '多库变更',
            })}
          </Button>
        </Tooltip>
        <ApplyDatabasePermissionButton
          label={
            formatMessage({
              id: 'src.page.Project.Database.AddDataBaseButton.B54F6D7D',
              defaultMessage: '申请库权限',
            }) /*"申请库权限"*/
          }
          projectId={projectId}
        />
      </Space>
      <Modal
        open={open}
        title={formatMessage({
          id: 'odc.Database.AddDataBaseButton.AddDatabase',
          defaultMessage: '添加数据库',
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
                  defaultMessage: '所属数据源',
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
                    defaultMessage: '请选择',
                  })}
                  /*请选择*/ onChange={() =>
                    form.setFieldsValue({
                      databaseIds: [],
                    })
                  }
                >
                  {dataSourceListWithoutFileSystem?.map((item) => {
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
                                    defaultMessage: '该数据源已绑定项目：{itemProjectName}',
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
                required={false}
                label={formatMessage({
                  id: 'odc.Database.AddDataBaseButton.Environment',
                  defaultMessage: '环境',
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
              defaultMessage: '数据库',
            })} /*数据库*/
          >
            <Select
              mode="multiple"
              placeholder={formatMessage({
                id: 'odc.Database.AddDataBaseButton.SelectAnUnassignedDatabase',
                defaultMessage: '请选择未分配项目的数据库',
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
                          defaultMessage: '- 已绑定项目：',
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
};

export default AddDataBaseButton;
