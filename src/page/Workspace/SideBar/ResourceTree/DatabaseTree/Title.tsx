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

import RiskLevelLabel from '@/component/RiskLevelLabel';
import { IDatasource } from '@/d.ts/datasource';
import { IProject } from '@/d.ts/project';
import Icon from '@ant-design/icons';
import ProjectSvg from '@/svgr/project_space.svg';
import { getDataSourceStyleByConnectType } from '@/common/datasource';

export default function TreeTitle({
  project,
  datasource,
}: {
  project?: IProject;
  datasource?: IDatasource;
}) {
  const icon = getDataSourceStyleByConnectType(datasource?.type);
  return (
    <div title={datasource?.name} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      {!!datasource && (
        <>
          <div style={{ flexShrink: 0, flexGrow: 0 }}>
            <Icon
              component={icon?.icon?.component}
              style={{ fontSize: '16px', verticalAlign: 'text-bottom', color: icon?.icon?.color }}
            />
          </div>
          <div
            style={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginLeft: 4,
            }}
          >
            {datasource?.name}
          </div>
        </>
      )}
      {!!project && (
        <>
          <div style={{ flexShrink: 0, flexGrow: 0, paddingRight: 8 }}>
            <Icon
              component={ProjectSvg}
              style={{ fontSize: '14px', verticalAlign: 'text-bottom' }}
            />
          </div>
          <div
            style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {project?.name}
          </div>
        </>
      )}
    </div>
  );
}
