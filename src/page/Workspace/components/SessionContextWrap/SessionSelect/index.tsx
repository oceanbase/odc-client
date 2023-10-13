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
import { useContext, useEffect, useMemo, useState } from 'react';
import SessionContext from '../context';

import ConnectionPopover from '@/component/ConnectionPopover';
import Icon, { DownOutlined, LoadingOutlined } from '@ant-design/icons';
import { Dropdown, Popover, Space, Spin, Tag } from 'antd';
import styles from './index.less';

import { ConnectionMode } from '@/d.ts';
import PjSvg from '@/svgr/project_space.svg';
import classNames from 'classnames';
import SelectModal from './modal';
import tracert from '@/util/tracert';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import { useRequest } from 'ahooks';
import { listDatabases } from '@/common/network/database';
import SessionDropdown from './SessionDropdown';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { EnvColorMap } from '@/constant';

export default function SessionSelect({
  readonly,
  dialectTypes,
}: {
  readonly?: boolean;
  dialectTypes?: ConnectionMode[];
}) {
  const context = useContext(SessionContext);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    tracert.expo('a3112.b41896.c330994');
  }, []);

  const { data, loading, run: fetchDatabase } = useRequest(listDatabases, {
    manual: true,
  });

  const databaseOptions = useMemo(() => {
    return data?.contents?.map((item) => {
      return {
        label: item.name,
        key: item.id,
      };
    });
  }, [data]);

  function renderProject() {
    return (
      <Popover
        overlayClassName={styles.pop}
        placement="bottomLeft"
        content={<ConnectionPopover connection={context?.session?.connection} />}
      >
        <Space className={styles.link} size={4}>
          <Icon component={PjSvg} style={{ fontSize: 14, verticalAlign: 'text-bottom' }} />
          <span style={{ verticalAlign: 'top' }}>
            {context?.session?.odcDatabase?.project?.name}
          </span>
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
    const fromDataSource = context?.from === 'datasource' || context.datasourceMode;
    if (readonly) {
      return (
        <>
          {renderEnv()}
          <div className={classNames(styles.readonly)}>
            {fromDataSource ? renderDatasource() : renderProject()}
          </div>
        </>
      );
    }
    return (
      <SessionDropdown>
        <div className={styles.content}>
          {renderEnv()}
          <div>{fromDataSource ? renderDatasource() : renderProject()}</div>
        </div>
      </SessionDropdown>
    );
  }

  return (
    <>
      {!context?.databaseId && !context?.datasourceId ? (
        <div
          style={{
            background: EnvColorMap[context?.session?.odcDatabase?.environment?.style]?.background,
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
            background: EnvColorMap[context?.session?.odcDatabase?.environment?.style]?.background,
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

      {!readonly && (
        <SelectModal
          dialectTypes={dialectTypes || []}
          visible={visible}
          close={() => setVisible(false)}
        />
      )}
    </>
  );
}
