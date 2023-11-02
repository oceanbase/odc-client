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

import { ConnectType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';
import { Form, Radio, Space } from 'antd';

import styles from './index.less';
import { IDataSourceType } from '@/d.ts/datasource';
import { getDataSourceStyle, getDefaultConnectType, getDsByConnectType } from '@/common/datasource';

export default function DBTypeItem() {
  const typeSelect = (
    <Form.Item
      shouldUpdate
      requiredMark={false}
      label={formatMessage({ id: 'odc.Form.DBTypeItem.DataSourceType' })} /*数据源类型*/
    >
      {({ getFieldValue, setFieldsValue }) => {
        const type: ConnectType = getFieldValue('type');
        const ds = getDsByConnectType(type) || IDataSourceType.OceanBase;
        return (
          <Radio.Group
            className={styles.select}
            value={ds}
            onChange={(e) => {
              const defaultType: ConnectType = getDefaultConnectType(e.target.value);
              if (defaultType) {
                setFieldsValue({
                  type: defaultType,
                });
              }
            }}
          >
            <Space>
              <Radio.Button value={IDataSourceType.OceanBase}>
                <Space style={{ verticalAlign: 'middle' }}>
                  <div style={{ lineHeight: 1 }}>
                    <Icon
                      style={{
                        fontSize: 24,
                        color: getDataSourceStyle(IDataSourceType.OceanBase)?.icon?.color,
                      }}
                      component={getDataSourceStyle(IDataSourceType.OceanBase)?.icon?.component}
                    />
                  </div>
                  OceanBase
                </Space>
              </Radio.Button>
              <Radio.Button value={IDataSourceType.MySQL}>
                <Space style={{ verticalAlign: 'middle' }}>
                  <div style={{ lineHeight: 1 }}>
                    <Icon
                      style={{
                        fontSize: 24,
                        color: getDataSourceStyle(IDataSourceType.MySQL)?.icon?.color,
                      }}
                      component={getDataSourceStyle(IDataSourceType.MySQL)?.icon?.component}
                    />
                  </div>
                  MySQL
                </Space>
              </Radio.Button>
            </Space>
          </Radio.Group>
        );
      }}
    </Form.Item>
  );

  return <>{typeSelect}</>;
}
