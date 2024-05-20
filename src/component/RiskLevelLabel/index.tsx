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

import { Space, Tag } from 'antd';
import { RiskLevelMap } from '../../page/Secure/interface';
import styles from './index.less';
import { EnvColorMap } from '@/constant';
import Icon from '@ant-design/icons';

import { ReactComponent as defaultRiskLevel } from '@/svgr/defaultRiskLevel.svg';

import { ReactComponent as lowRiskLevel } from '@/svgr/lowRiskLevel.svg';

import { ReactComponent as middleRiskLevel } from '@/svgr/middleRiskLevel.svg';

import { ReactComponent as highRiskLevel } from '@/svgr/highRiskLevel.svg';

export const RenderIconByRiskLevel: React.FC<{
  level: number | string;
}> = ({ level }) => {
  switch (level) {
    case 0:
    case '0': {
      return <Icon component={defaultRiskLevel} />;
    }
    case 1:
    case '1': {
      return <Icon component={lowRiskLevel} />;
    }
    case 2:
    case '2': {
      return <Icon component={middleRiskLevel} />;
    }
    case 3:
    case '3': {
      return <Icon component={highRiskLevel} />;
    }
    default: {
      return null;
    }
  }
};
const RiskLevelLabel: React.FC<{
  iconMode?: boolean;
  level?: number;
  color: string;
  content?: string;
  extra?: string;
}> = ({ iconMode = false, level = -1, color = 'grey', content = '', extra = '' }) => {
  return level === -1 && !content?.length ? (
    <span>-</span>
  ) : iconMode ? (
    <Space size={4}>
      <div>
        <RenderIconByRiskLevel level={level} />
      </div>
      {content && <div>{content}</div>}
      {extra && <div>{extra}</div>}
    </Space>
  ) : (
    <div className={styles.tag}>
      <Tag
        style={{
          background: EnvColorMap[color?.toUpperCase()]?.background,
          color: EnvColorMap[color?.toUpperCase()]?.textColor,
        }}
        color={''}
      >
        {level !== -1 ? RiskLevelMap[level] : content}
        {extra}
      </Tag>
    </div>
  );
};
export const ODCRiskLevelLabel: React.FC<{
  iconMode?: boolean;
  levelMap?: boolean;
  color?: string;
  level: number | string;
  extra?: React.ReactNode;
  content?: React.ReactNode;
}> = ({
  iconMode = false,
  levelMap = false,
  level = -1,
  color = 'grey',
  content = '',
  extra = '',
}) => {
  if (iconMode) {
    return (
      <Space size={4}>
        <div>
          <RenderIconByRiskLevel level={level} />
        </div>
        {levelMap && level !== -1 && RiskLevelMap[level]}
        {content && <div>{content}</div>}
        {extra && <div>{extra}</div>}
      </Space>
    );
  }
  if (level === -1 && !content) {
    return <span>-</span>;
  }
  return <div className={styles.tag}>-</div>;
};
export const ODCTag: React.FC<{
  color: string;
  content?: string;
}> = ({ color = 'grey', content = '' }) => {
  return content?.length ? (
    <div className={styles.tag}>
      <Tag
        style={{
          background: EnvColorMap[color?.toUpperCase()]?.background,
          color: EnvColorMap[color?.toUpperCase()]?.textColor,
        }}
        color={''}
      >
        {content}
      </Tag>
    </div>
  ) : (
    <span>-</span>
  );
};

export default RiskLevelLabel;
