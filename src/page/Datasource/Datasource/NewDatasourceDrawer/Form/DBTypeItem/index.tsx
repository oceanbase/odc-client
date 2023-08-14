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
import OBSvg from '@/svgr/source_ob.svg';
import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';
import { Form, Radio, Space } from 'antd';

import styles from './index.less';

enum DBTypeEnum {
  OceanBase = 'ob',
}

class DBType {
  constructor(public type: DBTypeEnum, public defaultType: ConnectType) {}
}

const oceanbase = new DBType(DBTypeEnum.OceanBase, ConnectType.OB_ORACLE);

const dbType2Ins = {
  [DBTypeEnum.OceanBase]: oceanbase,
};

const typeMap = {
  [ConnectType.CLOUD_OB_MYSQL]: dbType2Ins[DBTypeEnum.OceanBase],
  [ConnectType.CLOUD_OB_ORACLE]: dbType2Ins[DBTypeEnum.OceanBase],
  [ConnectType.OB_MYSQL]: dbType2Ins[DBTypeEnum.OceanBase],
  [ConnectType.OB_ORACLE]: dbType2Ins[DBTypeEnum.OceanBase],
  [ConnectType.ODP_SHARDING_OB_MYSQL]: dbType2Ins[DBTypeEnum.OceanBase],
};

export default function DBTypeItem() {
  const typeSelect = (
    <Form.Item
      shouldUpdate
      requiredMark={false}
      label={formatMessage({ id: 'odc.Form.DBTypeItem.DataSourceType' })} /*数据源类型*/
    >
      {({ getFieldValue, setFieldsValue }) => {
        const type: ConnectType = getFieldValue('type');
        const dbType: DBType = typeMap[type] || dbType2Ins[DBTypeEnum.OceanBase];
        return (
          <Radio.Group
            className={styles.select}
            optionType="button"
            value={dbType.type}
            options={[
              {
                label: (
                  <Space style={{ verticalAlign: 'middle' }}>
                    <div style={{ lineHeight: 1 }}>
                      <Icon style={{ fontSize: 24 }} component={OBSvg} />
                    </div>
                    OceanBase
                  </Space>
                ),

                value: oceanbase.type,
              },
            ]}
            onChange={(e) => {
              const value: DBTypeEnum = e.target.value;
              const ins = dbType2Ins[value];
              if (ins) {
                setFieldsValue({
                  type: ins.defaultType,
                });
              }
            }}
          />
        );
      }}
    </Form.Item>
  );

  return <>{typeSelect}</>;
}
