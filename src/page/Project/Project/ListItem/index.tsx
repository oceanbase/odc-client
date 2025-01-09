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

import { IProject, ProjectRole } from '@/d.ts/project';
import Icon from '@ant-design/icons';
import { Checkbox, Tooltip } from 'antd';
import classNames from 'classnames';
import React, { forwardRef, useMemo } from 'react';
import styles from './index.less';
import type { SelectProject } from '@/page/Project/components/DeleteProjectModal.tsx';
import { ReactComponent as ProjectSvg } from '@/svgr/project_space.svg';
import { ReactComponent as UserSvg } from '@/svgr/user.svg';

interface IProps {
  data: IProject;
  onClick: (p: IProject) => void;
  action: React.ReactElement;
  onSelectChange?: (isSelected: boolean, params: any) => void;
  selectProjectList: SelectProject[];
}

export default forwardRef(function ListItem(
  { data, onClick, action, onSelectChange, selectProjectList }: IProps,
  ref: React.Ref<HTMLDivElement>,
) {
  const onChange = (e) => {
    onSelectChange(e.target.checked, {
      id: data.id,
      name: data.name,
    });
  };

  const isDisabledCheckbox = useMemo(() => {
    return !data?.currentUserResourceRoles?.includes(ProjectRole.OWNER);
  }, [data?.currentUserResourceRoles]);

  return (
    <div ref={ref} className={classNames(styles.item)} onClick={onClick.bind(this, data)}>
      {action && (
        <div
          className={classNames(styles.block)}
          style={{ marginLeft: '8px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title={isDisabledCheckbox ? '暂无权限，请联系管理员' : undefined}>
            <Checkbox
              onChange={onChange}
              disabled={isDisabledCheckbox}
              checked={selectProjectList.some((item) => item.id === data.id)}
            ></Checkbox>
          </Tooltip>
        </div>
      )}

      <div className={classNames(styles.block, styles.status)}>
        <Icon component={ProjectSvg} style={{ color: 'var(--icon-blue-color)', fontSize: 16 }} />
      </div>
      <div className={classNames(styles.block, styles.name)}>{data.name}</div>
      <div className={classNames(styles.block, styles.desc)}>{data.description || '-'}</div>
      <div className={classNames(styles.block, styles.users)}>
        <Icon style={{ color: 'var(--icon-color-disable)', marginRight: 5 }} component={UserSvg} />
        {Array.from(
          new Set(
            data.members?.filter((item) => item.role === ProjectRole.OWNER)?.map((a) => a.name),
          ),
        )?.join(', ') || '-'}
      </div>
      {action && <div className={classNames(styles.block, styles.action)}>{action}</div>}
    </div>
  );
});
