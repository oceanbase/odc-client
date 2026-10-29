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
import { IDatabase } from '@/d.ts/database';
import { Space, Tooltip } from 'antd';
import Icon from '@ant-design/icons';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import React from 'react';

interface IProps {
  database: IDatabase;
}

const DatabaseLabel: React.FC<IProps> = (props) => {
  const { database } = props;
  const dbIcon = getDataSourceStyleByConnectType(database?.dataSource?.type)?.dbIcon;

  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
      {!!database?.environment?.name && (
        <RiskLevelLabel
          content={database?.environment?.name}
          color={database?.environment?.style}
        />
      )}
      <Icon
        component={dbIcon?.component}
        style={{ fontSize: 16, marginRight: 4, verticalAlign: 'textBottom' }}
      />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        <Tooltip title={database?.name}>
          <div
            style={{
              overflow: 'hidden',
              maxWidth: '100%',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: 'max-content',
            }}
          >
            {database?.name || '-'}
          </div>
        </Tooltip>
        <span
          style={{
            color: 'var(--text-color-secondary)',
            marginLeft: '4px',
          }}
        >
          {database?.remark}
        </span>
      </div>
    </div>
  );
};
export default DatabaseLabel;
