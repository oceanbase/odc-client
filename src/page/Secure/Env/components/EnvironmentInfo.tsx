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

import { Acess, canAcess, createPermission } from '@/component/Acess';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { actionTypes, IManagerResourceType } from '@/d.ts';
import { IEnvironment } from '@/d.ts/environment';
import { formatMessage } from '@/util/intl';
import Icon, { EllipsisOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Descriptions, Dropdown, Space, Tooltip } from 'antd';
import { MenuClickEventHandler, MenuInfo } from 'rc-menu/lib/interface';
import styles from './index.less';

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
    switch (info?.key) {
      case actionTypes.update: {
        handleUpdateEnvironment();
        return;
      }
      case actionTypes.delete: {
        handleDeleteEnvironment();
        return;
      }
      default: {
        return;
      }
    }
  };

  const items = [
    {
      label: formatMessage({
        id: 'src.page.Secure.Env.components.FF5B44FE',
        defaultMessage: '编辑环境',
      }), //'编辑环境'
      key: actionTypes.update,
    },
    {
      label: formatMessage({
        id: 'src.page.Secure.Env.components.75B57B74',
        defaultMessage: '删除环境',
      }), //'删除环境'
      key: actionTypes.delete,
    },
  ]
    ?.filter(
      (item) => canAcess(createPermission(IManagerResourceType.environment, item?.key))?.accessible,
    )
    ?.filter(Boolean);
  const hasPremissions = items?.length !== 0;
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Space className={styles.tag}>
          <div className={styles.tagLabel}>
            {
              formatMessage({
                id: 'odc.Env.components.InnerEnvironment.LabelStyle',
                defaultMessage: '标签样式:',
              }) /*标签样式:*/
            }
          </div>
          <Space size={0}>
            <RiskLevelLabel content={name} color={style} />
            {!enabled && (
              <Tooltip
                title={formatMessage({
                  id: 'src.page.Secure.Env.components.60756A4B',
                  defaultMessage: '环境已被禁用',
                })}
              >
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
          <Acess
            fallback={null}
            {...createPermission(IManagerResourceType.environment, actionTypes.update)}
          >
            <Button
              onClick={handleSwitchEnvEnabled}
              type={enabled ? 'default' : 'primary'}
              loading={loading}
              disabled={loading}
            >
              {enabled
                ? formatMessage({
                    id: 'src.page.Secure.Env.components.A4A3A31E',
                    defaultMessage: '禁用',
                  })
                : formatMessage({
                    id: 'src.page.Secure.Env.components.63058F33',
                    defaultMessage: '启用',
                  })}
            </Button>
          </Acess>
          {builtIn || !hasPremissions ? null : (
            <Dropdown
              menu={{
                items,
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
            formatMessage({
              id: 'odc.Env.components.InnerEnvironment.Description',
              defaultMessage: '描述',
            }) //描述
          }
        >
          {description || '-'}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};
export default EnvironmentInfo;
