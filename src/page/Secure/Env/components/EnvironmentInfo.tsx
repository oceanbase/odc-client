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
import { formatMessage } from '@/util/intl';
import { Button, Descriptions, Dropdown, Space } from 'antd';
import styles from './index.less';
import { MenuClickEventHandler, MenuInfo } from 'rc-menu/lib/interface';
import { IEnvironment } from '@/d.ts/environment';

const EnvironmentInfo: React.FC<{
  loading: boolean;
  currentEnvironment: IEnvironment;
  handleSwitchEnvEnabled: () => void;
  handleDeleteEnvironment: () => void;
  handleUpdateEnvironment: () => void;
}> = ({
  loading,
  currentEnvironment,
  handleSwitchEnvEnabled = () => {},
  handleDeleteEnvironment = () => {},
  handleUpdateEnvironment = () => {},
}) => {
  const { name, style, builtIn = true, enabled, description } = currentEnvironment ?? {};
  const handleMenuOnClick: MenuClickEventHandler = (info: MenuInfo) => {
    console.log(info);
    switch (info.key) {
      case 'edit': {
        handleUpdateEnvironment();
        return;
      }
      case 'delete': {
        handleDeleteEnvironment();
        return;
      }
      default: {
        return;
      }
    }
  };
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Space className={styles.tag}>
          <div className={styles.tagLabel}>
            {formatMessage({ id: 'odc.Env.components.InnerEnvironment.LabelStyle' }) /*标签样式:*/}
          </div>
          <RiskLevelLabel content={name} color={style} />
        </Space>
        <Space>
          <Button onClick={handleSwitchEnvEnabled} loading={loading} disabled={loading}>
            {enabled ? '禁用' : '启用'}
          </Button>
          {builtIn ? null : (
            <Dropdown
              menu={{
                items: [
                  { label: '编辑环境', key: 'edit' },
                  { label: '删除环境', key: 'delete' },
                ],
                onClick: handleMenuOnClick,
              }}
            >
              <Button>...</Button>
            </Dropdown>
          )}
        </Space>
      </div>
      <Descriptions column={1}>
        <Descriptions.Item
          contentStyle={{ whiteSpace: 'pre' }}
          label={
            formatMessage({ id: 'odc.Env.components.InnerEnvironment.Description' }) //描述
          }
        >
          {description || '-'}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};
export default EnvironmentInfo;
