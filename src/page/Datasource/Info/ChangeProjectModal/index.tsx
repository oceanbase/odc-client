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

import { updateDataBase } from '@/common/network/database';
import { getProject, listProjects } from '@/common/network/project';
import { IDatabase } from '@/d.ts/database';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { Alert, Form, message, Modal, notification, Typography } from 'antd';
import { isUndefined } from 'lodash';
import { useEffect, useState } from 'react';
import ProjectSelect from './ProjectSelect';
import { DatabaseOwnerSelect } from '@/page/Project/Database/components/DatabaseOwnerSelect';
import { IProject } from '@/d.ts/project';
import RelativeResourceModal from '@/component/RelativeResourceModal';
import { getResourceDependencies } from '@/util/request/relativeResource';
import useResourceDepNotification, {
  EResourceType,
  EStatus,
} from '@/util/hooks/useResourceDepNotification';
import { EEntityType } from '@/d.ts/relativeResource';

interface IProps {
  visible: boolean;
  database: IDatabase;
  close: () => void;
  onSuccess: () => void;
}
export default function ChangeProjectModal({ visible, database, close, onSuccess }: IProps) {
  const [projectInfo, setProjectInfo] = useState<IProject>();
  const [ownerSelectStatus, setOwnerSelectStatus] = useState<boolean>(false);
  const [openDepResourceModal, setOpenDepResourceModal] = useState(false);
  const [form] = Form.useForm();
  const { contextHolder, openNotification } = useResourceDepNotification();
  const databaseName = database?.name || '-';

  const { data, loading, run } = useRequest(listProjects, {
    manual: true,
  });
  useEffect(() => {
    if (visible) {
      run(null, 1, 9999);
      const owner_ids = database?.owners?.map(({ id }) => id) || [];
      form.setFieldsValue({
        project: database?.project?.id || null,
        ownerIds: owner_ids,
      });
      if (database?.project?.id) {
        getProjectDetail(database?.project?.id);
      } else {
        setOwnerSelectStatus(true);
      }
    }
  }, [visible]);

  const getProjectDetail = async (project) => {
    const res = await getProject(project);
    res && setProjectInfo(res);
  };

  const onClose = () => {
    close();
    setProjectInfo(null);
    setOwnerSelectStatus(false);
    form.resetFields();
  };
  const handleChangeProject = async (): Promise<void> => {
    const value = await form.validateFields();
    const selectedProject = data?.contents?.find((project) => project.id === value.project);
    openNotification({
      name: database?.name,
      type: EResourceType.DATABASE,
      status: EStatus.LOADING,
    });
    const isSuccess = await updateDataBase([database?.id], value.project, value.ownerIds, true);
    if (isSuccess) {
      setOpenDepResourceModal(false);
      openNotification({
        name: database?.name,
        type: EResourceType.DATABASE,
        status: EStatus.SUCCESS,
        projectName: selectedProject?.name,
      });
      onClose();
      onSuccess();
    } else {
      openNotification({
        name: database?.name,
        type: EResourceType.DATABASE,
        status: EStatus.FAILED,
      });
    }
  };

  const handleConfirm = async () => {
    const res = await getResourceDependencies({ databaseIds: database?.id });
    const total =
      res?.flowDependencies?.length ||
      0 + res?.scheduleDependencies?.length ||
      0 + res?.scheduleTaskDependencies?.length ||
      0;
    if (total > 0) {
      setOpenDepResourceModal(true);
      return;
    } else {
      handleChangeProject();
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={
          formatMessage({
            id: 'odc.src.page.Datasource.Info.ChangeProjectModal.ModifyTheProject',
            defaultMessage: '修改所属项目',
          }) //'修改所属项目'
        }
        open={visible}
        onCancel={onClose}
        onOk={handleConfirm}
      >
        <Form
          requiredMark="optional"
          form={form}
          layout="vertical"
          onValuesChange={async (changedValues, allValues) => {
            if (changedValues.hasOwnProperty('project')) {
              if (changedValues.project) {
                getProjectDetail(changedValues.project);
              } else {
                setProjectInfo(undefined);
              }
              form.setFieldValue('ownerIds', []);
            }
          }}
        >
          <Form.Item>
            {
              formatMessage({
                id: 'odc.Info.ChangeProjectModal.DatabaseName',
                defaultMessage: '数据库名称：',
              }) /*数据库名称：*/
            }

            {database?.name}
            <Alert
              style={{ marginTop: '6px' }}
              type="info"
              message={formatMessage({
                id: 'src.page.Datasource.Info.ChangeProjectModal.1FCE3834',
                defaultMessage:
                  '通过该入口修改库所属项目或库管理员会导致针对该库的库权限分配失效。若只需修改库管理员且希望库权限分配不受影响，可通过【设置库管理员】入口进行调整。',
              })}
              showIcon
            />
          </Form.Item>
          <Form.Item
            required
            rules={[
              {
                validator(rule, value, callback) {
                  if (isUndefined(value)) {
                    callback(
                      formatMessage({
                        id: 'odc.Info.ChangeProjectModal.PleaseSelectAProject',
                        defaultMessage: '请选择项目',
                      }), //请选择项目
                    );

                    return;
                  }
                  callback();
                },
              },
            ]}
            label={
              formatMessage({
                id: 'odc.src.page.Datasource.Info.ChangeProjectModal.Project',
                defaultMessage: '项目',
              }) //'项目'
            }
            name={'project'}
          >
            <ProjectSelect
              projects={data?.contents}
              currentDatabase={database}
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
        <RelativeResourceModal
          open={openDepResourceModal}
          id={database?.id}
          mode={EEntityType.DATABASE}
          dataSourceName={database?.dataSource?.name}
          title={`确定要修改数据库 ${databaseName} 的所属项目吗？`}
          onCancel={() => setOpenDepResourceModal(false)}
          customSuccessHandler={handleChangeProject}
        />
      </Modal>
    </>
  );
}
