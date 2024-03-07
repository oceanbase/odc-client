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
import { Button, Descriptions, Dropdown, Space, Tooltip } from 'antd';
import styles from './index.less';
import { MenuClickEventHandler, MenuInfo } from 'rc-menu/lib/interface';
import { IEnvironment } from '@/d.ts/environment';
import Icon, { EllipsisOutlined, ExclamationCircleFilled } from '@ant-design/icons';

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
          <Space size={0}>
            <RiskLevelLabel content={name} color={style} />
            {!enabled && (
              <Tooltip title={formatMessage({ id: 'src.page.Secure.Env.components.60756A4B' })}>
                <ExclamationCircleFilled
                  style={{
                    color: 'var(--function-gold6-color)',
                    cursor: 'pointer',
                  }}
                />
              </Tooltip>
            )}
          </Space>
        </Space>
        <Space>
          <Button
            onClick={handleSwitchEnvEnabled}
            type={enabled ? 'default' : 'primary'}
            loading={loading}
            disabled={loading}
          >
            {enabled
              ? formatMessage({ id: 'src.page.Secure.Env.components.A4A3A31E' })
              : formatMessage({ id: 'src.page.Secure.Env.components.63058F33' })}
          </Button>
          {builtIn ? null : (
            <Dropdown
              menu={{
                items: [
                  {
                    label: formatMessage({ id: 'src.page.Secure.Env.components.FF5B44FE' }), //'编辑环境'
                    key: 'edit',
                  },
                  {
                    label: formatMessage({ id: 'src.page.Secure.Env.components.75B57B74' }), //'删除环境'
                    key: 'delete',
                  },
                ],
                onClick: handleMenuOnClick,
              }}
            >
              <Button style={{ padding: '3.6px 8px' }}>
                <Icon component={EllipsisOutlined} />
              </Button>
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
