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
import itemStyles from '../ListItem/index.less';
import styles from './index.less';
import classNames from 'classnames';

const ListHeader: React.FC<{ projectTypeIsArchived: boolean }> = ({ projectTypeIsArchived }) => {
  return (
    <div className={classNames(itemStyles.item, styles.header)}>
      {projectTypeIsArchived && (
        <div className={classNames(itemStyles.block, styles.checkbox)}></div>
      )}
      <div
        className={classNames(itemStyles.block, itemStyles.name, styles.headerColumn, styles.pl12)}
      >
        {formatMessage({
          id: 'src.page.Project.Project.ListHeader.AF76B973',
          defaultMessage: '项目名称',
        })}
      </div>
      <div className={classNames(itemStyles.block, itemStyles.desc, styles.headerColumn)}>
        {formatMessage({
          id: 'src.page.Project.Project.ListHeader.AF99B8AE',
          defaultMessage: '描述',
        })}
      </div>
      <div className={classNames(itemStyles.block, itemStyles.users, styles.headerColumn)}>
        {formatMessage({
          id: 'src.page.Project.Project.ListHeader.0DAE7158',
          defaultMessage: '管理员',
        })}
      </div>
      {projectTypeIsArchived && (
        <div className={classNames(itemStyles.block, itemStyles.action)}>
          {formatMessage({
            id: 'src.page.Project.Project.ListHeader.05E551A5',
            defaultMessage: '操作',
          })}
        </div>
      )}
    </div>
  );
};

export default ListHeader;
