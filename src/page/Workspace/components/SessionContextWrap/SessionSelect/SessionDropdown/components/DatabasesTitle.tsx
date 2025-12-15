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

import { IDatabasesTitleProps } from '../index';
import { hasPermission, TaskTypeMap } from '@/component/Task/helper';
import { Badge, Popover, Spin, Tooltip, Tree, Button, Radio } from 'antd';
import { formatMessage } from '@/util/intl';
import styles from '../index.less';
import { EnvColorMap } from '@/constant';
import ConnectionPopover from '@/component/ConnectionPopover';

export const GroupNodeTitle = (props) => {
  const { item } = props;
  return (
    <div className={styles.groupItem}>
      <span>{item?.groupName}</span>
      <Tooltip title={item?.tip}>
        <span className={styles.tip}>{item?.tip}</span>
      </Tooltip>
    </div>
  );
};

const DatabasesTitle: React.FC<IDatabasesTitleProps> = (props) => {
  const { taskType, db, disabled } = props;
  const task = TaskTypeMap?.[taskType] || '';
  return (
    <>
      {disabled ? (
        <Tooltip
          placement={'right'}
          title={
            formatMessage(
              {
                id: 'src.page.Workspace.components.SessionContextWrap.SessionSelect.SessionDropdown.DC4CF38C',
                defaultMessage: '暂无{task}权限，请先申请库权限',
              },
              { task },
            ) /*`暂无${task}权限，请先申请库权限`*/
          }
        >
          <div className={styles.textoverflow}>{db.name}</div>
        </Tooltip>
      ) : (
        <Popover
          showArrow={false}
          placement={'right'}
          content={<ConnectionPopover connection={db?.dataSource} database={db} showRemark />}
        >
          <div className={styles.databaseItem}>
            <span className={styles.textoverflow}>{db.name}</span>
            <span className={styles.dataSourceInfo}>{db?.dataSource?.name}</span>
          </div>
        </Popover>
      )}

      <Badge color={EnvColorMap[db?.environment?.style?.toUpperCase()]?.tipColor} />
    </>
  );
};

export default DatabasesTitle;
