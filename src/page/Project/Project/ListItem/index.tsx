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
import { Space } from 'antd';
import classNames from 'classnames';
import React, { forwardRef } from 'react';
import styles from './index.less';

import { ReactComponent as ProjectSvg } from '@/svgr/project_space.svg';
import { ReactComponent as UserSvg } from '@/svgr/user.svg';

interface IProps {
  data: IProject;
  onClick: (p: IProject) => void;
}

export default forwardRef(function ListItem(
  { data, onClick }: IProps,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className={classNames(styles.item, { [styles.itemDisable]: data?.archived })}
      onClick={onClick.bind(this, data)}
    >
      <div className={classNames(styles.block, styles.status)}>
        <Icon component={ProjectSvg} style={{ color: 'var(--icon-blue-color)', fontSize: 16 }} />
      </div>
      <div className={classNames(styles.block, styles.name)}>{data.name}</div>
      <div className={classNames(styles.block, styles.desc)}>{data.description || '-'}</div>
      <div className={classNames(styles.block, styles.users)}>
        <Space>
          <Icon style={{ color: 'var(--icon-color-disable)' }} component={UserSvg} />
          {data.members
            ?.filter((item) => item.role === ProjectRole.OWNER)
            ?.map((a) => a.name)
            ?.join(', ') || '-'}
        </Space>
      </div>
    </div>
  );
});
