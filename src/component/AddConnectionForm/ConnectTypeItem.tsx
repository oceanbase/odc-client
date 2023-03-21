import Helpdoc from '@/component/helpDoc';
import { ConnectionMode, ConnectType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Form, Radio } from 'antd';
import React, { useCallback, useMemo } from 'react';

import { haveOCP } from '@/util/env';
import styles from './index.less';

enum DBLogicType {
  NONE,
  SHARDING,
}

enum DBCloudType {
  NONE,
  CLOUD,
}

interface IConnectTypeItemProps {
  onlySys: boolean;
  isEdit: boolean;
  typeInValidMessage?: string;
  dbLogicType: DBLogicType;
  cloudType: DBCloudType;
  dbMode: ConnectionMode;
  innerChange: (dbLogicType, cloudType, dbMode) => void;
}

const DBLogicTypeItem: React.FC<IConnectTypeItemProps> = (props) => {
  const { dbLogicType, cloudType, dbMode, onlySys, isEdit, innerChange } = props;
  return (
    <Form.Item
      label={formatMessage({
        id: 'odc.component.AddConnectionForm.ConnectTypeItem.DatabaseType',
      })}
      /*数据库类型*/ shouldUpdate
      className={styles.noRequiredMark}
    >
      <Radio.Group
        value={dbLogicType}
        onChange={(e) => {
          const v = e.target.value;
          innerChange(v, cloudType, dbMode);
        }}
        disabled={onlySys}
      >
        <Radio disabled={isEdit} value={DBLogicType.NONE}>
          {
            formatMessage({
              id: 'odc.component.AddConnectionForm.ConnectTypeItem.PhysicalDatabase',
            })
            /*物理库*/
          }

          <Helpdoc isTip doc="normalDB" />
        </Radio>
        <Radio disabled={isEdit} value={DBLogicType.SHARDING}>
          {
            formatMessage({
              id: 'odc.component.AddConnectionForm.ConnectTypeItem.LogicalDatabase',
            })
            /*逻辑库*/
          }

          <Helpdoc isTip doc="shardingDB" />
        </Radio>
      </Radio.Group>
    </Form.Item>
  );
};

const DBCloudTypeItem: React.FC<IConnectTypeItemProps> = (props) => {
  const { dbLogicType, cloudType, dbMode, onlySys, isEdit, innerChange } = props;

  return (
    <>
      {!haveOCP() ? (
        <Form.Item
          className={styles.noRequiredMark}
          label={
            <Helpdoc leftText doc="connectType" isTip>
              {formatMessage({
                id: 'portal.connection.form.connectType',
              })}
            </Helpdoc>
          }
        >
          <Radio.Group
            value={dbLogicType !== DBLogicType.NONE ? null : cloudType}
            disabled={onlySys || dbLogicType !== DBLogicType.NONE}
            onChange={(e) => {
              const v = e.target.value;
              innerChange(dbLogicType, v, dbMode);
            }}
          >
            <Radio disabled={isEdit} value={DBCloudType.NONE}>
              {
                formatMessage({
                  id: 'odc.AddConnectionDrawer.AddConnectionForm.IndependentDeployment',
                })

                /* 独立部署 */
              }
              /
              {
                formatMessage({
                  id: 'odc.AddConnectionDrawer.AddConnectionForm.ApsaraStack',
                })

                /* 专有云 */
              }
            </Radio>
            <Radio disabled={isEdit} value={DBCloudType.CLOUD}>
              {formatMessage({
                id: 'odc.AddConnectionDrawer.AddConnectionForm.PublicCloud',
              })}
            </Radio>
          </Radio.Group>
        </Form.Item>
      ) : null}
    </>
  );
};

const DbModeItem: React.FC<IConnectTypeItemProps> = (props) => {
  const { dbLogicType, cloudType, dbMode, onlySys, isEdit, typeInValidMessage, innerChange } =
    props;
  return (
    <Form.Item
      className={styles.noRequiredMark}
      validateStatus={!!typeInValidMessage ? 'error' : null}
      help={typeInValidMessage}
      label={
        <Helpdoc leftText doc="dbMode" isTip>
          {formatMessage({
            id: 'portal.connection.form.mode',
          })}
        </Helpdoc>
      }
    >
      <Radio.Group
        disabled={onlySys || dbLogicType === DBLogicType.SHARDING}
        value={dbMode}
        onChange={(e) => {
          const v = e.target.value;
          innerChange(dbLogicType, cloudType, v);
        }}
      >
        <Radio value={ConnectionMode.OB_ORACLE} disabled={isEdit}>
          Oracle
        </Radio>
        <Radio value={ConnectionMode.OB_MYSQL} disabled={isEdit}>
          MySQL
        </Radio>
      </Radio.Group>
    </Form.Item>
  );
};

