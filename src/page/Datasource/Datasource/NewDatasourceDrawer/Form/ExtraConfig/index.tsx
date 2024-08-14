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

import { getDataSourceModeConfig } from '@/common/datasource';
import { haveOCP } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { Collapse, Form, Tabs } from 'antd';
import React, { useContext } from 'react';
import DatasourceFormContext from '../context';
import InitScriptItem from '../InitScriptItem';
import JDBCParamsItem from '../JDBCParamsItem';
import SSLItem from '../SSLItem';
import SysForm from '../SysForm';
import styles from './index.less';
interface IProps {}
const ExtraConfig: React.FC<IProps> = function () {
  const context = useContext(DatasourceFormContext);
  const sysAccountExist = context.isEdit && !!context.originDatasource?.sysTenantUsername;
  const sysItem = {
    label: formatMessage({
      id: 'odc.src.page.Datasource.Datasource.NewDatasourceDrawer.Form.ExtraConfig.SYSTenantAccount',
      defaultMessage: 'sys 租户账号',
    }), //'sys 租户账号'
    key: 'sys',
    forceRender: true,
    children: (
      <SysForm formRef={context.form} isEdit={context.isEdit} sysAccountExist={sysAccountExist} />
    ),
  };
  const sslItem = {
    label: 'SSL',
    key: 'ssl',
    forceRender: true,
    children: <SSLItem />,
  };
  const initScriptItem = {
    label: formatMessage({
      id: 'odc.src.page.Datasource.Datasource.NewDatasourceDrawer.Form.ExtraConfig.ConnectTheInitializedScript',
      defaultMessage: '连接初始化脚本',
    }), //'连接初始化脚本'
    key: 'script',
    forceRender: true,
    children: <InitScriptItem />,
  };
  const jdbcItem = {
    label: formatMessage({
      id: 'odc.src.page.Datasource.Datasource.NewDatasourceDrawer.Form.ExtraConfig.DriveAttribute',
      defaultMessage: '驱动属性',
    }), //'驱动属性'
    key: 'jdbc',
    forceRender: true,
    children: <JDBCParamsItem />,
  };
  return (
    <Collapse className={styles.main} ghost>
      <Collapse.Panel
        key="1"
        header={
          <span style={{ fontWeight: 'bold' }}>
            {formatMessage({
              id: 'odc.src.page.Datasource.Datasource.NewDatasourceDrawer.Form.ExtraConfig.AdvancedSettings',
              defaultMessage: '高级设置',
            })}
          </span> /* 高级设置 */
        }
        forceRender
      >
        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const type = getFieldValue('type');
            const config = getDataSourceModeConfig(type)?.connection;
            return (
              <Tabs
                size="small"
                type="card"
                items={
                  !haveOCP()
                    ? [
                        config?.sys && sysItem,
                        config?.ssl && sslItem,
                        initScriptItem,
                        jdbcItem,
                      ].filter(Boolean)
                    : [initScriptItem]
                }
              />
            );
          }}
        </Form.Item>
      </Collapse.Panel>
    </Collapse>
  );
};
export default ExtraConfig;
