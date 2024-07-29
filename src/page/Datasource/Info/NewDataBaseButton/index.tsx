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

import { createDataBase } from '@/common/network/database';
import { getProject, listProjects } from '@/common/network/project';
import { ConnectionMode } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { Button, Form, Input, message, Modal, Space, Tooltip } from 'antd';
import { toInteger } from 'lodash';
import { useEffect, useState } from 'react';
import ProjectSelect from '../ChangeProjectModal/ProjectSelect';
import { CaseInput } from '@/component/Input/Case';
import { getDataSourceModeConfigByConnectionMode } from '@/common/datasource';
import { DatabaseOwnerSelect } from '@/page/Project/Database/components/DatabaseOwnerSelect.tsx';
import { IProject } from '@/d.ts/project';

interface IProps {
  dataSourceId: string;
  projectId: number;
  projectName: string;
  onSuccess: () => void;
  mode: ConnectionMode;
}
export default function NewDataBaseButton({
  dataSourceId,
  projectId,
  projectName,
  onSuccess,
  mode,
}: IProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [projectInfo, setProjectInfo] = useState<IProject>(null);
  const [ownerSelectStatus, setOwnerSelectStatus] = useState<boolean>(false);
  const [form] = Form.useForm<
    Pick<IDatabase, 'name' | 'collationName' | 'charsetName'> & {
      projectId?: number;
      ownerIds?: number[];
    }
  >();
  const { run, loading } = useRequest(createDataBase, {
    manual: true,
  });
  const haveCharset = ![ConnectionMode.OB_ORACLE, ConnectionMode.ORACLE].includes(mode);
  const { data: project, loading: projectListLoading } = useRequest(listProjects, {
    defaultParams: [null, 1, 99999],
  });
  const sqlConfig = getDataSourceModeConfigByConnectionMode(mode)?.sql;
  function close() {
    setOpen(false);
    form.resetFields();
    setProjectInfo(null);
  }

  const getProjectDetails = async (projectId: number) => {
    const res = await getProject(projectId);
    res && setProjectInfo(res);
  };

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (projectId) {
        form.setFieldsValue({
          projectId: projectId,
        });
        getProjectDetails(projectId);
      }
    }
    switch (mode) {
      case ConnectionMode.OB_MYSQL:
      case ConnectionMode.MYSQL: {
        form.setFieldsValue({
          collationName: 'utf8_general_ci',
          charsetName: 'utf8',
        });
        return;
      }
      case ConnectionMode.OB_ORACLE:
      case ConnectionMode.ORACLE: {
        return;
      }
      case ConnectionMode.DORIS: {
        form.setFieldsValue({
          collationName: 'utf8_general_ci',
          charsetName: 'utf8',
        });
        return;
      }
    }
  }, [mode, open]);

  async function submit() {
    const formData = await form.validateFields();
    if (!formData) {
      return;
    }
    const isSuccess = await run({
      name: formData.name,
      collationName: formData?.collationName,
      charsetName: formData.charsetName,
      project: {
        id: formData?.projectId,
      },
      dataSource: {
        id: toInteger(dataSourceId),
      },
      ownerIds: formData.ownerIds,
    });
    if (isSuccess) {
      message.success(
        formatMessage({
          id: 'odc.Info.NewDataBaseButton.New',
          defaultMessage: '新建成功',
        }), //新建成功
      );
      setOpen(false);
      onSuccess();
      setOwnerSelectStatus(false);
      form.resetFields();
      setProjectInfo(null);
    }
  }
  return (
    <>
      <Button onClick={() => setOpen(true)} type="primary">
        {
          formatMessage({
            id: 'odc.Info.NewDataBaseButton.CreateADatabase',
            defaultMessage: '新建数据库',
          }) /*新建数据库*/
        }
      </Button>
      <Modal
        open={open}
        title={formatMessage({
          id: 'odc.Info.NewDataBaseButton.CreateADatabase',
          defaultMessage: '新建数据库',
        })}
        /*新建数据库*/ onOk={submit}
        onCancel={close}
        destroyOnClose
      >
        <Form
          form={form}
          initialValues={{}}
          layout="vertical"
          onValuesChange={async (changedValues, allValues) => {
            if (changedValues.hasOwnProperty('projectId')) {
              if (changedValues.projectId) {
                getProjectDetails(changedValues.projectId);
              } else {
                setProjectInfo(null);
              }
              form.setFieldValue('ownerIds', []);
            }
          }}
        >
          <Form.Item
            name={'name'}
            label={formatMessage({
              id: 'odc.Info.NewDataBaseButton.DatabaseName',
              defaultMessage: '数据库名称',
            })} /*数据库名称*/
          >
            <CaseInput
              caseSensitive={sqlConfig?.caseSensitivity}
              escapes={sqlConfig?.escapeChar}
              style={{
                width: 320,
              }}
              placeholder={formatMessage({
                id: 'odc.Info.NewDataBaseButton.PleaseEnter',
                defaultMessage: '请输入',
              })} /*请输入*/
            />
          </Form.Item>
          {haveCharset && (
            <Space>
              <Form.Item
                name={'charsetName'}
                label={formatMessage({
                  id: 'odc.Info.NewDataBaseButton.CharacterEncoding',
                  defaultMessage: '字符编码',
                })} /*字符编码*/
              >
                <Input
                  style={{
                    width: 200,
                  }}
                  placeholder={formatMessage({
                    id: 'odc.Info.NewDataBaseButton.PleaseEnter',
                    defaultMessage: '请输入',
                  })} /*请输入*/
                  disabled={mode === ConnectionMode.DORIS}
                />
              </Form.Item>
              <Form.Item
                name={'collationName'}
                label={formatMessage({
                  id: 'odc.Info.NewDataBaseButton.SortingRules',
                  defaultMessage: '排序规则',
                })} /*排序规则*/
              >
                <Input
                  style={{
                    width: 200,
                  }}
                  placeholder={formatMessage({
                    id: 'odc.Info.NewDataBaseButton.PleaseEnter',
                    defaultMessage: '请输入',
                  })} /*请输入*/
                  disabled={mode === ConnectionMode.DORIS}
                />
              </Form.Item>
            </Space>
          )}

          <Form.Item
            name={'projectId'}
            label={
              formatMessage({
                id: 'odc.src.page.Datasource.Info.NewDataBaseButton.Project',
                defaultMessage: '项目',
              }) //'项目'
            }
          >
            <ProjectSelect
              defaultProject={{
                projectName: projectName,
                projectId: projectId,
              }}
              disabled={!!projectId}
              disabledTip={
                formatMessage(
                  {
                    id: 'odc.src.page.Datasource.Info.NewDataBaseButton.CurrentDataSourceProject',
                    defaultMessage:
                      '当前数据源所属项目【{projectName}】, 无法修改，可通过编辑数据源修改所属项目',
                  },
                  { projectName },
                ) //`当前数据源所属项目【${projectName}】, 无法修改，可通过编辑数据源修改所属项目`
              }
              projects={project?.contents}
              currentDatabase={null}
              setDisabledStatus={(status) => setOwnerSelectStatus(status)}
            />
          </Form.Item>
          <DatabaseOwnerSelect
            projectInfo={projectInfo}
            hasDefaultSet={false}
            setFormOwnerIds={(value) => {
              form.setFieldsValue({
                ownerIds: value,
              });
            }}
            disabled={ownerSelectStatus}
          />
        </Form>
      </Modal>
    </>
  );
}
