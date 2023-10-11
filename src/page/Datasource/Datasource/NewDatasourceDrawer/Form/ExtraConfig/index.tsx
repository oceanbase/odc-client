import { getDataSourceModeConfig } from '@/common/datasource';
import { Collapse, Form, Tabs } from 'antd';
import React, { useContext } from 'react';
import SysForm from '../SysForm';
import DatasourceFormContext from '../context';
import SSLItem from '../SSLItem';
import styles from './index.less';
import InitScriptItem from '../InitScriptItem';
import JDBCParamsItem from '../JDBCParamsItem';

interface IProps {}

const ExtraConfig: React.FC<IProps> = function () {
  const context = useContext(DatasourceFormContext);
  const sysAccountExist = context.isEdit && !!context.originDatasource?.sysTenantUsername;
  const sysItem = {
    label: 'sys 租户账号',
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
    label: '连接初始化脚本',
    key: 'script',
    forceRender: true,
    children: <InitScriptItem />,
  };
  const jdbcItem = {
    label: '驱动属性',
    key: 'jdbc',
    forceRender: true,
    children: <JDBCParamsItem />,
  };
  return (
    <Collapse className={styles.main} ghost>
      <Collapse.Panel key="1" header="高级设置" forceRender>
        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const type = getFieldValue('type');
            const config = getDataSourceModeConfig(type)?.connection;
            return (
              <Tabs
                size="small"
                type="card"
                items={[
                  config?.sys && sysItem,
                  config?.ssl && sslItem,
                  initScriptItem,
                  jdbcItem,
                ].filter(Boolean)}
              />
            );
          }}
        </Form.Item>
      </Collapse.Panel>
    </Collapse>
  );
};

export default ExtraConfig;