interface IProps {
  onlySys: boolean;
  isEdit: boolean;
  typeInValidMessage: string;
  value?: ConnectType;
  onChange?: (value: ConnectType) => void;
  children: (props: {
    dBLogicTypeItem: React.ReactElement;
    dBCloudTypeItem: React.ReactElement;
    dbModeItem: React.ReactElement;
  }) => React.ReactElement;
}

const ConnectTypeItem: React.FC<IProps> = function (props) {
  const { value, isEdit, onlySys, typeInValidMessage, onChange, children } = props;

  const [dbLogicType, cloudType, dbMode] = useMemo(() => {
    switch (value) {
      case ConnectType.OB_MYSQL: {
        return [DBLogicType.NONE, DBCloudType.NONE, ConnectionMode.OB_MYSQL];
      }
      case ConnectType.OB_ORACLE: {
        return [DBLogicType.NONE, DBCloudType.NONE, ConnectionMode.OB_ORACLE];
      }
      case ConnectType.CLOUD_OB_MYSQL: {
        return [DBLogicType.NONE, DBCloudType.CLOUD, ConnectionMode.OB_MYSQL];
      }
      case ConnectType.CLOUD_OB_ORACLE: {
        return [DBLogicType.NONE, DBCloudType.CLOUD, ConnectionMode.OB_ORACLE];
      }
      case ConnectType.ODP_SHARDING_OB_MYSQL: {
        return [DBLogicType.SHARDING, DBCloudType.NONE, ConnectionMode.OB_MYSQL];
      }
      default: {
        return [DBLogicType.NONE, DBCloudType.NONE, ConnectionMode.OB_MYSQL];
      }
    }
  }, [value]);
  const getConnectType = useCallback(function (dbLogicType, cloudType, dbMode) {
    if (dbLogicType === DBLogicType.SHARDING) {
      /**
       * sharding 下的处理
       */
      switch (dbMode) {
        case ConnectionMode.OB_MYSQL:
        default: {
          return ConnectType.ODP_SHARDING_OB_MYSQL;
        }
      }
    }
    /**
     * 物理库
     */
    if (cloudType === DBCloudType.CLOUD) {
      /**
       * 云
       */
      switch (dbMode) {
        case ConnectionMode.OB_MYSQL: {
          return ConnectType.CLOUD_OB_MYSQL;
        }
        case ConnectionMode.OB_ORACLE: {
          return ConnectType.CLOUD_OB_ORACLE;
        }
      }
    }
    switch (dbMode) {
      case ConnectionMode.OB_MYSQL: {
        return ConnectType.OB_MYSQL;
      }
      case ConnectionMode.OB_ORACLE: {
        return ConnectType.OB_ORACLE;
      }
    }

    return null;
  }, []);
  const innerChange = useCallback(
    (dbLogicType, cloudType, dbMode) => {
      onChange(getConnectType(dbLogicType, cloudType, dbMode));
    },
    [getConnectType],
  );

  const dBLogicTypeItem = (
    <DBLogicTypeItem
      dbLogicType={dbLogicType}
      cloudType={cloudType}
      dbMode={dbMode}
      onlySys={onlySys}
      isEdit={isEdit}
      innerChange={innerChange}
    />
  );

  const dBCloudTypeItem = (
    <DBCloudTypeItem
      dbLogicType={dbLogicType}
      cloudType={cloudType}
      dbMode={dbMode}
      onlySys={onlySys}
      isEdit={isEdit}
      innerChange={innerChange}
    />
  );

  const dbModeItem = (
    <DbModeItem
      dbLogicType={dbLogicType}
      cloudType={cloudType}
      dbMode={dbMode}
      onlySys={onlySys}
      isEdit={isEdit}
      typeInValidMessage={typeInValidMessage}
      innerChange={innerChange}
    />
  );

  return children({ dBLogicTypeItem, dBCloudTypeItem, dbModeItem });
};

export default ConnectTypeItem;
