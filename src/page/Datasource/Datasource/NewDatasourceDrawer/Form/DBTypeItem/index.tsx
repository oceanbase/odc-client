import { ConnectType } from '@/d.ts';
import OBSvg from '@/svgr/mysql.svg';
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
    <Form.Item shouldUpdate label="数据源类型">
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
                  <Space>
                    <Icon style={{ fontSize: 18 }} component={OBSvg} />
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
