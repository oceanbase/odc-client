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

import { setProjectAchived, updateProject } from '@/common/network/project';
import { IProject, ProjectRole } from '@/d.ts/project';
import { formatMessage } from '@/util/intl';
import { history } from '@umijs/max';
import { Button, Form, Input, message, Popconfirm, Space, Modal, Tooltip } from 'antd';
import { useContext, useEffect, useState } from 'react';
import ProjectContext from '../../ProjectContext';
import { isProjectArchived } from '@/page/Project/helper';
import DeleteProjectModal from '@/page/Project/components/DeleteProjectModal.tsx';
import RelativeResourceModal from '@/component/RelativeResourceModal';
import { getResourceDependencies } from '@/util/request/relativeResource';
import { EEntityType } from '@/d.ts/relativeResource';

export default function Info() {
  const [form] = Form.useForm<Pick<IProject, 'name' | 'description'>>();
  const context = useContext(ProjectContext);
  const projectName = context?.project?.name;
  const [isModify, setIsModify] = useState(false);
  const projectArchived = isProjectArchived(context.project);
  const [openDeleteProjectModal, setOpenDeleteProjectModal] = useState(false);
  const [openArchiveModal, setOpenArchiveModal] = useState(false);
  const isProjectOwner = context?.project?.currentUserResourceRoles?.includes(ProjectRole.OWNER);

  useEffect(() => {
    if (context.project) {
      form.setFieldsValue(context.project);
    }
  }, [context.project]);

  async function onSubmit() {
    const data = await form.validateFields();
    const newData = {
      ...context.project,
      ...data,
    };
    const isSuccess = await updateProject(context?.projectId, newData);
    if (isSuccess) {
      message.success(
        formatMessage({ id: 'odc.Setting.Info.UpdatedSuccessfully', defaultMessage: '更新成功！' }), //更新成功！
      );
      setIsModify(false);
      context?.reloadProject();
    }
  }

  const handleProjectAchived = async () => {
    const res = await getResourceDependencies({ projectId: context.projectId });
    const total =
      res?.flowDependencies?.length ||
      0 + res?.scheduleDependencies?.length ||
      0 + res?.scheduleTaskDependencies?.length ||
      0;
    if (total > 0) {
      setOpenArchiveModal(true);
    } else {
      Modal.confirm({
        title: formatMessage({
          id: 'src.page.Project.Setting.Info.38EA601D',
          defaultMessage: '确定要归档这个项目吗？',
        }),
        content: (
          <p>
            {formatMessage({
              id: 'src.page.Project.Setting.Info.D29E85EF',
              defaultMessage: '项目归档后将不可恢复，但仍保留相关数据，',
            })}
            {formatMessage({
              id: 'src.page.Project.Setting.Info.5666645F',
              defaultMessage: '可前往归档项目中查看项目。',
            })}
          </p>
        ),

        okText: formatMessage({
          id: 'app.button.ok',
          defaultMessage: '确定',
        }),
        cancelText: formatMessage({
          id: 'app.button.cancel',
          defaultMessage: '取消',
        }),
        onOk: async () => {
          const isSuccess = await setProjectAchived({
            projectId: context?.projectId,
            archived: true,
          });
          if (!isSuccess) {
            return;
          }
          message.success(
            formatMessage({
              id: 'odc.Setting.Info.OperationSucceeded',
              defaultMessage: '操作成功',
            }), //操作成功
          );
          history.push('/project');
        },
      });
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Form
        onValuesChange={() => {
          setIsModify(true);
        }}
        form={form}
        initialValues={context.project}
        layout="vertical"
        requiredMark="optional"
      >
        <Form.Item
          required
          name={'name'}
          label={formatMessage({
            id: 'odc.Setting.Info.ProjectName',
            defaultMessage: '项目名称',
          })} /*项目名称*/
        >
          <Input
            placeholder={formatMessage({
              id: 'odc.Setting.Info.EnterAName',
              defaultMessage: '请输入名称',
            })}
            disabled={projectArchived}
            /*请输入名称*/ style={{ width: 400 }}
          />
        </Form.Item>
        <Form.Item
          name={'description'}
          label={formatMessage({
            id: 'odc.Setting.Info.Description',
            defaultMessage: '描述',
          })} /*描述*/
        >
          <Input.TextArea
            placeholder={formatMessage({
              id: 'odc.Setting.Info.EnterADescription',
              defaultMessage: '请输入描述',
            })} /*请输入描述*/
            style={{ width: 480 }}
            disabled={projectArchived}
            autoSize={{ minRows: 4, maxRows: 8 }}
          />
        </Form.Item>
      </Form>
      <Space size={36} direction="vertical">
        <Button disabled={!isModify} type="primary" onClick={onSubmit}>
          {
            formatMessage({
              id: 'odc.Setting.Info.ConfirmModification',
              defaultMessage: '确认修改',
            }) /*确认修改*/
          }
        </Button>
        {projectArchived ? (
          <Tooltip
            title={
              !isProjectOwner
                ? formatMessage({
                    id: 'src.page.Project.Setting.Info.3C89D359',
                    defaultMessage: '暂无权限，请联系管理员',
                  })
                : undefined
            }
          >
            <Button
              danger
              onClick={() => setOpenDeleteProjectModal(true)}
              disabled={!isProjectOwner}
            >
              {formatMessage({
                id: 'src.page.Project.Setting.Info.FF3FCF6B',
                defaultMessage: '删除项目',
              })}
            </Button>
          </Tooltip>
        ) : (
          <Button danger onClick={handleProjectAchived}>
            {
              formatMessage({
                id: 'odc.Setting.Info.ArchiveProject',
                defaultMessage: '归档项目',
              }) /*归档项目*/
            }
          </Button>
        )}
      </Space>
      <DeleteProjectModal
        open={openDeleteProjectModal}
        setOpen={setOpenDeleteProjectModal}
        verifyValue="delete"
        projectList={[{ id: context?.project?.id, name: context?.project?.name }]}
        afterDelete={() => {
          history.push('/project?archived=true');
        }}
      />
      <RelativeResourceModal
        mode={EEntityType.PROJECT}
        open={openArchiveModal}
        id={context?.project?.id}
        title={`项目 ${projectName} 存在以下未完成的工单和作业，暂不支持归档`}
        onCancel={() => setOpenArchiveModal(false)}
      />
    </div>
  );
}
