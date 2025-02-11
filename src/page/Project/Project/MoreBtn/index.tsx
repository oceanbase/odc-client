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
import { Dropdown, Tooltip, Button } from 'antd';
import { inject, observer } from 'mobx-react';
import { EllipsisOutlined } from '@ant-design/icons';
import styles from './index.less';
import { useState } from 'react';
import { IProject, ProjectRole } from '@/d.ts/project';
import DeleteProjectModal from '@/page/Project/components/DeleteProjectModal.tsx';
import { IOperation, ArchivedProjectOperationKey } from '@/d.ts/operation';

enum Actions {
  REMOVE = 'remove',
}

interface MoreBtnProps {
  project: IProject;
  reload: () => void;
}

const MoreBtn: React.FC<MoreBtnProps> = function (props) {
  const { project, reload } = props;
  const [openDeleteProjectModal, setOpenDeleteProjectModal] = useState(false);

  const operation: IOperation[] = [
    {
      key: ArchivedProjectOperationKey.REMOVE,
      action: () => setOpenDeleteProjectModal(true),
      disable: !project?.currentUserResourceRoles?.includes(ProjectRole.OWNER),
      disableTooltip: () => {
        if (!project?.currentUserResourceRoles?.includes(ProjectRole.OWNER)) {
          return formatMessage({
            id: 'src.page.Project.Project.MoreBtn.AF228484',
            defaultMessage: '暂无权限，请联系管理员',
          });
        } else {
          return '';
        }
      },
      text: formatMessage({
        id: 'src.page.Project.Project.MoreBtn.CF5D6A1D',
        defaultMessage: '删除项目',
      }),
    },
  ];

  return (
    <>
      <Dropdown
        placement={'bottomRight'}
        dropdownRender={() => (
          <div className={styles.content}>
            {operation.map((item) => (
              <Tooltip title={item.disableTooltip()}>
                <Button type="text" key={item.key} onClick={item.action} disabled={item.disable}>
                  {item.text}
                </Button>
              </Tooltip>
            ))}
          </div>
        )}
      >
        <EllipsisOutlined
          style={{
            cursor: 'default',
            fontSize: 14,
            color: 'var(--icon-color-normal)',
          }}
        />
      </Dropdown>
      <DeleteProjectModal
        open={openDeleteProjectModal}
        setOpen={setOpenDeleteProjectModal}
        projectList={[{ id: project.id, name: project.name }]}
        verifyValue="delete"
        afterDelete={reload}
      ></DeleteProjectModal>
    </>
  );
};

export default inject('modalStore')(observer(MoreBtn));
