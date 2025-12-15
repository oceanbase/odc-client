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
import React, { useContext } from 'react';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { DatabaseGroup } from '@/d.ts/database';
import ParamContext from '../ParamContext';
import { ReactComponent as GroupSvg } from '@/svgr/group.svg';
import Icon from '@ant-design/icons';
import FilterIcon from '@/component/Button/FIlterIcon';
import styles from './index.less';

interface IProps {
  border?: boolean;
}

const items: MenuProps['items'] = [
  {
    key: DatabaseGroup.none,
    label: formatMessage({
      id: 'src.page.Project.Database.Header.A1EE90B2',
      defaultMessage: '不分组',
    }),
  },
  {
    key: DatabaseGroup.dataSource,
    label: formatMessage({
      id: 'src.page.Project.Database.Header.5FD57F6A',
      defaultMessage: '按数据源分组',
    }),
  },
  {
    key: DatabaseGroup.connectType,
    label: formatMessage({
      id: 'src.page.Project.Database.Header.E108F9A6',
      defaultMessage: '按类型分组',
    }),
  },
  {
    key: DatabaseGroup.cluster,
    label: formatMessage({
      id: 'src.page.Project.Database.Header.8730FD3B',
      defaultMessage: '按集群分组',
    }),
  },
  {
    key: DatabaseGroup.tenant,
    label: formatMessage({
      id: 'src.page.Project.Database.Header.C4EF591A',
      defaultMessage: '按租户分组',
    }),
  },
  {
    key: DatabaseGroup.environment,
    label: formatMessage({
      id: 'src.page.Project.Database.Header.B1C73CB4',
      defaultMessage: '按环境分组',
    }),
  },
];

const Group: React.FC<IProps> = function ({ border = false }) {
  const context = useContext(ParamContext);

  const handleSelectGroupBy = (e) => {
    context.setGroupMode?.(e.key as DatabaseGroup);
  };
  return (
    <Dropdown
      menu={{
        selectedKeys: [context.groupMode],
        items,
        onClick: handleSelectGroupBy,
      }}
    >
      <FilterIcon
        className={styles.groupIconContainer}
        border={border}
        isActive={context.groupMode !== DatabaseGroup.none}
      >
        <Icon
          component={GroupSvg}
          style={
            context.groupMode !== DatabaseGroup.none
              ? { color: 'var(--icon-color-focus)', fontSize: 16 }
              : { color: 'var(--icon-color-normal)', fontSize: 16 }
          }
        />
      </FilterIcon>
    </Dropdown>
  );
};

export default Group;
