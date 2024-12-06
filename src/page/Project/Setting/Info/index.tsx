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
import { IProject } from '@/d.ts/project';
import { formatMessage } from '@/util/intl';
import { history } from '@umijs/max';
import { Button, Form, Input, message, Popconfirm, Space, Modal } from 'antd';
import { useContext, useEffect, useState } from 'react';
import ProjectContext from '../../ProjectContext';
import { isProjectArchived } from '@/page/Project/helper';
import { getUnfinishedTickets } from '@/common/network/task';
import TaskList from './TaskList';
import DeleteProjectModal from '@/page/Project/components/DeleteProjectModal.tsx';

export default function Info() {
  const [form] = Form.useForm<Pick<IProject, 'name' | 'description'>>();
  const context = useContext(ProjectContext);
  const [isModify, setIsModify] = useState(false);
  const projectArchived = isProjectArchived(context.project);
  const [openDeleteProjectModal, setOpenDeleteProjectModal] = useState(false);

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
    const res = await getUnfinishedTickets(context.projectId);
    const tatolUnfinishedTicketsCount =
      res?.unfinishedFlowInstances?.length + res?.unfinishedSchedules?.length;
    if (tatolUnfinishedTicketsCount > 0) {
      Modal.error({
        title: '项目存在未完成的工单，暂不支持归档',
        width: 500,
        content: (
          <>
            <div
              style={{ color: 'rgba(0, 0, 0, 0.45)' }}
            >{`以下 ${tatolUnfinishedTicketsCount} 个工单未完成：`}</div>
            {res?.unfinishedFlowInstances?.length > 0 && (
              <Space style={{ marginBottom: '12px' }}>
                <TaskList dataSource={res?.unfinishedFlowInstances} />
              </Space>
            )}
            {res?.unfinishedSchedules?.length > 0 && (
              <Space>
                <TaskList dataSource={res?.unfinishedSchedules} />
              </Space>
            )}
          </>
        ),
      });
    } else {
      Modal.confirm({
        title: '确定要归档这个项目吗？',
        content: '项目归档后将不可恢复，但仍保留相关数据，可前往归档项目中查看项目。',
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
          <Button danger onClick={() => setOpenDeleteProjectModal(true)}>
            删除项目
          </Button>
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
        beforeDelete={() => {
          history.push('/project');
        }}
      />
    </div>
  );
}
