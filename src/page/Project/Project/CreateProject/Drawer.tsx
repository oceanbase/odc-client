/*
 * Copyright 2024 OceanBase
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
import { useRequest } from 'ahooks';
import { Button, Drawer, FormInstance, message, Space } from 'antd';
import { useRef, useState } from 'react';
import CreateProject, { ICreateProjectFormData } from '.';

import { createProject as createProjectService } from '@/common/network/project';
import { ProjectRole } from '@/d.ts/project';

interface IProps {
  onCreate?: () => void;
  disabled?: boolean;
}

export default function CreateProjectDrawer(props: IProps) {
  const [open, setOpen] = useState(false);
  const createProject = useRef<{ form: FormInstance<ICreateProjectFormData> }>();
  const { run, loading, cancel } = useRequest(createProjectService, {
    manual: true,
  });
  async function onSubmit() {
    const data = await createProject?.current?.form?.validateFields();
    if (data) {
      const isSuccess = await run({
        name: data?.name,
        description: data?.description,
        members: data?.owner
          ?.map((item) => ({
            id: item,
            role: ProjectRole.OWNER,
          }))
          .concat(
            data?.dba?.map((item) => ({
              id: item,
              role: ProjectRole.DBA,
            })),
          )
          .concat(
            data?.developer?.map((item) => ({
              id: item,
              role: ProjectRole.DEVELOPER,
            })),
          )
          .concat(
            data?.securityAdministrator?.map((item) => ({
              id: item,
              role: ProjectRole.SECURITY_ADMINISTRATOR,
            })),
          )
          .concat(
            data?.participant?.map((item) => ({
              id: item,
              role: ProjectRole.PARTICIPANT,
            })),
          )
          .filter(Boolean),
      });
      if (isSuccess) {
        message.success(
          formatMessage({ id: 'odc.Project.CreateProject.Drawer.New' }), //新建成功
        );
        setOpen(false);
        props?.onCreate?.();
      }
    }
  }

  function onClose() {
    setOpen(false);
    cancel?.();
  }

  return (
    <>
      <Button
        disabled={props.disabled}
        type="primary"
        onClick={props.disabled ? null : () => setOpen(true)}
      >
        {formatMessage({ id: 'odc.Project.CreateProject.Drawer.CreateAProject' }) /*新建项目*/}
      </Button>
      <Drawer
        width={520}
        onClose={onClose}
        open={open}
        title={formatMessage({
          id: 'odc.Project.CreateProject.Drawer.CreateAProject.1',
        })} /*创建项目*/
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={onClose}>
              {formatMessage({ id: 'odc.Project.CreateProject.Drawer.Cancel' }) /*取消*/}
            </Button>
            <Button loading={loading} type="primary" onClick={onSubmit}>
              {formatMessage({ id: 'odc.Project.CreateProject.Drawer.Ok' }) /*确定*/}
            </Button>
          </Space>
        }
      >
        <CreateProject key={open + ''} ref={createProject} />
      </Drawer>
    </>
  );
}
