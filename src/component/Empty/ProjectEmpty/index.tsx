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
import { Result } from 'antd';
import styles from './index.less';
import { ProjectTabType } from '@/d.ts/project';

interface ProjectEmptyProps {
  type: ProjectTabType;
  renderActionButton: () => JSX.Element;
}

const ProjectEmpty: React.FC<ProjectEmptyProps> = ({ type, renderActionButton }) => {
  const renderTitle = (type) => {
    switch (type) {
      case ProjectTabType.ALL:
        return (
          <div className={styles.title}>
            {formatMessage({
              id: 'src.component.Empty.ProjectEmpty.9FECA85F',
              defaultMessage: '暂无项目',
            })}
          </div>
        );
      case ProjectTabType.ARCHIVED:
        return (
          <div className={styles.title}>
            {formatMessage({
              id: 'src.component.Empty.ProjectEmpty.328FFA9A',
              defaultMessage: '暂无归档项目',
            })}
          </div>
        );
      default:
        return '';
    }
  };

  const renderSubTitle = (type) => {
    switch (type) {
      case ProjectTabType.ALL:
        return (
          <div className={styles.subTitle}>
            <div>
              {formatMessage({
                id: 'src.component.Empty.ProjectEmpty.027DBCF9',
                defaultMessage: '作为业务协同的最小协作单元，提供统一管控规则',
              })}
            </div>
            <div>
              {formatMessage({
                id: 'src.component.Empty.ProjectEmpty.C753B59D',
                defaultMessage: '保障团队的高效协同和数据源安全变更',
              })}
            </div>
          </div>
        );

      case ProjectTabType.ARCHIVED:
        return (
          <div className={styles.subTitle}>
            <div>
              {formatMessage({
                id: 'src.component.Empty.ProjectEmpty.C35E7838',
                defaultMessage: '项目归档后，将不再支持任何协同开发活动',
              })}
            </div>
          </div>
        );

      default:
        return;
    }
  };

  return (
    <>
      <Result
        status={'success'}
        title={renderTitle(type)}
        subTitle={renderSubTitle(type)}
        icon={
          <img
            src={window.publicPath + 'img/graphic_empty.svg'}
            style={{ height: 102, width: 132 }}
          />
        }
      />

      {type === ProjectTabType.ALL && renderActionButton()}
    </>
  );
};

export default ProjectEmpty;
