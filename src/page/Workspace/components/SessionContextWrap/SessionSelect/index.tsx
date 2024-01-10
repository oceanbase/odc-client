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
import { useContext, useEffect } from 'react';
import SessionContext from '../context';

import ConnectionPopover from '@/component/ConnectionPopover';
import Icon, { DownOutlined, LoadingOutlined } from '@ant-design/icons';
import { Divider, Popover, Space, Spin } from 'antd';
import styles from './index.less';

import { ConnectionMode } from '@/d.ts';
import { ReactComponent as PjSvg } from '@/svgr/project_space.svg';
import classNames from 'classnames';
import tracert from '@/util/tracert';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import SessionDropdown from './SessionDropdown';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { EnvColorMap } from '@/constant';
import login from '@/store/login';

export default function SessionSelect({
  readonly,
}: {
  readonly?: boolean;
  dialectTypes?: ConnectionMode[];
}) {
  const context = useContext(SessionContext);
  useEffect(() => {
    tracert.expo('a3112.b41896.c330994');
  }, []);

  function renderProject() {
    const DBIcon = getDataSourceStyleByConnectType(context?.session?.connection?.type)?.dbIcon;
    return (
      <Popover
        overlayClassName={styles.pop}
        placement="bottomLeft"
        content={<ConnectionPopover connection={context?.session?.connection} />}
      >
        <Space className={styles.link} size={4}>
          <Icon component={PjSvg} style={{ fontSize: 14, verticalAlign: 'text-top' }} />
          <span style={{ verticalAlign: 'top' }}>
            {context?.session?.odcDatabase?.project?.name}
          </span>
          {!context.datasourceMode && (
            <>
              <span>/</span>
              <Icon
                component={DBIcon?.component}
                style={{ fontSize: 14, marginLeft: 2, verticalAlign: 'middle' }}
              />
              {context?.session?.odcDatabase?.name}
            </>
          )}
          <DownOutlined />
        </Space>
      </Popover>
    );
  }

  function renderDatasource() {
    const DBIcon = getDataSourceStyleByConnectType(context?.session?.connection?.type)?.icon;
    return (
      <Popover
        overlayClassName={styles.pop}
        placement="bottomLeft"
        content={<ConnectionPopover connection={context?.session?.connection} />}
      >
        <Space className={styles.link} size={4}>
          <Icon
            component={DBIcon?.component}
            style={{ fontSize: 16, verticalAlign: 'text-top', color: DBIcon?.color }}
          />
          <span style={{ verticalAlign: 'top' }}>{context?.session?.connection?.name}</span>
          {!context.datasourceMode && (
            <>
              <span>/</span>
              {context?.session?.odcDatabase?.name}
            </>
          )}
          <DownOutlined />
        </Space>
      </Popover>
    );
  }
  function renderEnv() {
    if (!context?.session?.odcDatabase?.environment?.name) {
      return null;
    }
    return (
      <div className={styles.tag}>
        <RiskLevelLabel
          color={context?.session?.odcDatabase?.environment?.style}
          content={context?.session?.odcDatabase?.environment?.name}
        />
      </div>
    );
  }
  function renderSessionInfo() {
    const fromDataSource = context.datasourceMode;

    const dsStyle = getDataSourceStyleByConnectType(context?.session?.connection?.type);
    const content = (
      <Popover
        overlayClassName={styles.pop}
        placement="bottomLeft"
        content={<ConnectionPopover connection={context?.session?.connection} />}
      >
        {fromDataSource ? (
          <Space style={{ lineHeight: '22px' }} className={styles.link} size={4}>
            <Icon
              component={dsStyle?.icon?.component}
              style={{ fontSize: 16, verticalAlign: 'middle', color: dsStyle?.icon?.color }}
            />
            <span style={{ lineHeight: 1 }}>{context?.session?.connection?.name}</span>
            <DownOutlined />
          </Space>
        ) : (
          <Space style={{ lineHeight: '22px' }} className={styles.link} size={4}>
            <Icon
              component={dsStyle?.dbIcon?.component}
              style={{ fontSize: 16, verticalAlign: 'middle' }}
            />
            <span style={{ lineHeight: 1 }}>{context?.session?.odcDatabase?.name}</span>
            <DownOutlined />
            <Space
              size={1}
              split={<Divider type="vertical" />}
              style={{ color: 'var(--text-color-hint)', marginLeft: 8 }}
            >
              {login.isPrivateSpace() ? null : (
                <span>项目：{context?.session?.odcDatabase?.project?.name}</span>
              )}
              <span>数据源：{context?.session?.odcDatabase?.dataSource?.name}</span>
            </Space>
          </Space>
        )}
      </Popover>
    );
    if (readonly) {
      return (
        <>
          {renderEnv()}
          <div className={classNames(styles.readonly)}>{content}</div>
        </>
      );
    }
    return (
      <SessionDropdown>
        <div className={styles.content}>
          {renderEnv()}
          <div>{content}</div>
        </div>
      </SessionDropdown>
    );
  }

  return (
    <>
      {!context?.databaseId && !context?.datasourceId ? (
        <div
          style={{
            background:
              EnvColorMap[context?.session?.odcDatabase?.environment?.style]?.lineBackground,
          }}
          className={styles.line}
        >
          <SessionDropdown>
            <a>
              {
                formatMessage({
                  id: 'odc.SessionContextWrap.SessionSelect.SelectADatabase',
                }) /*请选择数据库*/
              }
            </a>
          </SessionDropdown>
        </div>
      ) : (
        <div
          style={{
            background:
              EnvColorMap[context?.session?.odcDatabase?.environment?.style]?.lineBackground,
          }}
          className={styles.line}
        >
          {context?.session ? (
            renderSessionInfo()
          ) : (
            <Spin
              style={{ marginLeft: 20 }}
              spinning={true}
              indicator={<LoadingOutlined style={{ fontSize: 18 }} spin />}
            />
          )}
        </div>
      )}
    </>
  );
}
